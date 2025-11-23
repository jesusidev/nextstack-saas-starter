output "dns_name" {
  description = "DNS name of the ALB"
  value       = aws_lb.this.dns_name
}

output "security_group_id" {
  description = "Security group ID attached to the ALB"
  value       = aws_security_group.alb.id
}

output "target_group_arn" {
  description = "ARN of the target group"
  value       = aws_lb_target_group.this.arn
}

output "http_listener_arn" {
  description = "ARN of the HTTP listener"
  value       = aws_lb_listener.http.arn
}

output "https_listener_arn" {
  description = "ARN of the HTTPS listener (null if not created)"
  value       = length(aws_lb_listener.https) > 0 ? aws_lb_listener.https[0].arn : null
}
output "zone_id" {
  description = "Hosted zone ID of the ALB"
  value       = aws_lb.this.zone_id
}
