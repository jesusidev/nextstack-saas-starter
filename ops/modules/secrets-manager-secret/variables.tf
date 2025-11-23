variable "name" {
  description = "Name of the secret"
  type        = string
}

variable "description" {
  description = "Optional description for the secret"
  type        = string
  default     = ""
}

variable "kms_key_id" {
  description = "Optional KMS key ID or ARN to encrypt the secret. If null, AWS-managed key is used."
  type        = string
  default     = null
}

variable "force_delete_without_recovery" {
  description = "Force delete secret without recovery window (low-cost/dev friendly). If false, AWS default recovery applies."
  type        = bool
  default     = true
}

variable "secret_string" {
  description = "Secret string value to store (use jsonencode(...) for JSON)."
  type        = string
  sensitive   = true
}

variable "tags" {
  description = "Tags to apply"
  type        = map(string)
  default     = {}
}
