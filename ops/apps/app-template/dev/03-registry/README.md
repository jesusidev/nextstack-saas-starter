# Registry Module (ECR)

## Purpose

Creates an AWS Elastic Container Registry (ECR) repository for storing AppTemplate Docker images. Includes lifecycle policies to automatically clean up old images and reduce storage costs.

## What's Created

- **ECR Repository**: Private Docker image registry
- **Image Scanning**: Automatic vulnerability scanning on push
- **Lifecycle Policy**: Auto-cleanup of old/untagged images
- **Encryption**: AES256 encryption at rest

## Prerequisites

- AWS account with ECR permissions
- Docker installed locally for pushing images
- AWS CLI configured

## Dependencies

**None** - This is a foundational module.

## Used By

- **05-compute**: EC2 instance pulls images from this registry
- **09-cicd**: CI/CD pipeline pushes images here

## Deployment

```bash
cd ops/apps/app-template/dev/03-registry

# Copy and configure
cp terraform.tfvars.example terraform.tfvars
nano terraform.tfvars

# Deploy
terraform init
terraform apply

# Note the repository URL
terraform output repository_url
```

## Configuration

### terraform.tfvars

```hcl
region               = "us-west-2"
repository_name      = "app-template-dev"
image_tag_mutability = "MUTABLE"        # or "IMMUTABLE"
scan_on_push         = true             # Enable vulnerability scanning
image_retention_count = 10              # Keep last 10 tagged images
untagged_retention_days = 7             # Delete untagged after 7 days
```

### Image Mutability

- **MUTABLE**: Can overwrite tags (e.g., `latest`, `dev`, `v1.0`)
- **IMMUTABLE**: Tags are permanent once created (recommended for production)

Use MUTABLE in dev for flexibility, IMMUTABLE in prod for reproducibility.

## Usage After Deployment

### Push Docker Image

```bash
# Get repository URL
ECR_URL=$(terraform output -raw repository_url)

# Login to ECR
aws ecr get-login-password --region us-west-2 | \
  docker login --username AWS --password-stdin $ECR_URL

# Build and tag image
docker build -t app-template:latest .
docker tag app-template:latest $ECR_URL:latest

# Push to ECR
docker push $ECR_URL:latest
```

### Pull Image from EC2

```bash
# On EC2 instance (with IAM permissions)
aws ecr get-login-password --region us-west-2 | \
  docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-west-2.amazonaws.com

docker pull <repository-url>:latest
```

## Lifecycle Policy Details

The module creates two lifecycle rules:

1. **Tagged Image Retention**: Keeps last N tagged images (default: 10)
   - Applies to images tagged with version prefix (e.g., `v1.0`, `v2.1`)
   - Older versions automatically deleted

2. **Untagged Cleanup**: Deletes untagged images after N days (default: 7)
   - Failed/intermediate builds don't accumulate
   - Reduces storage costs

### Cost Impact

Without lifecycle policy:
- 100 images × 500MB = 50GB storage
- 50GB × $0.10/GB = **$5.00/month**

With lifecycle policy (10 images retained):
- 10 images × 500MB = 5GB storage  
- 5GB × $0.10/GB = **$0.50/month**

## Outputs

```bash
terraform output repository_url   # For docker push/pull
terraform output repository_arn   # For IAM policies
terraform output repository_name  # For CI/CD scripts
terraform output registry_id      # For cross-account access
```

## Cost Estimate

| Resource | Dev Cost | Production Cost |
|----------|----------|-----------------|
| ECR Repository | Free | Free |
| Image Storage (5GB) | $0.50/month | $0.50/month |
| Image Scanning | Free (first 100 images/month) | $0.09/scan after free tier |
| **Total** | **~$0.50-1/month** | **~$1-3/month** |

## When to Deploy

**Always deploy** - This is required for containerized applications.

## When to Skip

- Using Docker Hub or another container registry
- Not using containers (traditional VM deployments)
- Using managed services like ECS/Fargate with public images

## Security Features

1. **Private Repository**: Images not publicly accessible
2. **Encryption at Rest**: AES256 encryption
3. **Image Scanning**: Vulnerability detection on push
4. **IAM Integration**: Fine-grained access control

### Recommended IAM Permissions

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ecr:GetAuthorizationToken",
        "ecr:BatchCheckLayerAvailability",
        "ecr:GetDownloadUrlForLayer",
        "ecr:BatchGetImage"
      ],
      "Resource": "*"
    }
  ]
}
```

## Troubleshooting

### Error: "no basic auth credentials"

**Solution**: Login to ECR first

```bash
aws ecr get-login-password --region us-west-2 | \
  docker login --username AWS --password-stdin <account>.dkr.ecr.us-west-2.amazonaws.com
```

### Error: "Requested image not found"

**Solution**: Verify image was pushed successfully

```bash
aws ecr describe-images --repository-name app-template-dev
```

### Images not being cleaned up

**Solution**: Check lifecycle policy is applied

```bash
aws ecr get-lifecycle-policy --repository-name app-template-dev
```

## Next Steps

After deploying this module:

1. **Push first image**: Build and push Docker image to test
2. **Deploy compute module**: EC2 instance that pulls from this registry
3. **Setup CI/CD**: Automate image builds and pushes
4. **Enable notifications**: CloudWatch Events for push/scan events

## Related Modules

- **05-compute**: Consumes images from this registry
- **09-cicd**: Pushes images to this registry
- **08-monitoring**: Can monitor image vulnerabilities
