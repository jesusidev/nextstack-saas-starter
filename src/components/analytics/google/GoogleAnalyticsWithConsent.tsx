'use client';

/**
 * Google Analytics with Cookie Consent
 *
 * Wrapper for GoogleAnalytics that respects user cookie preferences.
 * Initializes with denied consent and updates based on user choice.
 */

import { useEffect } from 'react';
import { useCookieConsent } from '~/hooks/useCookieConsent';
import { updateGoogleAnalyticsConsent } from '~/utils/consentManager';
import { GoogleAnalytics } from './GoogleAnalytics';

/**
 * GoogleAnalytics component with consent management
 *
 * Features:
 * - Always loads GA script (required for consent mode)
 * - Initializes with consent denied
 * - Updates consent when user preferences change
 * - Implements Google Consent Mode v2
 *
 * @example
 * ```tsx
 * <CookieConsentProvider>
 *   <GoogleAnalyticsWithConsent />
 * </CookieConsentProvider>
 * ```
 */
export function GoogleAnalyticsWithConsent() {
  const { consent } = useCookieConsent();

  // Update GA consent whenever user preferences change
  useEffect(() => {
    if (consent) {
      updateGoogleAnalyticsConsent(consent.analytics);
    }
  }, [consent]);

  // Always render GA with denied consent initially
  // Consent Mode v2 requires script to be loaded
  return <GoogleAnalytics defaultConsent="denied" />;
}
