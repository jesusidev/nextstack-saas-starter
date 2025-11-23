variable "aws_region" {
  description = "AWS region"
  type        = string
}

variable "aws_account_id" {
  description = "Expected AWS account ID (safety check)"
  type        = string
}

variable "aws_profile" {
  description = "Optional AWS CLI profile"
  type        = string
  default     = ""
}

variable "name_prefix" {
  description = "Name prefix for resources"
  type        = string
}

variable "vpc_id" {
  description = "VPC ID from global stack"
  type        = string
}

variable "private_subnet_ids" {
  description = "Private subnet IDs for RDS from global stack"
  type        = list(string)
}

variable "allowed_security_group_ids" {
  description = "Security group IDs allowed to access RDS (typically from compute module)"
  type        = list(string)
  default     = []
}

variable "db_name" {
  description = "Database name"
  type        = string
  default     = "app-templatedb"
}

variable "db_username" {
  description = "Master username"
  type        = string
  default     = "scoutadmin"
}

variable "instance_class" {
  description = "RDS instance class"
  type        = string
  default     = "db.t3.micro"
}

variable "allocated_storage" {
  description = "Allocated storage in GB"
  type        = number
  default     = 20
}

variable "multi_az" {
  description = "Enable Multi-AZ deployment"
  type        = bool
  default     = false
}

variable "engine_version" {
  description = "PostgreSQL version"
  type        = string
  default     = "16.8"
}

variable "backup_retention_period" {
  description = "Backup retention in days"
  type        = number
  default     = 7
}

variable "deletion_protection" {
  description = "Enable deletion protection"
  type        = bool
  default     = false
}

variable "skip_final_snapshot" {
  description = "Skip final snapshot on destroy"
  type        = bool
  default     = true
}

variable "apply_immediately" {
  description = "Apply changes immediately"
  type        = bool
  default     = true
}

variable "create_secret" {
  description = "Create Secrets Manager secret for credentials"
  type        = bool
  default     = true
}

variable "tags" {
  description = "Standard tags"
  type        = map(string)
  default     = {}
}
