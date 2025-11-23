variable "name_prefix" {
  description = "Prefix for naming EC2-related resources"
  type        = string
}

variable "vpc_id" {
  description = "VPC ID where the instance and SG will live"
  type        = string
}

variable "subnet_id" {
  description = "Subnet ID (public) for the instance"
  type        = string
}

variable "instance_type" {
  description = "EC2 instance type"
  type        = string
  default     = "t3.micro"
}

variable "ami_id" {
  description = "AMI ID to use"
  type        = string
}

variable "key_name" {
  description = "Optional EC2 key pair name (leave empty to omit)"
  type        = string
  default     = ""
}

variable "allowed_admin_cidrs" {
  description = "CIDR blocks allowed for SSH access (port 22). Leave empty to disable SSH ingress."
  type        = list(string)
  default     = []
}

variable "s3_access_arns" {
  description = "Optional list of S3 bucket ARNs to grant list/get/put/delete object access"
  type        = list(string)
  default     = []
}

variable "associate_public_ip" {
  description = "Associate a public IP to the instance"
  type        = bool
  default     = true
}

variable "user_data" {
  description = "User data script to bootstrap the instance"
  type        = string
}

variable "region" {
  description = "AWS region (used for ECR auth policy context)"
  type        = string
}

variable "ecr_repository_name" {
  description = "Name of the ECR repository that the instance will pull from"
  type        = string
}

variable "tags" {
  description = "Tags to apply"
  type        = map(string)
  default     = {}
}

