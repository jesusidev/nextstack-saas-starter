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

variable "alarm_email" {
  description = "Email address for alarm notifications (leave empty to skip email)"
  type        = string
  default     = ""
}

variable "log_retention_days" {
  description = "Number of days to retain CloudWatch logs"
  type        = number
  default     = 7
}

variable "monitor_alb" {
  description = "Whether to monitor ALB (requires 06-loadbalancer deployed)"
  type        = bool
  default     = false
}

variable "monitor_rds" {
  description = "Whether to monitor RDS (requires 04-database deployed)"
  type        = bool
  default     = false
}

# EC2 Alarm Thresholds
variable "ec2_cpu_threshold" {
  description = "EC2 CPU utilization threshold percentage"
  type        = number
  default     = 80
}

# ALB Alarm Thresholds
variable "alb_response_time_threshold" {
  description = "ALB response time threshold in seconds"
  type        = number
  default     = 2
}

variable "alb_5xx_threshold" {
  description = "ALB 5XX error count threshold"
  type        = number
  default     = 10
}

# RDS Alarm Thresholds
variable "rds_cpu_threshold" {
  description = "RDS CPU utilization threshold percentage"
  type        = number
  default     = 80
}

variable "rds_storage_threshold_bytes" {
  description = "RDS free storage space threshold in bytes (default: 5GB)"
  type        = number
  default     = 5368709120
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
