// Conversion-specific event definitions for public product browsing feature
import type { AppEvent } from './types';

/**
 * Conversion events interface for tracking user interactions
 * that lead to sign-up conversions in the public product browsing flow
 */
export interface ConversionEvents {
  /**
   * User clicks on a public product card
   */
  'conversion:card-clicked': AppEvent<{
    productId: string;
    productName: string;
    isAuthenticated: boolean;
  }>;

  /**
   * User clicks the favorite button on a public product card
   */
  'conversion:favorite-clicked': AppEvent<{
    productId: string;
    productName: string;
    isAuthenticated: boolean;
  }>;

  /**
   * User reaches scroll depth threshold and scroll is locked
   */
  'conversion:scroll-locked': AppEvent<{
    scrollDepth: number;
  }>;

  /**
   * User reaches scroll depth threshold
   */
  'conversion:scroll-triggered': AppEvent<{
    scrollDepth: number;
  }>;

  /**
   * Sign-up overlay is shown to user
   */
  'conversion:overlay-shown': AppEvent<{
    triggerSource: 'card' | 'favorite' | 'scroll';
    scrollDepth?: number;
  }>;

  /**
   * User dismisses the sign-up overlay
   */
  'conversion:overlay-dismissed': AppEvent<{
    triggerSource: 'card' | 'favorite' | 'scroll';
  }>;

  /**
   * User successfully signs up or signs in from overlay
   */
  'conversion:completed': AppEvent<{
    triggerSource: 'card' | 'favorite' | 'scroll';
    conversionType: 'signup' | 'signin';
  }>;

  /**
   * User clicks the Sign Up button in the overlay
   */
  'conversion:signup-clicked': AppEvent<{
    triggerSource: 'card' | 'favorite' | 'scroll';
  }>;

  /**
   * User clicks the Sign In button in the overlay
   */
  'conversion:signin-clicked': AppEvent<{
    triggerSource: 'card' | 'favorite' | 'scroll';
  }>;

  /**
   * Public products page viewed by unauthenticated user
   */
  'conversion:page-viewed': AppEvent<{
    productCount: number;
    showAll: boolean;
  }>;
}

/**
 * Type-safe conversion event names
 */
export type ConversionEventName = keyof ConversionEvents;
