output "repository_url" {
  description = "URL of the ECR repository"
  value       = aws_ecr_repository.app-template.repository_url
}

output "repository_arn" {
  description = "ARN of the ECR repository"
  value       = aws_ecr_repository.app-template.arn
}

output "repository_name" {
  description = "Name of the ECR repository"
  value       = aws_ecr_repository.app-template.name
}

output "registry_id" {
  description = "Registry ID where the repository was created"
  value       = aws_ecr_repository.app-template.registry_id
}
