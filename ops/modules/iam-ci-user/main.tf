terraform {
  required_version = ">= 1.5.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = ">= 5.0"
    }
  }
}

data "aws_caller_identity" "current" {}

locals {
  ecr_repo_arn = "arn:aws:ecr:${var.region}:${data.aws_caller_identity.current.account_id}:repository/${var.ecr_repository_name}"
  s3_object_arns = [for arn in var.s3_bucket_arns : "${arn}/*"]
}

# CI/CD IAM user
resource "aws_iam_user" "this" {
  count = var.enable ? 1 : 0

  name = var.username != "" ? var.username : "${var.name_prefix}-ci"
  tags = var.tags
}

# ECR push/pull least-privilege policy (scoped to one repo)
data "aws_iam_policy_document" "ecr" {
  count = var.enable ? 1 : 0

  statement {
    sid     = "EcrAuthToken"
    actions = [
      "ecr:GetAuthorizationToken",
    ]
    resources = ["*"]
  }

  statement {
    sid     = "EcrRepositoryActions"
    actions = [
      "ecr:BatchCheckLayerAvailability",
      "ecr:BatchGetImage",
      "ecr:CompleteLayerUpload",
      "ecr:DescribeImages",
      "ecr:DescribeRepositories",
      "ecr:GetDownloadUrlForLayer",
      "ecr:InitiateLayerUpload",
      "ecr:PutImage",
      "ecr:UploadLayerPart",
    ]
    resources = [local.ecr_repo_arn]
  }
}

resource "aws_iam_policy" "ecr" {
  count  = var.enable ? 1 : 0
  name   = "${var.name_prefix}-ci-ecr"
  policy = data.aws_iam_policy_document.ecr[0].json
}

resource "aws_iam_user_policy_attachment" "ecr" {
  count      = var.enable ? 1 : 0
  user       = aws_iam_user.this[0].name
  policy_arn = aws_iam_policy.ecr[0].arn
}

# Optional S3 scoped access

data "aws_iam_policy_document" "s3" {
  count = var.enable && length(var.s3_bucket_arns) > 0 ? 1 : 0

  statement {
    actions   = ["s3:ListBucket"]
    resources = var.s3_bucket_arns
  }

  statement {
    actions   = ["s3:GetObject", "s3:PutObject", "s3:DeleteObject"]
    resources = local.s3_object_arns
  }
}

resource "aws_iam_policy" "s3" {
  count  = var.enable && length(var.s3_bucket_arns) > 0 ? 1 : 0
  name   = "${var.name_prefix}-ci-s3"
  policy = data.aws_iam_policy_document.s3[0].json
}

resource "aws_iam_user_policy_attachment" "s3" {
  count      = var.enable && length(var.s3_bucket_arns) > 0 ? 1 : 0
  user       = aws_iam_user.this[0].name
  policy_arn = aws_iam_policy.s3[0].arn
}

# Access key
resource "aws_iam_access_key" "this" {
  count = var.enable ? 1 : 0
  user  = aws_iam_user.this[0].name
}
