# CI/CD Module

## Purpose

Creates IAM user and permissions for CI/CD pipelines (GitHub Actions, GitLab CI, etc.). Provides secure access to push Docker images, sync S3 assets, and deploy to EC2.

## What's Created

- **IAM User**: Dedicated CI/CD user
- **Access Keys**: AWS credentials for automation
- **ECR Push Policy**: Push Docker images
- **S3 Sync Policy**: Upload static assets
- **EC2 Deploy Policy** (optional): Trigger deployments via Systems Manager
- **Secrets Manager Secret**: Securely stores all credentials

## Prerequisites

- Storage module deployed (02-storage)
- Registry module deployed (03-registry)
- Compute module deployed (05-compute)

## Dependencies

**Required:**
- `02-storage` - S3 bucket access
- `03-registry` - ECR push permissions
- `05-compute` - EC2 deployment target

## Used By

**External CI/CD systems:**
- GitHub Actions
- GitLab CI/CD
- CircleCI
- Jenkins
- etc.

## Deployment

```bash
cd ops/apps/app-template/dev/09-cicd

cp terraform.tfvars.example terraform.tfvars
nano terraform.tfvars

terraform init
terraform apply

# Get credentials (store securely!)
terraform output access_key_id
terraform output secret_access_key

# Or retrieve from Secrets Manager
aws secretsmanager get-secret-value \
  --secret-id dev/cicd-credentials \
  --query SecretString \
  --output text | jq
```

## Configuration

### terraform.tfvars

```hcl
environment      = "dev"
cicd_user_name   = "app-template-cicd-dev"
enable_ec2_deploy = true  # Enable Systems Manager deployment
secret_recovery_days = 7   # Recovery period for deleted secrets
```

## Storing Credentials in CI/CD

### GitHub Actions

```bash
# Add secrets to GitHub repository
# Settings → Secrets and variables → Actions → New repository secret

AWS_ACCESS_KEY_ID: <access-key-id>
AWS_SECRET_ACCESS_KEY: <secret-access-key>
AWS_REGION: us-west-2
ECR_REPOSITORY: <ecr-url>
S3_ASSETS_BUCKET: <bucket-name>
EC2_INSTANCE_ID: <instance-id>
```

### GitLab CI/CD

```bash
# Settings → CI/CD → Variables → Add Variable

AWS_ACCESS_KEY_ID (protected, masked)
AWS_SECRET_ACCESS_KEY (protected, masked)
AWS_REGION
ECR_REPOSITORY
```

### Environment Variables

```bash
export AWS_ACCESS_KEY_ID="<access-key-id>"
export AWS_SECRET_ACCESS_KEY="<secret-access-key>"
export AWS_DEFAULT_REGION="us-west-2"
```

## IAM Permissions

The CI/CD user has permissions for:

### ECR (Docker Images)
- ✅ Get authorization token
- ✅ Push images
- ✅ List images
- ✅ Describe repositories

### S3 (Static Assets)
- ✅ Upload files (PutObject)
- ✅ Download files (GetObject)
- ✅ Delete files (DeleteObject)
- ✅ List bucket contents

### EC2 (Deployment - Optional)
- ✅ Describe instances
- ✅ Send SSM commands
- ✅ Check command status

### What CI/CD User CANNOT Do
- ❌ Terminate EC2 instances
- ❌ Delete S3 buckets
- ❌ Delete ECR repositories
- ❌ Modify IAM roles/users
- ❌ Access other AWS accounts

**Principle of least privilege applied!**

## Example CI/CD Workflows

### GitHub Actions - Full Deployment

```yaml
name: Deploy to Dev

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-west-2
      
      - name: Login to Amazon ECR
        id: login-ecr
        uses: aws-actions/amazon-ecr-login@v2
      
      - name: Build and push Docker image
        env:
          ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
          ECR_REPOSITORY: app-template-dev
          IMAGE_TAG: ${{ github.sha }}
        run: |
          docker build -t $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG .
          docker tag $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG $ECR_REGISTRY/$ECR_REPOSITORY:latest
          docker push $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG
          docker push $ECR_REGISTRY/$ECR_REPOSITORY:latest
      
      - name: Deploy to EC2
        env:
          INSTANCE_ID: ${{ secrets.EC2_INSTANCE_ID }}
        run: |
          aws ssm send-command \
            --instance-ids $INSTANCE_ID \
            --document-name "AWS-RunShellScript" \
            --parameters 'commands=[
              "cd /opt/app-template",
              "aws ecr get-login-password | docker login --username AWS --password-stdin ${{ steps.login-ecr.outputs.registry }}",
              "docker-compose pull",
              "docker-compose up -d"
            ]'
```

### GitHub Actions - Static Assets Only

```yaml
name: Sync Assets to S3

on:
  push:
    paths:
      - 'public/**'

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-west-2
      
      - name: Sync to S3
        run: |
          aws s3 sync ./public/ s3://${{ secrets.S3_ASSETS_BUCKET }}/ \
            --delete \
            --cache-control "public, max-age=31536000"
```

### GitLab CI/CD

```yaml
stages:
  - build
  - deploy

variables:
  ECR_REPOSITORY: app-template-dev

build:
  stage: build
  image: docker:latest
  services:
    - docker:dind
  before_script:
    - apk add --no-cache aws-cli
    - aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $ECR_REPOSITORY
  script:
    - docker build -t $ECR_REPOSITORY:$CI_COMMIT_SHA .
    - docker tag $ECR_REPOSITORY:$CI_COMMIT_SHA $ECR_REPOSITORY:latest
    - docker push $ECR_REPOSITORY:$CI_COMMIT_SHA
    - docker push $ECR_REPOSITORY:latest

deploy:
  stage: deploy
  image: amazon/aws-cli
  script:
    - aws ssm send-command --instance-ids $EC2_INSTANCE_ID --document-name "AWS-RunShellScript" --parameters 'commands=["cd /opt/app-template && docker-compose pull && docker-compose up -d"]'
```

## Deployment Strategies

### Strategy 1: Pull from EC2

CI/CD pushes image → EC2 pulls and restarts

```bash
# In CI/CD pipeline
docker push $ECR_REPOSITORY:latest

# On EC2 (via SSM)
docker-compose pull
docker-compose up -d
```

**Pros:** Simple, EC2-initiated
**Cons:** Requires Systems Manager

### Strategy 2: Direct SSH

CI/CD SSHs to EC2 and deploys

```bash
# In CI/CD pipeline
ssh ec2-user@$EC2_IP "cd /opt/app-template && docker-compose pull && docker-compose up -d"
```

**Pros:** No SSM needed
**Cons:** Requires SSH key management, open SSH port

### Strategy 3: Blue/Green

Deploy to new instance, swap traffic

**Pros:** Zero downtime
**Cons:** More complex, requires ALB

## Security Best Practices

### 1. Rotate Access Keys Regularly

```bash
# Generate new key
aws iam create-access-key --user-name app-template-cicd-dev

# Update CI/CD secrets
# Delete old key
aws iam delete-access-key --user-name app-template-cicd-dev --access-key-id OLD_KEY
```

**Recommendation:** Rotate every 90 days

### 2. Use Secrets Manager

Don't hardcode credentials in CI/CD config. Use dynamic retrieval:

```bash
# In CI/CD
aws secretsmanager get-secret-value --secret-id dev/cicd-credentials
```

### 3. Restrict by IP (Optional)

Add condition to IAM policy:

```json
{
  "Condition": {
    "IpAddress": {
      "aws:SourceIp": ["GitHub_Actions_IP_Range"]
    }
  }
}
```

### 4. Enable MFA Delete on S3

Prevent accidental deletions:

```bash
aws s3api put-bucket-versioning \
  --bucket app-template-assets-dev \
  --versioning-configuration Status=Enabled,MFADelete=Enabled \
  --mfa "arn:aws:iam::123456:mfa/root-account-mfa-device 123456"
```

### 5. Monitor IAM Activity

Use CloudTrail to track CI/CD user actions:

```bash
aws cloudtrail lookup-events \
  --lookup-attributes AttributeKey=Username,AttributeValue=app-template-cicd-dev
```

## Retrieving Credentials

### From Terraform Outputs

```bash
cd ops/apps/app-template/dev/09-cicd

# Access key ID
terraform output -raw access_key_id

# Secret access key
terraform output -raw secret_access_key
```

### From Secrets Manager

```bash
# Get all credentials
aws secretsmanager get-secret-value \
  --secret-id dev/cicd-credentials \
  --query SecretString \
  --output text | jq

# Get specific value
aws secretsmanager get-secret-value \
  --secret-id dev/cicd-credentials \
  --query SecretString \
  --output text | jq -r '.aws_access_key_id'
```

## Testing Credentials

### Test ECR Push

```bash
# Configure AWS CLI
export AWS_ACCESS_KEY_ID="<access-key>"
export AWS_SECRET_ACCESS_KEY="<secret-key>"

# Login to ECR
aws ecr get-login-password --region us-west-2 | \
  docker login --username AWS --password-stdin <ecr-url>

# Push test image
docker tag alpine:latest <ecr-url>:test
docker push <ecr-url>:test
```

### Test S3 Sync

```bash
# Upload file
echo "test" > test.txt
aws s3 cp test.txt s3://app-template-assets-dev/

# List bucket
aws s3 ls s3://app-template-assets-dev/
```

### Test EC2 Deployment

```bash
# Send command via SSM
aws ssm send-command \
  --instance-ids i-xxxxx \
  --document-name "AWS-RunShellScript" \
  --parameters 'commands=["echo Hello from CI/CD"]'

# Check command status
aws ssm list-command-invocations \
  --command-id <command-id> \
  --details
```

## Outputs

```bash
terraform output cicd_user_name          # IAM user name
terraform output cicd_user_arn           # IAM user ARN
terraform output access_key_id           # Access key (sensitive)
terraform output secret_access_key       # Secret key (sensitive)
terraform output credentials_secret_arn  # Secrets Manager ARN
terraform output ecr_repository_url      # For Docker push
terraform output s3_assets_bucket        # For S3 sync
terraform output ec2_instance_id         # For deployment
```

## Cost Estimate

| Resource | Monthly Cost |
|----------|--------------|
| IAM User | **Free** |
| Access Keys | **Free** |
| Secrets Manager Secret | $0.40 |
| API Calls (10K) | $0.05 |
| **Total** | **~$0.45/month** |

Essentially free for CI/CD infrastructure!

## When to Deploy

**Always** - Required for automated deployments.

## When to Skip

- Manual deployments only
- Using external CI/CD with AWS OIDC (no IAM user needed)
- Very early development phase

## Troubleshooting

### Access Denied errors

1. **Check IAM policies attached:**
   ```bash
   aws iam list-user-policies --user-name app-template-cicd-dev
   aws iam list-attached-user-policies --user-name app-template-cicd-dev
   ```

2. **Verify credentials:**
   ```bash
   aws sts get-caller-identity
   ```

3. **Check CloudTrail for detailed error:**
   ```bash
   aws cloudtrail lookup-events --max-results 10
   ```

### ECR login fails

```bash
# Verify ECR permissions
aws ecr describe-repositories --repository-names app-template-dev

# Test authorization token
aws ecr get-authorization-token
```

### SSM command fails

1. **Check SSM agent running on EC2**
2. **Verify IAM instance profile on EC2**
3. **Check security groups allow outbound HTTPS**

## Alternative: OIDC (No IAM User)

For GitHub Actions, consider OIDC instead of IAM user:

```yaml
- name: Configure AWS credentials
  uses: aws-actions/configure-aws-credentials@v4
  with:
    role-to-assume: arn:aws:iam::123456789:role/GitHubActionsRole
    aws-region: us-west-2
```

**Pros:**
- No long-lived credentials
- Better security
- No key rotation needed

**Cons:**
- More complex setup
- GitHub Actions only

## Next Steps

After deploying CI/CD:

1. **Store credentials**: Add to GitHub/GitLab secrets
2. **Test deployment**: Run manual workflow
3. **Setup branch protection**: Require successful deploy before merge
4. **Add deploy notifications**: Slack/email on deploy
5. **Monitor deployments**: Use 08-monitoring alarms

## Related Modules

- **02-storage**: S3 buckets for asset uploads
- **03-registry**: ECR for Docker images
- **05-compute**: EC2 deployment target
- **08-monitoring**: Alert on deployment failures
