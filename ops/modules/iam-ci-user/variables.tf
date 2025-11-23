variable "region" {
  description = "AWS region"
  type        = string
}

variable "name_prefix" {
  description = "Prefix used for naming IAM resources"
  type        = string
}

variable "ecr_repository_name" {
  description = "Name of the ECR repository this CI user can push/pull"
  type        = string
}

variable "s3_bucket_arns" {
  description = "Optional list of S3 bucket ARNs to grant access (list, get/put/delete objects, list bucket)"
  type        = list(string)
  default     = []
}

variable "enable" {
  description = "Whether to create the CI IAM user and keys"
  type        = bool
  default     = true
}

variable "username" {
  description = "Optional explicit username for the CI user"
  type        = string
  default     = ""
}

variable "tags" {
  description = "Tags to apply to IAM resources"
  type        = map(string)
  default     = {}
}
