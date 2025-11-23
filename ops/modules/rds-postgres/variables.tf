variable "name_prefix" {
  description = "Name prefix for RDS and related resources"
  type        = string
}

variable "vpc_id" {
  description = "VPC ID where the RDS security group will be created"
  type        = string
}

variable "private_subnet_ids" {
  description = "List of private subnet IDs for the DB subnet group"
  type        = list(string)
}

variable "allowed_security_group_ids" {
  description = "Security group IDs allowed to connect to Postgres (ingress 5432)"
  type        = list(string)
  default     = []
}

variable "db_name" {
  description = "Initial database name"
  type        = string
}

variable "username" {
  description = "Master username"
  type        = string
}

variable "instance_class" {
  description = "RDS instance class (e.g., db.t3.micro)"
  type        = string
  default     = "db.t3.micro"
}

variable "allocated_storage" {
  description = "Allocated storage in GB"
  type        = number
  default     = 20
}

variable "max_allocated_storage" {
  description = "Optional storage autoscaling upper limit in GB (null to disable)"
  type        = number
  default     = null
}

variable "multi_az" {
  description = "Enable Multi-AZ deployment"
  type        = bool
  default     = false
}

variable "engine_version" {
  description = "PostgreSQL engine version (e.g., 16.3)"
  type        = string
}

variable "backup_retention_period" {
  description = "Automatic backup retention in days"
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
  description = "Create a Secrets Manager secret with connection details"
  type        = bool
  default     = true
}

variable "secret_name" {
  description = "Optional explicit name for the Secrets Manager secret (if null, a default based on name_prefix is used)"
  type        = string
  default     = null
}

variable "tags" {
  description = "Common tags"
  type        = map(string)
  default     = {}
}
