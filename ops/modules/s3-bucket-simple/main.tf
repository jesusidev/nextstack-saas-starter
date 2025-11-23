terraform {
  required_version = ">= 1.5.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = ">= 5.0"
    }
  }
}

# Base bucket
resource "aws_s3_bucket" "this" {
  bucket        = var.name
  force_destroy = var.force_destroy

  tags = var.tags
}

# Ownership controls (enforce bucket owner and disable ACLs)
resource "aws_s3_bucket_ownership_controls" "this" {
  bucket = aws_s3_bucket.this.id

  rule {
    object_ownership = "BucketOwnerEnforced"
  }
}


# Public access block (ACLs are blocked/ignored; policy toggles based on public_read)
resource "aws_s3_bucket_public_access_block" "this" {
  bucket = aws_s3_bucket.this.id

  block_public_acls       = true
  block_public_policy     = var.public_read ? false : true
  ignore_public_acls      = true
  restrict_public_buckets = var.public_read ? false : true
}

# Public-read policy for objects (only when public_read = true)
data "aws_iam_policy_document" "public_read" {
  count = var.public_read ? 1 : 0

  statement {
    sid    = "AllowPublicRead"
    effect = "Allow"

    principals {
      type        = "*"
      identifiers = ["*"]
    }

    actions = [
      "s3:GetObject",
    ]

    resources = [
      "${aws_s3_bucket.this.arn}/*",
    ]
  }
}

resource "aws_s3_bucket_policy" "public" {
  count  = var.public_read ? 1 : 0
  bucket = aws_s3_bucket.this.id
  policy = data.aws_iam_policy_document.public_read[0].json

  depends_on = [aws_s3_bucket_public_access_block.this]
}

# Versioning
resource "aws_s3_bucket_versioning" "this" {
  bucket = aws_s3_bucket.this.id

  versioning_configuration {
    status = var.enable_versioning ? "Enabled" : "Suspended"
  }
}

# Default SSE (AES256)
resource "aws_s3_bucket_server_side_encryption_configuration" "this" {
  count  = var.enable_sse ? 1 : 0
  bucket = aws_s3_bucket.this.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

# CORS
resource "aws_s3_bucket_cors_configuration" "this" {
  count  = length(var.cors_rules) > 0 ? 1 : 0
  bucket = aws_s3_bucket.this.id

  dynamic "cors_rule" {
    for_each = var.cors_rules
    content {
      allowed_headers = cors_rule.value.allowed_headers
      allowed_methods = cors_rule.value.allowed_methods
      allowed_origins = cors_rule.value.allowed_origins
      expose_headers  = cors_rule.value.expose_headers
      max_age_seconds = cors_rule.value.max_age_seconds
    }
  }
}

# Lifecycle rules (cost optimization)
resource "aws_s3_bucket_lifecycle_configuration" "this" {
  count  = var.enable_lifecycle ? 1 : 0
  bucket = aws_s3_bucket.this.id

  rule {
    id     = "abort-incomplete-mpu"
    status = "Enabled"

    abort_incomplete_multipart_upload {
      days_after_initiation = 7
    }

    filter {}
  }

  # Transition current objects to IA and Glacier-IR
  rule {
    id     = "current-transition"
    status = "Enabled"

    transition {
      days          = 30
      storage_class = "STANDARD_IA"
    }
    transition {
      days          = 90
      storage_class = "GLACIER_IR"
    }

    filter {}
  }

  # Noncurrent transitions only effective when versioning is enabled
  dynamic "rule" {
    for_each = var.enable_versioning ? [1] : []
    content {
      id     = "noncurrent-transition"
      status = "Enabled"

      noncurrent_version_transition {
        noncurrent_days = 30
        storage_class   = "STANDARD_IA"
      }
      noncurrent_version_transition {
        noncurrent_days = 90
        storage_class   = "GLACIER_IR"
      }

      filter {}
    }
  }

  depends_on = [aws_s3_bucket_versioning.this]
}
