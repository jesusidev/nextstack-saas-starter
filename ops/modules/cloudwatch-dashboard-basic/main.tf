terraform {
  required_version = ">= 1.5.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = ">= 5.0"
    }
  }
}

locals {
  dashboard_name = var.dashboard_name != "" ? var.dashboard_name : "${var.name_prefix}-dashboard"

  ec2_cpu_widget = {
    type = "metric"
    x = 0
    y = 0
    width = 12
    height = 6
    properties = {
      metrics = [
        [ "AWS/EC2", "CPUUtilization", "InstanceId", var.instance_id ]
      ]
      period = 60
      stat   = "Average"
      region = var.region
      title  = "EC2 CPU Utilization"
      view   = "timeSeries"
    }
  }

  rds_widget = var.rds_instance_identifier != "" ? [{
    type = "metric"
    x = 12
    y = 0
    width = 12
    height = 6
    properties = {
      metrics = [
        [ "AWS/RDS", "FreeStorageSpace", "DBInstanceIdentifier", var.rds_instance_identifier ]
      ]
      period = 300
      stat   = "Average"
      region = var.region
      title  = "RDS Free Storage Space"
      view   = "timeSeries"
    }
  }] : []

  widgets = concat([local.ec2_cpu_widget], local.rds_widget)
}

resource "aws_cloudwatch_dashboard" "this" {
  dashboard_name = local.dashboard_name
  dashboard_body = jsonencode({
    widgets = local.widgets
  })
}
