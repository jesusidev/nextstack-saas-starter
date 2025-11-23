variable "domain_name" {
  description = "Primary domain name for the ACM certificate"
  type        = string
}

variable "hosted_zone_id" {
  description = "Route53 hosted zone ID used for DNS validation and optional records"
  type        = string
}

variable "subject_alternative_names" {
  description = "Optional list of Subject Alternative Names (SANs)"
  type        = list(string)
  default     = []
}

variable "tags" {
  description = "Tags to apply to ACM certificate"
  type        = map(string)
  default     = {}
}