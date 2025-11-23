terraform {
  required_version = ">= 1.5.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = ">= 5.0"
    }
    random = {
      source  = "hashicorp/random"
      version = ">= 3.0"
    }
  }
}

# DB Subnet Group
resource "aws_db_subnet_group" "this" {
  name       = "${var.name_prefix}-db-subnets"
  subnet_ids = var.private_subnet_ids
  tags       = merge(var.tags, { Name = "${var.name_prefix}-db-subnets" })
}

# Security Group for RDS
resource "aws_security_group" "db" {
  name        = "${var.name_prefix}-rds-sg"
  description = "RDS Postgres SG"
  vpc_id      = var.vpc_id

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = merge(var.tags, { Name = "${var.name_prefix}-rds-sg" })
}

# Allow Postgres ingress from specified SGs (supports single SG to avoid apply-time unknown for_each)
resource "aws_security_group_rule" "ingress_from_sgs" {
  count                    = length(var.allowed_security_group_ids) > 0 ? 1 : 0
  type                     = "ingress"
  security_group_id        = aws_security_group.db.id
  from_port                = 5432
  to_port                  = 5432
  protocol                 = "tcp"
  source_security_group_id = var.allowed_security_group_ids[0]
}

# Generate a strong password for the DB master user
resource "random_password" "db" {
  length           = 20
  special          = true
  override_special = "!@#%^*()-_=+[]{}"
}

# RDS PostgreSQL instance (private subnets)
resource "aws_db_instance" "this" {
  identifier                 = "${var.name_prefix}-postgres"
  engine                     = "postgres"
  engine_version             = var.engine_version
  instance_class             = var.instance_class
  db_name                    = var.db_name
  username                   = var.username
  password                   = random_password.db.result

  allocated_storage          = var.allocated_storage
  max_allocated_storage      = var.max_allocated_storage

  multi_az                   = var.multi_az
  storage_encrypted          = true
  publicly_accessible        = false

  vpc_security_group_ids     = [aws_security_group.db.id]
  db_subnet_group_name       = aws_db_subnet_group.this.name

  backup_retention_period    = var.backup_retention_period
  deletion_protection        = var.deletion_protection
  skip_final_snapshot        = var.skip_final_snapshot
  apply_immediately          = var.apply_immediately

  # Optionally specify performance or monitoring settings later

  tags = merge(var.tags, { Name = "${var.name_prefix}-postgres" })
}

# Optional Secrets Manager secret with connection info
locals {
  secret_name_effective = var.secret_name != null && var.secret_name != "" ? var.secret_name : "${var.name_prefix}/rds"
  connection_json = jsonencode({
    engine   = "postgres",
    host     = aws_db_instance.this.address,
    port     = aws_db_instance.this.port,
    database = var.db_name,
    username = var.username,
    password = random_password.db.result,
    jdbc     = "jdbc:postgresql://${aws_db_instance.this.address}:${aws_db_instance.this.port}/${var.db_name}"
  })
}

module "db_secret" {
  source = "../secrets-manager-secret"
  count  = var.create_secret ? 1 : 0

  name          = local.secret_name_effective
  description   = "Credentials for ${var.name_prefix} RDS Postgres"
  secret_string = local.connection_json
  tags          = var.tags
}
