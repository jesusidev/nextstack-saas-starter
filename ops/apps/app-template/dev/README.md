# AppTemplate Infrastructure - Modular Terraform

Complete modular infrastructure for AppTemplate, with separate Terraform states for each resource group. Deploy only what you need, when you need it.

## 📁 Module Structure

```
dev/
├── 02-storage/         ✅ S3 buckets (always deploy)
├── 03-registry/        ✅ ECR repository (always deploy)
├── 04-database/        ⚙️  RDS PostgreSQL (optional)
├── 05-compute/         ✅ EC2 instance (always deploy)
├── 06-loadbalancer/    ⚙️  Application Load Balancer (optional)
├── 07-dns-certs/       ⚙️  Route53 + ACM certificate (optional)
├── 08-monitoring/      ⚙️  CloudWatch alarms & dashboard (recommended)
└── 09-cicd/            ✅ CI/CD IAM user (always deploy)
```

## 🚀 Quick Start

### Minimal Development Setup (~$12/month)

Deploy only essential infrastructure:

```bash
cd dev

# 1. Storage (S3)
cd 02-storage
cp terraform.tfvars.example terraform.tfvars
nano terraform.tfvars  # Configure
terraform init && terraform apply

# 2. Registry (ECR)
cd ../03-registry
cp terraform.tfvars.example terraform.tfvars
terraform init && terraform apply

# 3. Compute (EC2)
cd ../05-compute
cp terraform.tfvars.example terraform.tfvars
nano terraform.tfvars  # Set VPC, subnet, AMI, key
terraform init && terraform apply

# 4. CI/CD
cd ../09-cicd
cp terraform.tfvars.example terraform.tfvars
terraform init && terraform apply
```

**Result:** Working application infrastructure without database, load balancer, or custom domain.

### Full Production Setup (~$70-90/month)

Deploy everything including HA database, SSL, and monitoring:

```bash
# Deploy in order:
for module in 02-storage 03-registry 04-database 05-compute 06-loadbalancer 07-dns-certs 08-monitoring 09-cicd; do
  cd $module
  cp terraform.tfvars.example terraform.tfvars
  nano terraform.tfvars
  terraform init && terraform apply
  cd ..
done
```

## 📊 Cost Comparison

| Scenario | Modules | Monthly Cost |
|----------|---------|--------------|
| **Minimal Dev** | Storage + Registry + Compute + CI/CD | ~$12 |
| **Dev with Monitoring** | Above + Monitoring | ~$17 |
| **Dev with Database** | Above + Database | ~$32 |
| **Staging** | All except DNS/Certs | ~$50 |
| **Production** | All modules + HA configs | ~$80-100 |

## 🔄 Deployment Order

### Independent Modules (No Dependencies)
Deploy these first, in any order:
- `02-storage` - S3 buckets
- `03-registry` - ECR repository

### Dependent Modules (Deploy After Prerequisites)
Follow this order:
1. **04-database** (optional) - Needs VPC from global
2. **05-compute** - Needs storage + registry (+ optional database)
3. **06-loadbalancer** (optional) - Needs compute
4. **07-dns-certs** (optional) - Needs loadbalancer
5. **08-monitoring** (recommended) - Monitors compute (+ optional ALB/RDS)
6. **09-cicd** - Needs storage + registry + compute

## 📖 Module Documentation

Each module has comprehensive documentation:

- [02-storage/README.md](./02-storage/README.md) - S3 buckets for assets & uploads
- [03-registry/README.md](./03-registry/README.md) - ECR Docker registry
- [04-database/README.md](./04-database/README.md) - RDS PostgreSQL database
- [05-compute/README.md](./05-compute/README.md) - EC2 application server
- [06-loadbalancer/README.md](./06-loadbalancer/README.md) - Application Load Balancer
- [07-dns-certs/README.md](./07-dns-certs/README.md) - Custom domain + SSL
- [08-monitoring/README.md](./08-monitoring/README.md) - CloudWatch alarms & dashboard
- [09-cicd/README.md](./09-cicd/README.md) - CI/CD IAM credentials

**Architecture Overview:**
- [MODULAR_ARCHITECTURE.md](./MODULAR_ARCHITECTURE.md) - Design decisions & benefits
- [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) - Detailed deployment scenarios

## 🎯 Common Use Cases

### 1. Just Need S3 Storage

```bash
cd 02-storage
terraform apply
```

**Cost:** ~$0.50-2/month

### 2. Early Development (No Database)

```bash
cd 02-storage && terraform apply
cd ../03-registry && terraform apply
cd ../05-compute && terraform apply  # use_database = false
cd ../09-cicd && terraform apply
```

**Cost:** ~$12/month

### 3. Add Database Later

```bash
# Deploy database
cd 04-database
terraform apply

# Update compute to use database
cd ../05-compute
nano terraform.tfvars  # Set use_database = true
terraform apply
```

**Additional cost:** +$15-30/month

### 4. Add Load Balancer & SSL

```bash
# Deploy ALB
cd 06-loadbalancer
terraform apply

# Get certificate
cd ../07-dns-certs
terraform apply
CERT_ARN=$(terraform output -raw certificate_arn)

# Update ALB with cert
cd ../06-loadbalancer
nano terraform.tfvars  # Set certificate_arn
terraform apply
```

**Additional cost:** +$22-26/month

## 🔗 Module Dependencies

### Storage (02-storage)
- **Depends on:** Nothing
- **Used by:** Compute (IAM), CI/CD (upload access)

### Registry (03-registry)
- **Depends on:** Nothing
- **Used by:** Compute (pull images), CI/CD (push images)

### Database (04-database)
- **Depends on:** VPC from ops/global
- **Used by:** Compute (connection), Monitoring (alarms)

### Compute (05-compute)
- **Depends on:** Storage, Registry, (optional) Database
- **Used by:** Load Balancer (target), Monitoring (alarms), CI/CD (deploy)

### Load Balancer (06-loadbalancer)
- **Depends on:** Compute
- **Used by:** DNS/Certs (A record), Monitoring (alarms)

### DNS & Certs (07-dns-certs)
- **Depends on:** Load Balancer
- **Used by:** Nothing (terminal module)

### Monitoring (08-monitoring)
- **Depends on:** Compute, (optional) Load Balancer, (optional) Database
- **Used by:** Nothing (monitoring only)

### CI/CD (09-cicd)
- **Depends on:** Storage, Registry, Compute
- **Used by:** External CI/CD systems (GitHub Actions, etc.)

## 🔧 Inter-Module Communication

Modules reference each other via `terraform_remote_state`:

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

**Key Principle:** Each module has its own Terraform state file, preventing blast radius issues.

## 🗑️ Destroying Infrastructure

### Destroy Everything (Full Cleanup)

```bash
# Destroy in REVERSE order
cd 09-cicd && terraform destroy
cd ../08-monitoring && terraform destroy
cd ../07-dns-certs && terraform destroy
cd ../06-loadbalancer && terraform destroy
cd ../05-compute && terraform destroy
cd ../04-database && terraform destroy
cd ../03-registry && terraform destroy
cd ../02-storage && terraform destroy
```

### Destroy Only Database (Save $15-30/month)

```bash
cd 04-database
terraform destroy
# Everything else continues running!
```

### Destroy Only Load Balancer (Save $21-26/month)

```bash
cd 06-loadbalancer
terraform destroy
# Access app directly via EC2 IP
```

## ✅ When to Deploy Each Module

| Module | Development | Staging | Production |
|--------|-------------|---------|------------|
| **02-storage** | ✅ Always | ✅ Always | ✅ Always |
| **03-registry** | ✅ Always | ✅ Always | ✅ Always |
| **04-database** | ⚠️ Optional | ✅ Yes | ✅ Yes |
| **05-compute** | ✅ Always | ✅ Always | ✅ Always |
| **06-loadbalancer** | ⚠️ Optional | ✅ Yes | ✅ Always |
| **07-dns-certs** | ⚠️ Optional | ✅ Yes | ✅ Always |
| **08-monitoring** | ⚠️ Recommended | ✅ Yes | ✅ Always |
| **09-cicd** | ✅ Always | ✅ Always | ✅ Always |

## 🆚 Modular vs Monolithic

### Old Way (Monolithic)

```bash
cd ops/apps/app-template/dev
terraform apply  # Deploys everything, even if you don't need it
```

**Problems:**
- ❌ Can't skip expensive resources (RDS, ALB)
- ❌ Large blast radius (one mistake affects everything)
- ❌ Slow deployments (must plan entire stack)
- ❌ Team conflicts (can't work in parallel)
- ❌ Confusing destruction (feature flags ambiguity)

### New Way (Modular)

```bash
cd ops/apps/app-template/dev
cd 02-storage && terraform apply  # Just S3
cd ../03-registry && terraform apply  # Just ECR
# Skip database, load balancer, DNS
cd ../05-compute && terraform apply  # Just EC2
```

**Benefits:**
- ✅ Deploy only what you need
- ✅ Small blast radius (isolated states)
- ✅ Fast, focused deployments
- ✅ Team can work in parallel
- ✅ Clear destruction (destroy specific module)

## 🛡️ Best Practices

### 1. Always Use terraform.tfvars

```bash
# Don't pass variables on CLI
terraform apply -var="region=us-west-2"  # ❌

# Use tfvars file
cp terraform.tfvars.example terraform.tfvars
nano terraform.tfvars
terraform apply  # ✅
```

### 2. Review Plans Before Applying

```bash
terraform plan -out=plan.tfplan
# Review carefully
terraform apply plan.tfplan
```

### 3. Use Remote State for Teams

```hcl
# backend.tf
terraform {
  backend "s3" {
    bucket         = "app-template-terraform-state"
    key            = "dev/02-storage/terraform.tfstate"
    region         = "us-west-2"
    encrypt        = true
    dynamodb_table = "terraform-state-lock"
  }
}
```

### 4. Tag Everything

```hcl
tags = {
  Project     = "AppTemplate"
  Environment = "dev"
  ManagedBy   = "terraform"
  Team        = "engineering"
  CostCenter  = "engineering"
}
```

### 5. Test Destruction in Dev

Periodically test destroying and recreating modules:

```bash
cd 04-database
terraform destroy
terraform apply
```

Ensures your modules are truly independent.

## 🐛 Troubleshooting

### Error: "No state file found"

**Cause:** Trying to reference a module that hasn't been deployed.

**Solution:** Deploy the prerequisite module first.

```bash
cd ../02-storage && terraform apply
cd ../05-compute && terraform apply
```

### Error: "Security group not found"

**Cause:** Dependent module not deployed yet.

**Solution:** Check deployment order and dependencies.

### Outputs are null

**Cause:** Module deployed but resources failed.

**Solution:** Check module state.

```bash
cd <module-dir>
terraform state list
terraform output
```

## 📚 Additional Resources

- [Terraform AWS Provider Docs](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)
- [AWS Well-Architected Framework](https://aws.amazon.com/architecture/well-architected/)
- [Terraform Best Practices](https://www.terraform-best-practices.com/)

## 🤝 Contributing

When adding new modules:

1. Follow the naming convention: `NN-modulename/`
2. Include all 5 files: `main.tf`, `variables.tf`, `outputs.tf`, `terraform.tfvars.example`, `README.md`
3. Document dependencies clearly
4. Add cost estimates
5. Update this README

## 📞 Support

Questions? Check the module-specific READMEs:
- [MODULAR_ARCHITECTURE.md](./MODULAR_ARCHITECTURE.md) - Why modular?
- [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) - Deployment scenarios
- Module READMEs - Detailed per-module docs

## 🎉 You're Ready!

Start with the minimal setup and add modules as you need them. Each module is fully documented and independent.

**Next steps:**
1. Read [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
2. Deploy storage and registry
3. Customize compute module
4. Add monitoring
5. Setup CI/CD

Happy deploying! 🚀
