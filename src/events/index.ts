// Re-export all event types for easy importing

export * from './analytics-events';
export * from './conversion-events';
export * from './notification-events';
export * from './permission-events';
export * from './product-events';
export * from './project-events';
export * from './theme-events';
export * from './types';
export * from './ui-events';
export * from './use-analytics-events';
export * from './use-notification-events';
export * from './use-permission-events';
export * from './use-product-events';

// Import all event interfaces
import type { AnalyticsEvents } from './analytics-events';
import type { ConversionEvents } from './conversion-events';
import type { NotificationEvents } from './notification-events';
import type { PermissionEvents } from './permission-events';
import type { ProductEvents } from './product-events';
import type { ProjectEvents } from './project-events';
import type { ThemeEvents } from './theme-events';
import type { UIEvents } from './ui-events';

// Combine all domain events into one interface
export interface CustomWindowEventMap
  extends WindowEventMap,
    ProductEvents,
    ProjectEvents,
    ThemeEvents,
    NotificationEvents,
    AnalyticsEvents,
    ConversionEvents,
    PermissionEvents,
    UIEvents {}

// Union type of all event names for type safety
export type AllEventNames =
  | keyof ProductEvents
  | keyof ProjectEvents
  | keyof ThemeEvents
  | keyof NotificationEvents
  | keyof AnalyticsEvents
  | keyof ConversionEvents
  | keyof PermissionEvents
  | keyof UIEvents;
