output "log_group_name" {
  description = "CloudWatch Logs group name"
  value       = aws_cloudwatch_log_group.this.name
}
