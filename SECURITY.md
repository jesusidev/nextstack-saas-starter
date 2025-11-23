# Security Policy

## Supported Versions

We release patches for security vulnerabilities. Currently supported versions:

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

We take the security of NextStack SaaS Starter seriously. If you believe you have found a security vulnerability, please report it to us as described below.

### Please Do Not

- **Do not** open a public GitHub issue for security vulnerabilities
- **Do not** disclose the vulnerability publicly until it has been addressed

### How to Report

**Please report security vulnerabilities by emailing:** 

Include the following information in your report:

- Type of vulnerability (e.g., XSS, SQL injection, authentication bypass)
- Full paths of source file(s) related to the vulnerability
- Location of the affected source code (tag/branch/commit or direct URL)
- Step-by-step instructions to reproduce the issue
- Proof-of-concept or exploit code (if possible)
- Impact of the vulnerability, including how an attacker might exploit it

### What to Expect

- **Acknowledgment:** We will acknowledge receipt of your vulnerability report within 48 hours
- **Updates:** We will send you regular updates about our progress
- **Timeline:** We aim to address critical vulnerabilities within 7 days
- **Credit:** If you wish, we will publicly credit you for the discovery once the issue is resolved

## Security Best Practices for Users

When deploying this template, please ensure:

### Environment Variables
- Never commit `.env` files to version control
- Use strong, unique values for all secrets
- Rotate credentials regularly
- Use environment-specific credentials (dev/staging/production)

### Authentication
- Configure Clerk with appropriate security settings
- Enable MFA for admin accounts
- Review and configure session timeout settings
- Implement rate limiting on authentication endpoints

### Database
- Use strong database passwords
- Restrict database access to application servers only
- Enable SSL/TLS for database connections
- Regular backups with encryption

### AWS/S3
- Follow principle of least privilege for IAM roles
- Enable S3 bucket encryption
- Configure appropriate CORS policies
- Use presigned URLs with short expiration times
- Enable CloudTrail for audit logging

### Application
- Keep dependencies up to date (`npm audit`)
- Review and configure CSP headers
- Enable HTTPS in production
- Configure appropriate rate limiting
- Implement proper input validation
- Use parameterized queries (Prisma handles this)

### Docker
- Use official base images
- Scan images for vulnerabilities
- Don't run containers as root
- Keep Docker and dependencies updated

## Known Security Considerations

### Third-Party Services
This template integrates with:
- **Clerk** - Authentication provider
- **AWS S3** - File storage
- **PostgreSQL** - Database

Please review the security documentation for each service and configure them according to your security requirements.

### File Uploads
- File uploads are handled via presigned S3 URLs
- Client-side validation is implemented but should not be solely relied upon
- Configure appropriate file size limits
- Implement server-side file type validation
- Consider adding virus scanning for production use

### Rate Limiting
- Basic rate limiting is implemented
- Review and adjust limits based on your use case
- Consider using a dedicated rate limiting service for production

## Security Updates

We will announce security updates through:
- GitHub Security Advisories
- Release notes
- Email notifications (if you've starred the repository)

## Compliance

This template provides a foundation for building secure applications but does not guarantee compliance with specific regulations (GDPR, HIPAA, SOC 2, etc.). You are responsible for:

- Conducting your own security assessments
- Implementing additional controls as needed
- Maintaining compliance with applicable regulations
- Regular security audits

## Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security Best Practices](https://nextjs.org/docs/app/building-your-application/configuring/security)
- [Clerk Security Documentation](https://clerk.com/docs/security)
- [AWS Security Best Practices](https://aws.amazon.com/security/best-practices/)

---

**Last Updated:** November 23, 2025
