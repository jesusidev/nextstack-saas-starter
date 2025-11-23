terraform {
  required_version = ">= 1.5.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = ">= 5.0"
    }
  }
}

# Standard (non-alias) records
resource "aws_route53_record" "standard" {
  # Use index-based keys to avoid plan-time unknowns from record fields (e.g., ACM DNS validation values)
  for_each = { for idx, r in var.standard_records : tostring(idx) => r }

  zone_id = var.zone_id
  name    = each.value.name
  type    = each.value.type
  ttl     = each.value.ttl
  records = each.value.records

  allow_overwrite = each.value.allow_overwrite
}

# Alias records
resource "aws_route53_record" "alias" {
  for_each = { for r in var.alias_records : r.name => r }

  zone_id = var.zone_id
  name    = each.value.name
  type    = var.alias_record_type

  alias {
    name                   = each.value.target_name
    zone_id                = each.value.target_zone_id
    evaluate_target_health = each.value.evaluate_target_health
  }
}
