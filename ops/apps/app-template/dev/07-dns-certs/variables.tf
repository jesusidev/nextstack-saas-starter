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

variable "domain_name" {
  description = "Domain name for the application (e.g., dev.app-template.com)"
  type        = string
}

variable "subject_alternative_names" {
  description = "Additional domain names for the certificate (e.g., www.dev.app-template.com)"
  type        = list(string)
  default     = []
}

variable "create_hosted_zone" {
  description = "Whether to create a new Route53 hosted zone (false to use existing)"
  type        = bool
  default     = false
}

variable "create_www_record" {
  description = "Whether to create a www CNAME record"
  type        = bool
  default     = true
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
