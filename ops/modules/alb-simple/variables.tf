variable "name_prefix" {
  description = "Prefix for naming ALB resources"
  type        = string
}

variable "vpc_id" {
  description = "VPC ID where the ALB and SG will live"
  type        = string
}

variable "public_subnet_ids" {
  description = "List of public subnet IDs for the ALB (at least two)"
  type        = list(string)
}

variable "target_instance_id" {
  description = "EC2 instance ID to register in the target group"
  type        = string
}

variable "target_port" {
  description = "Port the target (instance) listens on"
  type        = number
  default     = 80
}

variable "health_check_path" {
  description = "HTTP health check path"
  type        = string
  default     = "/"
}

variable "certificate_arn" {
  description = "ACM certificate ARN for HTTPS listener on 443 (if empty, HTTPS is not created)"
  type        = string
  default     = ""
}

variable "enable_https" {
  description = "Whether to create HTTPS-related resources (SG rule 443 and HTTPS listener). Must be plan-known."
  type        = bool
  default     = false
}

variable "tags" {
  description = "Tags to apply"
  type        = map(string)
  default     = {}
}
