// Theme and user preference events for NextStack SaaS Starter
import type { AppEvent } from './types';
export interface ThemeEvents {
  'theme:changed': AppEvent<{
    theme: 'light' | 'dark' | 'system';
    previousTheme: 'light' | 'dark' | 'system';
    userId?: string;
  }>;
  'theme:toggle-requested': AppEvent<void>;
  'theme:system-preference-changed': AppEvent<{ prefersDark: boolean }>;
  'preferences:view-mode-changed': AppEvent<{
    viewMode: 'cards' | 'table';
    context: 'products' | 'projects' | 'dashboard';
    userId?: string;
  }>;
  'preferences:settings-updated': AppEvent<{
    settings: Record<string, unknown>;
    userId?: string;
  }>;
}

// Type-safe theme event names
export type ThemeEventName = keyof ThemeEvents;
