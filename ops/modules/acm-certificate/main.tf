terraform {
  required_version = ">= 1.5.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = ">= 5.0"
    }
  }
}

resource "aws_acm_certificate" "this" {
  domain_name               = var.domain_name
  subject_alternative_names = var.subject_alternative_names
  validation_method         = "DNS"

  lifecycle {
    create_before_destroy = true
  }

  tags = var.tags
}

# Create DNS validation records via Route53 module
locals {
  validation_records = [
    for dvo in aws_acm_certificate.this.domain_validation_options : {
      name            = dvo.resource_record_name
      type            = dvo.resource_record_type
      ttl             = 60
      records         = [dvo.resource_record_value]
      allow_overwrite = true
    }
  ]
}

module "dns_validation" {
  source           = "../route53-records"
  zone_id          = var.hosted_zone_id
  standard_records = local.validation_records
  alias_records    = []
}

resource "aws_acm_certificate_validation" "this" {
  certificate_arn         = aws_acm_certificate.this.arn
  validation_record_fqdns = module.dns_validation.all_fqdns
}
