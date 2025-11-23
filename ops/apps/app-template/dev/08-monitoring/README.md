# Monitoring Module (CloudWatch)

## Purpose

Sets up comprehensive monitoring and alerting for AppTemplate infrastructure. Creates CloudWatch alarms, dashboards, and SNS notifications for proactive issue detection.

## What's Created

- **SNS Topic**: Alert notification channel
- **Email Subscription**: Sends alerts to specified email
- **CloudWatch Log Group**: Centralized application logs
- **EC2 Alarms**: CPU utilization, status checks
- **ALB Alarms** (optional): Unhealthy targets, response time, 5XX errors
- **RDS Alarms** (optional): CPU, storage space, connections
- **CloudWatch Dashboard**: Visual metrics overview

## Prerequisites

- EC2 instance deployed (from 05-compute)

## Dependencies

**Required:**
- `05-compute` - EC2 metrics to monitor

**Optional:**
- `06-loadbalancer` - ALB metrics (set `monitor_alb = true`)
- `04-database` - RDS metrics (set `monitor_rds = true`)

## Used By

**None** - This is a monitoring-only module

## Deployment

```bash
cd ops/apps/app-template/dev/08-monitoring

cp terraform.tfvars.example terraform.tfvars
nano terraform.tfvars

# Set your email for alerts
alarm_email = "your-email@domain.com"

# Enable ALB monitoring if deployed
monitor_alb = true

# Enable RDS monitoring if deployed
monitor_rds = true

terraform init
terraform apply
```

**Important**: Check your email for SNS subscription confirmation!

## Configuration

### terraform.tfvars

```hcl
# Your email for alerts
alarm_email = "ops@app-template.com"

# Log retention
log_retention_days = 7   # Dev: 7, Prod: 30-90

# Enable module monitoring
monitor_alb = true   # If load balancer deployed
monitor_rds = true   # If database deployed

# Thresholds (adjust based on your needs)
ec2_cpu_threshold              = 80   # %
alb_response_time_threshold    = 2    # seconds
alb_5xx_threshold             = 10   # count per 5 min
rds_cpu_threshold             = 80   # %
rds_storage_threshold_bytes    = 5GB
```

## Alarms Overview

### EC2 Alarms (Always Created)

| Alarm | Metric | Threshold | Description |
|-------|--------|-----------|-------------|
| **CPU Utilization** | CPUUtilization | 80% | High CPU usage |
| **Status Check Failed** | StatusCheckFailed | >0 | Instance health issues |

### ALB Alarms (if monitor_alb=true)

| Alarm | Metric | Threshold | Description |
|-------|--------|-----------|-------------|
| **Unhealthy Targets** | UnHealthyHostCount | >0 | EC2 failing health checks |
| **Response Time** | TargetResponseTime | >2s | Slow application responses |
| **5XX Errors** | HTTPCode_Target_5XX | >10 | Server errors |

### RDS Alarms (if monitor_rds=true)

| Alarm | Metric | Threshold | Description |
|-------|--------|-----------|-------------|
| **CPU Utilization** | CPUUtilization | 80% | High database CPU |
| **Free Storage** | FreeStorageSpace | <5GB | Low disk space |

## Email Notifications

After deployment, you'll receive:

1. **SNS Subscription Email**: Click "Confirm subscription"
2. **Alarm Notifications**: When thresholds breached
3. **OK Notifications**: When alarms recover

### Example Alarm Email

```
You are receiving this email because your Amazon CloudWatch Alarm 
"dev-ec2-cpu-utilization" in US West (Oregon) region has entered 
the ALARM state.

Alarm Details:
- New State: ALARM
- Reason: Threshold Crossed: 1 datapoint [85.2] was greater than 
  the threshold (80.0).
- Timestamp: 2025-11-06 10:30:00 UTC
```

## CloudWatch Dashboard

Visual overview of all metrics in one place.

### Accessing Dashboard

```bash
# Get dashboard URL
terraform output dashboard_url

# Or manually:
AWS Console → CloudWatch → Dashboards → dev-dashboard
```

### Dashboard Widgets

**Always Included:**
- EC2 CPU Utilization
- EC2 Network Traffic

**If monitor_alb=true:**
- ALB Request Count
- ALB Response Time
- ALB Healthy/Unhealthy Targets

**If monitor_rds=true:**
- RDS CPU Utilization
- RDS Database Connections
- RDS Free Storage Space

## Viewing Logs

### Via AWS Console

```
CloudWatch → Logs → Log Groups → /aws/ec2/dev
```

### Via CLI

```bash
# Tail recent logs
aws logs tail /aws/ec2/dev --follow

# Search logs
aws logs filter-log-events \
  --log-group-name /aws/ec2/dev \
  --filter-pattern "ERROR"

# Export logs
aws logs create-export-task \
  --log-group-name /aws/ec2/dev \
  --from 1635724800000 \
  --to 1635811200000 \
  --destination s3-bucket-name
```

## Adjusting Thresholds

### Development vs Production

**Development (relaxed):**
```hcl
ec2_cpu_threshold           = 90   # Allow higher usage
alb_response_time_threshold = 5    # More lenient
alb_5xx_threshold          = 50   # Expect some errors
log_retention_days         = 7    # Short retention
```

**Production (strict):**
```hcl
ec2_cpu_threshold           = 70   # Alert early
alb_response_time_threshold = 1    # Fast responses
alb_5xx_threshold          = 5    # Low error tolerance
log_retention_days         = 90   # Long retention for audit
```

## Alarm Actions

When alarm triggers:

1. ✅ SNS notification sent to email
2. ✅ Alarm state logged in CloudWatch
3. ✅ Dashboard updated to show red status
4. 🔔 Optional: Trigger Lambda for auto-remediation
5. 🔔 Optional: Integrate with PagerDuty/Slack

### Adding Slack Integration

```bash
# Create Lambda to forward SNS to Slack
# Subscribe Lambda to SNS topic
aws sns subscribe \
  --topic-arn $(terraform output -raw sns_topic_arn) \
  --protocol lambda \
  --notification-endpoint arn:aws:lambda:us-west-2:xxx:function:sns-to-slack
```

## Cost Estimate

| Resource | Quantity | Monthly Cost |
|----------|----------|--------------|
| CloudWatch Alarms | 7 standard | $0.70 (7 × $0.10) |
| CloudWatch Dashboard | 1 | $3.00 |
| SNS Notifications | 100/month | Free (first 1000) |
| CloudWatch Logs (1GB) | Ingestion | $0.50 |
| CloudWatch Logs Storage | 7 days | $0.03 |
| **Total** | **Dev** | **~$4-5/month** |

**Production (more alarms):**
- 15 alarms: $1.50
- 3 dashboards: $9.00
- 10GB logs/month: $5.30
- **Total: ~$15-20/month**

## When to Deploy

**Always recommended** - Monitoring is critical for all environments.

## When to Skip

- Very early development (pre-alpha)
- Temporary/testing environments
- Cost-extremely-sensitive scenarios

**Even then, basic EC2 monitoring is recommended.**

## Outputs

```bash
terraform output sns_topic_arn    # For additional subscriptions
terraform output log_group_name   # For application logging
terraform output dashboard_url    # Direct link to dashboard
```

## Advanced Monitoring

### Custom Metrics

Add custom application metrics:

```bash
# From EC2 instance
aws cloudwatch put-metric-data \
  --namespace AppTemplate \
  --metric-name ActiveUsers \
  --value 1234 \
  --unit Count
```

### Composite Alarms

Combine multiple alarms:

```hcl
resource "aws_cloudwatch_composite_alarm" "critical" {
  alarm_name          = "critical-system-failure"
  alarm_description   = "Multiple critical components failing"
  actions_enabled     = true
  alarm_actions       = [aws_sns_topic.alarms.arn]
  
  alarm_rule = "ALARM(${aws_cloudwatch_metric_alarm.ec2_status_check.alarm_name}) AND ALARM(${aws_cloudwatch_metric_alarm.alb_unhealthy_targets[0].alarm_name})"
}
```

### Anomaly Detection

Use ML-based anomaly detection:

```hcl
resource "aws_cloudwatch_metric_alarm" "anomaly" {
  alarm_name          = "ec2-cpu-anomaly"
  comparison_operator = "LessThanLowerOrGreaterThanUpperThreshold"
  evaluation_periods  = 2
  threshold_metric_id = "e1"
  
  metric_query {
    id          = "e1"
    expression  = "ANOMALY_DETECTION_BAND(m1)"
    label       = "CPU Utilization (Expected)"
    return_data = "true"
  }
  
  metric_query {
    id = "m1"
    metric {
      metric_name = "CPUUtilization"
      namespace   = "AWS/EC2"
      period      = 300
      stat        = "Average"
      dimensions = {
        InstanceId = data.terraform_remote_state.compute.outputs.instance_id
      }
    }
  }
}
```

## Troubleshooting

### Not receiving email alerts

1. **Check SNS subscription status:**
   ```bash
   aws sns list-subscriptions-by-topic \
     --topic-arn $(terraform output -raw sns_topic_arn)
   ```

2. **Confirm subscription**: Check email spam folder

3. **Test notification:**
   ```bash
   aws sns publish \
     --topic-arn $(terraform output -raw sns_topic_arn) \
     --message "Test alert"
   ```

### Alarm in INSUFFICIENT_DATA state

- Not enough metric data collected yet
- Wait 5-10 minutes after deployment
- Verify resource is running and emitting metrics

### Logs not appearing

1. **Check CloudWatch agent installed** (on EC2)
2. **Verify IAM permissions** (compute module includes these)
3. **Check log group exists:**
   ```bash
   aws logs describe-log-groups --log-group-name-prefix /aws/ec2/
   ```

### Dashboard shows "No data"

- Metrics take 5-10 minutes to appear
- Verify resources are running
- Check correct region selected in dashboard

## Best Practices

1. **Test alarms**: Manually trigger thresholds to verify alerts
2. **Adjust thresholds**: Based on actual usage patterns
3. **Document runbooks**: What to do when each alarm fires
4. **Regular reviews**: Check dashboard weekly
5. **Archive logs**: Export to S3 for long-term storage
6. **Tag everything**: Makes filtering and searching easier

## Integration with Other Tools

### PagerDuty
```bash
aws sns subscribe \
  --topic-arn $(terraform output -raw sns_topic_arn) \
  --protocol https \
  --notification-endpoint https://events.pagerduty.com/integration/xxx/enqueue
```

### Slack
Use AWS Chatbot or Lambda function to forward alerts.

### Datadog/New Relic
Install agents on EC2 for enhanced monitoring.

## Next Steps

After deploying monitoring:

1. **Confirm SNS subscription**: Check your email
2. **Review dashboard**: Ensure metrics are flowing
3. **Test an alarm**: Temporarily lower threshold to trigger
4. **Document responses**: Create runbook for each alarm
5. **Setup CI/CD**: `09-cicd` for automated deployments

## Related Modules

- **05-compute**: Primary monitoring target
- **06-loadbalancer**: Optional ALB monitoring
- **04-database**: Optional RDS monitoring
- **09-cicd**: Can trigger deploys on alarm recovery
