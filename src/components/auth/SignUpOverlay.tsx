'use client';

import { Button, Modal, Stack, Text, Title } from '@mantine/core';
import { AnimatePresence, motion } from 'motion/react';
import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { useAnalytics } from '~/hooks/analytics/useAnalytics';

/**
 * Props for the SignUpOverlay component
 */
interface SignUpOverlayProps {
  /** Whether the overlay is visible */
  opened: boolean;
  /** Callback when overlay is closed */
  onClose: () => void;
  /** Source that triggered the overlay */
  triggerSource: 'card' | 'favorite' | 'scroll';
  /** Optional custom title */
  title?: string;
  /** Optional custom description */
  description?: string;
}

/**
 * Get messaging based on trigger source
 */
function getOverlayContent(triggerSource: SignUpOverlayProps['triggerSource']) {
  switch (triggerSource) {
    case 'card':
      return {
        title: 'Sign in to view full product details',
        description:
          'Create a free account to explore product details, save favorites, and manage your inventory.',
      };
    case 'favorite':
      return {
        title: 'Sign in to save your favorite products',
        description:
          'Join thousands of users discovering and organizing amazing products. Get started for free!',
      };
    case 'scroll':
      return {
        title: 'Join thousands of users discovering amazing products',
        description:
          'Create your free account to unlock full access, save favorites, and organize your product collection.',
      };
  }
}

/**
 * SignUpOverlay Component
 *
 * Modal overlay that prompts unauthenticated users to sign up or sign in.
 * Features:
 * - Integrates with Clerk for authentication
 * - Framer Motion animations for smooth appearance
 * - Context-aware messaging based on trigger source
 * - Analytics tracking for conversion funnel
 * - Responsive design with backdrop blur
 *
 * @example
 * ```tsx
 * const { opened, triggerSource, closeOverlay } = useSignUpOverlay();
 *
 * <SignUpOverlay
 *   opened={opened}
 *   onClose={closeOverlay}
 *   triggerSource={triggerSource}
 * />
 * ```
 */
export function SignUpOverlay({
  opened,
  onClose,
  triggerSource,
  title: customTitle,
  description: customDescription,
}: SignUpOverlayProps) {
  const analytics = useAnalytics();
  const router = useRouter();
  const content = getOverlayContent(triggerSource);
  const returnFocusRef = useRef<HTMLElement | null>(null);

  // Focus management: store active element when opened, restore when closed
  useEffect(() => {
    if (opened) {
      // Store the currently focused element to restore focus later
      returnFocusRef.current = document.activeElement as HTMLElement;

      analytics.track({
        event: 'conversion:overlay-shown',
        properties: {
          triggerSource,
        },
      });
    } else if (returnFocusRef.current) {
      // Restore focus to the element that triggered the overlay
      returnFocusRef.current.focus();
      returnFocusRef.current = null;
    }
  }, [opened, triggerSource, analytics]);

  // Handle close with analytics tracking
  const handleClose = () => {
    analytics.track({
      event: 'conversion:overlay-dismissed',
      properties: {
        triggerSource,
      },
    });
    onClose();
  };

  // Handle Sign Up button click
  const handleSignUpClick = () => {
    analytics.track({
      event: 'conversion:signup-clicked',
      properties: {
        triggerSource,
      },
    });
    router.push('/sign-up');
  };

  // Handle Sign In button click
  const handleSignInClick = () => {
    analytics.track({
      event: 'conversion:signin-clicked',
      properties: {
        triggerSource,
      },
    });
    router.push('/sign-in');
  };

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      size="lg"
      centered
      overlayProps={{
        opacity: 0.7,
        blur: 8,
      }}
      closeOnClickOutside
      closeOnEscape
      withCloseButton
      padding="xl"
      radius="md"
      trapFocus
      returnFocus
      transitionProps={{
        transition: 'fade',
        duration: 200,
      }}
      data-testid="signup-overlay"
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
              {/* Header with context-aware messaging */}
              <Stack gap="xs">
                <Title order={2} size="h3">
                  {customTitle || content.title}
                </Title>
                <Text size="sm" c="dimmed">
                  {customDescription || content.description}
                </Text>
              </Stack>

              {/* Action Buttons */}
              <Stack gap="md">
                <Button size="lg" fullWidth onClick={handleSignUpClick} data-testid="signup-button">
                  Sign Up - It's Free
                </Button>

                <Button
                  size="lg"
                  fullWidth
                  variant="outline"
                  onClick={handleSignInClick}
                  data-testid="signin-button"
                >
                  Sign In
                </Button>
              </Stack>

              {/* Additional messaging */}
              <Text size="xs" c="dimmed" ta="center">
                No credit card required • Free forever • Takes 30 seconds
              </Text>
            </Stack>
          </motion.div>
        )}
      </AnimatePresence>
    </Modal>
  );
}
