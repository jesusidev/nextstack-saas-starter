import { Anchor, Text, Title } from '@mantine/core';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Security Policy | NextStack SaaS Starter',
  description: 'Security practices and vulnerability reporting for NextStack SaaS Starter',
};

/**
 * Security Policy Page
 */
export default function SecurityPage() {
  return (
    <>
      <Title order={1}>Security Policy</Title>

      <Text size="sm" c="dimmed">
        Last Updated:{' '}
        {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
      </Text>

      <Title order={2} mt="xl">
        1. Our Commitment to Security
      </Title>
      <Text>
        At NextStack SaaS Starter, we take the security of your data seriously. We implement industry-standard
        security measures to protect your information and maintain the integrity of our Service.
      </Text>

      <Title order={2} mt="xl">
        2. Security Measures
      </Title>
      <Text>We employ multiple layers of security protection:</Text>

      <Title order={3} mt="lg">
        2.1 Authentication & Access Control
      </Title>
      <ul style={{ marginBottom: '1rem' }}>
        <li>Clerk authentication with industry-standard encryption</li>
        <li>Secure session management</li>
        <li>Role-based access control (RBAC)</li>
        <li>Multi-factor authentication support</li>
      </ul>

      <Title order={3} mt="lg">
        2.2 Data Protection
      </Title>
      <ul style={{ marginBottom: '1rem' }}>
        <li>Encryption in transit (TLS/HTTPS)</li>
        <li>Encryption at rest for sensitive data</li>
        <li>Regular database backups</li>
        <li>Secure file storage with AWS S3</li>
      </ul>

      <Title order={3} mt="lg">
        2.3 Infrastructure Security
      </Title>
      <ul style={{ marginBottom: '1rem' }}>
        <li>Regular security updates and patches</li>
        <li>Firewall protection and network security</li>
        <li>DDoS protection</li>
        <li>Automated security scanning</li>
        <li>Rate limiting to prevent abuse</li>
      </ul>

      <Title order={2} mt="xl">
        3. Vulnerability Reporting
      </Title>
      <Text>
        We appreciate the security research community's efforts in keeping our users safe. If you
        discover a security vulnerability, please report it responsibly.
      </Text>

      <Title order={3} mt="lg">
        3.1 How to Report
      </Title>
      <Text>
        Send vulnerability reports to:{' '}
        <Anchor href="mailto:security@nextstack-saas-starter.com">security@nextstack-saas-starter.com</Anchor>
      </Text>
      <Text>Please include:</Text>
      <ul style={{ marginBottom: '1rem' }}>
        <li>Description of the vulnerability</li>
        <li>Steps to reproduce</li>
        <li>Potential impact</li>
        <li>Your contact information</li>
      </ul>

      <Title order={3} mt="lg">
        3.2 What to Expect
      </Title>
      <ul style={{ marginBottom: '1rem' }}>
        <li>We will acknowledge your report within 48 hours</li>
        <li>We will investigate and respond with our findings</li>
        <li>We will work to remediate valid vulnerabilities promptly</li>
        <li>We will keep you informed throughout the process</li>
      </ul>

      <Title order={3} mt="lg">
        3.3 Responsible Disclosure Guidelines
      </Title>
      <Text>We ask that you:</Text>
      <ul style={{ marginBottom: '1rem' }}>
        <li>Do not access or modify user data without permission</li>
        <li>Do not perform destructive testing (DoS, spam, etc.)</li>
        <li>Do not publicly disclose the issue before we have addressed it</li>
        <li>Make a good faith effort to avoid privacy violations</li>
      </ul>

      <Title order={2} mt="xl">
        4. Compliance & Certifications
      </Title>
      <Text>We comply with relevant data protection regulations and industry standards:</Text>
      <ul style={{ marginBottom: '1rem' }}>
        <li>GDPR (General Data Protection Regulation)</li>
        <li>CCPA (California Consumer Privacy Act)</li>
        <li>SOC 2 Type II compliance (in progress)</li>
      </ul>

      <Title order={2} mt="xl">
        5. Incident Response
      </Title>
      <Text>In the event of a security incident, we have established procedures to:</Text>
      <ul style={{ marginBottom: '1rem' }}>
        <li>Quickly identify and contain the incident</li>
        <li>Assess the impact and affected users</li>
        <li>Notify affected users as required by law</li>
        <li>Implement measures to prevent recurrence</li>
      </ul>

      <Title order={2} mt="xl">
        6. User Responsibilities
      </Title>
      <Text>Help us keep your account secure by:</Text>
      <ul style={{ marginBottom: '1rem' }}>
        <li>Using a strong, unique password</li>
        <li>Enabling multi-factor authentication</li>
        <li>Not sharing your account credentials</li>
        <li>Reporting suspicious activity immediately</li>
        <li>Keeping your contact information up-to-date</li>
      </ul>

      <Title order={2} mt="xl">
        7. Third-Party Services
      </Title>
      <Text>We use trusted third-party services that maintain their own security standards:</Text>
      <ul style={{ marginBottom: '1rem' }}>
        <li>
          <strong>Clerk:</strong> SOC 2 Type II certified authentication
        </li>
        <li>
          <strong>AWS:</strong> ISO 27001, SOC 1/2/3 certified infrastructure
        </li>
        <li>
          <strong>Vercel:</strong> Enterprise-grade hosting platform
        </li>
      </ul>

      <Title order={2} mt="xl">
        8. Contact Us
      </Title>
      <Text>
        For security-related questions or concerns:{' '}
        <Anchor href="mailto:security@nextstack-saas-starter.com">security@nextstack-saas-starter.com</Anchor>
      </Text>
      <Text>
        For general inquiries:{' '}
        <Anchor href="mailto:support@nextstack-saas-starter.com">support@nextstack-saas-starter.com</Anchor>
      </Text>
    </>
  );
}
