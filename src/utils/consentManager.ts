/**
 * Consent Manager
 *
 * Orchestrates consent updates across Google Analytics and Microsoft Clarity
 * when user cookie preferences change.
 */

import type { CookieConsent } from '~/types/cookieConsent';

/**
 * Update Google Analytics consent state
 * Uses Google Consent Mode v2 API
 *
 * @param granted - Whether analytics consent is granted
 * @see https://developers.google.com/tag-platform/security/guides/consent
 */
export function updateGoogleAnalyticsConsent(granted: boolean): void {
  if (typeof window === 'undefined' || !window.gtag) {
    return;
  }

  try {
    window.gtag('consent', 'update', {
      analytics_storage: granted ? 'granted' : 'denied',
      ad_storage: 'denied', // We don't use advertising
      ad_user_data: 'denied',
      ad_personalization: 'denied',
    });

    // Send consent event for analytics tracking
    if (granted) {
      window.gtag('event', 'cookie_consent_granted', {
        event_category: 'consent',
        event_label: 'analytics',
        value: 1,
      });
    }
  } catch (error) {
    console.error('Error updating Google Analytics consent:', error);
  }
}

/**
 * Update Microsoft Clarity consent state
 * Uses Clarity consent API
 *
 * @param granted - Whether Clarity consent is granted
 * @see https://learn.microsoft.com/en-us/clarity/setup-and-installation/clarity-api
 */
export function updateMicrosoftClarityConsent(granted: boolean): void {
  if (typeof window === 'undefined' || !window.clarity) {
    return;
  }

  try {
    window.clarity('consent', granted);
  } catch (error) {
    console.error('Error updating Microsoft Clarity consent:', error);
  }
}

/**
 * Update all analytics consent states based on cookie preferences
 * Call this whenever consent preferences change
 *
 * @param consent - Complete consent object with all preferences
 */
export function updateAllConsents(consent: CookieConsent): void {
  updateGoogleAnalyticsConsent(consent.analytics);
  updateMicrosoftClarityConsent(consent.clarity);
}

/**
 * Initialize consent to denied state
 * Call this on app initialization before user has given consent
 * Sets up Google Consent Mode v2 with denied defaults
 */
export function initializeConsentDenied(): void {
  updateGoogleAnalyticsConsent(false);
  updateMicrosoftClarityConsent(false);
}

/**
 * Grant all optional consents
 * Helper for "Accept All" button
 */
export function grantAllConsents(): void {
  updateGoogleAnalyticsConsent(true);
  updateMicrosoftClarityConsent(true);
}

/**
 * Deny all optional consents
 * Helper for "Reject All" button
 */
export function denyAllConsents(): void {
  updateGoogleAnalyticsConsent(false);
  updateMicrosoftClarityConsent(false);
}

/**
 * Apply stored consent preferences to analytics services
 * Used when loading stored consent from localStorage
 *
 * @param consent - Stored consent object to apply
 */
export function applyStoredConsent(consent: CookieConsent | null): void {
  if (!consent) {
    // No stored consent, initialize with denied
    initializeConsentDenied();
    return;
  }

  // Apply stored preferences
  updateAllConsents(consent);
}
