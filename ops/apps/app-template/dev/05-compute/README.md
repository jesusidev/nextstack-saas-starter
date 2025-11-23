# Compute Module (EC2)

## Purpose

Creates an EC2 instance to run the AppTemplate application. Includes IAM roles for S3/ECR/RDS access, security groups, and automated Docker deployment via user data script.

## What's Created

- **EC2 Instance**: Application server (t3.micro by default)
- **Security Group**: Firewall rules (SSH, HTTP, HTTPS, app port)
- **IAM Role**: Permissions for S3, ECR, RDS, CloudWatch
- **IAM Instance Profile**: Attaches role to EC2
- **Elastic IP** (optional): Static public IP
- **User Data Script**: Auto-deploys Docker container on launch

## Prerequisites

- VPC and subnet created (from ops/global)
- SSH key pair created in AWS
- AMI ID for your region (Amazon Linux 2023 or Ubuntu 22.04)

## Dependencies

**Required:**
- `02-storage` - S3 buckets for assets/uploads (IAM permissions)
- `03-registry` - ECR repository (Docker image source)

**Optional:**
- `04-database` - RDS database (Secrets Manager access)

## Used By

- `06-loadbalancer` - ALB targets this EC2 instance
- `08-monitoring` - CloudWatch monitors this instance

## Deployment

```bash
cd ops/apps/app-template/dev/05-compute

# Copy and configure
cp terraform.tfvars.example terraform.tfvars
nano terraform.tfvars

# IMPORTANT: Update these values
# - vpc_id (from ops/global outputs)
# - subnet_id (public subnet)
# - ami_id (get latest AMI for your region)
# - key_name (create SSH key first)
# - ssh_cidr_blocks (restrict to your IP)

# Deploy prerequisites first
cd ../02-storage && terraform apply
cd ../03-registry && terraform apply

# Deploy compute
cd ../05-compute
terraform init
terraform apply

# Get instance details
terraform output instance_public_ip
terraform output app_url
```

## Configuration

### terraform.tfvars

```hcl
# Network (from ops/global)
vpc_id    = "vpc-0123456789"
subnet_id = "subnet-0123456789"

# Instance
instance_type = "t3.micro"     # Dev: t3.micro, Prod: t3.medium+
ami_id        = "ami-xxx"      # Amazon Linux 2023
key_name      = "my-ssh-key"

# Security
ssh_cidr_blocks = ["203.0.113.0/32"]  # Your IP only!

# Optional
allocate_eip = true   # Static IP (costs $3.60/month when not attached)
use_database = true   # If 04-database deployed
```

### Finding the Right AMI

```bash
# Amazon Linux 2023 (recommended)
aws ec2 describe-images \
  --owners amazon \
  --filters "Name=name,Values=al2023-ami-*-x86_64" \
  --query 'sort_by(Images, &CreationDate)[-1].ImageId' \
  --output text

# Ubuntu 22.04 LTS
aws ec2 describe-images \
  --owners 123456789012 \
  --filters "Name=name,Values=ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*" \
  --query 'sort_by(Images, &CreationDate)[-1].ImageId' \
  --output text
```

## User Data Script

The `user_data.sh` script automatically:

1. ✅ Updates system packages
2. ✅ Installs Docker and Docker Compose
3. ✅ Installs AWS CLI v2
4. ✅ Installs CloudWatch agent
5. ✅ Logs into ECR
6. ✅ Pulls latest Docker image
7. ✅ Creates `.env.production` with S3/RDS config
8. ✅ Starts application with docker-compose
9. ✅ Configures log rotation

### Viewing User Data Logs

```bash
ssh ec2-user@<instance-ip>
sudo tail -f /var/log/user-data.log
sudo tail -f /var/log/cloud-init-output.log
```

## IAM Permissions

The EC2 instance has permissions for:

### S3 Access
- Read/write to assets bucket
- Read/write to uploads bucket

### ECR Access
- Pull Docker images
- Login to registry

### RDS Access (if use_database=true)
- Read database credentials from Secrets Manager

### CloudWatch Access
- Create log groups/streams
- Write application logs

## Security Best Practices

### 1. Restrict SSH Access

```hcl
ssh_cidr_blocks = ["YOUR_IP/32"]  # Not 0.0.0.0/0!
```

### 2. Use Systems Manager Session Manager

Instead of SSH, use AWS Session Manager (no open ports):

```bash
aws ssm start-session --target <instance-id>
```

Add this IAM policy to the role:
```json
{
  "Effect": "Allow",
  "Action": [
    "ssm:UpdateInstanceInformation",
    "ssmmessages:CreateControlChannel",
    "ssmmessages:CreateDataChannel",
    "ssmmessages:OpenControlChannel",
    "ssmmessages:OpenDataChannel"
  ],
  "Resource": "*"
}
```

### 3. Encrypt Root Volume

Already enabled by default:
```hcl
encrypted = true
```

## Connecting to the Instance

### SSH Access

```bash
# Get instance IP
INSTANCE_IP=$(terraform output -raw instance_public_ip)

# SSH
ssh -i ~/.ssh/your-key.pem ec2-user@$INSTANCE_IP

# View application logs
docker logs app-template_app_1 -f
```

### Application Access

```bash
# Get app URL
terraform output app_url
# Returns: http://54.123.45.67:3000

# Test health endpoint
curl http://<instance-ip>:3000/api/health
```

## Updating the Application

### Manual Update

```bash
ssh ec2-user@<instance-ip>

cd /opt/app-template

# Pull latest image
aws ecr get-login-password | docker login --username AWS --password-stdin <ecr-url>
docker pull <ecr-url>:latest

# Restart
docker-compose down
docker-compose up -d
```

### Automated Update (CI/CD)

The `09-cicd` module creates a CI user that can:
1. Push new image to ECR
2. SSH to EC2 and trigger deployment
3. Or use AWS Systems Manager Run Command

## Outputs

```bash
terraform output instance_id          # For AWS console
terraform output instance_public_ip   # For SSH/HTTP
terraform output security_group_id    # For ALB configuration
terraform output app_url              # Direct application access
```

## Cost Estimate

| Resource | Configuration | Monthly Cost |
|----------|---------------|--------------|
| EC2 t3.micro | 730 hours | $7.59 |
| EBS gp3 (20GB) | Storage | $1.60 |
| Elastic IP (optional) | If allocated | $3.60 |
| Data Transfer | 1GB out | $0.09 |
| **Total** | **Dev** | **~$9-13/month** |

**Production sizing:**
| Instance Type | vCPU | RAM | Monthly Cost |
|---------------|------|-----|--------------|
| t3.micro | 2 | 1GB | $7.59 |
| t3.small | 2 | 2GB | $15.18 |
| t3.medium | 2 | 4GB | $30.37 |
| t3.large | 2 | 8GB | $60.74 |

## When to Deploy

**Always** - This is the core application server.

## When to Skip

- Using ECS/Fargate instead
- Using Lambda/serverless
- Application hosted externally

## Troubleshooting

### Instance not accessible

1. Check security group allows your IP
2. Verify instance is running: `aws ec2 describe-instances`
3. Check user data script completed: `tail /var/log/cloud-init-output.log`

### Docker container not starting

```bash
ssh ec2-user@<ip>
cd /opt/app-template
docker-compose logs
docker ps -a
```

Common issues:
- ECR login failed (check IAM permissions)
- Image not found (push to ECR first)
- Port already in use (check netstat)

### Can't pull from ECR

```bash
# Manually test ECR login
aws ecr get-login-password --region us-west-2 | \
  docker login --username AWS --password-stdin <account>.dkr.ecr.us-west-2.amazonaws.com

# Check IAM permissions
aws sts get-caller-identity
```

### Database connection fails (if using RDS)

1. Check `use_database = true` in tfvars
2. Verify database security group allows EC2 access
3. Check Secrets Manager permissions in IAM role

```bash
# Test secret retrieval
aws secretsmanager get-secret-value --secret-id <secret-arn>
```

## Next Steps

After deploying compute:

1. **Test application**: Visit the app_url output
2. **Deploy load balancer** (optional): `06-loadbalancer` for HTTPS/SSL
3. **Setup monitoring**: `08-monitoring` for CloudWatch alarms
4. **Configure CI/CD**: `09-cicd` for automated deployments

## Related Modules

- **02-storage**: S3 buckets referenced via IAM
- **03-registry**: ECR repository for Docker images
- **04-database**: Optional RDS connection
- **06-loadbalancer**: Routes traffic to this instance
- **08-monitoring**: Monitors this instance
- **09-cicd**: Deploys to this instance
