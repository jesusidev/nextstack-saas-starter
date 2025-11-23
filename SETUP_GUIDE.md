# NextStack SaaS Starter - Setup Guide

**Welcome!** This guide will help you customize and deploy the NextStack SaaS Starter template for your own SaaS application.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Quick Start](#quick-start)
3. [Customization](#customization)
4. [Environment Setup](#environment-setup)
5. [Database Setup](#database-setup)
6. [Authentication Setup](#authentication-setup)
7. [AWS S3 Setup](#aws-s3-setup)
8. [Analytics Setup](#analytics-setup)
9. [Deployment](#deployment)
10. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before you begin, ensure you have:

- **Node.js 18+** installed
- **Docker & Docker Compose** installed (recommended)
- **Git** installed
- **AWS Account** (for S3 features)
- **Clerk Account** (for authentication)

---

## Quick Start

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd nextstack-saas-starter
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

```bash
# Copy the example file
cp .env.example .env

# Edit .env and fill in your values
# See "Environment Setup" section below for details
```

### 4. Start with Docker (Recommended)

```bash
# Start all services (app + database)
docker compose up -d

# View logs
docker compose logs -f app

# Access the app at http://localhost:3001
```

### 5. Or Start Locally (Without Docker)

```bash
# Start PostgreSQL separately (or use Docker for just the database)
docker compose up -d postgres

# Run migrations
npm run db:migrate

# Start development server
npm run dev

# Access the app at http://localhost:3000
```

---

## Customization

### Rename the Project

The template uses "nextstack-saas-starter" as the default name. To customize:

1. **Update package.json:**
   ```json
   {
     "name": "your-app-name",
     "version": "0.1.0"
   }
   ```

2. **Update package-lock.json:**
   ```bash
   npm install
   ```

3. **Update database name in .env:**
   ```bash
   POSTGRES_DB=your_app_db
   DATABASE_URL=postgresql://appuser:apppass@localhost:5432/your_app_db
   ```

4. **Update Docker container names (optional):**
   ```bash
   PG_CONTAINER_NAME=your_app_postgres
   ```

### Customize Branding

1. **Update README.md** with your app description
2. **Update public/favicon.ico** with your logo
3. **Update src/app/layout.tsx** metadata
4. **Update landing page** in `src/app/page.tsx`

---

## Environment Setup

### Required Variables

Copy `.env.example` to `.env` and configure:

```bash
# Authentication (Required)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_key
CLERK_SECRET_KEY=sk_test_your_key

# Database (Required)
DATABASE_URL=postgresql://appuser:apppass@localhost:5432/appdb

# AWS S3 (Required for file uploads)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
S3_ASSETS_BUCKET=your-app-dev-assets
```

### Optional Variables

```bash
# Analytics (Optional)
NEXT_PUBLIC_GA_TAG=G-XXXXXXXXXX
NEXT_PUBLIC_MI_ID=your_clarity_id

# Application (Optional)
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

See `.env.template` for complete documentation.

---

## Database Setup

### Using Docker (Recommended)

Docker Compose automatically sets up PostgreSQL:

```bash
docker compose up -d postgres
```

### Manual PostgreSQL Setup

If not using Docker:

1. **Install PostgreSQL 15+**
2. **Create database:**
   ```sql
   CREATE DATABASE appdb;
   CREATE USER appuser WITH PASSWORD 'apppass';
   GRANT ALL PRIVILEGES ON DATABASE appdb TO appuser;
   ```

3. **Update DATABASE_URL** in `.env`

### Run Migrations

```bash
# With Docker
npm run db:docker:migrate

# Without Docker
npm run db:migrate
```

### Prisma Studio (Database GUI)

```bash
# With Docker
npm run db:docker:studio

# Without Docker
npm run db:studio
```

---

## Authentication Setup

This template uses [Clerk](https://clerk.com) for authentication.

### 1. Create Clerk Account

1. Go to https://clerk.com and sign up
2. Create a new application
3. Choose "Next.js" as the framework

### 2. Get API Keys

From your Clerk dashboard:

1. Go to **API Keys**
2. Copy **Publishable Key** → `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
3. Copy **Secret Key** → `CLERK_SECRET_KEY`

### 3. Configure Routes

Update in `.env` if needed:

```bash
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
```

### 4. Test Authentication

1. Start the app
2. Click "Sign In" or "Sign Up"
3. Create a test account
4. Verify you're redirected to the dashboard

---

## AWS S3 Setup

File uploads use AWS S3 with presigned URLs. Choose one of the following setup methods:

### Option A: Using Terraform (Recommended for Production)

The template includes Terraform modules for automated infrastructure setup.

**1. Navigate to storage module:**

```bash
cd ops/apps/app-template/dev/02-storage
```

**2. Configure variables:**

Edit `terraform.tfvars.example` and save as `terraform.tfvars`:

```hcl
aws_region     = "us-east-1"
aws_account_id = "123456789012"  # Your AWS account ID
app_name       = "your-app"
environment    = "dev"
```

**3. Initialize and apply:**

```bash
# Initialize Terraform
terraform init

# Review the plan
terraform plan

# Apply the configuration
terraform apply
```

**4. Get outputs:**

```bash
# Get the bucket name
terraform output s3_bucket_name

# Add to your .env
S3_ASSETS_BUCKET=<bucket-name-from-output>
```

**5. Set up IAM credentials:**

The Terraform module creates the bucket. You still need IAM credentials:

```bash
# Create IAM user with S3 permissions
cd ../11-runtime-iam  # If this module exists
terraform init
terraform apply

# Or create manually (see Option B, step 3)
```

**Benefits:**
- ✅ Automated and repeatable
- ✅ Proper bucket configuration (encryption, versioning)
- ✅ CORS automatically configured
- ✅ Infrastructure as code
- ✅ Easy to replicate across environments

**See also:** `ops/apps/app-template/dev/02-storage/README.md` for detailed Terraform instructions.

---

### Option B: Manual Setup (Quick Start)

For quick testing or if you prefer manual setup.

**1. Create S3 Bucket**

Using AWS CLI:
```bash
aws s3 mb s3://your-app-dev-assets --region us-east-1
```

Or use [AWS Console](https://console.aws.amazon.com/s3):
1. Click "Create bucket"
2. Name: `your-app-dev-assets`
3. Region: `us-east-1`
4. Keep default settings
5. Click "Create bucket"

**2. Configure CORS**

Add CORS configuration to your bucket:

Via AWS CLI:
```bash
aws s3api put-bucket-cors --bucket your-app-dev-assets --cors-configuration file://cors.json
```

Where `cors.json` contains:
```json
{
  "CORSRules": [
    {
      "AllowedHeaders": ["*"],
      "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
      "AllowedOrigins": ["http://localhost:3000", "http://localhost:3001"],
      "ExposeHeaders": ["ETag"]
    }
  ]
}
```

Or via AWS Console:
1. Go to your bucket
2. Click "Permissions" tab
3. Scroll to "Cross-origin resource sharing (CORS)"
4. Click "Edit" and paste the JSON above

**3. Create IAM User**

1. Go to [AWS IAM Console](https://console.aws.amazon.com/iam)
2. Click "Users" → "Create user"
3. Username: `your-app-s3-uploader`
4. Click "Next"
5. Select "Attach policies directly"
6. Click "Create policy" → "JSON" and paste:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::your-app-dev-assets",
        "arn:aws:s3:::your-app-dev-assets/*"
      ]
    }
  ]
}
```

7. Name the policy: `YourAppS3Access`
8. Attach to user
9. Create access key for the user
10. Download credentials

**4. Add credentials to .env:**

```bash
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
S3_ASSETS_BUCKET=your-app-dev-assets
```

**Benefits:**
- ✅ Quick and simple
- ✅ Good for testing and development
- ✅ No Terraform knowledge required

---

### Test File Upload

After setup (either option):

1. Start the application
2. Sign in to your account
3. Go to Dashboard
4. Try uploading an image
5. Verify it appears in your S3 bucket

**Troubleshooting:**
- Check AWS credentials are correct
- Verify CORS configuration
- Check IAM user has correct permissions
- Ensure bucket name matches `.env`

---

## Analytics Setup

### Google Analytics 4 (Optional)

1. Go to https://analytics.google.com
2. Create a new GA4 property
3. Get your Measurement ID (G-XXXXXXXXXX)
4. Add to `.env`:
   ```bash
   NEXT_PUBLIC_GA_TAG=G-XXXXXXXXXX
   ```

### Microsoft Clarity (Optional)

1. Go to https://clarity.microsoft.com
2. Create a new project
3. Get your Project ID
4. Add to `.env`:
   ```bash
   NEXT_PUBLIC_MI_ID=your_clarity_id
   ```

---

## Deployment

Choose a deployment platform based on your needs:

### Vercel (Easiest - Recommended for Beginners)

**Best for:** Quick deployments, serverless, automatic scaling

1. **Push to GitHub**
2. **Import to Vercel:**
   - Go to https://vercel.com
   - Click "Import Project"
   - Select your repository
3. **Add Environment Variables:**
   - Add all variables from `.env.production.example`
4. **Deploy!**

**Pros:** Zero configuration, automatic SSL, global CDN, free tier  
**Cons:** Serverless limitations, vendor lock-in

---

### Railway (Easy - Good for Full-Stack Apps)

**Best for:** Apps needing persistent database, background jobs

1. **Push to GitHub**
2. **Create Railway Project:**
   - Go to https://railway.app
   - Click "New Project" → "Deploy from GitHub"
3. **Add PostgreSQL:**
   - Click "New" → "Database" → "PostgreSQL"
   - Railway provides DATABASE_URL automatically
4. **Add Environment Variables:**
   - Add Clerk keys, AWS credentials, etc.
5. **Deploy!**

**Pros:** Managed database, easy setup, good free tier  
**Cons:** Can get expensive at scale

---

### Dokploy (Self-Hosted - Best Value)

**Best for:** Cost-effective production deployments, full control

Dokploy is a self-hosted PaaS (like Vercel/Railway) that runs on your own VPS.

**Choose your deployment method:**

#### Option A: AWS ECR with Terraform (Production)

**Best for:** Production, CI/CD, multi-environment

1. **Set up ECR with Terraform:**
   ```bash
   cd ops/apps/app-template/dev/03-registry
   terraform init
   terraform apply
   ```

2. **Configure Dokploy server for ECR:**
   - Install AWS CLI on Dokploy server
   - Set up automatic ECR authentication
   - Configure cron job for token refresh

3. **Deploy via Dokploy UI:**
   - Use ECR image URL
   - Add environment variables
   - Deploy!

**See detailed guide:** [docs/dokploy-setup.md](./docs/dokploy-setup.md#option-a-aws-ecr-deployment-with-terraform)

**Pros:** CI/CD ready, scalable, infrastructure as code  
**Cons:** More complex setup, requires AWS

#### Option B: VPS Direct Deployment (Simple)

**Best for:** Testing, simple deployments, learning

1. **Clone repo on VPS:**
   ```bash
   ssh user@your-vps
   git clone <your-repo>
   cd nextstack-saas-starter
   ```

2. **Deploy with Docker Compose:**
   ```bash
   cp .env.production.example .env
   # Edit .env with your values
   docker compose -f docker-compose.production.yml up -d
   ```

3. **Configure Dokploy proxy:**
   - Add domain in Dokploy UI
   - Enable SSL
   - Done!

**See detailed guide:** [docs/dokploy-setup.md](./docs/dokploy-setup.md#option-b-vps-direct-deployment)

**Pros:** Simple, no AWS needed, low cost  
**Cons:** Manual deployments, builds on VPS

**Cost:** $5-20/month VPS (DigitalOcean, Hetzner, Vultr)

---

### Docker (Self-Hosted - Advanced)

**Best for:** Custom infrastructure, existing Docker setup

```bash
# Build production image
docker build -f Dockerfile.app --target production -t your-app:latest .

# Run with docker-compose
docker compose -f docker-compose.production.yml up -d
```

**Pros:** Full control, portable  
**Cons:** Manual setup, no PaaS features

---

### AWS with Terraform (Enterprise)

**Best for:** Enterprise deployments, compliance requirements, high scale

See `ops/` directory for complete Terraform infrastructure:

```bash
cd ops/apps/app-template/dev

# Deploy each module in order:
# 1. Storage (S3)
# 2. Registry (ECR)
# 3. Database (RDS)
# 4. Compute (EC2)
# 5. Load Balancer (ALB)
# 6. DNS & Certificates (Route53 + ACM)
# 7. Monitoring (CloudWatch)
# 8. CI/CD (IAM roles)
```

Each module has a README with detailed instructions.

**Pros:** Production-grade, scalable, compliant  
**Cons:** Complex, higher cost, requires AWS expertise

---

## Deployment Comparison

| Platform | Difficulty | Cost/Month | Best For |
|----------|-----------|------------|----------|
| **Vercel** | ⭐ Easy | $0-20 | Quick deployments, serverless |
| **Railway** | ⭐ Easy | $5-50 | Full-stack apps, managed DB |
| **Dokploy (ECR)** | ⭐⭐ Medium | $6-25 | Production, CI/CD |
| **Dokploy (VPS)** | ⭐⭐ Medium | $5-20 | Cost-effective production |
| **Docker** | ⭐⭐⭐ Hard | $5-50 | Custom infrastructure |
| **AWS Terraform** | ⭐⭐⭐⭐ Expert | $50-500+ | Enterprise, high scale |

### Recommendation by Use Case

- **Learning/Testing:** Vercel or Dokploy (VPS)
- **Side Project:** Railway or Dokploy (VPS)
- **Startup MVP:** Vercel or Dokploy (ECR)
- **Growing Business:** Dokploy (ECR) or AWS
- **Enterprise:** AWS with Terraform

---

## Troubleshooting

### Database Connection Issues

**Problem:** Can't connect to database

**Solutions:**
- Verify PostgreSQL is running: `docker compose ps`
- Check DATABASE_URL in `.env`
- Ensure database exists: `docker compose exec postgres psql -U appuser -d appdb`

### Clerk Authentication Not Working

**Problem:** Sign in/up redirects fail

**Solutions:**
- Verify Clerk keys in `.env`
- Check Clerk dashboard for errors
- Ensure routes match in `.env` and Clerk dashboard

### S3 Upload Fails

**Problem:** File uploads return errors

**Solutions:**
- Verify AWS credentials in `.env`
- Check S3 bucket CORS configuration
- Verify IAM user has correct permissions
- Check bucket name matches `.env`

### Port Already in Use

**Problem:** Port 3000 or 3001 already in use

**Solutions:**
```bash
# Find process using port
lsof -i :3000

# Kill process
kill -9 <PID>

# Or change port in docker-compose.yml
```

### Docker Build Fails

**Problem:** Docker build errors

**Solutions:**
- Clear Docker cache: `docker system prune -a`
- Rebuild: `docker compose build --no-cache`
- Check Docker has enough memory (4GB+ recommended)

---

## Next Steps

- ✅ Customize branding and content
- ✅ Add your business logic
- ✅ Configure production environment
- ✅ Set up CI/CD pipeline
- ✅ Deploy to production

## Need Help?

- 📖 Check the [README.md](./README.md)
- 📖 Review [docs/](./docs/) for detailed guides
- 🐛 Open an issue on GitHub
- 💬 Join our community discussions

---

**Happy building! 🚀**
