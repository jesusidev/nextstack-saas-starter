# Database Module

## Purpose
Manages RDS PostgreSQL database instance for the application.

## Resources Created
- RDS PostgreSQL instance
- DB subnet group
- Security group for RDS
- Secrets Manager secret for database credentials
- Automated backups

## Prerequisites
Deploy **after** the compute module if you need to allow EC2 access:

```bash
# 1. Deploy compute first
cd ../05-compute
terraform apply

# 2. Get the security group ID
terraform output ec2_security_group_id

# 3. Use it in database module
cd ../04-database
# Add to terraform.tfvars:
# allowed_security_group_ids = ["sg-xxxxxxxxx"]
```

## Deployment

```bash
# Copy and edit variables
cp terraform.tfvars.example terraform.tfvars
nano terraform.tfvars

# Deploy
terraform init
terraform plan
terraform apply

# Cleanup
terraform destroy
```

## Outputs
- `rds_endpoint` - Database connection endpoint
- `rds_port` - Database port (5432)
- `rds_secret_arn` - Secrets Manager ARN with credentials
- `db_name` - Database name

## Used By
- `05-compute` - EC2 application connects to this database
- `08-monitoring` - CloudWatch monitors RDS metrics

## Dependencies
- `ops/global` - Requires VPC and private subnets
- `05-compute` (optional) - For security group access

## Cost
- **dev (t3.micro)**: ~$15-20/month
- **prod (t3.small, Multi-AZ)**: ~$60-80/month

## Important Notes

### When to Deploy
- **Development**: Optional - can use external database or SQLite
- **Staging/QA**: Recommended for realistic testing
- **Production**: Required

### When to Skip
Skip this module in development if:
- Using an external database service
- Testing with local SQLite/PostgreSQL
- Cost-conscious early development

Simply don't deploy this directory - compute module will work without it.

### Security
- Database is in private subnets (no internet access)
- Access controlled via security groups
- Credentials stored in Secrets Manager
- Automated backups enabled (7 days retention)

### High Availability
For production, enable:
```hcl
multi_az = true
instance_class = "db.t3.small"
deletion_protection = true
```
