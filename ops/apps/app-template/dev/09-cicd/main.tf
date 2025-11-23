terraform {
  required_version = ">= 1.5.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region  = var.region
  profile = var.profile
}

# Reference other modules
data "terraform_remote_state" "storage" {
  backend = "local"
  config = {
    path = "../02-storage/terraform.tfstate"
  }
}

data "terraform_remote_state" "registry" {
  backend = "local"
  config = {
    path = "../03-registry/terraform.tfstate"
  }
}

data "terraform_remote_state" "compute" {
  backend = "local"
  config = {
    path = "../05-compute/terraform.tfstate"
  }
}

# IAM user for CI/CD
resource "aws_iam_user" "cicd" {
  name = var.cicd_user_name

  tags = var.tags
}

# Access key for CI/CD user
resource "aws_iam_access_key" "cicd" {
  user = aws_iam_user.cicd.name
}

# Policy for ECR push
resource "aws_iam_user_policy" "ecr_push" {
  name = "${var.cicd_user_name}-ecr-push"
  user = aws_iam_user.cicd.name

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "ecr:GetAuthorizationToken"
        ]
        Resource = "*"
      },
      {
        Effect = "Allow"
        Action = [
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
        Resource = data.terraform_remote_state.registry.outputs.repository_arn
      }
    ]
  })
}

# Policy for S3 sync (static assets)
resource "aws_iam_user_policy" "s3_sync" {
  name = "${var.cicd_user_name}-s3-sync"
  user = aws_iam_user.cicd.name

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:PutObject",
          "s3:GetObject",
          "s3:DeleteObject",
          "s3:ListBucket",
          "s3:PutObjectAcl"
        ]
        Resource = [
          data.terraform_remote_state.storage.outputs.assets_bucket_arn,
          "${data.terraform_remote_state.storage.outputs.assets_bucket_arn}/*"
        ]
      }
    ]
  })
}

# Optional: Policy for EC2 deployment (SSH or Systems Manager)
resource "aws_iam_user_policy" "ec2_deploy" {
  count = var.enable_ec2_deploy ? 1 : 0
  name  = "${var.cicd_user_name}-ec2-deploy"
  user  = aws_iam_user.cicd.name

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "ec2:DescribeInstances",
          "ec2:DescribeInstanceStatus"
        ]
        Resource = "*"
      },
      {
        Effect = "Allow"
        Action = [
          "ssm:SendCommand",
          "ssm:GetCommandInvocation",
          "ssm:ListCommands"
        ]
        Resource = [
          "arn:aws:ec2:${var.region}:*:instance/${data.terraform_remote_state.compute.outputs.instance_id}",
          "arn:aws:ssm:${var.region}:*:document/AWS-RunShellScript"
        ]
      }
    ]
  })
}

# Store access key in Secrets Manager (recommended over exposing in outputs)
resource "aws_secretsmanager_secret" "cicd_credentials" {
  name                    = "${var.environment}/cicd-credentials"
  description             = "CI/CD AWS credentials for ${var.cicd_user_name}"
  recovery_window_in_days = var.secret_recovery_days

  tags = var.tags
}

resource "aws_secretsmanager_secret_version" "cicd_credentials" {
  secret_id = aws_secretsmanager_secret.cicd_credentials.id
  secret_string = jsonencode({
    aws_access_key_id     = aws_iam_access_key.cicd.id
    aws_secret_access_key = aws_iam_access_key.cicd.secret
    region                = var.region
    ecr_repository_url    = data.terraform_remote_state.registry.outputs.repository_url
    s3_assets_bucket      = data.terraform_remote_state.storage.outputs.assets_bucket_name
    ec2_instance_id       = data.terraform_remote_state.compute.outputs.instance_id
  })
}
