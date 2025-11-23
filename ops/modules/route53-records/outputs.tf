output "standard_fqdns" {
  description = "List of FQDNs for standard (non-alias) records created"
  value       = [for r in aws_route53_record.standard : r.fqdn]
}

output "alias_fqdns" {
  description = "List of FQDNs for alias records created"
  value       = [for r in aws_route53_record.alias : r.fqdn]
}

output "all_fqdns" {
  description = "List of all FQDNs created by this module"
  value       = concat(
    [for r in aws_route53_record.standard : r.fqdn],
    [for r in aws_route53_record.alias : r.fqdn]
  )
}
