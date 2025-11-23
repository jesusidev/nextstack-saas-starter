output "endpoint" {
  description = "RDS endpoint address"
  value       = aws_db_instance.this.address
}

output "port" {
  description = "RDS port"
  value       = aws_db_instance.this.port
}

output "db_name" {
  description = "Initial database name"
  value       = var.db_name
}

output "username" {
  description = "Master username"
  value       = var.username
}

output "instance_identifier" {
  description = "RDS instance identifier"
  value       = aws_db_instance.this.id
}

output "db_arn" {
  description = "ARN of the RDS instance"
  value       = aws_db_instance.this.arn
}

output "secret_name" {
  description = "Name of the Secrets Manager secret (null if not created)"
  value       = var.create_secret ? module.db_secret[0].secret_name : null
}

output "secret_arn" {
  description = "ARN of the Secrets Manager secret with DB connection (null if not created)"
  value       = var.create_secret ? module.db_secret[0].secret_arn : null
}

output "secret_id" {
  description = "ID of the Secrets Manager secret (null if not created)"
  value       = var.create_secret ? module.db_secret[0].secret_id : null
}
