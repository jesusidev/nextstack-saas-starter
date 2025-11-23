/**
 * Cookie Consent Storage Utilities
 *
 * SSR-safe localStorage utilities for persisting and retrieving cookie consent preferences.
 * Includes version management and error handling.
 */

import type { CookieConsent } from '~/types/cookieConsent';
import { CONSENT_STORAGE_KEY, CONSENT_VERSION, DEFAULT_CONSENT } from '~/types/cookieConsent';

/**
 * Check if code is running in browser environment (SSR-safe)
 */
function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

/**
 * Create default consent state with current timestamp
 * All optional cookies denied by default (GDPR compliant)
 */
export function createDefaultConsent(): CookieConsent {
  return {
    ...DEFAULT_CONSENT,
    timestamp: Date.now(),
  };
}

/**
 * Get consent preferences from localStorage
 * Returns null if no preferences exist or if SSR
 *
 * @returns Stored consent preferences or null
 */
export function getStoredConsent(): CookieConsent | null {
  if (!isBrowser()) {
    return null;
  }

  try {
    const stored = localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!stored) {
      return null;
    }

    const parsed = JSON.parse(stored) as CookieConsent;

    // Validate required fields
    if (
      typeof parsed.version !== 'number' ||
      typeof parsed.timestamp !== 'number' ||
      typeof parsed.analytics !== 'boolean' ||
      typeof parsed.clarity !== 'boolean'
    ) {
      console.warn('Invalid consent data in storage, clearing...');
      removeConsent();
      return null;
    }

    // Check version and migrate if needed
    if (parsed.version !== CONSENT_VERSION) {
      return migrateConsent(parsed);
    }

    return parsed;
  } catch (error) {
    console.error('Error reading cookie consent from storage:', error);
    // Clear corrupted data
    removeConsent();
    return null;
  }
}

/**
 * Save consent preferences to localStorage
 *
 * @param consent - Consent preferences to save
 * @returns true if saved successfully, false otherwise
 */
export function saveConsent(consent: CookieConsent): boolean {
  if (!isBrowser()) {
    return false;
  }

  try {
    const toSave = {
      ...consent,
      timestamp: Date.now(), // Always update timestamp on save
    };
    localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(toSave));
    return true;
  } catch (error) {
    // Handle localStorage quota exceeded or other errors
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      console.error('localStorage quota exceeded, cannot save cookie consent');
    } else {
      console.error('Error saving cookie consent to storage:', error);
    }
    return false;
  }
}

/**
 * Remove consent preferences from localStorage
 * Used for resetting user preferences
 */
export function removeConsent(): void {
  if (!isBrowser()) {
    return;
  }

  try {
    localStorage.removeItem(CONSENT_STORAGE_KEY);
  } catch (error) {
    console.error('Error removing cookie consent from storage:', error);
  }
}

/**
 * Clear all consent-related data
 * Alias for removeConsent for clarity in some contexts
 */
export function clearConsent(): void {
  removeConsent();
}

/**
 * Migrate old consent versions to current schema
 * For future schema changes, add migration logic here
 *
 * @param oldConsent - Consent object with old version
 * @returns Migrated consent object
 */
function migrateConsent(oldConsent: CookieConsent): CookieConsent {
  console.info(`Migrating cookie consent from version ${oldConsent.version} to ${CONSENT_VERSION}`);

  // Future migrations would go here
  // Example:
  // if (oldConsent.version === 1) {
  //   // Migrate from v1 to v2
  //   return { ...oldConsent, newField: defaultValue, version: 2 };
  // }

  // For now, just update version and timestamp
  const migrated: CookieConsent = {
    ...oldConsent,
    version: CONSENT_VERSION,
    timestamp: Date.now(),
    // Ensure necessary is always true
    necessary: true,
  };

  // Save migrated version
  saveConsent(migrated);

  return migrated;
}

/**
 * Check if consent has expired
 * GDPR recommends re-asking for consent every 12 months
 *
 * @param consent - Consent object to check
 * @param maxAgeMs - Maximum age in milliseconds (default: 365 days)
 * @returns true if consent has expired
 */
export function isConsentExpired(
  consent: CookieConsent,
  maxAgeMs = 365 * 24 * 60 * 60 * 1000
): boolean {
  const age = Date.now() - consent.timestamp;
  return age > maxAgeMs;
}

/**
 * Check if consent exists and is still valid
 * Combines existence check with expiration check
 *
 * @param maxAgeMs - Maximum age in milliseconds
 * @returns true if valid consent exists
 */
export function hasValidConsent(maxAgeMs?: number): boolean {
  const consent = getStoredConsent();
  if (!consent) {
    return false;
  }
  if (maxAgeMs !== undefined && isConsentExpired(consent, maxAgeMs)) {
    return false;
  }
  return true;
}

/**
 * Update specific consent preferences
 * Merges with existing consent or creates new if none exists
 *
 * @param updates - Partial consent updates
 * @returns Updated consent object
 */
export function updateStoredConsent(
  updates: Partial<Omit<CookieConsent, 'version' | 'necessary'>>
): CookieConsent {
  const current = getStoredConsent() || createDefaultConsent();
  const updated: CookieConsent = {
    ...current,
    ...updates,
    version: CONSENT_VERSION,
    necessary: true, // Always true
    timestamp: Date.now(),
  };
  saveConsent(updated);
  return updated;
}
