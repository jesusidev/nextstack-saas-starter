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
  region  = var.region
  profile = var.profile
}

# Reference load balancer outputs
data "terraform_remote_state" "loadbalancer" {
  backend = "local"
  config = {
    path = "../06-loadbalancer/terraform.tfstate"
  }
}

# Route53 hosted zone (either create new or use existing)
resource "aws_route53_zone" "main" {
  count = var.create_hosted_zone ? 1 : 0
  name  = var.domain_name

  tags = merge(
    var.tags,
    {
      Name = var.domain_name
    }
  )
}

# Use existing hosted zone
data "aws_route53_zone" "existing" {
  count = var.create_hosted_zone ? 0 : 1
  name  = var.domain_name
}

locals {
  zone_id = var.create_hosted_zone ? aws_route53_zone.main[0].zone_id : data.aws_route53_zone.existing[0].zone_id
}

# ACM Certificate
resource "aws_acm_certificate" "main" {
  domain_name               = var.domain_name
  subject_alternative_names = var.subject_alternative_names
  validation_method         = "DNS"

  lifecycle {
    create_before_destroy = true
  }

  tags = merge(
    var.tags,
    {
      Name = var.domain_name
    }
  )
}

# DNS records for certificate validation
resource "aws_route53_record" "cert_validation" {
  for_each = {
    for dvo in aws_acm_certificate.main.domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      record = dvo.resource_record_value
      type   = dvo.resource_record_type
    }
  }

  allow_overwrite = true
  name            = each.value.name
  records         = [each.value.record]
  ttl             = 60
  type            = each.value.type
  zone_id         = local.zone_id
}

# Wait for certificate validation
resource "aws_acm_certificate_validation" "main" {
  certificate_arn         = aws_acm_certificate.main.arn
  validation_record_fqdns = [for record in aws_route53_record.cert_validation : record.fqdn]
}

# A record pointing to ALB
resource "aws_route53_record" "app" {
  zone_id = local.zone_id
  name    = var.domain_name
  type    = "A"

  alias {
    name                   = data.terraform_remote_state.loadbalancer.outputs.alb_dns_name
    zone_id                = data.terraform_remote_state.loadbalancer.outputs.alb_zone_id
    evaluate_target_health = true
  }
}

# WWW CNAME (optional)
resource "aws_route53_record" "www" {
  count   = var.create_www_record ? 1 : 0
  zone_id = local.zone_id
  name    = "www.${var.domain_name}"
  type    = "CNAME"
  ttl     = 300
  records = [var.domain_name]
}
