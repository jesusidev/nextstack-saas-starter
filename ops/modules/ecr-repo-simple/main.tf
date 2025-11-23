terraform {
  required_version = ">= 1.5.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = ">= 5.0"
    }
  }
}

resource "aws_ecr_repository" "this" {
  name                 = var.name
  image_tag_mutability = var.image_tag_mutability

  image_scanning_configuration {
    scan_on_push = var.scan_on_push
  }

  tags = var.tags
}

# Optional lifecycle policy to keep last N images
resource "aws_ecr_lifecycle_policy" "this" {
  count      = var.lifecycle_keep_last > 0 ? 1 : 0
  repository = aws_ecr_repository.this.name

  policy = jsonencode({
    rules = [
      {
        rulePriority = 1,
        description  = "Keep last ${var.lifecycle_keep_last} images",
        selection    = {
          tagStatus     = "any",
          countType     = "imageCountMoreThan",
          countNumber   = var.lifecycle_keep_last,
        },
        action = { type = "expire" }
      }
    ]
  })
}
