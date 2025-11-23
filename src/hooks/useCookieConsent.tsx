'use client';

/**
 * Cookie Consent Hook
 *
 * Custom hook to access cookie consent context and check consent status.
 * Must be used within CookieConsentProvider.
 */

import { useContext, useMemo } from 'react';
import { CookieConsentContext } from '~/components/cookie-consent/CookieConsentProvider';
import type { CookieConsentContextValue } from '~/types/cookieConsent';

/**
 * Extended context value with helper properties
 */
export interface UseCookieConsentReturn extends CookieConsentContextValue {
  /** Whether Google Analytics consent is granted */
  hasAnalyticsConsent: boolean;
  /** Whether Microsoft Clarity consent is granted */
  hasClarityConsent: boolean;
  /** Whether any optional cookies are enabled */
  hasAnyOptionalConsent: boolean;
}

/**
 * Hook to access cookie consent context
 * Must be used within CookieConsentProvider
 *
 * @throws Error if used outside CookieConsentProvider
 * @returns Cookie consent state and actions with helper properties
 *
 * @example
 * ```tsx
 * function AnalyticsComponent() {
 *   const { hasAnalyticsConsent, acceptAll } = useCookieConsent();
 *
 *   if (!hasAnalyticsConsent) {
 *     return <Button onClick={acceptAll}>Enable Analytics</Button>;
 *   }
 *
 *   return <GoogleAnalytics />;
 * }
 * ```
 */
export function useCookieConsent(): UseCookieConsentReturn {
  const context = useContext(CookieConsentContext);

  if (context === undefined) {
    throw new Error('useCookieConsent must be used within CookieConsentProvider');
  }

  // Memoize helper values to avoid unnecessary re-renders
  const helpers = useMemo(
    () => ({
      hasAnalyticsConsent: context.consent?.analytics ?? false,
      hasClarityConsent: context.consent?.clarity ?? false,
      hasAnyOptionalConsent: (context.consent?.analytics || context.consent?.clarity) ?? false,
    }),
    [context.consent]
  );

  return {
    ...context,
    ...helpers,
  };
}
