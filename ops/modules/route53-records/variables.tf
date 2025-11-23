variable "zone_id" {
  description = "Route53 Hosted Zone ID where records will be created"
  type        = string
}

# Standard (non-alias) records
variable "standard_records" {
  description = "List of standard DNS records to create (A, CNAME, TXT, etc.)"
  type = list(object({
    name            = string
    type            = string
    ttl             = number
    records         = list(string)
    allow_overwrite = bool
  }))
  default = []
}

# Alias records to AWS targets (e.g., ALB)
variable "alias_records" {
  description = "List of alias A records to create"
  type = list(object({
    name                    = string
    target_name             = string
    target_zone_id          = string
    evaluate_target_health  = bool
  }))
  default = []
}

variable "alias_record_type" {
  description = "Record type for alias records (typically A or AAAA)"
  type        = string
  default     = "A"
}
