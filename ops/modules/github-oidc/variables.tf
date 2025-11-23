variable "role_name" {
  description = "Name of the IAM role for GitHub Actions"
  type        = string
}

variable "github_repositories" {
  description = "List of GitHub repositories allowed to assume this role (format: repo:org/repo:*)"
  type        = list(string)
}

variable "ecr_repository_arns" {
  description = "List of ECR repository ARNs that GitHub Actions can push to"
  type        = list(string)
}

variable "create_oidc_provider" {
  description = "Whether to create the OIDC provider (set to false if it already exists)"
  type        = bool
  default     = true
}

variable "existing_oidc_provider_arn" {
  description = "ARN of existing OIDC provider (required if create_oidc_provider is false)"
  type        = string
  default     = ""
}

variable "s3_bucket_arns" {
  description = "List of S3 bucket ARNs for static asset sync (optional)"
  type        = list(string)
  default     = []
}

variable "enable_cloudwatch_logs" {
  description = "Enable CloudWatch Logs access for GitHub Actions"
  type        = bool
  default     = false
}

variable "region" {
  description = "AWS region"
  type        = string
}

variable "tags" {
  description = "Tags to apply to resources"
  type        = map(string)
  default     = {}
}
