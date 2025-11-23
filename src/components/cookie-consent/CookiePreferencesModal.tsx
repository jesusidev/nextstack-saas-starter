'use client';

/**
 * Cookie Preferences Modal
 *
 * Detailed modal for managing granular cookie preferences.
 * Allows users to enable/disable individual cookie categories.
 */

import { Carousel } from '@mantine/carousel';
import { Button, Group, Modal, Stack, Switch, Text, Title, Tooltip } from '@mantine/core';
import { IconCheck, IconX } from '@tabler/icons-react';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { useCookieConsent } from '~/hooks/useCookieConsent';
import { COOKIE_INFO } from '~/types/cookieConsent';
import styles from './styles/CookiePreferencesModal.module.css';

interface CookiePreferencesModalProps {
  opened: boolean;
  onClose: () => void;
}

/**
 * Cookie Preferences Modal Component
 *
 * Provides detailed control over cookie preferences.
 * Shows information about each cookie category and allows granular control.
 *
 * Features:
 * - Toggle switches for optional cookies
 * - Necessary cookies shown as disabled (always required)
 * - Detailed information about each cookie category
 * - Save/Cancel actions
 * - Full keyboard accessibility
 *
 * @example
 * ```tsx
 * const [opened, setOpened] = useState(false);
 *
 * <CookiePreferencesModal
 *   opened={opened}
 *   onClose={() => setOpened(false)}
 * />
 * ```
 */
export function CookiePreferencesModal({ opened, onClose }: CookiePreferencesModalProps) {
  const { consent, updatePreferences, acceptAll, rejectOptional } = useCookieConsent();

  // Local state for preferences before saving
  const [analyticsEnabled, setAnalyticsEnabled] = useState(consent?.analytics ?? false);
  const [clarityEnabled, setClarityEnabled] = useState(consent?.clarity ?? false);

  // Sync local state with consent when modal opens or consent changes
  useEffect(() => {
    if (opened) {
      setAnalyticsEnabled(consent?.analytics ?? false);
      setClarityEnabled(consent?.clarity ?? false);
    }
  }, [opened, consent]);

  // Save preferences and close
  const handleSave = () => {
    updatePreferences({
      analytics: analyticsEnabled,
      clarity: clarityEnabled,
    });
    onClose();
  };

  // Accept all and close
  const handleAcceptAll = () => {
    acceptAll();
    onClose();
  };

  // Reject all optional and close
  const handleRejectAll = () => {
    rejectOptional();
    onClose();
  };

  // Render cookie category cards
  const renderNecessaryCard = () => (
    <div className={styles.cookieCategory}>
      <Group justify="space-between" align="flex-start">
        <div style={{ flex: 1 }}>
          <Title order={4} size="h5" mb="xs">
            {COOKIE_INFO.necessary.name}
          </Title>
          <Text size="sm" c="dimmed">
            {COOKIE_INFO.necessary.purpose}
          </Text>
          <Text size="xs" c="dimmed" mt="xs">
            Provider: {COOKIE_INFO.necessary.provider}
          </Text>
        </div>
        <Tooltip
          label="Necessary cookies (always enabled)"
          withArrow
          refProp="rootRef"
          zIndex={1200}
        >
          <Switch
            checked
            disabled
            aria-label="Necessary cookies (always enabled)"
            thumbIcon={<IconCheck size={12} color="var(--mantine-color-teal-6)" stroke={3} />}
          />
        </Tooltip>
      </Group>
    </div>
  );

  const renderAnalyticsCard = () => (
    <div className={styles.cookieCategory}>
      <Group justify="space-between" align="flex-start">
        <div style={{ flex: 1 }}>
          <Title order={4} size="h5" mb="xs">
            {COOKIE_INFO.analytics.name}
          </Title>
          <Text size="sm" c="dimmed">
            {COOKIE_INFO.analytics.purpose}
          </Text>
          <Text size="xs" c="dimmed" mt="xs">
            Provider: {COOKIE_INFO.analytics.provider}
          </Text>
        </div>
        <Switch
          checked={analyticsEnabled}
          onChange={(event) => setAnalyticsEnabled(event.currentTarget.checked)}
          aria-label="Enable Google Analytics"
          thumbIcon={
            analyticsEnabled ? (
              <IconCheck size={12} color="var(--mantine-color-teal-6)" stroke={3} />
            ) : (
              <IconX size={12} color="var(--mantine-color-red-6)" stroke={3} />
            )
          }
        />
      </Group>
    </div>
  );

  const renderClarityCard = () => (
    <div className={styles.cookieCategory}>
      <Group justify="space-between" align="flex-start">
        <div style={{ flex: 1 }}>
          <Title order={4} size="h5" mb="xs">
            {COOKIE_INFO.clarity.name}
          </Title>
          <Text size="sm" c="dimmed">
            {COOKIE_INFO.clarity.purpose}
          </Text>
          <Text size="xs" c="dimmed" mt="xs">
            Provider: {COOKIE_INFO.clarity.provider}
          </Text>
        </div>
        <Switch
          checked={clarityEnabled}
          onChange={(event) => setClarityEnabled(event.currentTarget.checked)}
          aria-label="Enable Microsoft Clarity"
          thumbIcon={
            clarityEnabled ? (
              <IconCheck size={12} color="var(--mantine-color-teal-6)" stroke={3} />
            ) : (
              <IconX size={12} color="var(--mantine-color-red-6)" stroke={3} />
            )
          }
        />
      </Group>
    </div>
  );

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Cookie Preferences"
      size="lg"
      centered
      zIndex={1100}
      overlayProps={{
        opacity: 0.7,
        blur: 8,
      }}
      closeOnClickOutside
      closeOnEscape
      trapFocus
      returnFocus
      transitionProps={{
        transition: 'fade',
        duration: 200,
      }}
    >
      <AnimatePresence>
        {opened && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{
              duration: 0.2,
              ease: [0.4, 0, 0.2, 1],
            }}
          >
            <Stack gap="lg">
              {/* Introduction */}
              <Text size="sm" c="dimmed">
                Manage your cookie preferences below. You can enable or disable optional cookies.
                Necessary cookies cannot be disabled as they are essential for the site to function.
              </Text>

              {/* Mobile: Carousel */}
              <div className={styles.categoriesCarousel}>
                <Carousel
                  slideSize="100%"
                  slideGap="md"
                  withIndicators
                  withControls={false}
                  emblaOptions={{ loop: false }}
                >
                  <Carousel.Slide>{renderNecessaryCard()}</Carousel.Slide>
                  <Carousel.Slide>{renderAnalyticsCard()}</Carousel.Slide>
                  <Carousel.Slide>{renderClarityCard()}</Carousel.Slide>
                </Carousel>
              </div>

              {/* Desktop: Stack */}
              <div className={styles.categoriesStack}>
                {renderNecessaryCard()}
                {renderAnalyticsCard()}
                {renderClarityCard()}
              </div>

              {/* Action Buttons */}
              <div className={styles.buttonGroup}>
                <Button variant="filled" onClick={handleAcceptAll}>
                  Accept All
                </Button>
                <Button variant="filled" onClick={handleSave}>
                  Save Preferences
                </Button>
                <Button variant="subtle" onClick={handleRejectAll}>
                  Reject All
                </Button>
              </div>
            </Stack>
          </motion.div>
        )}
      </AnimatePresence>
    </Modal>
  );
}
