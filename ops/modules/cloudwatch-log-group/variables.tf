variable "name_prefix" {
  description = "Name prefix used to build the default log group name"
  type        = string
}

variable "log_group_name" {
  description = "Optional explicit CloudWatch Logs group name"
  type        = string
  default     = ""
}

variable "retention_days" {
  description = "Retention in days for the log group"
  type        = number
  default     = 14
}

variable "tags" {
  description = "Tags to apply"
  type        = map(string)
  default     = {}
}
