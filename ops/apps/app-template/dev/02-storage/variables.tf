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

variable "assets_bucket_name" {
  description = "S3 bucket name for assets (public and uploads)"
  type        = string
}

variable "tags" {
  description = "Standard tags"
  type        = map(string)
  default     = {}
}
