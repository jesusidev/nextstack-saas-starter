// Enhanced notification events for NextStack SaaS Starter
import type { AppEvent } from './types';
export interface NotificationEvents {
  'notification:show': AppEvent<{
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
    duration?: number;
    action?: { label: string; onClick: () => void };
    persistent?: boolean;
  }>;
  'notification:hide': AppEvent<{ id?: string }>;
  'notification:clear-all': AppEvent<void>;
  'notification:product-action': AppEvent<{
    action: 'created' | 'updated' | 'deleted' | 'favorited';
    productName: string;
    type: 'success' | 'info';
  }>;
  'notification:system': AppEvent<{
    message: string;
    type: 'maintenance' | 'update' | 'announcement';
    level: 'low' | 'medium' | 'high';
  }>;
}

// Type-safe notification event names
export type NotificationEventName = keyof NotificationEvents;
