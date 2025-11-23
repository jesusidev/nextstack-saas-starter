variable "name" {
  description = "Base name for tagging AWS resources"
  type        = string
}

variable "cidr_block" {
  description = "VPC CIDR block"
  type        = string
}

variable "public_subnet_cidrs" {
  description = "List of CIDR blocks for public subnets (2)"
  type        = list(string)
}

variable "private_subnet_cidrs" {
  description = "List of CIDR blocks for private subnets (2)"
  type        = list(string)
}

variable "azs" {
  description = "List of availability zones corresponding to the subnets (2)"
  type        = list(string)
}

variable "enable_nat_gateway" {
  description = "Whether to create a (single) NAT Gateway for private subnet egress"
  type        = bool
  default     = false
}

variable "tags" {
  description = "Common tags to apply to resources"
  type        = map(string)
  default     = {}
}