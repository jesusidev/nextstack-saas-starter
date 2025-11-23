variable "name" {
  description = "ECR repository name"
  type        = string
}

variable "image_tag_mutability" {
  description = "Tag mutability setting (MUTABLE or IMMUTABLE)"
  type        = string
  default     = "MUTABLE"
}

variable "scan_on_push" {
  description = "Enable image scanning on push"
  type        = bool
  default     = true
}

variable "lifecycle_keep_last" {
  description = "If > 0, add a lifecycle policy to keep only the last N images"
  type        = number
  default     = 10
}

variable "tags" {
  description = "Tags to apply"
  type        = map(string)
  default     = {}
}
