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

variable "vpc_id" {
  description = "VPC ID where EC2 will be launched"
  type        = string
}

variable "subnet_id" {
  description = "Subnet ID for EC2 instance"
  type        = string
}

variable "instance_name" {
  description = "Name of the EC2 instance"
  type        = string
  default     = "app-template-dev"
}

variable "instance_type" {
  description = "EC2 instance type"
  type        = string
  default     = "t3.micro"
}

variable "ami_id" {
  description = "AMI ID for EC2 instance (Amazon Linux 2023 or Ubuntu)"
  type        = string
}

variable "key_name" {
  description = "SSH key pair name"
  type        = string
}

variable "root_volume_size" {
  description = "Size of root volume in GB"
  type        = number
  default     = 20
}

variable "app_port" {
  description = "Application port (Next.js default: 3000)"
  type        = number
  default     = 3000
}

variable "ssh_cidr_blocks" {
  description = "CIDR blocks allowed for SSH access"
  type        = list(string)
  default     = ["0.0.0.0/0"]
}

variable "http_cidr_blocks" {
  description = "CIDR blocks allowed for HTTP access"
  type        = list(string)
  default     = ["0.0.0.0/0"]
}

variable "https_cidr_blocks" {
  description = "CIDR blocks allowed for HTTPS access"
  type        = list(string)
  default     = ["0.0.0.0/0"]
}

variable "app_cidr_blocks" {
  description = "CIDR blocks allowed for application port access"
  type        = list(string)
  default     = ["0.0.0.0/0"]
}

variable "allocate_eip" {
  description = "Whether to allocate an Elastic IP"
  type        = bool
  default     = false
}

variable "use_database" {
  description = "Whether to reference database module outputs"
  type        = bool
  default     = false
}

variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
  default     = "dev"
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
