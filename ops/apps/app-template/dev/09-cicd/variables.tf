variable "region" {
  description = "AWS region"
  type        = string
  default     = "us-west-2"
}

variable "profile" {
  description = "AWS profile to use"
  type        = string
  default     = "default"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "dev"
}

variable "cicd_user_name" {
  description = "Name of the IAM user for CI/CD"
  type        = string
  default     = "app-template-cicd-dev"
}

variable "enable_ec2_deploy" {
  description = "Enable permissions for EC2 deployment via Systems Manager"
  type        = bool
  default     = true
}

variable "secret_recovery_days" {
  description = "Number of days to retain secret after deletion"
  type        = number
  default     = 7
}

variable "tags" {
  description = "Tags to apply to resources"
  type        = map(string)
  default = {
    Project     = "AppTemplate"
    Environment = "dev"
    ManagedBy   = "terraform"
  }
}
