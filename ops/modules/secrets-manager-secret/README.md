# secrets-manager-secret module

Reusable AWS Secrets Manager secret module for separation of concerns and cross-service reuse.

Features:
- Creates a Secrets Manager secret with optional description and KMS key
- Stores a provided secret_string (plain text or JSON-encoded)
- Force delete without recovery enabled by default (cost-friendly for dev/test)
- Exposes secret ARN/ID/name and version ID

## Inputs
- name (string) – required secret name
- description (string, default "") – optional description
- kms_key_id (string, default null) – optional KMS key ID/ARN; if null, AWS-managed key is used
- force_delete_without_recovery (bool, default true)
- secret_string (string, sensitive) – the value to store (use jsonencode({...}) for JSON)
- tags (map(string), default {})

## Outputs
- secret_id
- secret_arn
- secret_name
- version_id

## Example: JSON payload

```
module "app_db_secret" {
  source      = "../secrets-manager-secret"
  name        = "myapp-rds-credentials"
  description = "RDS credentials for myapp"
  secret_string = jsonencode({
    engine   = "postgres"
    host     = aws_db_instance.this.address
    port     = aws_db_instance.this.port
    dbname   = var.db_name
    username = var.username
    password = random_password.db.result
  })
  tags = var.tags
}
```

Tip: Grant consumers (e.g., EC2 role) permission to read the secret via a targeted IAM policy with secretsmanager:GetSecretValue on module.app_db_secret.secret_arn.
