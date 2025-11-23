'use client';

/**
 * Cookie Preferences Floating Button
 *
 * A floating action button that allows users to access cookie preferences at any time.
 * Positioned in the bottom-right corner with smooth animations.
 */

import { ActionIcon, Tooltip } from '@mantine/core';
import { IconCookie } from '@tabler/icons-react';
import { AnimatePresence, motion } from 'motion/react';
import { useState } from 'react';
import { useCookieConsent } from '~/hooks/useCookieConsent';
import { CookiePreferencesModal } from './CookiePreferencesModal';
import styles from './styles/CookiePreferencesButton.module.css';

/**
 * Cookie Preferences Button Component
 *
 * Displays a floating action button (FAB) that opens the cookie preferences modal.
 * Only shows after user has provided initial consent.
 *
 * Features:
 * - Fixed positioning in bottom-right corner
 * - Fade-in animation on mount
 * - Hover effects with scale animation
 * - Full keyboard accessibility
 * - Tooltip for clarity
 * - High z-index to stay above most content
 *
 * @example
 * ```tsx
 * <CookieConsentProvider>
 *   <CookiePreferencesButton />
 *   <App />
 * </CookieConsentProvider>
 * ```
 */
export function CookiePreferencesButton() {
  const { hasConsent, isLoading } = useCookieConsent();
  const [preferencesOpen, setPreferencesOpen] = useState(false);

  // Only show button after user has provided initial consent
  if (isLoading || !hasConsent) {
    return null;
  }

  return (
    <>
      <AnimatePresence>
        <motion.div
          className={styles.buttonWrapper}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{
            duration: 0.3,
            ease: [0.4, 0, 0.2, 1],
          }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <Tooltip label="Cookie Preferences" position="left" withArrow zIndex={1300} offset={12}>
            <ActionIcon
              size="xl"
              radius="xl"
              variant="filled"
              color="blue"
              onClick={() => setPreferencesOpen(true)}
              aria-label="Open cookie preferences"
              className={styles.button}
            >
              <IconCookie size={24} stroke={1.5} />
            </ActionIcon>
          </Tooltip>
        </motion.div>
      </AnimatePresence>

      {/* Preferences Modal */}
      <CookiePreferencesModal opened={preferencesOpen} onClose={() => setPreferencesOpen(false)} />
    </>
  );
}
