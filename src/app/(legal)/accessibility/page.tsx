import { Anchor, Text, Title } from '@mantine/core';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Web Accessibility | NextStack SaaS Starter',
  description: 'Accessibility commitment and WCAG compliance for NextStack SaaS Starter',
};

/**
 * Web Accessibility Statement Page
 */
export default function AccessibilityPage() {
  return (
    <>
      <Title order={1}>Web Accessibility Statement</Title>

      <Text size="sm" c="dimmed">
        Last Updated:{' '}
        {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
      </Text>

      <Title order={2} mt="xl">
        1. Our Commitment
      </Title>
      <Text>
        NextStack SaaS Starter is committed to ensuring digital accessibility for people with disabilities. We
        continually improve the user experience for everyone and apply relevant accessibility
        standards.
      </Text>

      <Title order={2} mt="xl">
        2. Conformance Status
      </Title>
      <Text>
        We aim to conform to the{' '}
        <Anchor href="https://www.w3.org/WAI/WCAG21/quickref/" target="_blank" rel="noopener">
          Web Content Accessibility Guidelines (WCAG) 2.1
        </Anchor>{' '}
        level AA. These guidelines explain how to make web content more accessible for people with
        disabilities.
      </Text>

      <Title order={2} mt="xl">
        3. Accessibility Features
      </Title>
      <Text>NextStack SaaS Starter includes the following accessibility features:</Text>

      <Title order={3} mt="lg">
        3.1 Keyboard Navigation
      </Title>
      <ul>
        <li>All interactive elements are keyboard accessible</li>
        <li>Logical tab order throughout the application</li>
        <li>Visible focus indicators</li>
        <li>Keyboard shortcuts for common actions</li>
        <li>Skip navigation links</li>
      </ul>

      <Title order={3} mt="lg">
        3.2 Screen Reader Support
      </Title>
      <ul>
        <li>Semantic HTML markup</li>
        <li>ARIA labels and descriptions</li>
        <li>Alternative text for images</li>
        <li>Proper heading hierarchy</li>
        <li>Form labels and error messages</li>
      </ul>

      <Title order={3} mt="lg">
        3.3 Visual Design
      </Title>
      <ul>
        <li>Sufficient color contrast (WCAG AA compliant)</li>
        <li>Resizable text up to 200%</li>
        <li>Information not conveyed by color alone</li>
        <li>Consistent navigation and layout</li>
        <li>Mobile-first responsive design</li>
      </ul>

      <Title order={3} mt="lg">
        3.4 Content
      </Title>
      <ul>
        <li>Clear and simple language</li>
        <li>Descriptive link text</li>
        <li>Meaningful page titles</li>
        <li>Error prevention and clear error messages</li>
      </ul>

      <Title order={2} mt="xl">
        4. Testing & Evaluation
      </Title>
      <Text>We regularly evaluate our accessibility through:</Text>
      <ul>
        <li>Automated accessibility testing tools</li>
        <li>Manual keyboard navigation testing</li>
        <li>Screen reader testing (NVDA, JAWS, VoiceOver)</li>
        <li>Color contrast analysis</li>
        <li>User testing with people with disabilities</li>
      </ul>

      <Title order={2} mt="xl">
        5. Known Limitations
      </Title>
      <Text>
        While we strive for full accessibility, some areas may not yet meet all standards. We are
        actively working to address these issues:
      </Text>
      <ul>
        <li>Some third-party integrations may have limited accessibility</li>
        <li>Legacy features are being updated to meet current standards</li>
        <li>Some complex visualizations may require alternative formats</li>
      </ul>

      <Title order={2} mt="xl">
        6. Assistive Technologies
      </Title>
      <Text>NextStack SaaS Starter is designed to be compatible with:</Text>
      <ul>
        <li>Screen readers (JAWS, NVDA, VoiceOver, TalkBack)</li>
        <li>Speech recognition software</li>
        <li>Screen magnification software</li>
        <li>Alternative input devices</li>
      </ul>

      <Title order={2} mt="xl">
        7. Browser Compatibility
      </Title>
      <Text>NextStack SaaS Starter works with recent versions of major browsers including:</Text>
      <ul>
        <li>Google Chrome</li>
        <li>Mozilla Firefox</li>
        <li>Apple Safari</li>
        <li>Microsoft Edge</li>
      </ul>

      <Title order={2} mt="xl">
        8. Feedback & Assistance
      </Title>
      <Text>
        We welcome your feedback on the accessibility of NextStack SaaS Starter. If you encounter accessibility
        barriers, please let us know:
      </Text>
      <ul>
        <li>
          Email:{' '}
          <Anchor href="mailto:accessibility@nextstack-saas-starter.com">accessibility@nextstack-saas-starter.com</Anchor>
        </li>
        <li>
          Support: <Anchor href="mailto:support@nextstack-saas-starter.com">support@nextstack-saas-starter.com</Anchor>
        </li>
      </ul>
      <Text>
        We aim to respond to accessibility feedback within 2 business days and to propose a solution
        within 10 business days.
      </Text>

      <Title order={2} mt="xl">
        9. Ongoing Improvements
      </Title>
      <Text>Accessibility is an ongoing effort. We regularly:</Text>
      <ul>
        <li>Review and update our accessibility practices</li>
        <li>Provide accessibility training to our team</li>
        <li>Include accessibility in our development process</li>
        <li>Monitor for new accessibility standards and technologies</li>
      </ul>

      <Title order={2} mt="xl">
        10. Third-Party Content
      </Title>
      <Text>
        Some content on NextStack SaaS Starter may be provided by third parties. We encourage our users to
        follow accessibility best practices when contributing content. We provide guidance and tools
        to help ensure user-generated content is accessible.
      </Text>

      <Title order={2} mt="xl">
        11. Contact Information
      </Title>
      <Text>
        For questions about our accessibility efforts or to request accessible formats:{' '}
        <Anchor href="mailto:accessibility@nextstack-saas-starter.com">accessibility@nextstack-saas-starter.com</Anchor>
      </Text>
    </>
  );
}
