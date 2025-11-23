# Modular Deployment Guide

## Overview

This guide shows how to deploy AppTemplate infrastructure using separate Terraform modules instead of a monolithic stack.

## Why Modular?

**Problems with monolithic + feature flags:**
- ❌ Confusing state management during destroy
- ❌ Large blast radius (one change affects everything)
- ❌ Slow deployments (must plan/apply entire stack)
- ❌ Team conflicts when multiple people work
- ❌ Can't skip expensive resources easily

**Benefits of modular approach:**
- ✅ Independent state files (clear ownership)
- ✅ Deploy/destroy only what you need
- ✅ Faster, focused deployments
- ✅ Team can work in parallel
- ✅ Easy to skip modules in dev (no RDS, no ALB)

## Directory Structure

```
dev/
├── 02-storage/         # S3 buckets (always needed)
├── 03-registry/        # ECR repository (always needed)
├── 04-database/        # RDS PostgreSQL (optional)
├── 05-compute/         # EC2 instance (always needed)
├── 06-loadbalancer/    # ALB (production only)
├── 07-dns-certs/       # Route53 + ACM (production only)
├── 08-monitoring/      # CloudWatch (recommended)
└── 09-cicd/            # CI user (recommended)
```

## Quick Start Examples

### Scenario 1: Minimal Development Setup

Deploy only essential infrastructure (~$12/month):

```bash
cd ops/apps/app-template/dev

# Storage
cd 02-storage
cp terraform.tfvars.example terraform.tfvars
terraform init && terraform apply

# Registry
cd ../03-registry
cp terraform.tfvars.example terraform.tfvars
terraform init && terraform apply

# Compute
cd ../05-compute
cp terraform.tfvars.example terraform.tfvars
# Edit to reference storage outputs
terraform init && terraform apply

# CI/CD
cd ../09-cicd
cp terraform.tfvars.example terraform.tfvars
terraform init && terraform apply
```

**Result**: Working app infrastructure without database or load balancer.

### Scenario 2: Full Production Stack

Deploy everything including HA database and SSL (~$70-90/month):

```bash
# Deploy in order:
1. 02-storage      # S3 buckets
2. 03-registry     # ECR
3. 04-database     # RDS (production config)
4. 05-compute      # EC2
5. 06-loadbalancer # ALB
6. 07-dns-certs    # Route53 + ACM
7. 08-monitoring   # CloudWatch
8. 09-cicd         # CI user
```

### Scenario 3: Just S3 Buckets

Need only storage for static assets:

```bash
cd ops/apps/app-template/dev/02-storage
cp terraform.tfvars.example terraform.tfvars
terraform init
terraform apply
```

**That's it!** Only S3 buckets created, nothing else.

## Deployment Order & Dependencies

### Independent Modules (Deploy Anytime)
- `02-storage` - No dependencies
- `03-registry` - No dependencies
- `04-database` - Only needs VPC from global

### Dependent Modules (Deploy After Prerequisites)
- `05-compute` → needs storage, registry
- `06-loadbalancer` → needs compute
- `07-dns-certs` → needs loadbalancer
- `08-monitoring` → needs compute (and optionally database)
- `09-cicd` → needs registry, storage

### Recommended Deployment Flow

```
┌─────────────┐
│   Global    │ (VPC, Subnets - already exists)
└──────┬──────┘
       │
       ├──────────────┬──────────────┬──────────────┐
       │              │              │              │
   ┌───▼───┐    ┌────▼────┐    ┌────▼────┐    ┌───▼────┐
   │Storage│    │Registry │    │Database │    │  ...   │
   └───┬───┘    └────┬────┘    └────┬────┘    └────────┘
       │             │              │
       └─────┬───────┘              │
             │                      │
        ┌────▼─────┐                │
        │ Compute  │◄───────────────┘
        └────┬─────┘
             │
        ┌────▼─────┐
        │   ALB    │
        └────┬─────┘
             │
        ┌────▼─────┐
        │DNS/Certs │
        └──────────┘
```

## Module Details

### 02-storage (S3 Buckets)
**Purpose**: Static assets and file uploads
**Cost**: ~$2-5/month
**When to Deploy**: Always (foundational)
**When to Skip**: Never

```bash
cd 02-storage
terraform init
terraform apply
```

Outputs used by:
- `05-compute` (IAM permissions)
- `09-cicd` (deployment permissions)

### 03-registry (ECR)
**Purpose**: Docker image repository
**Cost**: ~$1-2/month
**When to Deploy**: Always (needed for containerized apps)
**When to Skip**: If using Docker Hub or another registry

### 04-database (RDS PostgreSQL)
**Purpose**: Application database
**Cost**: ~$15-30/month (dev), ~$60-100/month (prod with Multi-AZ)
**When to Deploy**: Staging, QA, Production
**When to Skip**: 
- Early development (use SQLite)
- Using external database service
- Cost-sensitive environments

```bash
# Skip in dev
# Just don't cd into 04-database

# Deploy in prod
cd 04-database
terraform init
terraform apply
```

### 05-compute (EC2 Instance)
**Purpose**: Application server
**Cost**: ~$8-15/month (t3.micro)
**When to Deploy**: Always
**When to Skip**: Never (core application infrastructure)

**Important**: Reads outputs from storage and registry:

```hcl
# In main.tf
data "terraform_remote_state" "storage" {
  backend = "local"
  config = {
    path = "../02-storage/terraform.tfstate"
  }
}

# Use outputs
s3_access_arns = [
  data.terraform_remote_state.storage.outputs.assets_bucket_arn,
  data.terraform_remote_state.storage.outputs.uploads_bucket_arn
]
```

### 06-loadbalancer (ALB)
**Purpose**: Load balancing, SSL termination
**Cost**: ~$16-20/month
**When to Deploy**: Production, Staging
**When to Skip**: Development (access EC2 directly)

### 07-dns-certs (Route53 + ACM)
**Purpose**: Custom domain and SSL certificates
**Cost**: ~$0.50-1/month (Route53 hosted zone)
**When to Deploy**: Production with custom domain
**When to Skip**: Development, QA (use ALB DNS or IP)

### 08-monitoring (CloudWatch)
**Purpose**: Alarms, dashboards, logs
**Cost**: ~$1-3/month
**When to Deploy**: Always recommended
**When to Skip**: Very early development

### 09-cicd (CI User)
**Purpose**: CI/CD pipeline credentials
**Cost**: Free
**When to Deploy**: Always (needed for deployments)
**When to Skip**: Manual deployments only

## Working with Outputs

Modules share data via `terraform_remote_state`:

```hcl
# In 05-compute/main.tf
data "terraform_remote_state" "storage" {
  backend = "local"
  config = {
    path = "../02-storage/terraform.tfstate"
  }
}

# Access outputs
bucket_arn = data.terraform_remote_state.storage.outputs.assets_bucket_arn
```

**Note**: You must deploy the prerequisite module first, or the data source will fail.

## Common Workflows

### Add Database to Existing Setup

```bash
# 1. Deploy database
cd 04-database
cp terraform.tfvars.example terraform.tfvars
nano terraform.tfvars  # Configure
terraform init && terraform apply

# 2. Note the endpoint and secret ARN
terraform output rds_endpoint
terraform output rds_secret_arn

# 3. Update compute module to use it
cd ../05-compute
nano main.tf  # Add data source for database
terraform apply  # Update IAM permissions
```

### Remove Database to Save Costs

```bash
cd 04-database
terraform destroy

# Compute module continues working
# (if your app doesn't require database)
```

### Deploy Only S3 and Registry for Initial Setup

```bash
cd 02-storage && terraform apply
cd ../03-registry && terraform apply

# Push first Docker image
# Later deploy compute when ready
```

## Destroy Strategies

### Destroy Everything (Full Cleanup)

```bash
# Destroy in reverse order
cd 09-cicd && terraform destroy
cd ../08-monitoring && terraform destroy
cd ../07-dns-certs && terraform destroy
cd ../06-loadbalancer && terraform destroy
cd ../05-compute && terraform destroy
cd ../04-database && terraform destroy
cd ../03-registry && terraform destroy
cd ../02-storage && terraform destroy
```

### Destroy Only Database (Cost Savings)

```bash
cd 04-database
terraform destroy
# Everything else continues running
```

### Destroy Only Load Balancer

```bash
cd 06-loadbalancer
terraform destroy
# App still accessible via EC2 public IP
```

## Troubleshooting

### Error: "No state file found"
**Cause**: Trying to read outputs from a module that hasn't been deployed
**Solution**: Deploy the prerequisite module first

```bash
# If compute fails because storage doesn't exist
cd ../02-storage
terraform apply

cd ../05-compute
terraform apply
```

### Error: "Security group not found"
**Cause**: Compute module not deployed yet, but database trying to reference it
**Solution**: Deploy compute before database, or remove security group reference

### Module outputs are null
**Cause**: Module not deployed or failed
**Solution**: Check module state

```bash
cd <module-dir>
terraform state list  # Should show resources
terraform output      # Should show values
```

## Best Practices

1. **Deploy in order** - Follow dependency chain
2. **One module at a time** - Don't rush, verify outputs
3. **Use terraform.tfvars** - Keep configurations version-controlled
4. **Remote state** - Consider S3 backend for team collaboration
5. **Document changes** - Update module READMEs when modifying
6. **Test destroy** - Occasionally test destruction in dev

## Cost Optimization Matrix

| Environment | Modules | Monthly Cost |
|-------------|---------|--------------|
| **Minimal Dev** | Storage + Registry + Compute + CI | ~$12 |
| **Standard Dev** | Above + Monitoring | ~$15 |
| **With Database** | Above + Database | ~$30 |
| **Full Staging** | All except DNS | ~$50 |
| **Production** | All modules + HA configs | ~$80-100 |

## Comparison: Monolithic vs Modular

### Monolithic (Current)
```bash
cd ops/apps/app-template/dev
terraform apply  # Deploys everything
# Cost: $70-90/month in dev (can't skip RDS/ALB)
```

### Modular (Recommended)
```bash
cd ops/apps/app-template/dev
cd 02-storage && terraform apply
cd ../03-registry && terraform apply
cd ../05-compute && terraform apply
cd ../09-cicd && terraform apply
# Cost: $12/month (skipped expensive resources)
```

## Next Steps

1. **Try it**: Start with `02-storage` module
2. **Validate**: Ensure outputs work correctly
3. **Expand**: Add modules incrementally
4. **Document**: Update team deployment docs
5. **Automate**: Create deployment scripts

## Questions?

See individual module READMEs:
- [Storage Module](./02-storage/README.md)
- [Database Module](./04-database/README.md)
- [Architecture Overview](./MODULAR_ARCHITECTURE.md)
