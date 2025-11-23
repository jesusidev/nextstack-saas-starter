/**
 * Cookie Consent Types
 *
 * Type definitions for the cookie consent management system.
 * Includes consent storage schema, state management types, and UI state types.
 */

/**
 * Cookie consent preferences schema
 * Stored in localStorage with version tracking for future schema migrations
 */
export interface CookieConsent {
  /** Schema version for handling future migrations (start with 1) */
  version: number;
  /** Unix timestamp when consent was given/updated */
  timestamp: number;
  /** Google Analytics consent */
  analytics: boolean;
  /** Microsoft Clarity consent */
  clarity: boolean;
  /** Always true - Clerk authentication cookies are necessary */
  necessary: true;
}

/**
 * Individual cookie category identifier
 */
export type CookieCategory = 'analytics' | 'clarity' | 'necessary';

/**
 * Consent update payload for modifying preferences
 * Only optional cookies can be updated (necessary is always true)
 */
export interface ConsentUpdate {
  /** Update Google Analytics consent */
  analytics?: boolean;
  /** Update Microsoft Clarity consent */
  clarity?: boolean;
}

/**
 * Consent state for React Context
 * Represents the current state of cookie consent
 */
export interface CookieConsentState {
  /** Current consent preferences, null if not yet set */
  consent: CookieConsent | null;
  /** Whether user has provided consent (any preference set) */
  hasConsent: boolean;
  /** Whether consent is being loaded from storage */
  isLoading: boolean;
}

/**
 * Consent actions for Context
 * Available methods for managing cookie consent
 */
export interface CookieConsentActions {
  /** Accept all optional cookies (analytics + clarity) */
  acceptAll: () => void;
  /** Reject all optional cookies (only necessary remain) */
  rejectOptional: () => void;
  /** Update specific cookie preferences */
  updatePreferences: (update: ConsentUpdate) => void;
  /** Reset consent preferences (clear from storage) */
  resetConsent: () => void;
}

/**
 * Combined Context value
 * Full context value including state and actions
 */
export interface CookieConsentContextValue extends CookieConsentState, CookieConsentActions {}

/**
 * Cookie banner visibility state
 */
export type BannerState = 'hidden' | 'visible' | 'preferences';

/**
 * Cookie information for display in preferences modal
 * Used to show detailed information about each cookie category
 */
export interface CookieInfo {
  /** Display name of the cookie/service */
  name: string;
  /** Cookie category */
  category: CookieCategory;
  /** Description of what this cookie is used for */
  purpose: string;
  /** Whether this cookie is required for site functionality */
  required: boolean;
  /** Service provider (e.g., "Google", "Microsoft", "Clerk") */
  provider: string;
}

/**
 * Default consent preferences
 * Used when initializing consent for the first time
 */
export const DEFAULT_CONSENT: Omit<CookieConsent, 'timestamp'> = {
  version: 1,
  analytics: false,
  clarity: false,
  necessary: true,
} as const;

/**
 * Cookie information constants
 * Metadata about each cookie category for display
 */
export const COOKIE_INFO: Record<CookieCategory, CookieInfo> = {
  necessary: {
    name: 'Necessary Cookies',
    category: 'necessary',
    purpose:
      'Essential for authentication and core functionality. These cookies are required for the site to work properly.',
    required: true,
    provider: 'Clerk',
  },
  analytics: {
    name: 'Google Analytics',
    category: 'analytics',
    purpose:
      'Help us understand how visitors interact with our website by collecting and reporting information anonymously.',
    required: false,
    provider: 'Google',
  },
  clarity: {
    name: 'Microsoft Clarity',
    category: 'clarity',
    purpose:
      'Provides behavioral analytics to help us improve user experience through heatmaps and session recordings.',
    required: false,
    provider: 'Microsoft',
  },
} as const;

/**
 * LocalStorage key for storing consent preferences
 */
export const CONSENT_STORAGE_KEY = 'cookie-consent-preferences' as const;

/**
 * Consent schema version
 * Increment when making breaking changes to the CookieConsent interface
 */
export const CONSENT_VERSION = 1 as const;
