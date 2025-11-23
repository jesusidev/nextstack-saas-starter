variable "name_prefix" {
  description = "Prefix used for naming CloudWatch resources"
  type        = string
}

variable "instance_id" {
  description = "EC2 instance ID to monitor CPU utilization"
  type        = string
}

variable "cpu_threshold" {
  description = "CPU utilization threshold percentage for alarm"
  type        = number
  default     = 80
}

variable "sns_topic_arn" {
  description = "Optional SNS topic ARN for alarm/OK notifications"
  type        = string
  default     = ""
}

variable "tags" {
  description = "Tags to apply to CloudWatch resources"
  type        = map(string)
  default     = {}
}

# Optional RDS storage alarm inputs
variable "rds_instance_identifier" {
  description = "Optional RDS DB instance identifier to alarm on FreeStorageSpace"
  type        = string
  default     = ""
}

variable "rds_allocated_storage_gb" {
  description = "Allocated storage for RDS instance in GB (used to compute 10% free threshold)"
  type        = number
  default     = 0
}

variable "rds_free_storage_threshold_percent" {
  description = "Percentage of allocated storage considered as the minimum free space threshold"
  type        = number
  default     = 10
}

variable "enable_rds_storage_alarm" {
  description = "Whether to create the RDS free storage CloudWatch alarm"
  type        = bool
  default     = false
}
