# Load Balancer Module (ALB)

## Purpose

Creates an Application Load Balancer to distribute traffic to EC2 instances, enable SSL/TLS termination, and provide high availability.

## What's Created

- **Application Load Balancer**: Layer 7 load balancer
- **Target Group**: Routes traffic to EC2 instances
- **Security Group**: Allows HTTP/HTTPS from internet
- **HTTP Listener**: Port 80 (redirects to HTTPS if cert configured)
- **HTTPS Listener**: Port 443 (if certificate provided)
- **Health Checks**: Monitors instance health

## Prerequisites

- VPC with at least 2 public subnets in different AZs
- EC2 instance running (from 05-compute)

## Dependencies

**Required:**
- `05-compute` - EC2 instance to route traffic to

**Optional:**
- `07-dns-certs` - ACM certificate for HTTPS

## Used By

- `07-dns-certs` - Route53 points to this ALB

## Deployment

```bash
cd ops/apps/app-template/dev/06-loadbalancer

# Copy and configure
cp terraform.tfvars.example terraform.tfvars
nano terraform.tfvars

# IMPORTANT: Update these values
# - vpc_id (from ops/global)
# - subnet_ids (at least 2, different AZs)
# - target_port (must match app_port from compute)

# Deploy compute first
cd ../05-compute && terraform apply

# Deploy load balancer
cd ../06-loadbalancer
terraform init
terraform apply

# Get ALB DNS name
terraform output alb_dns_name
terraform output alb_url
```

## Configuration

### terraform.tfvars

```hcl
# Network
vpc_id = "vpc-0123456789"
subnet_ids = [
  "subnet-abc123",  # us-west-2a
  "subnet-def456"   # us-west-2b
]

# Application
target_port = 3000
health_check_path = "/api/health"

# SSL (after 07-dns-certs deployed)
certificate_arn = "arn:aws:acm:us-west-2:123456789:certificate/xxx"

# Production settings
enable_deletion_protection = true
```

### Finding Public Subnets

```bash
# List all subnets in VPC
aws ec2 describe-subnets \
  --filters "Name=vpc-id,Values=vpc-xxx" \
  --query 'Subnets[*].[SubnetId,AvailabilityZone,Tags[?Key==`Name`].Value|[0]]' \
  --output table

# Filter for public subnets
aws ec2 describe-subnets \
  --filters "Name=vpc-id,Values=vpc-xxx" "Name=tag:Type,Values=public" \
  --query 'Subnets[*].[SubnetId,AvailabilityZone]' \
  --output table
```

**Important**: ALB requires subnets in at least 2 different availability zones.

## HTTP to HTTPS Redirect

When `certificate_arn` is provided, HTTP listener automatically redirects to HTTPS:

```
User → http://alb-dns-name → 301 Redirect → https://alb-dns-name → EC2
```

Without certificate, HTTP listener forwards directly:

```
User → http://alb-dns-name → EC2
```

## Health Checks

The ALB continuously monitors EC2 instance health:

- **Interval**: Every 30 seconds
- **Timeout**: 5 seconds
- **Healthy Threshold**: 2 consecutive successes
- **Unhealthy Threshold**: 3 consecutive failures
- **Path**: `/api/health` (configurable)
- **Expected Status**: 200 OK

### Creating a Health Check Endpoint

Ensure your app has a health endpoint:

```typescript
// app/api/health/route.ts
export async function GET() {
  return Response.json({ status: 'ok' }, { status: 200 });
}
```

## Sticky Sessions

Enabled by default with `lb_cookie` for 24 hours. This ensures users stay on the same instance for session continuity.

## Security

### ALB Security Group

- **Ingress**: HTTP (80) and HTTPS (443) from anywhere
- **Egress**: All traffic to VPC (for EC2 communication)

### EC2 Security Group Update

After deploying ALB, update EC2 security group to only accept traffic from ALB:

```hcl
# In 05-compute/main.tf
ingress {
  from_port       = var.app_port
  to_port         = var.app_port
  protocol        = "tcp"
  security_groups = [data.terraform_remote_state.loadbalancer.outputs.alb_security_group_id]
  description     = "App port from ALB only"
}
```

## Accessing the Application

### Via ALB (Recommended)

```bash
# Get ALB DNS name
ALB_DNS=$(terraform output -raw alb_dns_name)

# Access application
curl http://$ALB_DNS
# or
open http://$ALB_DNS
```

### Direct to EC2 (Not Recommended)

```bash
# Still works but bypasses load balancer
EC2_IP=$(cd ../05-compute && terraform output -raw instance_public_ip)
curl http://$EC2_IP:3000
```

## Monitoring

### Check Target Health

```bash
# Get target group ARN
TG_ARN=$(terraform output -raw target_group_arn)

# Check health status
aws elbv2 describe-target-health --target-group-arn $TG_ARN
```

### Common Health Check Issues

**Unhealthy Target:**
```json
{
  "State": "unhealthy",
  "Reason": "Target.ResponseCodeMismatch",
  "Description": "Health checks failed with these codes: [404]"
}
```

**Solutions:**
1. Verify health check path exists: `curl http://ec2-ip:3000/api/health`
2. Check app is running: `ssh ec2-user@ec2-ip; docker ps`
3. Review security groups allow ALB → EC2 traffic
4. Check EC2 instance logs

## Outputs

```bash
terraform output alb_dns_name         # For Route53 or direct access
terraform output alb_zone_id          # For Route53 alias records
terraform output alb_url              # Full URL (http:// or https://)
terraform output target_group_arn     # For monitoring
terraform output alb_security_group_id # For EC2 security group rules
```

## Cost Estimate

| Resource | Configuration | Monthly Cost |
|----------|---------------|--------------|
| ALB | Active hours | $16.20 (730 hours × $0.0225/hour) |
| LCU (Load Balancer Capacity Units) | Light traffic | ~$5-10 |
| Data Processing | 1GB | $0.008/GB |
| **Total** | **Dev (low traffic)** | **~$21-26/month** |

**LCU Pricing:**
- New connections: $0.008 per LCU-hour
- Active connections: $0.008 per LCU-hour
- Processed bytes: $0.008 per LCU-hour
- Rule evaluations: $0.008 per LCU-hour

**Cost Optimization:**
- Consider skipping ALB in dev (access EC2 directly)
- Use ALB in staging/production for SSL and HA

## When to Deploy

- **Production**: Always (for SSL, HA, auto-scaling)
- **Staging**: Recommended (matches prod architecture)
- **Development**: Optional (can access EC2 directly)

## When to Skip

- Cost-sensitive dev environments ($21-26/month savings)
- Single-instance deployments without SSL needs
- Using CloudFront or another CDN as entry point

## SSL/TLS Configuration

### Without Certificate (HTTP Only)

```hcl
certificate_arn = ""
```

- ALB serves HTTP only on port 80
- No encryption between user and ALB
- Not recommended for production

### With Certificate (HTTPS)

```hcl
certificate_arn = "arn:aws:acm:us-west-2:xxx:certificate/xxx"
```

- ALB serves HTTPS on port 443
- HTTP redirects to HTTPS
- Uses TLS 1.3 for best security

Get certificate ARN from `07-dns-certs` module:

```bash
cd ../07-dns-certs
terraform output certificate_arn
```

## Troubleshooting

### Error: "ALB requires at least 2 subnets in different AZs"

**Solution**: Provide subnets in different availability zones

```hcl
subnet_ids = [
  "subnet-abc123",  # us-west-2a
  "subnet-def456"   # us-west-2b (different AZ)
]
```

### Target shows as unhealthy

1. **Check health endpoint**:
   ```bash
   curl http://<ec2-ip>:3000/api/health
   ```

2. **Review target health**:
   ```bash
   aws elbv2 describe-target-health --target-group-arn <arn>
   ```

3. **Check security groups**:
   - ALB SG allows outbound to EC2
   - EC2 SG allows inbound from ALB

4. **Verify app is running**:
   ```bash
   ssh ec2-user@<ec2-ip>
   docker ps
   docker logs <container-id>
   ```

### 502 Bad Gateway

**Causes:**
- EC2 instance not responding
- App crashed or not started
- Incorrect target port
- Security group blocking traffic

**Debug:**
```bash
# Check target health
aws elbv2 describe-target-health --target-group-arn <arn>

# Test direct EC2 access
curl http://<ec2-ip>:3000

# Check app logs
ssh ec2-user@<ec2-ip>
docker logs -f app-template_app_1
```

### Certificate validation pending

If using ACM certificate:
1. Certificate must be validated (DNS or email)
2. Certificate must be in same region as ALB
3. Domain must match certificate CN/SAN

```bash
aws acm describe-certificate --certificate-arn <arn>
```

## Next Steps

After deploying load balancer:

1. **Test HTTP access**: Visit the ALB URL
2. **Deploy DNS/certs**: `07-dns-certs` for custom domain + HTTPS
3. **Update EC2 security group**: Restrict to ALB traffic only
4. **Setup monitoring**: `08-monitoring` for ALB metrics
5. **Configure CI/CD**: Update deployment scripts to use ALB

## Related Modules

- **05-compute**: Target for ALB traffic
- **07-dns-certs**: Custom domain + SSL certificate
- **08-monitoring**: CloudWatch alarms for ALB health
