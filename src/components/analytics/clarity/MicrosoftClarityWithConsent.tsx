'use client';

/**
 * Microsoft Clarity with Cookie Consent
 *
 * Wrapper for MicrosoftClarity that only loads when user grants consent.
 * Updates Clarity consent API when preferences change.
 */

import { useEffect, useState } from 'react';
import { useCookieConsent } from '~/hooks/useCookieConsent';
import { updateMicrosoftClarityConsent } from '~/utils/consentManager';
import { MicrosoftClarity } from './MicrosoftClarity';

/**
 * MicrosoftClarity component with consent management
 *
 * Features:
 * - Only loads Clarity script when consent is granted
 * - Updates consent API when preferences change
 * - Once loaded, script remains (Clarity doesn't support full unloading)
 *
 * @example
 * ```tsx
 * <CookieConsentProvider>
 *   <MicrosoftClarityWithConsent />
 * </CookieConsentProvider>
 * ```
 */
export function MicrosoftClarityWithConsent() {
  const { consent, hasClarityConsent } = useCookieConsent();
  const [shouldLoad, setShouldLoad] = useState(false);

  // Load Clarity once consent is granted
  // Note: Once loaded, we don't unload it (Clarity doesn't support that well)
  // Instead, we use the consent API to control data collection
  useEffect(() => {
    if (consent?.clarity && !shouldLoad) {
      setShouldLoad(true);
      updateMicrosoftClarityConsent(true);
    } else if (consent && !consent.clarity) {
      // User revoked consent - stop data collection
      updateMicrosoftClarityConsent(false);
    }
  }, [consent, shouldLoad]);

  // Don't load script until user consents
  if (!hasClarityConsent || !shouldLoad) {
    return null;
  }

  return <MicrosoftClarity />;
}
