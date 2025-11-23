'use client';

import { useCallback, useState } from 'react';

/**
 * Type for trigger sources
 */
export type TriggerSource = 'card' | 'favorite' | 'scroll';

/**
 * Return type for useSignUpOverlay hook
 */
interface UseSignUpOverlayReturn {
  /** Whether the overlay is currently opened */
  opened: boolean;
  /** The source that triggered the overlay */
  triggerSource: TriggerSource | null;
  /** Function to show the overlay with a specific trigger source */
  showOverlay: (source: TriggerSource) => void;
  /** Function to close the overlay */
  closeOverlay: () => void;
  /** Whether the overlay has been shown this session */
  hasShownThisSession: boolean;
}

/**
 * Session storage key for tracking scroll trigger display
 */
const SESSION_STORAGE_KEY = 'signup-overlay-scroll-shown';

/**
 * Custom hook for managing sign-up overlay state and session persistence
 *
 * Features:
 * - Manages overlay open/close state
 * - Tracks which trigger source opened the overlay
 * - Uses session storage ONLY for scroll trigger (card/favorite clicks always show)
 * - Provides methods to show and close the overlay
 *
 * @example
 * ```tsx
 * function ProductsPage() {
 *   const { opened, triggerSource, showOverlay, closeOverlay } = useSignUpOverlay();
 *
 *   const handleCardClick = () => {
 *     showOverlay('card'); // Always shows
 *   };
 *
 *   return (
 *     <>
 *       <button onClick={handleCardClick}>View Product</button>
 *       <SignUpOverlay
 *         opened={opened}
 *         onClose={closeOverlay}
 *         triggerSource={triggerSource}
 *       />
 *     </>
 *   );
 * }
 * ```
 */
export function useSignUpOverlay(): UseSignUpOverlayReturn {
  // Check if scroll trigger was already shown this session
  const [scrollTriggerShown, setScrollTriggerShown] = useState(() => {
    if (typeof window === 'undefined') {
      return false;
    }
    return sessionStorage.getItem(SESSION_STORAGE_KEY) === 'true';
  });

  const [opened, setOpened] = useState(false);
  const [triggerSource, setTriggerSource] = useState<TriggerSource | null>(null);

  /**
   * Show the overlay with the specified trigger source
   * Only scroll_trigger respects session storage - card/favorite clicks always show
   */
  const showOverlay = useCallback(
    (source: TriggerSource) => {
      // Only prevent scroll trigger if already shown this session
      // Card clicks and favorite clicks should always show the overlay
      if (source === 'scroll' && scrollTriggerShown) {
        return;
      }

      setTriggerSource(source);
      setOpened(true);
    },
    [scrollTriggerShown]
  );

  /**
   * Close the overlay and mark scroll trigger as shown in session storage
   */
  const closeOverlay = useCallback(() => {
    setOpened(false);

    // Only persist to session storage if it was a scroll trigger
    if (triggerSource === 'scroll') {
      setScrollTriggerShown(true);
      if (typeof window !== 'undefined') {
        sessionStorage.setItem(SESSION_STORAGE_KEY, 'true');
      }
    }
  }, [triggerSource]);

  return {
    opened,
    triggerSource,
    showOverlay,
    closeOverlay,
    hasShownThisSession: scrollTriggerShown,
  };
}
