# Multi-Environment Deployment Setup Guide

**Last Updated:** 2025-11-08  
**Dokploy Version:** v0.25.6  
**Status:** ✅ Production Ready

Complete guide for setting up automated zero-downtime deployments across DEV, QA, and PROD environments using GitHub Actions, AWS ECR, and Dokploy.

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Environment Status](#environment-status)
4. [Setup Guide](#setup-guide)
5. [Dokploy Configuration](#dokploy-configuration)
6. [GitHub Secrets](#github-secrets)
7. [Testing](#testing)
8. [Troubleshooting](#troubleshooting)

---

## Overview

### What You Get

- ✅ **Automated Deployments** - Push to main = automatic deployment
- ✅ **Zero Downtime** - New containers start before old ones stop
- ✅ **Semantic Versioning** - Automatic version bumping and releases
- ✅ **Secure Authentication** - OIDC (no long-lived AWS credentials for GitHub Actions)
- ✅ **Automatic Migrations** - Database migrations run in container entrypoint
- ✅ **Multi-Environment** - Separate AWS accounts for DEV, QA, and PROD
- ✅ **Version-Tagged Images** - Easy rollback to any version

### Deployment Flow

```
Developer → Git Push → GitHub Actions → AWS ECR → Dokploy → Production
                           ↓              ↓         ↓
                      Build Image    Store Image  Deploy
                      Run Tests      Tag Versions Zero Downtime
```

### Cost Per Environment

- **ECR Storage:** ~$0.50/month
- **GitHub Actions:** Free (2000 min/month)
- **OIDC/IAM:** Free
- **Total:** ~$0.50/month per environment

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          GitHub Repository                                   │
│                                                                              │
│  feature/* branches ──┐                                                      │
│  main branch ─────────┼──> GitHub Actions                                    │
└───────────────────────┴──────────────────────────────────────────────────────┘
                               │
                ┌──────────────┴──────────────┐
                │                             │
                ▼                             ▼
┌───────────────────────────┐   ┌───────────────────────────┐
│   DEV AWS Account         │   │   PROD AWS Account        │
│   (123456789012)          │   │   (Account ID TBD)        │
│                           │   │                           │
│  ┌─────────────────────┐  │   │  ┌─────────────────────┐  │
│  │ ECR: nextstack-saas-starter-dev │  │   │  │ ECR: nextstack-saas-starter-prod│  │
│  │ OIDC: GitHub Actions│  │   │  │ OIDC: GitHub Actions│  │
│  │ IAM: Runtime User   │  │   │  │ IAM: Runtime User   │  │
│  └─────────────────────┘  │   │  └─────────────────────┘  │
│           ↓               │   │           ↓               │
│  ┌─────────────────────┐  │   │  ┌─────────────────────┐  │
│  │ Dokploy Dev         │  │   │  │ Dokploy Prod        │  │
│  │ PostgreSQL Dev      │  │   │  │ PostgreSQL Prod     │  │
│  └─────────────────────┘  │   │  └─────────────────────┘  │
└───────────────────────────┘   └───────────────────────────┘
```

---

## Environment Status

### ✅ DEV Environment (Complete)

| Component | Status | Details |
|-----------|--------|---------|
| AWS Account | ✅ | 123456789012 |
| ECR Repository | ✅ | nextstack-saas-starter-dev |
| OIDC Provider | ✅ | token.actions.githubusercontent.com |
| IAM Role (GitHub) | ✅ | GitHubActionsECRPush-Dev |
| IAM User (Runtime) | ✅ | nextstack-saas-starter-s3-uploader |
| S3 Bucket | ✅ | nextstack-saas-starter-dev-assets |
| Dokploy Instance | ✅ | Configured |
| GitHub Secrets | ✅ | All 7 secrets added |

### ⏳ QA Environment (Ready to Deploy)

| Component | Status | Details |
|-----------|--------|---------|
| AWS Account | ⏳ | Not created yet |
| ECR Repository | ⏳ | Will be nextstack-saas-starter-qa |
| OIDC Provider | ⏳ | Will create |
| IAM Role (GitHub) | ⏳ | Will be GitHubActionsECRPush-QA |
| IAM User (Runtime) | ⏳ | Will be nextstack-saas-starter-s3-uploader-qa |
| Terraform | ✅ | Ready to copy from dev/ |

### ⏳ PROD Environment (Ready to Deploy)

| Component | Status | Details |
|-----------|--------|---------|
| AWS Account | ⏳ | Not created yet |
| ECR Repository | ⏳ | Will be nextstack-saas-starter-prod |
| OIDC Provider | ⏳ | Will create |
| IAM Role (GitHub) | ⏳ | Will be GitHubActionsECRPush-Prod |
| IAM User (Runtime) | ⏳ | Will be nextstack-saas-starter-s3-uploader-prod |
| Terraform | ✅ | Ready to copy from dev/ |

---

## Setup Guide

### Phase 1: DEV Environment (✅ Complete)

#### Step 1: Deploy AWS Infrastructure

**1.1 Deploy ECR Repository**

```bash
cd ops/apps/nextstack-saas-starter/dev/03-registry

# Create config
cp terraform.tfvars.example terraform.tfvars
nano terraform.tfvars  # Update profile, repository name, tags

# Deploy
terraform init
terraform apply

# Note output
terraform output repository_url
# Output: 123456789012.dkr.ecr.us-west-2.amazonaws.com/nextstack-saas-starter-dev
```

**1.2 Deploy GitHub OIDC**

```bash
cd ../10-github-oidc

# Create config
cp terraform.tfvars.example terraform.tfvars
nano terraform.tfvars  # Update profile, github_repositories

# Deploy
terraform init
terraform apply

# Note output
terraform output github_actions_role_arn
# Output: arn:aws:iam::123456789012:role/GitHubActionsECRPush-Dev
```

**1.3 Configure Runtime IAM User**

```bash
cd ../11-runtime-iam

# Create config
cp terraform.tfvars.example terraform.tfvars

# Initialize
terraform init

# Import existing user (if already exists)
terraform import aws_iam_user.runtime nextstack-saas-starter-s3-uploader

# Apply (creates combined S3 + ECR policy)
terraform apply

# Verify
terraform output usage_instructions
```

#### Step 2: Configure ECR Authentication on Dokploy Server

⚠️ **CRITICAL:** Complete this step first, otherwise Dokploy cannot pull images from ECR.

Follow the complete guide: [Dokploy ECR Setup](./dokploy-ecr-setup.md)

**Quick summary:**
1. SSH into Dokploy server
2. Install AWS CLI
3. Configure AWS credentials (same as `nextstack-saas-starter-s3-uploader` IAM user)
4. Set up cron job to refresh ECR login every 6 hours
5. Test Docker can pull images from ECR

#### Step 3: Configure Dokploy Application

**3.1 Create Application**

1. Login to Dokploy
2. Create Application: `nextstack-saas-starter-dev`
3. **Provider:** Docker
4. **Docker Image:** `123456789012.dkr.ecr.us-west-2.amazonaws.com/nextstack-saas-starter-dev:latest`
   
   ⚠️ **CRITICAL:** No spaces in URL!

5. Leave Registry URL, Username, Password **empty** (credentials configured on server via cron)

**3.2 Add Environment Variables**

Go to **Environment** tab:

```bash
# AWS Credentials (for S3 access in application runtime)
AWS_ACCESS_KEY_ID=AKIA...  # From nextstack-saas-starter-s3-uploader
AWS_SECRET_ACCESS_KEY=...  # From nextstack-saas-starter-s3-uploader
AWS_REGION=us-west-2
AWS_DEFAULT_REGION=us-west-2

# S3 Configuration
S3_ASSETS_BUCKET=nextstack-saas-starter-dev-assets

# Database
DATABASE_URL=postgresql://user:password@postgres:5432/nextstack-saas-starter_dev

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# Node Environment
NODE_ENV=production
PORT=3000
```

**3.3 Configure Health Check**

Go to **Advanced** → **Swarm Settings** → **Health Check**:

```json
{
  "Test": [
    "CMD",
    "curl",
    "-f",
    "http://localhost:3000/api/health"
  ],
  "Interval": 30000000000,
  "Timeout": 10000000000,
  "StartPeriod": 40000000000,
  "Retries": 3
}
```

**3.4 Configure Update Config (Zero Downtime)**

Go to **Advanced** → **Swarm Settings** → **Update Config**:

```json
{
  "Parallelism": 1,
  "Delay": 10000000000,
  "FailureAction": "rollback",
  "Order": "start-first"
}
```

⚠️ **"Order": "start-first"** enables zero downtime!

**3.5 Configure Rollback Config**

Go to **Advanced** → **Swarm Settings** → **Rollback Config**:

```json
{
  "Parallelism": 1,
  "Delay": 5000000000,
  "FailureAction": "pause",
  "Monitor": 10000000000,
  "MaxFailureRatio": 0.3,
  "Order": "stop-first"
}
```

**3.6 Configure Domain**

Go to **Domains** tab:

1. Add Domain: `dev.nextstack-saas-starter.com`
2. Port: `3000`
3. HTTPS: Enable
4. Save

**3.7 Get Application ID and API Token**

**Application ID:**
- Look at URL: `.../application/jHV_5jEfGpUmtCQynX1o8`
- Copy: `jHV_5jEfGpUmtCQynX1o8`

**API Token:**
- Go to Settings → API Tokens
- Create Token: `github-actions-dev`
- Permissions: Deploy applications
- Copy token: `dkp_...`

#### Step 4: Add GitHub Secrets

Go to: https://github.com/your-username/nextstack-saas-starter/settings/secrets/actions

Add these secrets:

| Secret Name | Value | Source |
|------------|-------|--------|
| `AWS_OIDC_ROLE_ARN_DEV` | `arn:aws:iam::123456789012:role/GitHubActionsECRPush-Dev` | Terraform output |
| `DOKPLOY_DEV_URL` | `https://dokploy.yourdomain.com` | Your Dokploy URL |
| `DOKPLOY_DEV_TOKEN` | `dkp_...` | From Dokploy |
| `DOKPLOY_DEV_APP_ID` | `jHV_5jEfGpUmtCQynX1o8` | From Dokploy URL |
| `DOKPLOY_DEV_APP_URL` | `https://dev.nextstack-saas-starter.com` | Your app URL |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY_DEV` | `pk_test_...` | Clerk dashboard |
| `CLERK_SECRET_KEY_DEV` | `sk_test_...` | Clerk dashboard |

#### Step 5: Test Deployment

```bash
# Trigger manual deployment
gh workflow run deploy-production.yml \
  -f environment=development \
  -f version=latest

# Watch progress
gh run watch

# Test health endpoint
curl https://dev.nextstack-saas-starter.com/api/health
```

---

### Phase 2: QA Environment (When Ready)

#### Step 1: Create QA AWS Account

```bash
# Via AWS Organizations
aws organizations create-account \
  --email nextstack-saas-starter-qa@yourdomain.com \
  --account-name "NextStack SaaS Starter-QA" \
  --profile jesusidev  # Management account
```

#### Step 2: Configure AWS Profile

Add to `~/.aws/config`:

```ini
[profile jesusidev-QA]
sso_start_url = https://your-org.awsapps.com/start
sso_region = us-west-2
sso_account_id = QA_ACCOUNT_ID
sso_role_name = AdministratorAccess
region = us-west-2
```

#### Step 3: Copy and Deploy Terraform

```bash
# Copy DEV terraform to QA
cp -r ops/apps/nextstack-saas-starter/dev ops/apps/nextstack-saas-starter/qa

# Update all terraform.tfvars files
cd ops/apps/nextstack-saas-starter/qa

# Update 03-registry
cd 03-registry
sed -i '' 's/nextstack-saas-starter-dev/nextstack-saas-starter-qa/g' terraform.tfvars
sed -i '' 's/jesusidev-DEV/jesusidev-QA/g' terraform.tfvars
sed -i '' 's/environment = "dev"/environment = "qa"/g' terraform.tfvars
terraform init && terraform apply

# Update 10-github-oidc
cd ../10-github-oidc
sed -i '' 's/GitHubActionsECRPush-Dev/GitHubActionsECRPush-QA/g' terraform.tfvars
sed -i '' 's/jesusidev-DEV/jesusidev-QA/g' terraform.tfvars
sed -i '' 's/environment = "dev"/environment = "qa"/g' terraform.tfvars
terraform init && terraform apply

# Update 11-runtime-iam
cd ../11-runtime-iam
sed -i '' 's/nextstack-saas-starter-s3-uploader/nextstack-saas-starter-s3-uploader-qa/g' terraform.tfvars
sed -i '' 's/NextStack SaaS StarterS3AndECRAccess-Dev/NextStack SaaS StarterS3AndECRAccess-QA/g' terraform.tfvars
sed -i '' 's/jesusidev-DEV/jesusidev-QA/g' terraform.tfvars
sed -i '' 's/environment = "dev"/environment = "qa"/g' terraform.tfvars
terraform init && terraform apply
```

#### Step 4: Configure Dokploy QA

Same as DEV, but:
- Application name: `nextstack-saas-starter-qa`
- Docker image: `QA_ACCOUNT.dkr.ecr.us-west-2.amazonaws.com/nextstack-saas-starter-qa:latest`
- Domain: `qa.nextstack-saas-starter.com`
- Database: `nextstack-saas-starter_qa`

#### Step 5: Add QA GitHub Secrets

Add these secrets with `_QA` suffix:
- `AWS_OIDC_ROLE_ARN_QA`
- `DOKPLOY_QA_URL`
- `DOKPLOY_QA_TOKEN`
- `DOKPLOY_QA_APP_ID`
- `DOKPLOY_QA_APP_URL`
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY_QA`
- `CLERK_SECRET_KEY_QA`

---

### Phase 3: PROD Environment (When Ready)

Same steps as QA, but:
- Use PROD account
- Use `jesusidev-PROD` profile
- Use `nextstack-saas-starter-prod` repository name
- Use `_PROD` suffix for secrets

---

## Dokploy Configuration

### Critical Settings

#### 1. Provider Configuration

```
Provider: Docker
Docker Image: 123456789012.dkr.ecr.us-west-2.amazonaws.com/nextstack-saas-starter-dev:latest
Registry URL: (empty)
Username: (empty)
Password: (empty)
```

⚠️ **No spaces in Docker image URL!**

#### 2. Environment Variables

The AWS credentials are used by the application for S3 file uploads:

```bash
AWS_ACCESS_KEY_ID=AKIA...  # From nextstack-saas-starter-s3-uploader IAM user
AWS_SECRET_ACCESS_KEY=...  # From nextstack-saas-starter-s3-uploader IAM user
AWS_REGION=us-west-2
AWS_DEFAULT_REGION=us-west-2
S3_ASSETS_BUCKET=nextstack-saas-starter-dev-assets
```

**Note:** ECR authentication is handled separately on the Dokploy server via cron job. See [Dokploy ECR Setup](./dokploy-ecr-setup.md).

#### 3. Health Check (Zero Downtime)

```json
{
  "Test": ["CMD", "curl", "-f", "http://localhost:3000/api/health"],
  "Interval": 30000000000,
  "Timeout": 10000000000,
  "StartPeriod": 40000000000,
  "Retries": 3
}
```

#### 4. Update Config (Zero Downtime)

```json
{
  "Parallelism": 1,
  "Delay": 10000000000,
  "FailureAction": "rollback",
  "Order": "start-first"
}
```

The **"Order": "start-first"** setting is what gives you zero downtime:
- Starts NEW container first
- Waits for health check
- THEN stops old container

---

## GitHub Secrets

### Environment Mapping

GitHub Actions determines which environment to deploy to based on secrets:

```yaml
development → AWS_OIDC_ROLE_ARN_DEV  → nextstack-saas-starter-dev  → Dokploy DEV
qa          → AWS_OIDC_ROLE_ARN_QA   → nextstack-saas-starter-qa   → Dokploy QA
production  → AWS_OIDC_ROLE_ARN_PROD → nextstack-saas-starter-prod → Dokploy PROD
```

### Required Secrets Per Environment

#### DEV (✅ Complete)

```
AWS_OIDC_ROLE_ARN_DEV = arn:aws:iam::123456789012:role/GitHubActionsECRPush-Dev
DOKPLOY_DEV_URL = https://dokploy.yourdomain.com
DOKPLOY_DEV_TOKEN = dkp_...
DOKPLOY_DEV_APP_ID = jHV_5jEfGpUmtCQynX1o8
DOKPLOY_DEV_APP_URL = https://dev.nextstack-saas-starter.com
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY_DEV = pk_test_...
CLERK_SECRET_KEY_DEV = sk_test_...
```

#### QA (⏳ When Ready)

```
AWS_OIDC_ROLE_ARN_QA = arn:aws:iam::QA_ACCOUNT:role/GitHubActionsECRPush-QA
DOKPLOY_QA_URL = https://dokploy-qa.yourdomain.com
DOKPLOY_QA_TOKEN = dkp_...
DOKPLOY_QA_APP_ID = clx...
DOKPLOY_QA_APP_URL = https://qa.nextstack-saas-starter.com
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY_QA = pk_live_...
CLERK_SECRET_KEY_QA = sk_live_...
```

#### PROD (⏳ When Ready)

```
AWS_OIDC_ROLE_ARN_PROD = arn:aws:iam::PROD_ACCOUNT:role/GitHubActionsECRPush-Prod
DOKPLOY_PROD_URL = https://dokploy.yourdomain.com
DOKPLOY_PROD_TOKEN = dkp_...
DOKPLOY_PROD_APP_ID = clx...
DOKPLOY_PROD_APP_URL = https://nextstack-saas-starter.com
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY_PROD = pk_live_...
CLERK_SECRET_KEY_PROD = sk_live_...
```

---

## Testing

### Test DEV Deployment

```bash
# Manual deployment
gh workflow run deploy-production.yml \
  -f environment=development \
  -f version=latest

# Watch progress
gh run watch

# Check health
curl https://dev.nextstack-saas-starter.com/api/health
```

### Test Automatic Release

```bash
# Create feature
git checkout -b feature/test
echo "test" >> README.md
git commit -m "feat: test deployment"
git push -u origin feature/test

# Create and merge PR
gh pr create --title "feat: test deployment"
gh pr merge --squash

# Watch automatic release
gh run list --workflow=release.yml

# Check release
gh release list

# Watch deployment (deploys to DEV until PROD secrets added)
gh run list --workflow=deploy-production.yml
```

### Test Zero Downtime

1. Open app: `https://dev.nextstack-saas-starter.com`
2. Trigger deployment
3. Keep refreshing page
4. **Expected:** No errors, no downtime!

---

## Troubleshooting

### Issue: "Invalid reference format" in Dokploy

**Cause:** Space in Docker image URL

**Solution:**
```
❌ 123456789012.dkr.ecr.us-west-2.amazonaws. com/nextstack-saas-starter-dev:latest
✅ 123456789012.dkr.ecr.us-west-2.amazonaws.com/nextstack-saas-starter-dev:latest
```

Remove space in Dokploy → General → Docker Image

### Issue: "HTTP 401 Unauthorized" from Dokploy API

**Cause:** Wrong API authentication

**Solution:** Workflow uses `x-api-key` header (correct for v0.25.6)

Verify token in GitHub secrets:
```bash
gh secret list | grep DOKPLOY_DEV_TOKEN
```

### Issue: "Failed to pull image" / "no basic auth credentials" in Dokploy

**Cause:** ECR authentication not configured on Dokploy server

**Solution:**
1. Follow the complete setup guide: [Dokploy ECR Setup](./dokploy-ecr-setup.md)

2. Quick fix (SSH into Dokploy server):
   ```bash
   # Configure AWS credentials
   sudo su
   aws configure set aws_access_key_id AKIA... --profile ecr
   aws configure set aws_secret_access_key ... --profile ecr
   aws configure set region us-west-2 --profile ecr
   
   # Login to ECR
   aws ecr get-login-password --region us-west-2 --profile ecr | \
     docker login --username AWS --password-stdin \
     123456789012.dkr.ecr.us-west-2.amazonaws.com
   
   exit
   ```

3. Set up cron job for automatic refresh (see [Dokploy ECR Setup](./dokploy-ecr-setup.md))

4. Verify IAM user has ECR pull permissions:
   ```bash
   aws iam list-attached-user-policies \
     --user-name nextstack-saas-starter-s3-uploader \
     --profile jesusidev-DEV
   ```
   Should show: `NextStack SaaS StarterS3AndECRAccess-Dev`

### Issue: "Health check failed"

**Cause:** App not responding

**Solution:**
1. Check Dokploy logs
2. Verify all environment variables set
3. Check database connection
4. Verify `/api/health` endpoint exists

### Issue: Docker build fails with Clerk error

**Cause:** Missing Clerk secrets

**Solution:**
```bash
gh secret set NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY_DEV -b "pk_test_..."
gh secret set CLERK_SECRET_KEY_DEV -b "sk_test_..."
```

### Issue: "Credentials could not be loaded" in GitHub Actions

**Cause:** Missing AWS OIDC role secret

**Solution:**
```bash
gh secret set AWS_OIDC_ROLE_ARN_DEV \
  -b "arn:aws:iam::123456789012:role/GitHubActionsECRPush-Dev"
```

---

## Workflow Behavior

### Current (DEV Only)

```bash
# Merge to main
git push origin main

# What happens:
1. Release workflow creates version (v1.0.0)
2. Deployment workflow triggers
3. Checks for PROD secrets → Not found
4. Falls back to DEV environment
5. Deploys to DEV account
```

### After PROD Setup

```bash
# Merge to main
git push origin main

# What happens:
1. Release workflow creates version (v1.1.0)
2. Deployment workflow triggers
3. Checks for PROD secrets → Found!
4. Deploys to PROD account
5. Zero downtime deployment
```

### Manual Environment Selection

```bash
# Deploy to specific environment
gh workflow run deploy-production.yml \
  -f environment=development \
  -f version=v1.0.0
```

---

## Key Concepts

### Single ECR Repository Per Environment

Each environment has ONE ECR repository:
- `nextstack-saas-starter-dev` (DEV account)
- `nextstack-saas-starter-qa` (QA account)
- `nextstack-saas-starter-prod` (PROD account)

Migrations run automatically in container entrypoint (no separate migration image needed).

### Combined IAM User

One IAM user per environment with BOTH permissions:
- S3 read/write (for file uploads)
- ECR pull (for Dokploy to pull images)

**DEV:** `nextstack-saas-starter-s3-uploader`  
**QA:** `nextstack-saas-starter-s3-uploader-qa`  
**PROD:** `nextstack-saas-starter-s3-uploader-prod`

### Three Types of AWS Credentials

1. **GitHub Actions** → OIDC (temporary, no long-lived keys)
   - Used to PUSH images to ECR
   - Role: `GitHubActionsECRPush-Dev`

2. **Dokploy Server** → IAM User (configured on server via cron)
   - Used to PULL images from ECR
   - Configured once on Dokploy server with auto-refresh
   - User: `nextstack-saas-starter-s3-uploader` (same credentials as #3)
   - See: [Dokploy ECR Setup](./dokploy-ecr-setup.md)

3. **Application Runtime** → IAM User (environment variables in Dokploy)
   - Used to access S3 for file uploads
   - User: `nextstack-saas-starter-s3-uploader`

### Environment Targeting

The AWS account ID is embedded in the IAM role ARN:

```
AWS_OIDC_ROLE_ARN_DEV  = arn:aws:iam::123456789012:role/...
                                      ^^^^^^^^^^^^
                                      DEV Account

AWS_OIDC_ROLE_ARN_PROD = arn:aws:iam::888888888888:role/...
                                      ^^^^^^^^^^^^
                                      PROD Account
```

GitHub Actions reads the role ARN, extracts the account ID, and authenticates to that specific AWS account.

---

## Terraform Directory Structure

```
ops/apps/nextstack-saas-starter/
├── dev/                           ✅ Complete
│   ├── 03-registry/              ✅ ECR repository
│   ├── 10-github-oidc/           ✅ GitHub OIDC
│   └── 11-runtime-iam/           ✅ Runtime IAM user
├── qa/                            ⏳ Ready to create
│   ├── 03-registry/
│   ├── 10-github-oidc/
│   └── 11-runtime-iam/
└── prod/                          ⏳ Ready to create
    ├── 03-registry/
    ├── 10-github-oidc/
    └── 11-runtime-iam/
```

---

## Deployment Workflows

### Daily Development

```bash
# 1. Create feature branch
git checkout -b feature/new-feature

# 2. Commit with conventional format
git commit -m "feat: add new feature"

# 3. Create PR
gh pr create --title "feat: add new feature"

# 4. Merge to main
gh pr merge --squash

# 5. Automatic magic!
# → Release created (v1.1.0)
# → Deployment triggered
# → Deploys to DEV (or PROD if secrets exist)
```

### Manual Deployment

```bash
# Deploy specific version to DEV
gh workflow run deploy-production.yml \
  -f environment=development \
  -f version=v1.0.0

# Deploy to QA (when ready)
gh workflow run deploy-production.yml \
  -f environment=qa \
  -f version=v1.0.0

# Deploy to PROD (when ready)
gh workflow run deploy-production.yml \
  -f environment=production \
  -f version=v1.0.0
```

### Rollback

```bash
# Option 1: Deploy previous version via GitHub Actions
gh workflow run deploy-production.yml \
  -f environment=development \
  -f version=v1.0.0

# Option 2: Use Dokploy UI
# Dokploy → Application → Deployments → Previous deployment → Redeploy
```

---

## Files Reference

### Terraform Modules
- `ops/apps/nextstack-saas-starter/dev/03-registry/` - ECR repository
- `ops/apps/nextstack-saas-starter/dev/10-github-oidc/` - GitHub OIDC for GitHub Actions
- `ops/apps/nextstack-saas-starter/dev/11-runtime-iam/` - Runtime IAM user (S3 + ECR)
- `ops/modules/github-oidc/` - Reusable OIDC module

### GitHub Actions Workflows
- `.github/workflows/release.yml` - Semantic release and versioning
- `.github/workflows/deploy-production.yml` - Zero-downtime deployment
- `.github/workflows/pr-validation.yml` - PR/branch validation

### Docker
- `Dockerfile.app` - Application image (includes migrations)
- `scripts/docker-entrypoint.sh` - Runs migrations automatically

### Documentation
- `docs/multi-environment-setup.md` - This guide (complete setup)
- `docs/versioning-and-releases.md` - Semantic versioning
- `docs/git-workflow.md` - Branch naming and PR conventions
- `docs/aws-account-structure.md` - AWS account organization

---

## Best Practices

### ✅ Do

- Use separate AWS accounts for isolation
- Use OIDC for GitHub Actions (no long-lived credentials)
- Use IAM user for Dokploy/runtime (necessary for ECR pull)
- Test in DEV before promoting to PROD
- Use semantic versioning for releases
- Follow conventional commit format
- Enable health checks
- Configure automatic rollbacks

### ❌ Don't

- Deploy directly to PROD without testing
- Share IAM credentials across environments
- Use same Dokploy instance for all environments
- Skip health check configuration
- Manually manage versions
- Put spaces in Docker image URLs
- Use ARG/ENV for secrets (use BuildKit secrets)

---

## Migration Plan

### Current State

```
✅ DEV environment fully operational
❌ QA environment not created
❌ PROD environment not created
```

### Recommended Timeline

**Week 1: DEV Testing**
- ✅ Test automated deployments
- ✅ Verify zero-downtime works
- ✅ Test rollback mechanism
- ✅ Monitor for issues

**Week 2-3: QA Environment**
- Create QA AWS account
- Deploy QA infrastructure
- Configure QA Dokploy
- Add QA secrets
- Test QA deployments

**Week 4+: PROD Environment**
- Create PROD AWS account
- Deploy PROD infrastructure
- Configure PROD Dokploy
- Add PROD secrets
- Test PROD deployment
- Go live!

---

## Support

**Issues?**
- Check [Troubleshooting](#troubleshooting) section
- Review GitHub Actions logs: `gh run view <run-id>`
- Check Dokploy logs: Dokploy → Application → Logs
- Verify secrets: `gh secret list`

**Questions?**
- Review this guide
- Check related documentation
- Open GitHub issue

---

## Related Documentation

- [Versioning and Releases](./versioning-and-releases.md) - Semantic versioning guide
- [Git Workflow](./git-workflow.md) - Branch naming and PR conventions
- [AWS Account Structure](./aws-account-structure.md) - Multi-account setup

---

**Last Updated:** 2025-11-08  
**Tested With:** Dokploy v0.25.6, AWS ECR, GitHub Actions  
**Status:** ✅ Production Ready
