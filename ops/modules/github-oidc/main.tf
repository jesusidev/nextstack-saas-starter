terraform {
  required_version = ">= 1.5.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = ">= 5.0"
    }
  }
}

# ==============================================================================
# GitHub OIDC Provider
# ==============================================================================

# Get GitHub's OIDC thumbprint
data "tls_certificate" "github" {
  url = "https://token.actions.githubusercontent.com"
}

# Create OIDC provider for GitHub Actions
resource "aws_iam_openid_connect_provider" "github" {
  count = var.create_oidc_provider ? 1 : 0

  url             = "https://token.actions.githubusercontent.com"
  client_id_list  = ["sts.amazonaws.com"]
  thumbprint_list = [data.tls_certificate.github.certificates[0].sha1_fingerprint]

  tags = var.tags
}

# ==============================================================================
# IAM Role for GitHub Actions
# ==============================================================================

# Trust policy for GitHub Actions
data "aws_iam_policy_document" "github_actions_assume_role" {
  statement {
    effect = "Allow"

    principals {
      type        = "Federated"
      identifiers = [var.create_oidc_provider ? aws_iam_openid_connect_provider.github[0].arn : var.existing_oidc_provider_arn]
    }

    actions = ["sts:AssumeRoleWithWebIdentity"]

    condition {
      test     = "StringEquals"
      variable = "token.actions.githubusercontent.com:aud"
      values   = ["sts.amazonaws.com"]
    }

    condition {
      test     = "StringLike"
      variable = "token.actions.githubusercontent.com:sub"
      values   = var.github_repositories
    }
  }
}

# IAM role for GitHub Actions
resource "aws_iam_role" "github_actions" {
  name               = var.role_name
  assume_role_policy = data.aws_iam_policy_document.github_actions_assume_role.json
  description        = "Role for GitHub Actions to push to ECR and deploy"

  tags = var.tags
}

# ==============================================================================
# ECR Push Permissions
# ==============================================================================

data "aws_iam_policy_document" "ecr_push" {
  # Get authorization token (required for docker login)
  statement {
    effect = "Allow"
    actions = [
      "ecr:GetAuthorizationToken"
    ]
    resources = ["*"]
  }

  # Push images to ECR repositories
  statement {
    effect = "Allow"
    actions = [
      "ecr:BatchCheckLayerAvailability",
      "ecr:GetDownloadUrlForLayer",
      "ecr:GetRepositoryPolicy",
      "ecr:DescribeRepositories",
      "ecr:ListImages",
      "ecr:DescribeImages",
      "ecr:BatchGetImage",
      "ecr:InitiateLayerUpload",
      "ecr:UploadLayerPart",
      "ecr:CompleteLayerUpload",
      "ecr:PutImage"
    ]
    resources = var.ecr_repository_arns
  }
}

resource "aws_iam_policy" "ecr_push" {
  name        = "${var.role_name}-ecr-push"
  description = "Allow GitHub Actions to push Docker images to ECR"
  policy      = data.aws_iam_policy_document.ecr_push.json

  tags = var.tags
}

resource "aws_iam_role_policy_attachment" "ecr_push" {
  role       = aws_iam_role.github_actions.name
  policy_arn = aws_iam_policy.ecr_push.arn
}

# ==============================================================================
# Optional: S3 Access for Static Assets
# ==============================================================================

data "aws_iam_policy_document" "s3_access" {
  count = length(var.s3_bucket_arns) > 0 ? 1 : 0

  statement {
    effect = "Allow"
    actions = [
      "s3:PutObject",
      "s3:GetObject",
      "s3:DeleteObject",
      "s3:ListBucket",
      "s3:PutObjectAcl"
    ]
    resources = concat(
      var.s3_bucket_arns,
      [for arn in var.s3_bucket_arns : "${arn}/*"]
    )
  }
}

resource "aws_iam_policy" "s3_access" {
  count = length(var.s3_bucket_arns) > 0 ? 1 : 0

  name        = "${var.role_name}-s3-access"
  description = "Allow GitHub Actions to sync static assets to S3"
  policy      = data.aws_iam_policy_document.s3_access[0].json

  tags = var.tags
}

resource "aws_iam_role_policy_attachment" "s3_access" {
  count = length(var.s3_bucket_arns) > 0 ? 1 : 0

  role       = aws_iam_role.github_actions.name
  policy_arn = aws_iam_policy.s3_access[0].arn
}

# ==============================================================================
# Optional: CloudWatch Logs Access
# ==============================================================================

data "aws_iam_policy_document" "cloudwatch_logs" {
  count = var.enable_cloudwatch_logs ? 1 : 0

  statement {
    effect = "Allow"
    actions = [
      "logs:CreateLogGroup",
      "logs:CreateLogStream",
      "logs:PutLogEvents",
      "logs:DescribeLogStreams"
    ]
    resources = ["arn:aws:logs:${var.region}:*:log-group:/aws/github-actions/*"]
  }
}

resource "aws_iam_policy" "cloudwatch_logs" {
  count = var.enable_cloudwatch_logs ? 1 : 0

  name        = "${var.role_name}-cloudwatch-logs"
  description = "Allow GitHub Actions to write logs to CloudWatch"
  policy      = data.aws_iam_policy_document.cloudwatch_logs[0].json

  tags = var.tags
}

resource "aws_iam_role_policy_attachment" "cloudwatch_logs" {
  count = var.enable_cloudwatch_logs ? 1 : 0

  role       = aws_iam_role.github_actions.name
  policy_arn = aws_iam_policy.cloudwatch_logs[0].arn
}
