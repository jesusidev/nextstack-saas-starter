'use client';

/**
 * Cookie Consent Banner
 *
 * Fixed bottom banner for cookie consent with accept/reject actions.
 * Based on Mantine UI CookiesBanner pattern with full accessibility.
 */

import { Anchor, Button, CloseButton, Group, Paper, Text } from '@mantine/core';
import { AnimatePresence, motion } from 'motion/react';
import { useId, useState } from 'react';
import { useCookieConsent } from '~/hooks/useCookieConsent';
import { CookiePreferencesModal } from './CookiePreferencesModal';
import styles from './styles/CookieConsentBanner.module.css';

/**
 * Cookie Consent Banner Component
 *
 * Displays fixed bottom banner when user has not provided consent.
 * Provides quick actions to accept all, reject optional, or manage preferences.
 *
 * Features:
 * - Fixed positioning at bottom with full width
 * - Slide-up animation on mount
 * - Responsive button layout (stacked on mobile, horizontal on desktop)
 * - Full keyboard accessibility
 * - ARIA labels and roles
 *
 * @example
 * ```tsx
 * <CookieConsentProvider>
 *   <CookieConsentBanner />
 *   <App />
 * </CookieConsentProvider>
 * ```
 */
export function CookieConsentBanner() {
  const { hasConsent, isLoading, acceptAll, rejectOptional } = useCookieConsent();
  const [preferencesOpen, setPreferencesOpen] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const titleId = useId();
  const descriptionId = useId();

  // Don't show banner if loading, has consent, or user dismissed
  if (isLoading || hasConsent || dismissed) {
    return null;
  }

  const handleAcceptAll = () => {
    acceptAll();
  };

  const handleRejectOptional = () => {
    rejectOptional();
  };

  const handleDismiss = () => {
    setDismissed(true);
  };

  return (
    <>
      <AnimatePresence>
        <motion.div
          className={styles.bannerWrapper}
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{
            duration: 0.3,
            ease: [0.4, 0, 0.2, 1],
          }}
          role="dialog"
          aria-labelledby={titleId}
          aria-describedby={descriptionId}
        >
          <Paper
            className={styles.banner}
            withBorder
            shadow="md"
            radius="md"
            p={{ base: 'md', sm: 'lg' }}
          >
            <Group justify="space-between" align="flex-start" mb="xs">
              <Text id={titleId} size="md" fw={500}>
                Cookie Preferences
              </Text>
              <CloseButton onClick={handleDismiss} aria-label="Dismiss cookie banner" size="sm" />
            </Group>

            <Text id={descriptionId} size="sm" c="dimmed" mb="md">
              We use cookies to enhance your browsing experience and analyze our traffic. Optional
              cookies (Google Analytics, Microsoft Clarity) help us improve our services. Essential
              cookies are required for authentication.{' '}
              <Anchor href="/privacy" size="sm">
                Privacy Policy
              </Anchor>
            </Text>

            {/* Button group - responsive layout via CSS */}
            <div className={styles.buttonGroup}>
              <Button variant="filled" size="sm" onClick={handleAcceptAll}>
                Accept All
              </Button>
              <Button variant="default" size="sm" onClick={() => setPreferencesOpen(true)}>
                Manage Preferences
              </Button>
              <Button variant="subtle" size="sm" onClick={handleRejectOptional}>
                Reject Optional
              </Button>
            </div>
          </Paper>
        </motion.div>
      </AnimatePresence>

      {/* Preferences Modal */}
      <CookiePreferencesModal opened={preferencesOpen} onClose={() => setPreferencesOpen(false)} />
    </>
  );
}
