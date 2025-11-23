# S3 Storage Module

## Purpose
Manages a single S3 bucket for both public assets and uploads. This simplified approach uses a single bucket with appropriate IAM policies and object prefixes (e.g., `/assets/`, `/uploads/`) rather than separate buckets.

## Resources Created
- `app-template-dev-assets` - S3 bucket for all storage needs (assets and uploads)
- CORS configuration supporting GET, PUT, POST, HEAD methods
- Versioning enabled
- Server-side encryption (SSE-S3)

## Deployment

```bash
# Copy and edit variables
cp terraform.tfvars.example terraform.tfvars
nano terraform.tfvars

# Deploy
terraform init
terraform plan
terraform apply

# Cleanup
terraform destroy
```

## Outputs
- `assets_bucket_name` - Name of assets bucket
- `assets_bucket_arn` - ARN of assets bucket

## Used By
- `05-compute` - EC2 instance needs S3 bucket ARN for IAM permissions
- `09-cicd` - CI user needs S3 bucket ARN for deployment permissions

## Dependencies
None - this is a foundational module

## Cost
Approximately $1-5/month depending on storage usage and requests
