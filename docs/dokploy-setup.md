# Dokploy Deployment Setup

This guide shows you how to deploy NextStack SaaS Starter to [Dokploy](https://dokploy.com), a self-hosted PaaS alternative to Vercel/Railway.

You have two deployment options:
- **Option A:** Using AWS ECR (with Terraform) — Recommended for production
- **Option B:** Using VPS directly — Simpler, good for testing

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Option A: AWS ECR Deployment](#option-a-aws-ecr-deployment-with-terraform)
3. [Option B: VPS Direct Deployment](#option-b-vps-direct-deployment)
4. [Post-Deployment](#post-deployment)
5. [Troubleshooting](#troubleshooting)

---

## Prerequisites

- **Dokploy server** installed and running
- **Domain name** (optional but recommended)
- **AWS account** (for Option A)
- **SSH access** to your Dokploy server

### Install Dokploy

If you haven't installed Dokploy yet:

```bash
# On your VPS (Ubuntu/Debian)
curl -sSL https://dokploy.com/install.sh | sh
```

Access Dokploy at `http://your-server-ip:3000`

---

## Option A: AWS ECR Deployment (with Terraform)

**Best for:** Production deployments, CI/CD pipelines, multi-environment setups

This option uses AWS ECR to store Docker images and Terraform to manage infrastructure.

### Benefits
- ✅ Automated infrastructure setup
- ✅ CI/CD integration with GitHub Actions
- ✅ Multi-environment support
- ✅ Scalable and production-ready
- ✅ Infrastructure as code

### Step 1: Set Up ECR with Terraform

Navigate to ECR module and configure:

```bash
cd ops/apps/app-template/dev/03-registry
cp terraform.tfvars.example terraform.tfvars
```

Edit `terraform.tfvars`:
```hcl
aws_region      = "us-east-1"
aws_account_id  = "123456789012"  # Your AWS account ID
app_name        = "your-app"
environment     = "dev"
repository_name = "your-app-dev"
```

Apply Terraform:
```bash
terraform init
terraform plan
terraform apply
```

Get ECR URL:
```bash
terraform output ecr_repository_url
```

### Step 2: Configure Dokploy Server for ECR

SSH into your Dokploy server and set up automatic ECR authentication:

```bash
ssh user@your-dokploy-server.com

# Install AWS CLI
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# Configure credentials (as root)
sudo su
aws configure set aws_access_key_id AKIA... --profile ecr
aws configure set aws_secret_access_key <secret> --profile ecr
aws configure set region us-east-1 --profile ecr
exit

# Create auto-refresh script
sudo mkdir -p /opt/dokploy/scripts
sudo tee /opt/dokploy/scripts/refresh-ecr-login.sh > /dev/null <<'SCRIPT'
#!/bin/bash
LOG_FILE="/var/log/ecr-login.log"
AWS_ACCOUNT_ID="123456789012"  # Replace with your account ID
AWS_REGION="us-east-1"

echo "[$(date)] Starting ECR login..." | tee -a "$LOG_FILE"

if aws ecr get-login-password --region $AWS_REGION --profile ecr | \
   docker login --username AWS --password-stdin \
   $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com 2>&1 | tee -a "$LOG_FILE"; then
    echo "[$(date)] ✅ ECR login successful" | tee -a "$LOG_FILE"
else
    echo "[$(date)] ❌ ECR login failed" | tee -a "$LOG_FILE"
    exit 1
fi
SCRIPT

sudo chmod +x /opt/dokploy/scripts/refresh-ecr-login.sh
sudo touch /var/log/ecr-login.log

# Set up cron (every 6 hours)
sudo crontab -e
# Add: 0 */6 * * * /opt/dokploy/scripts/refresh-ecr-login.sh
```

### Step 3: Deploy to Dokploy

In Dokploy UI:
1. Create new application
2. Choose "Docker Image"
3. Image: `123456789012.dkr.ecr.us-east-1.amazonaws.com/your-app-dev:latest`
4. Leave registry credentials empty (Docker daemon has them)
5. Add environment variables
6. Deploy!

---

## Option B: VPS Direct Deployment

**Best for:** Quick testing, simple deployments, learning

This option builds and runs Docker directly on your VPS.

### Benefits
- ✅ Simpler setup (no AWS needed)
- ✅ Faster for small projects
- ✅ Lower costs
- ✅ Good for testing

### Step 1: Clone Repository on VPS

```bash
ssh user@your-vps-ip

mkdir -p ~/apps
cd ~/apps
git clone https://github.com/your-username/nextstack-saas-starter.git
cd nextstack-saas-starter
```

### Step 2: Configure Environment

```bash
cp .env.production.example .env
nano .env
```

Fill in your credentials (Clerk, AWS S3, etc.)

### Step 3: Deploy with Docker Compose

```bash
# Start all services
docker compose -f docker-compose.production.yml up -d

# View logs
docker compose logs -f app

# Run migrations
docker compose exec app npx prisma migrate deploy
```

### Step 4: Configure Dokploy Proxy

In Dokploy UI:
1. Go to "Proxy" settings
2. Add domain: `your-domain.com`
3. Point to app container (port 3000)
4. Enable SSL

### Updating (VPS Method)

```bash
cd ~/apps/nextstack-saas-starter
git pull
docker compose -f docker-compose.production.yml build
docker compose -f docker-compose.production.yml up -d
docker compose exec app npx prisma migrate deploy
```

---

## Troubleshooting

### ECR Authentication (Option A)

Check cron job:
```bash
sudo crontab -l | grep ecr
tail -50 /var/log/ecr-login.log
```

### Build Issues (Option B)

Out of memory? Build locally:
```bash
# On your machine
docker build -f Dockerfile.app --target production -t your-app:latest .
docker save your-app:latest | gzip > your-app.tar.gz
scp your-app.tar.gz user@your-vps:/tmp/

# On VPS
docker load < /tmp/your-app.tar.gz
```

### Database Connection

```bash
# Check database is running
docker compose ps

# Test connection
docker compose exec app npx prisma db push
```

---

## Related Documentation

- [Multi-Environment Setup](./multi-environment-setup.md)
- [Infrastructure README](../ops/README.md)
- [SETUP_GUIDE.md](../SETUP_GUIDE.md)

---

**Last Updated:** November 23, 2025  
**Status:** ✅ Production Ready
