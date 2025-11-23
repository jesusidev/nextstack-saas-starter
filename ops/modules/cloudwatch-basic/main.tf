terraform {
  required_version = ">= 1.5.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = ">= 5.0"
    }
  }
}

resource "aws_cloudwatch_metric_alarm" "cpu_high" {
  alarm_name          = "${var.name_prefix}-cpu-high"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "CPUUtilization"
  namespace           = "AWS/EC2"
  period              = 60
  statistic           = "Average"
  threshold           = var.cpu_threshold

  dimensions = {
    InstanceId = var.instance_id
  }

  alarm_description = "CPU utilization too high"

  alarm_actions = var.sns_topic_arn != "" ? [var.sns_topic_arn] : []
  ok_actions    = var.sns_topic_arn != "" ? [var.sns_topic_arn] : []

  tags = var.tags
}

# Optional RDS storage alarm (FreeStorageSpace below threshold)
locals {
  rds_threshold_bytes = floor(var.rds_allocated_storage_gb * 1024 * 1024 * 1024 * (var.rds_free_storage_threshold_percent / 100))
}

resource "aws_cloudwatch_metric_alarm" "rds_storage_low" {
  count               = var.enable_rds_storage_alarm && var.rds_allocated_storage_gb > 0 ? 1 : 0
  alarm_name          = "${var.name_prefix}-rds-storage-low"
  comparison_operator = "LessThanThreshold"
  evaluation_periods  = 2
  metric_name         = "FreeStorageSpace"
  namespace           = "AWS/RDS"
  period              = 300
  statistic           = "Average"
  threshold           = local.rds_threshold_bytes

  dimensions = {
    DBInstanceIdentifier = var.rds_instance_identifier
  }

  alarm_description = "RDS free storage below ${var.rds_free_storage_threshold_percent}%"

  alarm_actions = var.sns_topic_arn != "" ? [var.sns_topic_arn] : []
  ok_actions    = var.sns_topic_arn != "" ? [var.sns_topic_arn] : []

  tags = var.tags
}
