terraform {
  required_version = ">= 1.5.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = ">= 5.0"
    }
  }
}

resource "aws_cloudwatch_log_group" "this" {
  name              = var.log_group_name != "" ? var.log_group_name : "/app/${var.name_prefix}"
  retention_in_days = var.retention_days
  tags              = var.tags
}
