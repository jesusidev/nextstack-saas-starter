terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = ">= 5.0"
    }
  }
}

provider "aws" {
  region = var.region
}

data "aws_availability_zones" "available" {}

locals {
  default_azs = slice(data.aws_availability_zones.available.names, 0, 2)
  azs_final   = length(var.azs) > 0 ? var.azs : local.default_azs
}

module "vpc" {
  source = "../modules/vpc-lean"

  name                 = var.name
  cidr_block           = var.cidr_block
  public_subnet_cidrs  = var.public_subnet_cidrs
  private_subnet_cidrs = var.private_subnet_cidrs
  azs                  = local.azs_final
  enable_nat_gateway   = var.enable_nat_gateway
  tags                 = var.tags
}
