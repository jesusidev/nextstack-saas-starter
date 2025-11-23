output "cpu_high_alarm_name" {
  description = "Name of the EC2 CPU high CloudWatch alarm"
  value       = aws_cloudwatch_metric_alarm.cpu_high.alarm_name
}

output "rds_storage_low_alarm_name" {
  description = "Name of the RDS low free storage alarm (null if not created)"
  value       = length(aws_cloudwatch_metric_alarm.rds_storage_low) > 0 ? aws_cloudwatch_metric_alarm.rds_storage_low[0].alarm_name : null
}
