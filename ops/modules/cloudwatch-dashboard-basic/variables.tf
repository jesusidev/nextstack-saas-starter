variable "name_prefix" {
  description = "Prefix used to build the default dashboard name"
  type        = string
}

variable "dashboard_name" {
  description = "Optional explicit CloudWatch dashboard name"
  type        = string
  default     = ""
}

variable "region" {
  description = "AWS region for widget rendering"
  type        = string
}

variable "instance_id" {
  description = "EC2 instance ID for CPU widget"
  type        = string
}

variable "rds_instance_identifier" {
  description = "Optional RDS instance identifier to include widgets"
  type        = string
  default     = ""
}
