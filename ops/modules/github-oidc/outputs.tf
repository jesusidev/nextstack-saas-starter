output "oidc_provider_arn" {
  description = "ARN of the GitHub OIDC provider"
  value       = var.create_oidc_provider ? aws_iam_openid_connect_provider.github[0].arn : var.existing_oidc_provider_arn
}

output "role_arn" {
  description = "ARN of the IAM role for GitHub Actions"
  value       = aws_iam_role.github_actions.arn
}

output "role_name" {
  description = "Name of the IAM role for GitHub Actions"
  value       = aws_iam_role.github_actions.name
}

output "ecr_push_policy_arn" {
  description = "ARN of the ECR push policy"
  value       = aws_iam_policy.ecr_push.arn
}

output "s3_access_policy_arn" {
  description = "ARN of the S3 access policy (if created)"
  value       = length(var.s3_bucket_arns) > 0 ? aws_iam_policy.s3_access[0].arn : null
}
