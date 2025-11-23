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

# Reference outputs from other modules
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

# Optional: Reference database if deployed
data "terraform_remote_state" "database" {
  count   = var.use_database ? 1 : 0
  backend = "local"
  config = {
    path = "../04-database/terraform.tfstate"
  }
}

# Get VPC and subnet info from global infrastructure
data "aws_vpc" "main" {
  id = var.vpc_id
}

data "aws_subnet" "selected" {
  id = var.subnet_id
}

# Security group for EC2 instance
resource "aws_security_group" "ec2" {
  name        = "${var.instance_name}-sg"
  description = "Security group for ${var.instance_name}"
  vpc_id      = var.vpc_id

  # SSH access
  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = var.ssh_cidr_blocks
    description = "SSH access"
  }

  # HTTP access
  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = var.http_cidr_blocks
    description = "HTTP access"
  }

  # HTTPS access
  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = var.https_cidr_blocks
    description = "HTTPS access"
  }

  # Application port (Next.js default: 3000)
  ingress {
    from_port   = var.app_port
    to_port     = var.app_port
    protocol    = "tcp"
    cidr_blocks = var.app_cidr_blocks
    description = "Application port"
  }

  # Outbound internet access
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
    description = "All outbound traffic"
  }

  tags = merge(
    var.tags,
    {
      Name = "${var.instance_name}-sg"
    }
  )
}

# IAM role for EC2 instance
resource "aws_iam_role" "ec2" {
  name = "${var.instance_name}-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ec2.amazonaws.com"
        }
      }
    ]
  })

  tags = var.tags
}

# IAM policy for S3 access
resource "aws_iam_role_policy" "s3_access" {
  name = "${var.instance_name}-s3-policy"
  role = aws_iam_role.ec2.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:PutObject",
          "s3:DeleteObject",
          "s3:ListBucket"
        ]
        Resource = [
          data.terraform_remote_state.storage.outputs.assets_bucket_arn,
          "${data.terraform_remote_state.storage.outputs.assets_bucket_arn}/*"
        ]
      }
    ]
  })
}

# IAM policy for ECR access
resource "aws_iam_role_policy" "ecr_access" {
  name = "${var.instance_name}-ecr-policy"
  role = aws_iam_role.ec2.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "ecr:GetAuthorizationToken",
          "ecr:BatchCheckLayerAvailability",
          "ecr:GetDownloadUrlForLayer",
          "ecr:BatchGetImage"
        ]
        Resource = "*"
      }
    ]
  })
}

# Optional: IAM policy for RDS access (Secrets Manager)
resource "aws_iam_role_policy" "rds_access" {
  count = var.use_database ? 1 : 0
  name  = "${var.instance_name}-rds-policy"
  role  = aws_iam_role.ec2.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "secretsmanager:GetSecretValue",
          "secretsmanager:DescribeSecret"
        ]
        Resource = data.terraform_remote_state.database[0].outputs.rds_secret_arn
      }
    ]
  })
}

# IAM policy for CloudWatch Logs
resource "aws_iam_role_policy" "cloudwatch_logs" {
  name = "${var.instance_name}-logs-policy"
  role = aws_iam_role.ec2.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents",
          "logs:DescribeLogStreams"
        ]
        Resource = "arn:aws:logs:${var.region}:*:log-group:/aws/ec2/${var.instance_name}*"
      }
    ]
  })
}

# IAM instance profile
resource "aws_iam_instance_profile" "ec2" {
  name = "${var.instance_name}-profile"
  role = aws_iam_role.ec2.name

  tags = var.tags
}

# EC2 instance
resource "aws_instance" "app" {
  ami                    = var.ami_id
  instance_type          = var.instance_type
  subnet_id              = var.subnet_id
  vpc_security_group_ids = [aws_security_group.ec2.id]
  iam_instance_profile   = aws_iam_instance_profile.ec2.name
  key_name               = var.key_name

  root_block_device {
    volume_size           = var.root_volume_size
    volume_type           = "gp3"
    delete_on_termination = true
    encrypted             = true
  }

  user_data = templatefile("${path.module}/user_data.sh", {
    ecr_repository_url = data.terraform_remote_state.registry.outputs.repository_url
    region             = var.region
    app_port           = var.app_port
    assets_bucket      = data.terraform_remote_state.storage.outputs.assets_bucket_name
    db_secret_arn      = var.use_database ? data.terraform_remote_state.database[0].outputs.rds_secret_arn : ""
    environment        = var.environment
  })

  tags = merge(
    var.tags,
    {
      Name = var.instance_name
    }
  )

  lifecycle {
    ignore_changes = [ami]
  }
}

# Elastic IP (optional)
resource "aws_eip" "app" {
  count    = var.allocate_eip ? 1 : 0
  instance = aws_instance.app.id
  domain   = "vpc"

  tags = merge(
    var.tags,
    {
      Name = "${var.instance_name}-eip"
    }
  )
}
