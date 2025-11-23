// Analytics-specific event definitions for NextStack SaaS Starter
import type { AppEvent } from './types';
export interface AnalyticsEvents {
  'analytics:track': AppEvent<{
    event: string;
    properties?: Record<string, unknown>;
    userId?: string;
    timestamp?: number;
  }>;
  'analytics:page-view': AppEvent<{
    page: string;
    title?: string;
    referrer?: string;
    userId?: string;
  }>;
  'analytics:user-action': AppEvent<{
    action: string;
    category: string;
    label?: string;
    value?: number;
    userId?: string;
  }>;
  'analytics:business-metric': AppEvent<{
    metric: string;
    value: number;
    unit?: string;
    userId?: string;
  }>;
  'analytics:error': AppEvent<{
    error: string;
    context?: string;
    userId?: string;
    stack?: string;
  }>;
}

// Type-safe analytics event names
export type AnalyticsEventName = keyof AnalyticsEvents;
