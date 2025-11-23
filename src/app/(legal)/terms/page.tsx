import { Anchor, Text, Title } from '@mantine/core';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Use | NextStack SaaS Starter',
  description: 'Terms of Use and Service Agreement for NextStack SaaS Starter',
};

/**
 * Terms of Use Page
 *
 * Legal terms and conditions for using NextStack SaaS Starter.
 */
export default function TermsPage() {
  return (
    <>
      <Title order={1}>Terms of Use</Title>

      <Text size="sm" c="dimmed">
        Last Updated:{' '}
        {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
      </Text>

      <Title order={2} mt="xl">
        1. Acceptance of Terms
      </Title>
      <Text>
        By accessing and using NextStack SaaS Starter ("the Service"), you accept and agree to be bound by the
        terms and provision of this agreement. If you do not agree to these terms, please do not use
        the Service.
      </Text>

      <Title order={2} mt="xl">
        2. Use License
      </Title>
      <Text>
        Permission is granted to temporarily access the materials on NextStack SaaS Starter for personal,
        non-commercial transitory viewing only. This is the grant of a license, not a transfer of
        title, and under this license you may not:
      </Text>
      <ul style={{ marginBottom: '1rem' }}>
        <li>Modify or copy the materials</li>
        <li>Use the materials for any commercial purpose or public display</li>
        <li>Attempt to reverse engineer any software contained on NextStack SaaS Starter</li>
        <li>Remove any copyright or other proprietary notations from the materials</li>
        <li>
          Transfer the materials to another person or "mirror" the materials on any other server
        </li>
      </ul>

      <Title order={2} mt="xl">
        3. User Accounts
      </Title>
      <Text>
        To access certain features of the Service, you may be required to create an account. You are
        responsible for:
      </Text>
      <ul style={{ marginBottom: '1rem' }}>
        <li>Maintaining the confidentiality of your account credentials</li>
        <li>All activities that occur under your account</li>
        <li>Notifying us immediately of any unauthorized use</li>
      </ul>

      <Title order={2} mt="xl">
        4. Acceptable Use
      </Title>
      <Text>You agree not to use the Service to:</Text>
      <ul style={{ marginBottom: '1rem' }}>
        <li>Violate any applicable laws or regulations</li>
        <li>Infringe upon the rights of others</li>
        <li>Transmit harmful code, viruses, or malware</li>
        <li>Engage in any fraudulent activity</li>
        <li>Harass, abuse, or harm other users</li>
      </ul>

      <Title order={2} mt="xl">
        5. Intellectual Property
      </Title>
      <Text>
        The Service and its original content, features, and functionality are owned by NextStack SaaS Starter
        and are protected by international copyright, trademark, patent, trade secret, and other
        intellectual property laws.
      </Text>

      <Title order={2} mt="xl">
        6. Disclaimer
      </Title>
      <Text>
        The materials on NextStack SaaS Starter are provided on an 'as is' basis. NextStack SaaS Starter makes no
        warranties, expressed or implied, and hereby disclaims and negates all other warranties
        including, without limitation, implied warranties or conditions of merchantability, fitness
        for a particular purpose, or non-infringement of intellectual property or other violation of
        rights.
      </Text>

      <Title order={2} mt="xl">
        7. Limitations
      </Title>
      <Text>
        In no event shall NextStack SaaS Starter or its suppliers be liable for any damages (including, without
        limitation, damages for loss of data or profit, or due to business interruption) arising out
        of the use or inability to use NextStack SaaS Starter, even if NextStack SaaS Starter or an authorized
        representative has been notified orally or in writing of the possibility of such damage.
      </Text>

      <Title order={2} mt="xl">
        8. Modifications to Terms
      </Title>
      <Text>
        NextStack SaaS Starter may revise these terms of service at any time without notice. By using this
        Service, you are agreeing to be bound by the current version of these terms of service.
      </Text>

      <Title order={2} mt="xl">
        9. Contact Information
      </Title>
      <Text>
        If you have any questions about these Terms, please contact us at:{' '}
        <Anchor href="mailto:support@nextstack-saas-starter.com">support@nextstack-saas-starter.com</Anchor>
      </Text>
    </>
  );
}
