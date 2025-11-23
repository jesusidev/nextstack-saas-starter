variable "name" {
  description = "S3 bucket name (must be globally unique)"
  type        = string
}


variable "public_read" {
  description = "If true, configures bucket for public read of objects (via policy) and relaxes Public Access Block accordingly"
  type        = bool
  default     = false
}

variable "enable_versioning" {
  description = "Enable S3 versioning"
  type        = bool
  default     = true
}

variable "enable_sse" {
  description = "Enable default server-side encryption with SSE-S3 (AES256)"
  type        = bool
  default     = true
}

variable "cors_rules" {
  description = "Optional list of CORS rules to apply"
  type = list(object({
    allowed_headers = list(string)
    allowed_methods = list(string)
    allowed_origins = list(string)
    expose_headers  = list(string)
    max_age_seconds = number
  }))
  default = []
}

variable "enable_lifecycle" {
  description = "Enable lifecycle rules for cost optimization"
  type        = bool
  default     = true
}

variable "force_destroy" {
  description = "Allow force destroy of bucket (dev-friendly). Use with caution."
  type        = bool
  default     = false
}

variable "tags" {
  description = "Tags to apply to the bucket"
  type        = map(string)
  default     = {}
}


