# AWS Infrastructure

This operations guide describes the modular, cost-optimized AWS infrastructure using Terraform.

## Architecture Overview

This template uses a **modular Terraform approach** with separate state files for each infrastructure component:

- **Global Infrastructure**: VPC, subnets, networking (shared across apps)
- **Modular Application Stack**: Independent modules for storage, compute, database, etc.
- **Cost-Optimized**: Deploy only what you need, when you need it
- **Isolated State**: Each module has its own Terraform state for safety

See ops/aws-architecture.md for the detailed architecture.

### Modular Infrastructure Model

```
┌─────────────────────────────────────────────────────────────┐
│                    DEPLOYMENT ARCHITECTURE                  │
├─────────────────────────────────────────────────────────────┤
│  Global Infrastructure (ops/global/)                        │
│     ├─ VPC (multi‑AZ) + subnets                             │
│     ├─ Internet Gateway (+ optional NAT Gateways)           │
│     ├─ Route tables & DB subnet groups                      │
│     └─ Shared across all applications                       │
├─────────────────────────────────────────────────────────────┤
│  Application Modules (ops/apps/app-template/dev/)           │
│     ├─ 02-storage/      → S3 buckets (always)               │
│     ├─ 03-registry/     → ECR repository (always)           │
│     ├─ 04-database/     → RDS PostgreSQL (optional)         │
│     ├─ 05-compute/      → EC2 instance (always)             │
│     ├─ 06-loadbalancer/ → ALB (optional)                    │
│     ├─ 07-dns-certs/    → Route53 + ACM (optional)          │
│     ├─ 08-monitoring/   → CloudWatch (recommended)          │
│     └─ 09-cicd/         → CI/CD IAM user (always)           │
│                                                              │
│  Each module has its own Terraform state file               │
└─────────────────────────────────────────────────────────────┘
```

## Directory Structure

```
ops/
├── aws-architecture.md         # Architecture documentation
├── README.md                   # This file
├── modules/                    # Reusable Terraform modules
│   ├── vpc-lean/               # Minimal VPC with public/private subnets
│   ├── s3-bucket-simple/       # S3 bucket with versioning and encryption
│   ├── ecr-repo-simple/        # ECR repository with lifecycle policies
│   ├── ec2-app/                # EC2 instance with Docker and IAM
│   ├── alb-simple/             # Application Load Balancer
│   ├── acm-certificate/        # ACM certificate with DNS validation
│   ├── route53-records/        # Route53 DNS records
│   ├── rds-postgres/           # PostgreSQL RDS with Secrets Manager
│   ├── secrets-manager-secret/ # Secrets Manager secret
│   ├── iam-ci-user/            # CI/CD IAM user with least privilege
│   ├── cloudwatch-basic/       # CloudWatch alarms
│   ├── cloudwatch-log-group/   # CloudWatch log groups
│   ├── cloudwatch-dashboard-basic/ # CloudWatch dashboards
│   └── cloudtrail-basic/       # CloudTrail audit logging
├── global/                     # Global VPC infrastructure
│   ├── main.tf
│   ├── variables.tf
│   ├── outputs.tf
│   ├── cloudtrail.tf
│   ├── terraform.tfvars.dev
│   ├── terraform.tfvars.qa
│   └── terraform.tfvars.prod
└── apps/
    └── app-template/           # Generic application infrastructure template
        └── dev/                # Development environment (modular)
            ├── 02-storage/     # S3 buckets
            ├── 03-registry/    # ECR repository
            ├── 04-database/    # RDS PostgreSQL
            ├── 05-compute/     # EC2 instance
            ├── 06-loadbalancer/ # Application Load Balancer
            ├── 07-dns-certs/   # Route53 + ACM
            ├── 08-monitoring/  # CloudWatch
            ├── 09-cicd/        # CI/CD IAM user
            ├── README.md       # Module overview
            └── DEPLOYMENT_GUIDE.md # Deployment instructions
```

### Quick Start

#### 1. Deploy Global Infrastructure (One Time)

```bash
cd ops/global
terraform init
terraform plan -var-file=terraform.tfvars.dev
terraform apply -var-file=terraform.tfvars.dev
```

This creates the VPC, subnets, and networking shared by all applications.

#### 2. Deploy Application Modules (Modular Approach)

This template uses a **modular deployment** where each infrastructure component is deployed independently:

```bash
cd ops/apps/app-template/dev

# Deploy essential modules (always needed)
cd 02-storage && terraform init && terraform apply  # S3 buckets
cd ../03-registry && terraform init && terraform apply  # ECR
cd ../05-compute && terraform init && terraform apply  # EC2
cd ../09-cicd && terraform init && terraform apply  # CI/CD user

# Deploy optional modules (as needed)
cd ../04-database && terraform init && terraform apply  # RDS (optional)
cd ../06-loadbalancer && terraform init && terraform apply  # ALB (optional)
cd ../07-dns-certs && terraform init && terraform apply  # Route53 + ACM (optional)
cd ../08-monitoring && terraform init && terraform apply  # CloudWatch (recommended)
```

**Benefits of Modular Approach:**
- ✅ Deploy only what you need (save costs in dev)
- ✅ Independent state files (isolated blast radius)
- ✅ Faster deployments (focused changes)
- ✅ Easy to add/remove components

See [ops/apps/app-template/dev/README.md](./apps/app-template/dev/README.md) for detailed deployment guide.

## Global Environment Support

The global setup supports multiple environments using the same patterns:

### Global-Dev Environment (10.0.0.0/16)

- Public subnets for EC2/optional ALB
- Private subnets for RDS (optional)

### Global-QA Environment (10.1.0.0/16)

- Mirrors dev layout; requires separate AWS account configuration

### Global-Prod Environment (10.2.0.0/16)

- Mirrors dev layout; production hardening recommended (ACM/ALB, CloudTrail, alarms)

## Shared Infrastructure Components

Note: There is no ops/shared directory. These are shared concerns implemented via existing modules and configuration:

- Monitoring and dashboards: use `ops/modules/cloudwatch-basic`, `ops/modules/cloudwatch-log-group`, and `ops/modules/cloudwatch-dashboard-basic`; enable CloudTrail via `ops/modules/cloudtrail-basic` as needed
- Cross-app security: implemented via security groups and IAM in `ops/modules/ec2-app` with least-privilege policies
- State management: for production, configure Terraform remote state in S3 with DynamoDB locking (see the "Remote State Configuration" section below)

## Environment Characteristics

### Development (~$12-15/month)
- **Essential modules only**: Storage, Registry, Compute, CI/CD
- **Skip expensive resources**: No RDS, no ALB, no custom domain
- **Instance type**: t3.micro
- **Cost optimization**: Deploy only what you need

### Staging/QA (~$30-50/month)
- **Add database**: RDS single-AZ for testing
- **Add monitoring**: CloudWatch alarms and dashboards
- **Optional ALB**: For load testing
- **Instance type**: t3.small

### Production (~$70-100/month)
- **All modules deployed**: Full infrastructure stack
- **High availability**: RDS Multi-AZ, multiple EC2 instances
- **Security**: ALB with ACM certificates, CloudTrail enabled
- **Instance type**: t3.medium or larger

## Prerequisites

1. AWS CLI configured with appropriate credentials
2. Terraform >= 1.5
3. AWS permissions for VPC, EC2, S3, IAM, and RDS (if enabled)
4. AWS Provider (hashicorp/aws) version >= 5.0

## Deployment Workflow

### Global Infrastructure

Deploy once per environment (dev/qa/prod):

```bash
cd ops/global
terraform init
terraform apply -var-file=terraform.tfvars.dev  # or .qa, .prod
```

### Application Modules

Deploy modules independently in each environment:

```bash
cd ops/apps/app-template/dev/<module-name>
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars with your configuration
terraform init
terraform apply
```

**Deployment Order:**
1. Storage (02-storage) - No dependencies
2. Registry (03-registry) - No dependencies  
3. Database (04-database) - Optional, needs VPC from global
4. Compute (05-compute) - Needs storage + registry
5. Load Balancer (06-loadbalancer) - Needs compute
6. DNS/Certs (07-dns-certs) - Needs load balancer
7. Monitoring (08-monitoring) - Needs compute
8. CI/CD (09-cicd) - Needs storage + registry

### AWS Tag Policy Compliance

- Follow organizational tag policies for environment, owner, and project when adopting the shared infra model.

```terraform
tags = {
  project     = "your-app-name" # Replace with your project name
  environment = "dev" # Must be: prod, dev, qa, global-dev, global-qa, global-prod
  owner       = "DevTeam" # Must be: DevTeam
  ManagedBy   = "Terraform" # Must be: Terraform
  Layer       = "ops-apps-your-app-dev" # Must be directory driven: ex. ops/global = ops-global
  }
```

## Getting Started

### Deployment Order

1. Global infrastructure (VPC/subnets/IGW, optional NAT)
2. Application layer (EC2 + Docker, S3 buckets, optional RDS/ALB)

### Quick Start - New Application

- For the lean baseline, provision per docs/aws-infra-setup.md (VPC, subnets, S3, EC2, optional RDS/ALB).

### Quick Start - Using App Template

- When ready to codify, use ops/apps/app-template as a starting point.

### AWS Account Configuration

- Ensure you’re deploying to the correct AWS account; update account IDs in Terraform tfvars when using infra.

## Deployment Instructions

### 🌍 Step 1: Deploy Global Infrastructure

Deploy the shared VPC and networking infrastructure:

```bash
cd ops/global
terraform init
terraform apply -var-file=terraform.tfvars.dev
```

**What this creates:**
- VPC with public and private subnets
- Internet Gateway
- Route tables and DB subnet groups
- Optional NAT Gateway (if enabled)

### 🏗️ Step 2: Deploy Application Modules

Deploy infrastructure modules based on your environment needs:

#### Minimal Development Setup (~$12/month)

```bash
cd ops/apps/app-template/dev

# Essential modules only
cd 02-storage && terraform apply      # S3 buckets
cd ../03-registry && terraform apply  # ECR
cd ../05-compute && terraform apply   # EC2 (no database)
cd ../09-cicd && terraform apply      # CI/CD user
```

#### Full Production Setup (~$70-100/month)

```bash
cd ops/apps/app-template/dev

# Deploy all modules in order
cd 02-storage && terraform apply
cd ../03-registry && terraform apply
cd ../04-database && terraform apply      # RDS PostgreSQL
cd ../05-compute && terraform apply
cd ../06-loadbalancer && terraform apply  # ALB
cd ../07-dns-certs && terraform apply     # Route53 + ACM
cd ../08-monitoring && terraform apply    # CloudWatch
cd ../09-cicd && terraform apply
```

#### Adding Components Later

You can add modules incrementally as needed:

```bash
# Add database to existing setup
cd ops/apps/app-template/dev/04-database
terraform apply

# Add load balancer
cd ../06-loadbalancer
terraform apply
```

## Cost Analysis

### Module-by-Module Costs

| Module | Monthly Cost | When to Deploy |
|--------|--------------|----------------|
| **02-storage** | $2-5 | Always |
| **03-registry** | $1-2 | Always |
| **04-database** | $15-30 (dev), $60-100 (prod) | Staging/Prod |
| **05-compute** | $8-15 (t3.micro) | Always |
| **06-loadbalancer** | $16-20 | Staging/Prod |
| **07-dns-certs** | $0.50-1 | Production |
| **08-monitoring** | $1-3 | Recommended |
| **09-cicd** | Free | Always |

### Cost Optimization Tips

- **Development**: Skip database, ALB, and DNS modules (~$12/month)
- **Avoid NAT Gateway**: Significant monthly cost (~$32/month)
- **Use S3 lifecycle rules**: Move old data to cheaper storage tiers
- **Right-size instances**: Start with t3.micro, scale up as needed
- **Destroy unused modules**: `terraform destroy` in module directory

## Documentation

### 📚 Infrastructure Guides

- **ops/aws-architecture.md** - Current architecture reference
- **ops/apps/app-template/dev/README.md** - Modular deployment overview
- **ops/apps/app-template/dev/DEPLOYMENT_GUIDE.md** - Detailed deployment scenarios
- **Module READMEs** - Each module has comprehensive documentation

### 🔧 Troubleshooting

- **CloudWatch Logs**: Check application and system logs
- **Security Groups**: Verify inbound/outbound rules
- **IAM Roles**: Validate EC2 instance profile permissions
- **Module State**: Use `terraform state list` to verify resources
- **Module Outputs**: Use `terraform output` to check values

## Architecture Components

### 🌍 Global Infrastructure (Shared)

- VPC, public subnets, optional private app/DB subnets, IGW, optional NAT, route tables, DB subnet groups

### 🏗️ Application Templates (Environment-Specific)

- Use ops/apps/app-template when moving to Terraform

#### Security Components

- EC2 SG: allow 80/443 from internet; restrict SSH to admin CIDRs
- Optional ALB SG: allow 80/443; app SG allows traffic only from ALB

#### Storage Components

- S3 assets (public read, versioning), uploads (private, SSE, CORS)

#### Database Components

- RDS Postgres (private subnets), Secrets Manager, backups, optional Multi‑AZ

## Remote State Configuration

### Global Infrastructure State

- Configure Terraform backend: S3 bucket + DynamoDB table for locks (production)

### Application Environment State

- Separate state per environment/app for isolation and recovery

## Security Best Practices

1. Least privilege IAM for EC2/app and CI/CD
2. Encrypt data at rest (S3 SSE, RDS) and in transit (ACM/HTTPS)
3. Store secrets in Secrets Manager
4. Restrict network access using security groups and private subnets for DB
5. Enable CloudTrail and CloudWatch alarms

## Best Practices

### Deployment Best Practices

1. Deploy global infra first
2. Run terraform validate/plan before apply (when using infra)
3. Tag consistently to meet org policies

### Operational Best Practices

1. Monitor costs and set budgets
2. Keep AMIs/containers and Terraform providers up to date
3. Document changes and back up state

## Summary

This template uses a **modular Terraform approach** that allows you to:

- ✅ Deploy only the infrastructure you need
- ✅ Keep costs low in development (~$12/month)
- ✅ Scale up to production with all features (~$70-100/month)
- ✅ Maintain isolated state files for safety
- ✅ Add or remove components independently

### Quick Reference

**Global Infrastructure:**
- VPC, subnets, Internet Gateway
- Optional NAT Gateway for private subnets
- Shared across all applications

**Application Modules:**
- **Always**: Storage (S3), Registry (ECR), Compute (EC2), CI/CD
- **Optional**: Database (RDS), Load Balancer (ALB), DNS/Certs (Route53+ACM)
- **Recommended**: Monitoring (CloudWatch)

### Need Help?

1. Review **ops/aws-architecture.md** for architecture overview
2. Check **ops/apps/app-template/dev/README.md** for deployment guide
3. Read module-specific READMEs for detailed configuration
4. Validate module dependencies and deployment order

---

**Last Updated:** November 2025  
**Architecture:** Modular Terraform with independent state files  
**Status:** Production-ready with cost-optimized development path

## Multi-account Environments (Account Safety)

To support different AWS accounts per environment, application stacks enforce the target account via the AWS provider, while the global stack does not enforce it by default.

- Global stack (ops/global):
  - Uses region input; does not set allowed_account_ids by default.
  - Env-specific var-files are provided: terraform.tfvars.dev, terraform.tfvars.qa, terraform.tfvars.prod.
  - If you want an account guard here too, you may add allowed_account_ids manually.

- App stacks (ops/apps/<app>/{dev,qa,prod}):
  - variables.tf includes aws_account_id.
  - main.tf sets provider allowed_account_ids = [var.aws_account_id].
  - terraform.tfvars(.example) includes an aws_account_id placeholder.

How to use:

- Set the correct aws_account_id for each environment in its var-file.
  - Global: use the provided env-specific files (terraform.tfvars.dev, terraform.tfvars.qa, terraform.tfvars.prod) or your own per-account tfvars file and pass it to Terraform (via -var-file).
  - Apps: set aws_account_id in each app env's terraform.tfvars(.example).
- Application stack plans/applies will fail early if your current AWS credentials/assumed role do not match the specified account, preventing accidental deployment into the wrong account.

Example (dev):

```
aws_region     = "us-west-2"
aws_account_id = "123456789012" # dev account ID
name_prefix    = "myapp-app-dev"
...
```

Example (prod):

```
aws_region     = "us-west-2"
aws_account_id = "123456789012" # prod account ID
name_prefix    = "myapp-app-prod"
...
```

Tip: Keep a separate var-file per environment/account and pass it to the deploy script or Terraform CLI.

## Using the Database Module (04-database)

The database module deploys an optional PostgreSQL RDS instance. To use it:

### 1. Ensure Global Infrastructure Has Private Subnets

```bash
cd ops/global
# Verify terraform.tfvars has create_private_subnets = true
terraform apply -var-file=terraform.tfvars.dev
```

### 2. Deploy the Database Module

```bash
cd ops/apps/app-template/dev/04-database
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars with your configuration
terraform init
terraform apply
```

### 3. Configure Compute Module to Use Database

The compute module (05-compute) automatically reads database outputs via `terraform_remote_state`:

```hcl
data "terraform_remote_state" "database" {
  backend = "local"
  config = {
    path = "../04-database/terraform.tfstate"
  }
}
```

**What the database module creates:**
- DB subnet group in private subnets
- Security group (restricted to EC2 on port 5432)
- Encrypted RDS PostgreSQL instance
- Secrets Manager secret with connection details

**Outputs:** `rds_endpoint`, `rds_port`, `rds_db_name`, `rds_secret_arn`

## RDS credentials and Secrets Manager

- Do not set db_password in tfvars. Leave it empty to auto-generate a strong random password. The rds-postgres module stores connection details in AWS Secrets Manager using AWS-managed encryption by default (low cost, no custom KMS required).
- When enable_rds = true and rds_create_secret = true, the app template automatically grants the EC2 instance role permission to read the secret.

Retrieve the secret via CLI:

```
aws secretsmanager get-secret-value \
  --secret-id <SECRET_ARN_OR_NAME> \
  --query SecretString --output text | jq -r '.'
```

Fields include: engine, host, port, dbname, username, password, instance_id, arn.

Cost tip:

- Secrets Manager charges per secret/month. Use one secret per database. If you must avoid this cost, you can set rds_create_secret = false, but you will then need another secure mechanism to pass credentials to your workloads (not recommended for production).

Rotation tip:

- You can rotate credentials by enabling a rotation function for Secrets Manager or by recreating the random password (e.g., taint random_password.db) and re-applying. Plan rotation windows to avoid downtime.

## Configure AWS credentials for Terraform (local)

If you see errors like:

- Error: No valid credential sources found
- Error: failed to refresh cached credentials, no EC2 IMDS role found

Terraform’s AWS provider cannot find credentials on your machine. Use ONE of the following:

1. AWS SSO (recommended for organizations)

- Configure once: aws configure sso
- Login: aws sso login --profile <your-profile>
- Use it:
  - Option A: export AWS_PROFILE=<your-profile>
  - Option B: set aws_profile in the app env tfvars (e.g., ops/apps/app-template/dev/terraform.tfvars):

    # aws_profile = "<your-profile>"

2. Named profile with static access keys (~/.aws/credentials)

- ~/.aws/credentials example:
  [your-profile]
  aws_access_key_id = AKIAxxxxxxxxxxxx
  aws_secret_access_key = xxxxxxxxxxxxxxxxxxxxxxxxxx
- Use it via environment: export AWS_PROFILE=your-profile
- Or via Terraform var in tfvars: aws_profile = "your-profile"

3. Environment variables (session or long-lived keys)

- export AWS_ACCESS_KEY_ID=...
- export AWS_SECRET_ACCESS_KEY=...
- export AWS_SESSION_TOKEN=... # if using temporary creds

Notes

- App stacks enforce allowed_account_ids = [var.aws_account_id]. You must authenticate to the intended account or the plan/apply will fail (safety guard).
- Quick check: aws sts get-caller-identity --profile <your-profile>
- The provider in ops/apps/<app>/<env>/main.tf uses profile = var.aws_profile when set; otherwise it falls back to the standard AWS SDK credential chain (env vars, default profile, etc.).
- See also: docs/aws-infra-setup.md and ops/aws-architecture.md for context around accounts and regions.
