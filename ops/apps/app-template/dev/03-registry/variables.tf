variable "region" {
  description = "AWS region for ECR repository"
  type        = string
  default     = "us-west-2"
}

variable "profile" {
  description = "AWS profile to use for authentication"
  type        = string
  default     = "default"
}

variable "repository_name" {
  description = "Name of the ECR repository"
  type        = string
  default     = "app-template-dev"
}

variable "image_tag_mutability" {
  description = "Image tag mutability setting (MUTABLE or IMMUTABLE)"
  type        = string
  default     = "MUTABLE"
}

variable "scan_on_push" {
  description = "Enable vulnerability scanning on image push"
  type        = bool
  default     = true
}

variable "image_retention_count" {
  description = "Number of tagged images to retain"
  type        = number
  default     = 10
}

variable "untagged_retention_days" {
  description = "Number of days to retain untagged images"
  type        = number
  default     = 7
}

variable "tags" {
  description = "Tags to apply to ECR repository"
  type        = map(string)
  default = {
    Project     = "AppTemplate"
    Environment = "dev"
    ManagedBy   = "terraform"
  }
}
