# DNS & Certificates Module (Route53 + ACM)

## Purpose

Sets up custom domain with SSL/TLS certificate for HTTPS access. Creates or uses existing Route53 hosted zone and provisions ACM certificate with automatic DNS validation.

## What's Created

- **Route53 Hosted Zone** (optional): DNS management for domain
- **ACM Certificate**: Free SSL/TLS certificate
- **DNS Validation Records**: Auto-validates certificate
- **A Record**: Points domain to ALB
- **WWW CNAME** (optional): Redirects www to apex domain

## Prerequisites

- Domain name registered (or subdomain of existing domain)
- ALB deployed (from 06-loadbalancer)
- Access to domain registrar (to update name servers)

## Dependencies

**Required:**
- `06-loadbalancer` - ALB to route traffic to

## Used By

**None** - This is a terminal module in the dependency chain

## Deployment

### Option 1: Using Existing Hosted Zone

If you already have a Route53 hosted zone:

```bash
cd ops/apps/app-template/dev/07-dns-certs

cp terraform.tfvars.example terraform.tfvars
nano terraform.tfvars

# Set:
domain_name        = "dev.app-template.com"
create_hosted_zone = false

terraform init
terraform apply
```

### Option 2: Creating New Hosted Zone

If this is a new domain/subdomain:

```bash
cd ops/apps/app-template/dev/07-dns-certs

cp terraform.tfvars.example terraform.tfvars
nano terraform.tfvars

# Set:
domain_name        = "newapp.example.com"
create_hosted_zone = true

terraform init
terraform apply

# Get name servers
terraform output hosted_zone_name_servers
```

**Important**: Update your domain registrar with the name servers output!

## Configuration

### terraform.tfvars

```hcl
# Your domain
domain_name = "dev.app-template.com"

# Additional domains for certificate
subject_alternative_names = [
  "www.dev.app-template.com",
  "api.dev.app-template.com"
]

# Route53 settings
create_hosted_zone = false  # true if new domain
create_www_record  = true   # Create www → apex redirect
```

## Certificate Validation

The module automatically validates the certificate using DNS:

1. ✅ Creates ACM certificate request
2. ✅ ACM provides DNS validation records
3. ✅ Module creates records in Route53
4. ✅ ACM validates ownership (~5-10 minutes)
5. ✅ Certificate becomes active

**No manual steps required!**

### Manual Validation (if needed)

If using external DNS:

```bash
# Get validation records
terraform show | grep -A 5 "domain_validation_options"

# Add these CNAME records to your DNS provider
# Wait for validation
aws acm describe-certificate --certificate-arn <arn>
```

## Updating ALB with Certificate

After certificate is issued, update the load balancer:

```bash
# Get certificate ARN
cd ops/apps/app-template/dev/07-dns-certs
CERT_ARN=$(terraform output -raw certificate_arn)

# Update ALB configuration
cd ../06-loadbalancer
nano terraform.tfvars

# Add:
certificate_arn = "<paste-cert-arn>"

terraform apply
```

Now HTTP will redirect to HTTPS!

## Domain Registrar Configuration

### New Hosted Zone

If you created a new hosted zone (`create_hosted_zone = true`):

```bash
# Get name servers
terraform output hosted_zone_name_servers
```

Output:
```
[
  "ns-123.awsdns-12.com",
  "ns-456.awsdns-45.org",
  "ns-789.awsdns-78.co.uk",
  "ns-012.awsdns-01.net"
]
```

**Update your domain registrar** (GoDaddy, Namecheap, etc.) with these name servers.

### Existing Hosted Zone

No action needed if using existing hosted zone.

## WWW Redirect

The module creates a www CNAME by default:

```
www.dev.app-template.com → dev.app-template.com → ALB
```

Both URLs work:
- https://dev.app-template.com
- https://www.dev.app-template.com

Disable with:
```hcl
create_www_record = false
```

## Testing

### Check DNS Resolution

```bash
# Check A record
dig dev.app-template.com

# Check www CNAME
dig www.dev.app-template.com

# Verify points to ALB
nslookup dev.app-template.com
```

### Check Certificate

```bash
# Test HTTPS
curl -I https://dev.app-template.com

# Verify certificate
openssl s_client -connect dev.app-template.com:443 -servername dev.app-template.com

# Check expiration
echo | openssl s_client -connect dev.app-template.com:443 2>/dev/null | \
  openssl x509 -noout -dates
```

### Check HTTP → HTTPS Redirect

```bash
# Should return 301 redirect
curl -I http://dev.app-template.com
```

## Outputs

```bash
terraform output certificate_arn       # For ALB HTTPS listener
terraform output hosted_zone_id        # For additional DNS records
terraform output domain_name           # Configured domain
terraform output app_url               # Full HTTPS URL
```

## Cost Estimate

| Resource | Monthly Cost |
|----------|--------------|
| Route53 Hosted Zone | $0.50 |
| DNS Queries (1M) | $0.40 |
| ACM Certificate | **Free** |
| **Total** | **~$0.90-1/month** |

**Notes:**
- ACM certificates are completely free
- Certificate auto-renews before expiration
- First 1M queries included, $0.40/M after

## When to Deploy

- **Production**: Always (custom domain + HTTPS)
- **Staging**: Recommended (use subdomain like staging.app-template.com)
- **Development**: Optional (can use ALB DNS name)

## When to Skip

- Cost-sensitive dev environments
- Using ALB DNS name directly
- Using CloudFlare or external DNS/SSL
- Testing phase without custom domain

## Security Features

1. **TLS 1.3 Support**: Modern encryption protocols
2. **Auto-Renewal**: Certificates renew automatically
3. **DNS Validation**: Secure ownership verification
4. **HTTPS Enforcement**: HTTP redirects to HTTPS

## Multi-Domain Certificates

Support multiple domains with one certificate:

```hcl
domain_name = "app-template.com"

subject_alternative_names = [
  "www.app-template.com",
  "api.app-template.com",
  "app.app-template.com",
  "*.app-template.com"  # Wildcard
]
```

**Wildcard Certificates:**
- `*.app-template.com` covers all subdomains
- Costs the same (free!)
- Useful for multiple environments

## Troubleshooting

### Certificate validation stuck

**Check validation status:**
```bash
aws acm describe-certificate --certificate-arn <arn>
```

**Common issues:**
1. DNS records not propagated (wait 5-10 minutes)
2. Route53 zone not authoritative
3. CAA records blocking issuance

**Solution**: Verify DNS records exist:
```bash
dig _<validation-name>.<domain> CNAME
```

### Domain not resolving

**Check Route53 records:**
```bash
aws route53 list-resource-record-sets --hosted-zone-id <zone-id>
```

**Verify name servers:**
```bash
dig NS app-template.com
```

Name servers should match Route53 hosted zone.

### HTTPS not working

1. **Certificate not validated**: Check ACM status
2. **ALB not configured**: Update `certificate_arn` in 06-loadbalancer
3. **HTTPS listener missing**: Redeploy load balancer module
4. **Wrong region**: Certificate must be in ALB region

### Mixed content warnings

If app loads but shows "Not Secure":

1. Check all resources use HTTPS URLs
2. Update `NEXT_PUBLIC_BASE_URL` environment variable
3. Verify API calls use HTTPS

## Certificate Renewal

ACM automatically renews certificates before expiration:

- ✅ Renews 60 days before expiration
- ✅ Sends renewal notifications via SNS
- ✅ No downtime during renewal
- ✅ No action required

**Best Practice**: Subscribe to ACM expiration notifications:

```bash
aws acm request-certificate \
  --domain-name example.com \
  --validation-method DNS \
  --idempotency-token 1234 \
  --options CertificateTransparencyLoggingPreference=ENABLED
```

## Next Steps

After deploying DNS and certificates:

1. **Update domain registrar**: Configure name servers (if new zone)
2. **Update ALB**: Add certificate ARN to load balancer
3. **Test HTTPS**: Verify certificate works correctly
4. **Update app config**: Set `NEXT_PUBLIC_BASE_URL` to HTTPS domain
5. **Setup monitoring**: `08-monitoring` for SSL expiration alerts
6. **Configure CI/CD**: Update deployment URLs

## Related Modules

- **06-loadbalancer**: Consumes certificate ARN for HTTPS
- **08-monitoring**: Can monitor certificate expiration
- **09-cicd**: Update deployment scripts with custom domain
