output "assets_bucket_name" {
  description = "Assets bucket name"
  value       = module.assets_bucket.bucket_name
}

output "assets_bucket_arn" {
  description = "Assets bucket ARN"
  value       = module.assets_bucket.bucket_arn
}
