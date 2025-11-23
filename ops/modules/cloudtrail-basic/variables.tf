variable "trail_name" {
  description = "Name of the CloudTrail trail"
  type        = string
}

variable "bucket_name" {
  description = "S3 bucket name for CloudTrail logs"
  type        = string
}

variable "is_multi_region_trail" {
  description = "Whether the trail applies to all regions"
  type        = bool
  default     = true
}

variable "enable_log_file_validation" {
  description = "Enables log file integrity validation"
  type        = bool
  default     = true
}

variable "tags" {
  description = "Tags to apply"
  type        = map(string)
  default     = {}
}
