output "trail_name" {
  description = "Name of the CloudTrail trail"
  value       = aws_cloudtrail.this.name
}

output "s3_bucket_name" {
  description = "Name of the S3 bucket storing CloudTrail logs"
  value       = aws_s3_bucket.trail.bucket
}
