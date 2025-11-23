terraform {
  required_version = ">= 1.5.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = ">= 5.0"
    }
  }
}

provider "aws" {
  region              = var.aws_region
  allowed_account_ids = [var.aws_account_id]
  profile             = var.aws_profile != "" ? var.aws_profile : null
}

# ============================================================================
# S3 Bucket - Assets (handles both public assets and uploads)
# ============================================================================

module "assets_bucket" {
  source = "../../../../modules/s3-bucket-simple"

  name              = var.assets_bucket_name
  public_read       = true
  enable_versioning = true
  enable_sse        = true
  cors_rules = [
    {
      allowed_headers = ["*"]
      allowed_methods = ["GET", "PUT", "POST", "HEAD"]
      allowed_origins = ["*"]
      expose_headers  = ["ETag"]
      max_age_seconds = 3000
    }
  ]
  tags = merge(var.tags, { bucket = "assets" })
}
