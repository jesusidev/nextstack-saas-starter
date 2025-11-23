'use client';

import { useCallback, useEffect, useState } from 'react';

/**
 * Options for the useScrollDepth hook
 */
interface UseScrollDepthOptions {
  /** Scroll depth percentage threshold (0-100) */
  threshold: number;
  /** Callback function triggered when threshold is reached */
  onThresholdReached: () => void;
  /** Session storage key to track if threshold was already reached */
  sessionKey?: string;
  /** Whether the hook is enabled (default: true) */
  enabled?: boolean;
}

/**
 * Return value of the useScrollDepth hook
 */
interface UseScrollDepthReturn {
  /** Current scroll depth as a percentage (0-100) */
  scrollDepth: number;
  /** Whether the threshold has been reached */
  hasReachedThreshold: boolean;
}

/**
 * Custom hook that tracks scroll depth and triggers a callback when a threshold is reached.
 *
 * Features:
 * - Calculates scroll depth as a percentage (0-100%)
 * - Triggers callback once when threshold is reached
 * - Uses session storage to prevent repeated triggers
 * - Cleans up event listeners on unmount
 * - Can be disabled via `enabled` flag
 *
 * @example
 * ```tsx
 * const { scrollDepth, hasReachedThreshold } = useScrollDepth({
 *   threshold: 40,
 *   onThresholdReached: () => {
 *     console.log('User scrolled to 40%!');
 *     showSignUpOverlay();
 *   },
 *   sessionKey: 'signup-overlay-scroll-triggered',
 *   enabled: !isAuthenticated,
 * });
 * ```
 */
export function useScrollDepth({
  threshold,
  onThresholdReached,
  sessionKey = 'scroll-depth-threshold-reached',
  enabled = true,
}: UseScrollDepthOptions): UseScrollDepthReturn {
  const [scrollDepth, setScrollDepth] = useState(0);
  const [hasReachedThreshold, setHasReachedThreshold] = useState(() => {
    // Check session storage on initialization
    if (typeof window === 'undefined') {
      return false;
    }
    return sessionStorage.getItem(sessionKey) === 'true';
  });

  const handleScroll = useCallback(() => {
    if (!enabled || hasReachedThreshold) {
      return;
    }

    // Calculate scroll depth percentage
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight;
    const winHeight = window.innerHeight;
    const scrollableHeight = docHeight - winHeight;

    // Prevent division by zero
    if (scrollableHeight <= 0) {
      setScrollDepth(0);
      return;
    }

    const currentDepth = (scrollTop / scrollableHeight) * 100;
    setScrollDepth(currentDepth);

    // Check if threshold is reached
    if (currentDepth >= threshold) {
      setHasReachedThreshold(true);
      sessionStorage.setItem(sessionKey, 'true');
      onThresholdReached();
    }
  }, [enabled, hasReachedThreshold, threshold, sessionKey, onThresholdReached]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    // Initial scroll position check
    handleScroll();

    // Add scroll event listener
    window.addEventListener('scroll', handleScroll, { passive: true });

    // Cleanup
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [enabled, handleScroll]);

  return {
    scrollDepth,
    hasReachedThreshold,
  };
}
