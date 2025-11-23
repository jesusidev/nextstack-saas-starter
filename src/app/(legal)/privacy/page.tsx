import { Anchor, Text, Title } from '@mantine/core';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | NextStack SaaS Starter',
  description: 'Privacy Policy and data handling practices for NextStack SaaS Starter',
};

/**
 * Privacy Policy Page
 */
export default function PrivacyPage() {
  return (
    <>
      <Title order={1}>Privacy Policy</Title>

      <Text size="sm" c="dimmed">
        Last Updated:{' '}
        {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
      </Text>

      <Title order={2} mt="xl">
        1. Information We Collect
      </Title>
      <Text>We collect information that you provide directly to us, including:</Text>
      <ul style={{ marginBottom: '1rem' }}>
        <li>Account information (name, email address)</li>
        <li>Profile information</li>
        <li>User-generated content (products, projects, categories)</li>
        <li>Communication preferences</li>
      </ul>

      <Title order={3} mt="lg">
        1.1 Automatically Collected Information
      </Title>
      <Text>
        When you use our Service, we automatically collect certain information about your device and
        usage:
      </Text>
      <ul style={{ marginBottom: '1rem' }}>
        <li>Log data (IP address, browser type, pages visited)</li>
        <li>Device information (device type, operating system)</li>
        <li>Usage data (features used, time spent)</li>
      </ul>

      <Title order={2} mt="xl">
        2. How We Use Your Information
      </Title>
      <Text>We use the information we collect to:</Text>
      <ul style={{ marginBottom: '1rem' }}>
        <li>Provide, maintain, and improve our Service</li>
        <li>Process your transactions and manage your account</li>
        <li>Send you technical notices and support messages</li>
        <li>Respond to your comments and questions</li>
        <li>Analyze usage patterns and improve user experience</li>
        <li>Detect and prevent fraud and abuse</li>
      </ul>

      <Title order={2} mt="xl">
        3. Cookies and Tracking
      </Title>
      <Text>
        We use cookies and similar tracking technologies to collect and track information about your
        activities on our Service. You can control cookie preferences through our cookie consent
        banner.
      </Text>

      <Title order={3} mt="lg">
        3.1 Essential Cookies
      </Title>
      <Text>
        These cookies are necessary for authentication and core functionality. They cannot be
        disabled:
      </Text>
      <ul style={{ marginBottom: '1rem' }}>
        <li>
          <strong>Clerk Authentication:</strong> Session management and user authentication
        </li>
      </ul>

      <Title order={3} mt="lg">
        3.2 Optional Analytics Cookies
      </Title>
      <Text>
        These cookies help us understand how visitors interact with our Service. You can opt-out via
        cookie preferences:
      </Text>
      <ul style={{ marginBottom: '1rem' }}>
        <li>
          <strong>Google Analytics:</strong> Usage statistics and performance metrics
        </li>
        <li>
          <strong>Microsoft Clarity:</strong> User behavior analytics and heatmaps
        </li>
      </ul>

      <Title order={2} mt="xl">
        4. Information Sharing
      </Title>
      <Text>
        We do not sell your personal information. We may share your information in the following
        circumstances:
      </Text>
      <ul style={{ marginBottom: '1rem' }}>
        <li>
          <strong>Service Providers:</strong> Third parties who perform services on our behalf
          (Clerk for authentication, Google Analytics, Microsoft Clarity)
        </li>
        <li>
          <strong>Legal Requirements:</strong> When required by law or to protect our rights
        </li>
        <li>
          <strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of
          assets
        </li>
      </ul>

      <Title order={2} mt="xl">
        5. Data Security
      </Title>
      <Text>
        We implement appropriate technical and organizational measures to protect your personal
        information. However, no method of transmission over the Internet is 100% secure.
      </Text>

      <Title order={2} mt="xl">
        6. Your Rights
      </Title>
      <Text>You have the right to:</Text>
      <ul style={{ marginBottom: '1rem' }}>
        <li>Access your personal information</li>
        <li>Correct inaccurate information</li>
        <li>Request deletion of your information</li>
        <li>Object to processing of your information</li>
        <li>Export your data</li>
        <li>Withdraw consent for optional cookies</li>
      </ul>

      <Title order={2} mt="xl">
        7. Children's Privacy
      </Title>
      <Text>
        Our Service is not intended for children under 13. We do not knowingly collect personal
        information from children under 13.
      </Text>

      <Title order={2} mt="xl">
        8. Changes to This Policy
      </Title>
      <Text>
        We may update this Privacy Policy from time to time. We will notify you of any changes by
        posting the new Privacy Policy on this page and updating the "Last Updated" date.
      </Text>

      <Title order={2} mt="xl">
        9. Contact Us
      </Title>
      <Text>
        If you have questions about this Privacy Policy, please contact us at:{' '}
        <Anchor href="mailto:privacy@nextstack-saas-starter.com">privacy@nextstack-saas-starter.com</Anchor>
      </Text>
    </>
  );
}
