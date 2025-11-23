terraform {
  required_version = ">= 1.5.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = ">= 5.0"
    }
  }
}

resource "aws_route53_zone" "this" {
  name = var.zone_name
  comment = var.comment
  force_destroy = false

  tags = var.tags
}
