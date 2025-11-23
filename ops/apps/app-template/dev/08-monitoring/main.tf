terraform {
  required_version = ">= 1.5.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region  = var.region
  profile = var.profile
}

# Reference other modules
data "terraform_remote_state" "compute" {
  backend = "local"
  config = {
    path = "../05-compute/terraform.tfstate"
  }
}

data "terraform_remote_state" "loadbalancer" {
  count   = var.monitor_alb ? 1 : 0
  backend = "local"
  config = {
    path = "../06-loadbalancer/terraform.tfstate"
  }
}

data "terraform_remote_state" "database" {
  count   = var.monitor_rds ? 1 : 0
  backend = "local"
  config = {
    path = "../04-database/terraform.tfstate"
  }
}

# SNS topic for alarms
resource "aws_sns_topic" "alarms" {
  name = "${var.environment}-alarms"

  tags = var.tags
}

# SNS topic subscription
resource "aws_sns_topic_subscription" "alarm_email" {
  count     = var.alarm_email != "" ? 1 : 0
  topic_arn = aws_sns_topic.alarms.arn
  protocol  = "email"
  endpoint  = var.alarm_email
}

# CloudWatch Log Group for application logs
resource "aws_cloudwatch_log_group" "app" {
  name              = "/aws/ec2/${var.environment}"
  retention_in_days = var.log_retention_days

  tags = var.tags
}

# EC2 CPU Utilization Alarm
resource "aws_cloudwatch_metric_alarm" "ec2_cpu" {
  alarm_name          = "${var.environment}-ec2-cpu-utilization"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "CPUUtilization"
  namespace           = "AWS/EC2"
  period              = "300"
  statistic           = "Average"
  threshold           = var.ec2_cpu_threshold
  alarm_description   = "EC2 CPU utilization is above ${var.ec2_cpu_threshold}%"
  alarm_actions       = [aws_sns_topic.alarms.arn]
  ok_actions          = [aws_sns_topic.alarms.arn]

  dimensions = {
    InstanceId = data.terraform_remote_state.compute.outputs.instance_id
  }

  tags = var.tags
}

# EC2 Status Check Alarm
resource "aws_cloudwatch_metric_alarm" "ec2_status_check" {
  alarm_name          = "${var.environment}-ec2-status-check"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "StatusCheckFailed"
  namespace           = "AWS/EC2"
  period              = "60"
  statistic           = "Maximum"
  threshold           = "0"
  alarm_description   = "EC2 instance status check failed"
  alarm_actions       = [aws_sns_topic.alarms.arn]

  dimensions = {
    InstanceId = data.terraform_remote_state.compute.outputs.instance_id
  }

  tags = var.tags
}

# ALB Target Health Alarm (if ALB monitoring enabled)
resource "aws_cloudwatch_metric_alarm" "alb_unhealthy_targets" {
  count               = var.monitor_alb ? 1 : 0
  alarm_name          = "${var.environment}-alb-unhealthy-targets"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "UnHealthyHostCount"
  namespace           = "AWS/ApplicationELB"
  period              = "60"
  statistic           = "Maximum"
  threshold           = "0"
  alarm_description   = "ALB has unhealthy targets"
  alarm_actions       = [aws_sns_topic.alarms.arn]
  ok_actions          = [aws_sns_topic.alarms.arn]

  dimensions = {
    TargetGroup  = data.terraform_remote_state.loadbalancer[0].outputs.target_group_arn
    LoadBalancer = data.terraform_remote_state.loadbalancer[0].outputs.alb_arn
  }

  tags = var.tags
}

# ALB Response Time Alarm
resource "aws_cloudwatch_metric_alarm" "alb_response_time" {
  count               = var.monitor_alb ? 1 : 0
  alarm_name          = "${var.environment}-alb-response-time"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "TargetResponseTime"
  namespace           = "AWS/ApplicationELB"
  period              = "300"
  statistic           = "Average"
  threshold           = var.alb_response_time_threshold
  alarm_description   = "ALB response time is above ${var.alb_response_time_threshold} seconds"
  alarm_actions       = [aws_sns_topic.alarms.arn]

  dimensions = {
    LoadBalancer = data.terraform_remote_state.loadbalancer[0].outputs.alb_arn
  }

  tags = var.tags
}

# ALB 5XX Error Alarm
resource "aws_cloudwatch_metric_alarm" "alb_5xx_errors" {
  count               = var.monitor_alb ? 1 : 0
  alarm_name          = "${var.environment}-alb-5xx-errors"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "1"
  metric_name         = "HTTPCode_Target_5XX_Count"
  namespace           = "AWS/ApplicationELB"
  period              = "300"
  statistic           = "Sum"
  threshold           = var.alb_5xx_threshold
  alarm_description   = "ALB 5XX errors exceed ${var.alb_5xx_threshold}"
  alarm_actions       = [aws_sns_topic.alarms.arn]

  dimensions = {
    LoadBalancer = data.terraform_remote_state.loadbalancer[0].outputs.alb_arn
  }

  tags = var.tags
}

# RDS CPU Utilization (if RDS monitoring enabled)
resource "aws_cloudwatch_metric_alarm" "rds_cpu" {
  count               = var.monitor_rds ? 1 : 0
  alarm_name          = "${var.environment}-rds-cpu-utilization"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "CPUUtilization"
  namespace           = "AWS/RDS"
  period              = "300"
  statistic           = "Average"
  threshold           = var.rds_cpu_threshold
  alarm_description   = "RDS CPU utilization is above ${var.rds_cpu_threshold}%"
  alarm_actions       = [aws_sns_topic.alarms.arn]

  dimensions = {
    DBInstanceIdentifier = data.terraform_remote_state.database[0].outputs.db_instance_id
  }

  tags = var.tags
}

# RDS Storage Space
resource "aws_cloudwatch_metric_alarm" "rds_storage" {
  count               = var.monitor_rds ? 1 : 0
  alarm_name          = "${var.environment}-rds-storage-space"
  comparison_operator = "LessThanThreshold"
  evaluation_periods  = "1"
  metric_name         = "FreeStorageSpace"
  namespace           = "AWS/RDS"
  period              = "300"
  statistic           = "Average"
  threshold           = var.rds_storage_threshold_bytes
  alarm_description   = "RDS free storage space is below threshold"
  alarm_actions       = [aws_sns_topic.alarms.arn]

  dimensions = {
    DBInstanceIdentifier = data.terraform_remote_state.database[0].outputs.db_instance_id
  }

  tags = var.tags
}

# CloudWatch Dashboard
resource "aws_cloudwatch_dashboard" "main" {
  dashboard_name = "${var.environment}-dashboard"

  dashboard_body = jsonencode({
    widgets = concat(
      [
        # EC2 CPU
        {
          type = "metric"
          properties = {
            metrics = [
              ["AWS/EC2", "CPUUtilization", { stat = "Average", label = "CPU" }]
            ]
            period = 300
            stat   = "Average"
            region = var.region
            title  = "EC2 CPU Utilization"
          }
        },
        # EC2 Network
        {
          type = "metric"
          properties = {
            metrics = [
              ["AWS/EC2", "NetworkIn", { stat = "Sum", label = "In" }],
              [".", "NetworkOut", { stat = "Sum", label = "Out" }]
            ]
            period = 300
            stat   = "Sum"
            region = var.region
            title  = "EC2 Network Traffic"
          }
        }
      ],
      var.monitor_alb ? [
        # ALB Requests
        {
          type = "metric"
          properties = {
            metrics = [
              ["AWS/ApplicationELB", "RequestCount", { stat = "Sum" }]
            ]
            period = 300
            stat   = "Sum"
            region = var.region
            title  = "ALB Request Count"
          }
        },
        # ALB Response Time
        {
          type = "metric"
          properties = {
            metrics = [
              ["AWS/ApplicationELB", "TargetResponseTime", { stat = "Average" }]
            ]
            period = 300
            stat   = "Average"
            region = var.region
            title  = "ALB Response Time"
          }
        }
      ] : [],
      var.monitor_rds ? [
        # RDS CPU
        {
          type = "metric"
          properties = {
            metrics = [
              ["AWS/RDS", "CPUUtilization", { stat = "Average" }]
            ]
            period = 300
            stat   = "Average"
            region = var.region
            title  = "RDS CPU Utilization"
          }
        },
        # RDS Connections
        {
          type = "metric"
          properties = {
            metrics = [
              ["AWS/RDS", "DatabaseConnections", { stat = "Sum" }]
            ]
            period = 300
            stat   = "Sum"
            region = var.region
            title  = "RDS Database Connections"
          }
        }
      ] : []
    )
  })
}
