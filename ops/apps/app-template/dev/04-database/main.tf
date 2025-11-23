terraform {
  required_version = ">= 1.5.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region              = var.aws_region
  allowed_account_ids = [var.aws_account_id]
  profile             = var.aws_profile != "" ? var.aws_profile : null
}

# ============================================================================
# RDS PostgreSQL Database
# ============================================================================

module "rds" {
  source = "../../../../modules/rds-postgres"

  name_prefix         = var.name_prefix
  vpc_id              = var.vpc_id
  private_subnet_ids  = var.private_subnet_ids
  
  # Allow access from compute layer security group
  # Get this from the compute module's outputs
  allowed_security_group_ids = var.allowed_security_group_ids

  db_name                 = var.db_name
  username                = var.db_username
  instance_class          = var.instance_class
  allocated_storage       = var.allocated_storage
  multi_az                = var.multi_az
  engine_version          = var.engine_version
  backup_retention_period = var.backup_retention_period
  deletion_protection     = var.deletion_protection
  skip_final_snapshot     = var.skip_final_snapshot
  apply_immediately       = var.apply_immediately
  create_secret           = var.create_secret

  tags = var.tags
}
