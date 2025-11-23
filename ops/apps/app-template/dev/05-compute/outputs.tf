output "instance_id" {
  description = "ID of the EC2 instance"
  value       = aws_instance.app.id
}

output "instance_public_ip" {
  description = "Public IP of the EC2 instance"
  value       = aws_instance.app.public_ip
}

output "instance_private_ip" {
  description = "Private IP of the EC2 instance"
  value       = aws_instance.app.private_ip
}

output "elastic_ip" {
  description = "Elastic IP address (if allocated)"
  value       = var.allocate_eip ? aws_eip.app[0].public_ip : null
}

output "security_group_id" {
  description = "ID of the EC2 security group"
  value       = aws_security_group.ec2.id
}

output "iam_role_arn" {
  description = "ARN of the IAM role"
  value       = aws_iam_role.ec2.arn
}

output "app_url" {
  description = "Application URL"
  value       = var.allocate_eip ? "http://${aws_eip.app[0].public_ip}:${var.app_port}" : "http://${aws_instance.app.public_ip}:${var.app_port}"
}
