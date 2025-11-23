// UI interaction events for NextStack SaaS Starter
import type { AppEvent } from './types';
export interface UIEvents {
  'modal:opened': AppEvent<{ modalId: string; context?: string }>;
  'modal:closed': AppEvent<{ modalId: string; context?: string }>;
  'form:submitted': AppEvent<{
    formId: string;
    formType: 'product' | 'profile' | 'settings';
    data: Record<string, unknown>;
  }>;
  'form:validation-failed': AppEvent<{
    formId: string;
    formType: 'product' | 'profile' | 'settings';
    errors: string[];
  }>;
  'search:performed': AppEvent<{
    query: string;
    context: 'products' | 'global';
    resultCount: number;
  }>;
  'navigation:route-changed': AppEvent<{
    from: string;
    to: string;
    userId?: string;
  }>;
  'upload:started': AppEvent<{
    fileType: string;
    fileSize: number;
    context: 'product-image' | 'profile-avatar';
  }>;
  'upload:completed': AppEvent<{
    fileType: string;
    fileSize: number;
    url: string;
    context: 'product-image' | 'profile-avatar';
  }>;
  'upload:failed': AppEvent<{
    fileType: string;
    error: string;
    context: 'product-image' | 'profile-avatar';
  }>;
}

// Type-safe UI event names
export type UIEventName = keyof UIEvents;
