output "username" {
  description = "IAM username for CI user"
  value       = var.enable ? aws_iam_user.this[0].name : null
}

output "access_key_id" {
  description = "Access key ID for the CI user (null if disabled)"
  value       = var.enable ? aws_iam_access_key.this[0].id : null
}

output "secret_access_key" {
  description = "Secret access key for the CI user (sensitive; null if disabled)"
  value       = var.enable ? aws_iam_access_key.this[0].secret : null
  sensitive   = true
}
