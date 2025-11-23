output "zone_id" {
  description = "Hosted Zone ID"
  value       = aws_route53_zone.this.zone_id
}

output "name_servers" {
  description = "List of nameservers to configure at your registrar"
  value       = aws_route53_zone.this.name_servers
}
