output "rds_endpoint" {
  description = "RDS connection endpoint"
  value       = module.rds.endpoint
}

output "rds_port" {
  description = "RDS port"
  value       = module.rds.port
}

output "rds_instance_identifier" {
  description = "RDS instance identifier"
  value       = module.rds.instance_identifier
}

output "rds_secret_arn" {
  description = "Secrets Manager ARN containing RDS credentials"
  value       = module.rds.secret_arn
}

output "rds_security_group_id" {
  description = "Security group ID for RDS"
  value       = module.rds.security_group_id
}

output "db_name" {
  description = "Database name"
  value       = var.db_name
}
