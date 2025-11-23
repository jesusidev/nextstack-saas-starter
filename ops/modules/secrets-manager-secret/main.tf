terraform {
  required_version = ">= 1.5.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = ">= 5.0"
    }
  }
}

resource "aws_secretsmanager_secret" "this" {
  name                        = var.name
  description                 = var.description != "" ? var.description : null
  kms_key_id                  = var.kms_key_id
  # Use a compatible fallback for older providers that don't support
  # force_delete_without_recovery by setting the minimal recovery window.
  # When force deletion is desired, we set a 7-day recovery window instead.
  recovery_window_in_days     = var.force_delete_without_recovery ? 7 : null
  tags                        = var.tags
}

resource "aws_secretsmanager_secret_version" "this" {
  secret_id     = aws_secretsmanager_secret.this.id
  secret_string = var.secret_string
}
