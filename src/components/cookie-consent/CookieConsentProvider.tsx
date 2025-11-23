'use client';

/**
 * Cookie Consent Provider
 *
 * React Context provider for managing cookie consent state globally.
 * Handles loading from storage, updating preferences, and syncing with analytics APIs.
 */

import { createContext, useCallback, useEffect, useState } from 'react';
import type {
  ConsentUpdate,
  CookieConsent,
  CookieConsentContextValue,
} from '~/types/cookieConsent';
import { CONSENT_VERSION } from '~/types/cookieConsent';
import { applyStoredConsent, updateAllConsents } from '~/utils/consentManager';
import {
  createDefaultConsent,
  getStoredConsent,
  removeConsent,
  saveConsent,
} from '~/utils/cookieStorage';

export const CookieConsentContext = createContext<CookieConsentContextValue | undefined>(undefined);

interface CookieConsentProviderProps {
  children: React.ReactNode;
}

/**
 * Cookie Consent Provider Component
 *
 * Provides cookie consent state and actions to all child components.
 * Initializes from localStorage and syncs changes with analytics services.
 *
 * @example
 * ```tsx
 * <CookieConsentProvider>
 *   <App />
 * </CookieConsentProvider>
 * ```
 */
export function CookieConsentProvider({ children }: CookieConsentProviderProps) {
  // Initialize state with lazy function to avoid SSR issues
  const [consent, setConsent] = useState<CookieConsent | null>(() => {
    // During SSR, return null
    if (typeof window === 'undefined') {
      return null;
    }
    // On client, try to load from storage
    return getStoredConsent();
  });

  const [isLoading, setIsLoading] = useState(true);

  // Load consent from storage on mount (client-side only)
  useEffect(() => {
    const stored = getStoredConsent();
    setConsent(stored);
    setIsLoading(false);

    // Apply stored consent to analytics services
    applyStoredConsent(stored);
  }, []);

  /**
   * Accept all optional cookies (analytics + clarity)
   */
  const acceptAll = useCallback(() => {
    const newConsent: CookieConsent = {
      version: CONSENT_VERSION,
      timestamp: Date.now(),
      analytics: true,
      clarity: true,
      necessary: true,
    };

    setConsent(newConsent);
    saveConsent(newConsent);
    updateAllConsents(newConsent);
  }, []);

  /**
   * Reject all optional cookies (keep only necessary)
   */
  const rejectOptional = useCallback(() => {
    const newConsent: CookieConsent = {
      version: CONSENT_VERSION,
      timestamp: Date.now(),
      analytics: false,
      clarity: false,
      necessary: true,
    };

    setConsent(newConsent);
    saveConsent(newConsent);
    updateAllConsents(newConsent);
  }, []);

  /**
   * Update specific cookie preferences
   * Merges with existing consent
   */
  const updatePreferences = useCallback(
    (update: ConsentUpdate) => {
      const current = consent || createDefaultConsent();
      const newConsent: CookieConsent = {
        ...current,
        ...update,
        version: CONSENT_VERSION,
        timestamp: Date.now(),
        necessary: true, // Always true
      };

      setConsent(newConsent);
      saveConsent(newConsent);
      updateAllConsents(newConsent);
    },
    [consent]
  );

  /**
   * Reset consent preferences (clear from storage)
   * Used when user wants to reset their choices
   */
  const resetConsent = useCallback(() => {
    setConsent(null);
    removeConsent();
    // Reset analytics to denied state
    applyStoredConsent(null);
  }, []);

  const value: CookieConsentContextValue = {
    consent,
    hasConsent: consent !== null,
    isLoading,
    acceptAll,
    rejectOptional,
    updatePreferences,
    resetConsent,
  };

  return <CookieConsentContext.Provider value={value}>{children}</CookieConsentContext.Provider>;
}
