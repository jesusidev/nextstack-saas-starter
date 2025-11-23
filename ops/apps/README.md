# Application Stacks (Terraform per app/env)

This directory contains per‑application Terraform stacks. Each app has separate environments (dev, qa, prod) under its folder.

## Structure

```
ops/apps/
├── app-template/
│   ├── dev/
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   ├── outputs.tf
│   │   └── terraform.tfvars.example
│   ├── qa/
│   └── prod/
└── <your-app>/
    ├── dev/
    ├── qa/
    └── prod/
```

Use `app-template` as a starting point for new apps, or run the scaffold script:

- Optional scaffold: `./ops/scripts/new-app.sh myapp`

This will create `ops/apps/myapp/{dev,qa,prod}` and prefill .tfvars examples.

## Prerequisites

- Terraform >= 1.5
- AWS CLI configured for the target account/role
- Ensure global infrastructure (ops/global) is applied and you have VPC/subnet IDs

## Per‑App Deployment (Terraform CLI)

Example below uses `myapp` and the `dev` environment. Repeat similarly for `qa` and `prod` with their values.

1) Prepare variables
- Copy the example var file and fill in values:

```
cd ops/apps/myapp/dev
cp terraform.tfvars.example terraform.tfvars
```

2) Set required values in terraform.tfvars
- Networking (from global outputs):
  - vpc_id
  - public_subnet_id
  - private_subnet_ids (if RDS enabled)
- Compute:
  - instance_type (e.g., "t3.micro")
- ECR/CI:
  - ecr_repository_name
  - enable_ci_user (true/false)
  - ci_secret_name (where CI credentials are stored)
- Optional ALB / Certificates / DNS:
  - enable_alb, public_subnet_ids (>= 2)
  - enable_acm, route53_zone_id, domain_name, subject_alternative_names
  - enable_alb_dns_record, alb_certificate_arn (if using an existing cert)

3) Initialize and deploy

```
terraform init
terraform plan  -var-file=terraform.tfvars
terraform apply -var-file=terraform.tfvars
```

4) Review outputs
- Buckets, EC2 instance details, optional RDS info and secrets, ECR repo details, optional ALB/DNS and CloudWatch resources.

## Account Safety

Each app environment requires `aws_account_id` and the provider enforces it with:

```
allowed_account_ids = [var.aws_account_id]
```

Plans/applies will fail if your current credentials do not match, preventing accidental deployments.

## Remote State (recommended for production)

Configure an S3 backend with DynamoDB locking in each environment before `terraform init` in production. Example backend block is not included by default; add it to the environment as needed.

## Notes

- The deploy helper script is removed. Always run Terraform directly inside the environment directory.
- To destroy resources, run:

```
terraform destroy -var-file=terraform.tfvars
```

- Use the QA/Prod directories with appropriate var-files and account IDs.


## Filling terraform.tfvars (Detailed)

Below are concise examples you can copy/paste and adapt. For a full list of variables, see the variables.tf in your chosen environment (e.g., ops/apps/app-template/dev/variables.tf) and the existing example files.

1) Minimal working example (no ALB/DNS)

```
aws_region     = "us-west-2"
aws_account_id = "123456789012"
name_prefix    = "myapp-dev"

# From ops/global outputs
vpc_id           = "vpc-xxxxxxxx"
public_subnet_id = "subnet-aaaaaaaa"

# Compute
instance_type = "t3.micro"

# Tags (follow ops/README.md tag policy)
tags = {
  project     = "your-app-name"  # Replace with your project name
  environment = "dev"
  owner       = "DevTeam"
  ManagedBy   = "Terraform"
  Layer       = "ops-apps-myapp-dev"
}
```

2) Enabling ALB + ACM + DNS (using an existing Route53 Hosted Zone)

Use this when your apex domain (e.g., example.com) is already hosted in Route53.

```
# ALB
enable_alb        = true
public_subnet_ids = ["subnet-aaaaaaaa", "subnet-bbbbbbbb"]
alb_target_port   = 80
alb_health_check_path = "/"

# ACM + DNS
enable_acm                 = true
route53_zone_id            = "ZXXXXXXXXXXXXXXXXX" # existing Hosted Zone ID
domain_name                = "dev.example.com"
subject_alternative_names  = ["www.dev.example.com"]

# ALB DNS record
enable_alb_dns_record = true
# alb_certificate_arn = "arn:aws:acm:..." # optional; leave empty to create via module
```

3) Enabling ALB + ACM + DNS (create a new Route53 Hosted Zone for your domain)

If your domain is registered elsewhere (Namecheap, GoDaddy, etc.) and you want AWS to host its DNS, set hosted_zone_name and leave route53_zone_id empty. After apply, use the nameservers output at your registrar.

```
# ALB
enable_alb        = true
public_subnet_ids = ["subnet-aaaaaaaa", "subnet-bbbbbbbb"]

# Create the hosted zone and issue a cert validated via Route53
hosted_zone_name = "example.com"  # apex domain to create in Route53
route53_zone_id  = ""             # leave empty when creating the zone
enable_acm       = true

# DNS names
domain_name               = "dev.example.com"
subject_alternative_names = []

enable_alb_dns_record = true
```

Important:
- Use either hosted_zone_name OR route53_zone_id (not both). If both are set, route53_zone_id takes precedence in templates that use an effective value.
- After creating a new hosted zone, update your domain registrar to use the nameservers from Terraform outputs. Until registrar DNS is updated and propagated, the ALB DNS name will work, but your custom domain may not resolve.

Viewing outputs (including nameservers when a hosted zone is created):

```
terraform output
terraform output route53_name_servers
terraform output route53_hosted_zone_id
```

If you prefer JSON for scripting:

```
terraform output -json | jq
```

4) Commands recap (per environment directory)

Run the following inside the environment directory:

```
terraform init
terraform plan  -var-file=terraform.tfvars
terraform apply -var-file=terraform.tfvars
# Destroy when needed:
terraform destroy -var-file=terraform.tfvars
```

5) Paths and examples for the included stacks

- app-template (starter):
  - cd ops/apps/app-template/dev
  - cp terraform.tfvars.example terraform.tfvars
  - Fill in vpc_id, subnet IDs, tags, and optionally DNS values per scenarios above.

- app-template (generic template for your app):
  - cd ops/apps/app-template/dev
  - Copy terraform.tfvars.example to terraform.tfvars and update:
    - vpc_id, public_subnet_id, and (if RDS enabled) private_subnet_ids from ops/global outputs
    - Route53: set route53_zone_id for an existing zone OR set hosted_zone_name to create a new zone
    - domain_name and subject_alternative_names for ACM/ALB
    - Replace all placeholder values with your actual configuration

See also:
- ops/README.md for deployment order, tag policy, and architecture notes
- docs/aws-infra-setup.md for the minimal AWS setup checklist
