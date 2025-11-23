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
  description = "VPC ID for ALB"
  type        = string
}

variable "subnet_ids" {
  description = "List of subnet IDs for ALB (minimum 2, different AZs)"
  type        = list(string)
}

variable "alb_name" {
  description = "Name of the Application Load Balancer"
  type        = string
  default     = "app-template-dev-alb"
}

variable "target_port" {
  description = "Port on EC2 instance (should match app_port from compute)"
  type        = number
  default     = 3000
}

variable "health_check_path" {
  description = "Health check endpoint path"
  type        = string
  default     = "/api/health"
}

variable "certificate_arn" {
  description = "ACM certificate ARN for HTTPS (leave empty for HTTP only)"
  type        = string
  default     = ""
}

variable "enable_deletion_protection" {
  description = "Enable deletion protection on ALB"
  type        = bool
  default     = false
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
