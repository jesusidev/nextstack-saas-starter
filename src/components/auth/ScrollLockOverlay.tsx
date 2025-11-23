'use client';

import { Text } from '@mantine/core';
import { motion } from 'motion/react';
import classes from './styles/ScrollLockOverlay.module.css';

/**
 * Props for ScrollLockOverlay component
 */
interface ScrollLockOverlayProps {
  /** Whether the overlay is visible */
  visible: boolean;
}

/**
 * ScrollLockOverlay Component
 *
 * Displays a gradient shadow overlay at the bottom of the page when
 * unauthenticated users reach the scroll threshold, with an animated
 * "Sign up to continue" indicator to encourage conversion.
 *
 * Features:
 * - Gradient shadow effect (transparent to solid)
 * - Animated scroll indicator (bouncing arrow)
 * - Prevents further scrolling
 * - Smooth fade-in animation
 *
 * @example
 * ```tsx
 * <ScrollLockOverlay visible={hasReachedScrollThreshold} />
 * ```
 */
export function ScrollLockOverlay({ visible }: ScrollLockOverlayProps) {
  if (!visible) {
    return null;
  }

  return (
    <motion.div
      className={classes.overlay}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <motion.div
        className={classes.indicator}
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut' }}
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
          className={classes.arrow}
        >
          <path d="M12 4l-8 8h16l-8-8z" />
        </svg>
        <Text size="sm" fw={600} className={classes.text}>
          Sign up to continue
        </Text>
      </motion.div>
    </motion.div>
  );
}
