output "instance_id" {
  description = "EC2 instance ID"
  value       = aws_instance.app.id
}

output "public_ip" {
  description = "Public IP of the EC2 instance"
  value       = aws_instance.app.public_ip
}

output "security_group_id" {
  description = "Security group ID for the instance"
  value       = aws_security_group.app.id
}

output "iam_role_name" {
  description = "IAM role name attached to the instance"
  value       = aws_iam_role.app.name
}

output "instance_profile_name" {
  description = "Instance profile name"
  value       = aws_iam_instance_profile.app.name
}
