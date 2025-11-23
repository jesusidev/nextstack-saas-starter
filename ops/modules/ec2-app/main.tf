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
  s3_object_arns = [for arn in var.s3_access_arns : "${arn}/*"]
}

# Security group allowing HTTP (80) and optional SSH (22)
resource "aws_security_group" "app" {
  name        = "${var.name_prefix}-sg"
  description = "Security group for ${var.name_prefix} EC2 app"
  vpc_id      = var.vpc_id

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = merge(var.tags, { Name = "${var.name_prefix}-sg" })
}

resource "aws_security_group_rule" "http_in" {
  type              = "ingress"
  from_port         = 80
  to_port           = 80
  protocol          = "tcp"
  cidr_blocks       = ["0.0.0.0/0"]
  security_group_id = aws_security_group.app.id
}

resource "aws_security_group_rule" "ssh_in" {
  count             = length(var.allowed_admin_cidrs) > 0 ? 1 : 0
  type              = "ingress"
  from_port         = 22
  to_port           = 22
  protocol          = "tcp"
  cidr_blocks       = var.allowed_admin_cidrs
  security_group_id = aws_security_group.app.id
}

# IAM role for EC2 to pull from ECR and access S3 (optional)
data "aws_iam_policy_document" "assume_role" {
  statement {
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["ec2.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "app" {
  name               = "${var.name_prefix}-ec2-role"
  assume_role_policy = data.aws_iam_policy_document.assume_role.json
  tags               = var.tags
}

data "aws_iam_policy_document" "ecr" {
  statement {
    sid     = "EcrAuthToken"
    actions = ["ecr:GetAuthorizationToken"]
    resources = ["*"]
  }
  statement {
    sid = "EcrPull"
    actions = [
      "ecr:BatchCheckLayerAvailability",
      "ecr:BatchGetImage",
      "ecr:GetDownloadUrlForLayer",
      "ecr:DescribeRepositories",
      "ecr:DescribeImages"
    ]
    resources = [local.ecr_repo_arn]
  }
}

resource "aws_iam_policy" "ecr" {
  name   = "${var.name_prefix}-ecr-pull"
  policy = data.aws_iam_policy_document.ecr.json
}

resource "aws_iam_role_policy_attachment" "ecr" {
  role       = aws_iam_role.app.name
  policy_arn = aws_iam_policy.ecr.arn
}

# Optional S3 policy
locals {
  s3_bucket_arns = var.s3_access_arns
}

data "aws_iam_policy_document" "s3" {
  count = length(local.s3_bucket_arns) > 0 ? 1 : 0

  statement {
    actions   = ["s3:ListBucket"]
    resources = local.s3_bucket_arns
  }

  statement {
    actions   = ["s3:GetObject", "s3:PutObject", "s3:DeleteObject"]
    resources = local.s3_object_arns
  }
}

resource "aws_iam_policy" "s3" {
  count  = length(local.s3_bucket_arns) > 0 ? 1 : 0
  name   = "${var.name_prefix}-s3-access"
  policy = data.aws_iam_policy_document.s3[0].json
}

resource "aws_iam_role_policy_attachment" "s3" {
  count      = length(local.s3_bucket_arns) > 0 ? 1 : 0
  role       = aws_iam_role.app.name
  policy_arn = aws_iam_policy.s3[0].arn
}

# Attach CloudWatchAgentServerPolicy for logs/metrics publishing
resource "aws_iam_role_policy_attachment" "cw_agent" {
  role       = aws_iam_role.app.name
  policy_arn = "arn:aws:iam::aws:policy/CloudWatchAgentServerPolicy"
}

# Enable SSM Session Manager (keyless shell access as fallback to SSH)
resource "aws_iam_role_policy_attachment" "ssm_core" {
  role       = aws_iam_role.app.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}

# Instance profile
resource "aws_iam_instance_profile" "app" {
  name = "${var.name_prefix}-instance-profile"
  role = aws_iam_role.app.name
  tags = var.tags
}

resource "aws_instance" "app" {
  ami                         = var.ami_id
  instance_type               = var.instance_type
  subnet_id                   = var.subnet_id
  associate_public_ip_address = var.associate_public_ip
  vpc_security_group_ids      = [aws_security_group.app.id]
  iam_instance_profile        = aws_iam_instance_profile.app.name
  user_data                   = var.user_data
  key_name                    = var.key_name != "" ? var.key_name : null

  tags = merge(var.tags, { Name = var.name_prefix })
}
