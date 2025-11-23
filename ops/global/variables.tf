variable "region" {
  description = "AWS region to deploy global infrastructure"
  type        = string
}

variable "name" {
  description = "Base name/prefix for global resources"
  type        = string
}

variable "cidr_block" {
  description = "VPC CIDR block"
  type        = string
}

variable "public_subnet_cidrs" {
  description = "List of CIDR blocks for public subnets"
  type        = list(string)
}

variable "private_subnet_cidrs" {
  description = "List of CIDR blocks for private subnets"
  type        = list(string)
}

variable "azs" {
  description = "Optional list of AZs to use (if empty, first two available AZs are used)"
  type        = list(string)
  default     = []
}

variable "enable_nat_gateway" {
  description = "Whether to create a cost-optimized (single) NAT Gateway"
  type        = bool
  default     = false
}

variable "tags" {
  description = "Tags to apply to resources"
  type        = map(string)
  default     = {}
}

variable "enable_cloudtrail" {
  description = "Whether to enable CloudTrail (creates S3 bucket + trail)"
  type        = bool
  default     = false
}

variable "cloudtrail_trail_name" {
  description = "Optional CloudTrail trail name (empty => defaults to name + \"-trail\")"
  type        = string
  default     = ""
}

variable "cloudtrail_bucket_name" {
  description = "S3 bucket name to store CloudTrail logs (required when enable_cloudtrail = true)"
  type        = string
  default     = ""
}
