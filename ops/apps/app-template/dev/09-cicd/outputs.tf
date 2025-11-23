output "cicd_user_name" {
  description = "Name of the CI/CD IAM user"
  value       = aws_iam_user.cicd.name
}

output "cicd_user_arn" {
  description = "ARN of the CI/CD IAM user"
  value       = aws_iam_user.cicd.arn
}

output "access_key_id" {
  description = "Access key ID (store securely!)"
  value       = aws_iam_access_key.cicd.id
  sensitive   = true
}

output "secret_access_key" {
  description = "Secret access key (store securely!)"
  value       = aws_iam_access_key.cicd.secret
  sensitive   = true
}

output "credentials_secret_arn" {
  description = "ARN of Secrets Manager secret containing all credentials"
  value       = aws_secretsmanager_secret.cicd_credentials.arn
}

output "ecr_repository_url" {
  description = "ECR repository URL for CI/CD"
  value       = data.terraform_remote_state.registry.outputs.repository_url
}

output "s3_assets_bucket" {
  description = "S3 assets bucket name for CI/CD"
  value       = data.terraform_remote_state.storage.outputs.assets_bucket_name
}

output "ec2_instance_id" {
  description = "EC2 instance ID for deployment"
  value       = data.terraform_remote_state.compute.outputs.instance_id
}
