variable "zone_name" {
  description = "Apex domain name for the public hosted zone (e.g., example.com)"
  type        = string
}

variable "comment" {
  description = "Optional comment for the hosted zone"
  type        = string
  default     = ""
}

variable "tags" {
  description = "Tags to apply to the hosted zone"
  type        = map(string)
  default     = {}
}
