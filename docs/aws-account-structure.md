# AWS Account Structure for NextStack SaaS Starter

This document outlines the AWS account structure for the NextStack SaaS Starter application, including account organization, access management, and cost controls.

## AWS Account Structure

### Account Hierarchy

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                     AWS Organizations                           │
│                                                                 │
│  ┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐│
│  │                 │   │                 │   │                 ││
│  │  Management     │   │  Security       │   │  Logging        ││
│  │  Account        │   │  Account        │   │  Account        ││
│  │                 │   │                 │   │                 ││
│  └─────────────────┘   └─────────────────┘   └─────────────────┘│
│                                                                 │
│  ┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐│
│  │                 │   │                 │   │                 ││
│  │  Development    │   │  QA             │   │  Production     ││
│  │  Account        │   │  Account        │   │  Account        ││
│  │                 │   │                 │   │                 ││
│  └─────────────────┘   └─────────────────┘   └─────────────────┘│
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Account Descriptions

1. **Management Account**
   - Root account for the AWS Organization
   - Contains only IAM users for organization administrators
   - No application resources deployed here
   - Manages consolidated billing
   - Applies organization-wide policies

2. **Security Account**
   - Centralized security services
   - AWS Security Hub
   - GuardDuty master
   - IAM Access Analyzer
   - AWS Config aggregator

3. **Logging Account**
   - Centralized logging repository
   - CloudTrail logs from all accounts
   - CloudWatch Logs exports
   - S3 access logs
   - Long-term log retention

4. **Development Account**
   - Development environment resources
   - Developer IAM roles
   - CI/CD pipeline resources
   - Lower security constraints for experimentation
   - Cost constraints to prevent overspending

5. **QA Account**
   - Testing environment resources
   - Isolated from development
   - Similar architecture to production
   - Test data management
   - Performance testing resources

6. **Production Account**
   - Production environment resources
   - Highest security constraints
   - Restricted access
   - Optimized for reliability and performance
   - Backup and disaster recovery

## AWS Organizations Setup

### Step-by-Step Implementation

1. **Create Management Account**
   - Sign up for a new AWS account to serve as the management account
   - Secure the root user with MFA
   - Create an administrative IAM user with appropriate permissions
   - Enable AWS Organizations

2. **Enable AWS Organizations Features**
   - Enable all features (not just consolidated billing)
   - Enable service control policies (SCPs)
   - Enable tag policies
   - Enable backup policies

3. **Create Organizational Units (OUs)**
   - Create "Infrastructure" OU for management, security, and logging accounts
   - Create "Workloads" OU for development, QA, and production accounts

4. **Create Member Accounts**
   - Create security account
   - Create logging account
   - Create development account
   - Create QA account
   - Create production account

5. **Apply Service Control Policies**
   - Create baseline security policies for all accounts
   - Create environment-specific policies (dev, QA, prod)
   - Apply restrictive policies to production account
   - Apply permissive policies to development account

6. **Configure CloudTrail**
   - Enable organization-wide CloudTrail
   - Configure log delivery to logging account
   - Enable log file validation
   - Configure CloudTrail insights

## AWS SSO Implementation

### Configuration Steps

1. **Enable AWS SSO**
   - Navigate to AWS SSO in the management account
   - Enable AWS SSO service
   - Configure AWS SSO directory

2. **Identity Source Configuration**
   - Configure identity provider (IdP)
   - Options:
     - AWS SSO built-in directory
     - External SAML 2.0 provider
     - AWS Managed Microsoft AD
     - AD Connector

3. **Create Permission Sets**
   - **Administrator**: Full administrative access
   - **Developer**: Development permissions
   - **DevOps**: Infrastructure management permissions
   - **ReadOnly**: Read-only access to resources
   - **SecurityAuditor**: Security audit permissions

4. **Assign Users and Groups**
   - Create users and groups in AWS SSO
   - Assign users to appropriate groups
   - Assign permission sets to groups for each account
   - Example assignments:
     - Administrators: Admin access to all accounts
     - Developers: Developer access to dev account, ReadOnly to QA
     - DevOps: DevOps access to all accounts
     - Security team: SecurityAuditor access to all accounts

5. **Configure AWS SSO User Portal**
   - Customize user portal URL
   - Configure session duration
   - Enable MFA for all users

## AWS Budgets and Cost Alerts

### Budget Configuration

1. **Create Organization-wide Budget**
   - Set monthly budget for entire organization
   - Configure alerts at 50%, 80%, and 100% thresholds
   - Send notifications to finance team and administrators

2. **Create Account-specific Budgets**
   - Development account: Set appropriate limits for development resources
   - QA account: Set limits based on testing needs
   - Production account: Set limits based on expected production usage

3. **Create Service-specific Budgets**
   - EC2 and Fargate budget
   - RDS budget
   - S3 and data transfer budget
   - Other service-specific budgets as needed

### Cost Alert Configuration

1. **Configure AWS Cost Anomaly Detection**
   - Enable anomaly detection for all accounts
   - Set appropriate thresholds for alerts
   - Configure notification preferences

2. **Set Up AWS Cost Explorer**
   - Enable Cost Explorer for all accounts
   - Create custom reports for regular review
   - Schedule monthly cost analysis reports

3. **Implement Cost Allocation Tags**
   - Define tagging strategy for resources
   - Activate cost allocation tags
   - Enforce tagging policies through AWS Organizations

4. **Configure AWS Budgets Actions**
   - Set up automated actions for budget thresholds
   - Configure notifications to appropriate teams
   - Implement automated cost control measures where appropriate

## AWS Multi-Account Implementation Checklist

### **1. AWS Organizations Setup**
- [x] Create management account (root user email + strong MFA)
- [x] Enable AWS Organizations with all features
- [x] Create organizational units (e.g., Security, Infrastructure, Environments)
- [x] Create member accounts:
    - [x] Security account
    - [x] Logging account
    - [x] Development account
    - [x] QA account
    - [x] Production account
- [x] Apply service control policies (SCPs) to OUs and accounts

---

### **2. Logging and Monitoring**
- [x] Configure organization-wide AWS CloudTrail:
    - [x] Create centralized S3 bucket in Logging account
    - [x] Enable encryption with AWS KMS key (same region)
    - [x] Apply least-privilege bucket policy
- [x] Enable AWS Config organization-wide

---

### **3. AWS SSO Implementation**
- [x] Enable AWS SSO in the management account
- [x] Configure identity source (Built-in, SAML, or AD)
- [x] Create permission sets:
    - [x] Administrator
    - [x] Developer
    - [x] DevOps
    - [x] ReadOnly
    - [x] SecurityAuditor
- [x] Create users and groups in AWS SSO
- [x] Assign groups to accounts and permission sets
- [x] Configure AWS SSO user portal (custom URL, session duration, MFA)

---

### **4. Cost Management and Budgets**
- [x] Create organization-wide budget (alerts at 50%, 80%, 100%)
- [x] Create account-specific budgets:
    - [x] Development
    - [x] QA
    - [x] Production
- [x] Create service-specific budgets:
    - [x] EC2 / Fargate
    - [x] RDS
    - [x] S3 & Data Transfer
- [x] Configure budget notifications to finance/admin teams

---

### **5. Cost Alert Configuration**
- [x] Enable AWS Cost Anomaly Detection:
    - [x] Create detection monitors for linked accounts and services
    - [x] Set alert thresholds and recipients
- [x] Enable AWS Cost Explorer:
    - [x] Create custom reports
    - [x] Schedule monthly cost analysis reports
- [x] Implement cost allocation tags:
    - [x] Define tagging strategy (Environment, Owner, Project)
    - [x] Create & enforce Tag Policies in AWS Organizations
    - [x] Activate cost allocation tags in Billing console
- [x] Configure budget actions:
    - [x] Set automated notifications
    - [x] Implement automated resource controls where possible

---

### **6. IAM Users for Application Services**

For applications deployed on platforms like Dokploy that don't support IAM roles (unlike EC2/ECS), you need to create IAM users with permanent credentials.

#### Creating Service IAM Users

**Example: S3 Upload Service User**

1. **Create IAM User**
   ```bash
   aws iam create-user --user-name nextstack-saas-starter-s3-uploader --profile jesusidev-DEV
   ```

2. **Create Least-Privilege Policy**
   
   Create policy document (`s3-access-policy.json`):
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Effect": "Allow",
         "Action": [
           "s3:PutObject",
           "s3:GetObject",
           "s3:DeleteObject",
           "s3:ListBucket"
         ],
         "Resource": [
           "arn:aws:s3:::nextstack-saas-starter-dev-assets",
           "arn:aws:s3:::nextstack-saas-starter-dev-assets/*"
         ]
       }
     ]
   }
   ```

3. **Create and Attach Policy**
   ```bash
   # Create policy
   aws iam create-policy \
     --policy-name NextStack SaaS StarterS3Access \
     --policy-document file://s3-access-policy.json \
     --profile jesusidev-DEV
   
   # Attach to user
   aws iam attach-user-policy \
     --user-name nextstack-saas-starter-s3-uploader \
     --policy-arn arn:aws:iam::123456789012:policy/NextStack SaaS StarterS3Access \
     --profile jesusidev-DEV
   ```

4. **Create Access Keys**
   ```bash
   aws iam create-access-key \
     --user-name nextstack-saas-starter-s3-uploader \
     --profile jesusidev-DEV
   ```
   
   **Output:**
   ```json
   {
     "AccessKeyId": "AKIA...",
     "SecretAccessKey": "...",
     "Status": "Active"
   }
   ```

5. **Store Credentials Securely**
   - Add to Dokploy environment variables
   - Add to local `.env` and `.env.local` files
   - **NEVER commit to git**
   - Store backup in password manager

#### Credential Rotation (Every 90 Days)

```bash
# 1. Create new access key
aws iam create-access-key --user-name nextstack-saas-starter-s3-uploader --profile jesusidev-DEV

# 2. Update Dokploy environment variables with new credentials

# 3. Test new credentials work

# 4. Delete old access key
aws iam delete-access-key \
  --user-name nextstack-saas-starter-s3-uploader \
  --access-key-id AKIA_OLD_KEY_ID \
  --profile jesusidev-DEV
```

#### Multi-Environment Setup

For production bucket access, update the policy to include multiple buckets:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::nextstack-saas-starter-dev-assets",
        "arn:aws:s3:::nextstack-saas-starter-dev-assets/*",
        "arn:aws:s3:::nextstack-saas-starter-qa-assets",
        "arn:aws:s3:::nextstack-saas-starter-qa-assets/*",
        "arn:aws:s3:::nextstack-saas-starter-prod-assets",
        "arn:aws:s3:::nextstack-saas-starter-prod-assets/*"
      ]
    }
  ]
}
```

Update the policy:
```bash
# Get current policy version
aws iam get-policy --policy-arn arn:aws:iam::123456789012:policy/NextStack SaaS StarterS3Access --profile jesusidev-DEV

# Create new policy version
aws iam create-policy-version \
  --policy-arn arn:aws:iam::123456789012:policy/NextStack SaaS StarterS3Access \
  --policy-document file://s3-access-policy-multi-env.json \
  --set-as-default \
  --profile jesusidev-DEV
```

#### Security Best Practices

- ✅ **Least Privilege**: Only grant permissions needed for the specific service
- ✅ **Separate Users**: Create different IAM users for different services
- ✅ **Regular Rotation**: Rotate access keys every 90 days
- ✅ **Monitor Usage**: Use CloudTrail to audit API calls
- ✅ **Secure Storage**: Store credentials in Dokploy secrets, never in code
- ✅ **Access Key Limits**: AWS allows max 2 access keys per user (for rotation)

#### Existing Service Users

| IAM User | Purpose | Permissions | Created |
|----------|---------|-------------|---------|
| `nextstack-saas-starter-s3-uploader` | S3 file uploads | S3 read/write/delete on assets buckets | 2025-11-07 |

#### Adding New Service Users

When you need credentials for other services (SES, SQS, etc.):

1. Create user: `nextstack-saas-starter-{service}-{purpose}`
2. Create minimal policy for that service only
3. Attach policy to user
4. Generate access keys
5. Add to Dokploy environment variables
6. Document in table above

---

### **7. Security Hardening**
- [ ] Enable GuardDuty organization-wide
- [ ] Enable Security Hub organization-wide
- [ ] Centralize CloudWatch alarms
- [ ] Apply IAM least-privilege roles

---

### **7. Final Verification**
- [x] Test SSO login for each role
- [x] Validate CloudTrail logs are delivered
- [x] Verify budgets and alerts trigger correctly
- [x] Check tagging compliance in all accounts

This account structure provides a secure, well-organized foundation for the NextStack SaaS Starter application across different environments, with appropriate access controls and cost management.