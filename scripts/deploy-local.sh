#!/usr/bin/env bash
# Stage-aware Manual Build & Push Script for AWS ECR
# Builds the Next.js app image with Dockerfile.app, logs in to ECR, and pushes to the stage repository.
# Can optionally trigger an ECS redeploy or print EC2 commands.

set -euo pipefail

show_help() {
  cat <<EOF
Usage: $(basename "$0") [options]

Options:
  --stage <dev|qa|production>   Build stage/target (default: dev)
  --region <aws-region>         AWS region (default: us-west-2)
  --repo <ecr-repo-name>        ECR repository name (default: nextstack-saas-starter-app-<stage-suffix>)
  --image-tag <tag>             Docker image tag (default: git short SHA or timestamp)
  --platform <platform>         Optional build platform (e.g., linux/amd64 or linux/arm64)
  --push-latest                 Also tag and push :latest (default: enabled)
  --no-latest                   Do not tag/push :latest
  --deploy <ecs|ec2|none>       Post-push action: ECS force-new-deployment, print EC2 steps, or none (default: none)
  --ecs-cluster <name>          ECS cluster name (required if --deploy ecs)
  --ecs-service <name>          ECS service name (required if --deploy ecs)
  -h, --help                    Show this help

Examples:
  $(basename "$0") --stage production --platform linux/amd64 --deploy ec2
  $(basename "$0") --stage qa --deploy ecs --ecs-cluster my-qa --ecs-service nextstack-saas-starter-qa
  $(basename "$0") --stage dev --no-latest
EOF
}

# Defaults
STAGE=${STAGE:-dev}
REGION=${REGION:-us-west-2}
REPO=${REPO:-}
IMAGE_TAG=${IMAGE_TAG:-$(git rev-parse --short HEAD 2>/dev/null || date +%Y%m%d-%H%M%S)}
PLATFORM=${PLATFORM:-}
PUSH_LATEST=${PUSH_LATEST:-true}
DEPLOY_TARGET=${DEPLOY_TARGET:-none}
ECS_CLUSTER=${ECS_CLUSTER:-}
ECS_SERVICE=${ECS_SERVICE:-}

# Parse CLI flags
while [[ ${1:-} ]]; do
  case "$1" in
    --stage) STAGE="$2"; shift 2;;
    --region) REGION="$2"; shift 2;;
    --repo) REPO="$2"; shift 2;;
    --image-tag) IMAGE_TAG="$2"; shift 2;;
    --platform) PLATFORM="$2"; shift 2;;
    --push-latest) PUSH_LATEST=true; shift;;
    --no-latest) PUSH_LATEST=false; shift;;
    --deploy) DEPLOY_TARGET="$2"; shift 2;;
    --ecs-cluster) ECS_CLUSTER="$2"; shift 2;;
    --ecs-service) ECS_SERVICE="$2"; shift 2;;
    -h|--help) show_help; exit 0;;
    *) echo "Unknown option: $1"; show_help; exit 1;;
  esac
done

# Normalize stage and derive suffix/target
STAGE_LC="$(printf '%s' "$STAGE" | tr '[:upper:]' '[:lower:]')"
case "$STAGE_LC" in
  prod|production)
    STAGE_NORM="production"; SUFFIX="prod"; DOCKER_TARGET="production";
    ;;
  qa)
    STAGE_NORM="qa"; SUFFIX="qa"; DOCKER_TARGET="qa";
    ;;
  dev|development|'')
    STAGE_NORM="dev"; SUFFIX="dev"; DOCKER_TARGET="dev";
    ;;
  *)
    echo "Error: invalid --stage '$STAGE'. Use dev|qa|production" >&2; exit 1;
    ;;
esac

# Default repo per stage if not provided
if [[ -z "$REPO" ]]; then
  REPO="nextstack-saas-starter-app-$SUFFIX"
fi

# Enforce repo naming to match stage suffix
if [[ "$REPO" != *"-$SUFFIX" ]]; then
  echo "Error: --repo must end with -$SUFFIX for stage '$STAGE_NORM' (got: $REPO)" >&2
  exit 1
fi

# Sanity checks
command -v aws >/dev/null 2>&1 || { echo "Error: aws CLI not found."; exit 1; }
command -v docker >/dev/null 2>&1 || { echo "Error: docker not found."; exit 1; }

APP_NAME="nextstack-saas-starter"
echo "Starting $STAGE_NORM manual build & push for $APP_NAME (repo: $REPO, target: $DOCKER_TARGET)..."

echo "Determining AWS account ID..."
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
ECR_REGISTRY="$ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com"
ECR_URL="$ECR_REGISTRY/$REPO"

trap 'echo "An error occurred. Please review the output above." >&2' ERR

# 1) Login to Amazon ECR
echo "Logging in to ECR: $ECR_REGISTRY"
aws ecr get-login-password --region "$REGION" | docker login --username AWS --password-stdin "$ECR_REGISTRY"

# 2) Build the Next.js application image (use Dockerfile.app)
if [[ -n "$PLATFORM" ]]; then
  echo "Using build platform: $PLATFORM"
  echo "Building image: $REPO:$IMAGE_TAG using Dockerfile.app (target: $DOCKER_TARGET, stage: $STAGE_NORM)"
  docker build --platform "$PLATFORM" -f Dockerfile.app --target "$DOCKER_TARGET" -t "$REPO:$IMAGE_TAG" .
else
  echo "Building image: $REPO:$IMAGE_TAG using Dockerfile.app (target: $DOCKER_TARGET, stage: $STAGE_NORM)"
  docker build -f Dockerfile.app --target "$DOCKER_TARGET" -t "$REPO:$IMAGE_TAG" .
fi

# 3) Tag and push to ECR
echo "Tagging image for ECR: $ECR_URL:$IMAGE_TAG"
docker tag "$REPO:$IMAGE_TAG" "$ECR_URL:$IMAGE_TAG"

if [[ "$PUSH_LATEST" == "true" ]]; then
  echo "Also tagging as latest: $ECR_URL:latest"
  docker tag "$REPO:$IMAGE_TAG" "$ECR_URL:latest"
fi

echo "Pushing image tag: $IMAGE_TAG"
docker push "$ECR_URL:$IMAGE_TAG"

if [[ "$PUSH_LATEST" == "true" ]]; then
  echo "Pushing latest tag"
  docker push "$ECR_URL:latest"
fi

# 4) Deploy the new image (optional)
case "$DEPLOY_TARGET" in
  ecs)
    if [[ -z "$ECS_CLUSTER" || -z "$ECS_SERVICE" ]]; then
      echo "--deploy ecs requires --ecs-cluster and --ecs-service"
      exit 1
    fi
    echo "Triggering ECS force-new-deployment for $ECS_CLUSTER/$ECS_SERVICE"
    aws ecs update-service \
      --cluster "$ECS_CLUSTER" \
      --service "$ECS_SERVICE" \
      --force-new-deployment
    echo "Note: If your task definition uses a pinned tag (not :latest), create a new revision with image $ECR_URL:$IMAGE_TAG and update the service."
    ;;
  ec2)
    cat <<'EC2_INSTRUCTIONS'

EC2 deployment (manual steps):
1) SSH into your EC2 instance.
2) Run the following commands (update REGION/ACCOUNT_ID/ECR_URL/IMAGE_TAG if needed):

  REGION=${REGION}
  ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
  ECR_URL=${ACCOUNT_ID}.dkr.ecr.${REGION}.amazonaws.com/${REPO}

  aws ecr get-login-password --region ${REGION} \
    | docker login --username AWS --password-stdin ${ACCOUNT_ID}.dkr.ecr.${REGION}.amazonaws.com

  docker pull ${ECR_URL}:${IMAGE_TAG}

  docker stop nextstack-saas-starter || true && docker rm nextstack-saas-starter || true

  docker run -d --name nextstack-saas-starter \
    --restart unless-stopped \
    --env-file /opt/nextstack-saas-starter/.env \
    -p 80:3000 \
    ${ECR_URL}:${IMAGE_TAG}

EC2_INSTRUCTIONS
    ;;
  none|*)
    echo "Push complete. No deploy action requested (use --deploy ecs|ec2)."
    ;;
 esac

echo "Done. Image available at: $ECR_URL:$IMAGE_TAG"
