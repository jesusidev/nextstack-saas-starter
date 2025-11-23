output "hosted_zone_id" {
  description = "ID of the Route53 hosted zone"
  value       = local.zone_id
}

output "hosted_zone_name_servers" {
  description = "Name servers for the hosted zone (update at domain registrar)"
  value       = var.create_hosted_zone ? aws_route53_zone.main[0].name_servers : null
}

output "certificate_arn" {
  description = "ARN of the ACM certificate (use in ALB configuration)"
  value       = aws_acm_certificate.main.arn
}

output "domain_name" {
  description = "Domain name configured"
  value       = var.domain_name
}

output "app_url" {
  description = "Full application URL"
  value       = "https://${var.domain_name}"
}
