import { useEvent } from '../hooks/use-event';
import type { NotificationEventName, NotificationEvents } from './notification-events';

// Domain-specific hook for notification events
export const useNotificationEvent = <T extends NotificationEventName>(
  eventName: T,
  callback?: (payload: NotificationEvents[T]['detail']) => void
) => {
  return useEvent(eventName, callback);
};

// Convenience hooks for specific notification events
export const useNotificationShow = (
  callback: (payload: {
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
    duration?: number;
    action?: { label: string; onClick: () => void };
    persistent?: boolean;
  }) => void
) => useNotificationEvent('notification:show', callback);

export const useNotificationProductAction = (
  callback: (payload: {
    action: 'created' | 'updated' | 'deleted' | 'favorited';
    productName: string;
    type: 'success' | 'info';
  }) => void
) => useNotificationEvent('notification:product-action', callback);

// Helper hook to dispatch notification events easily
export const useNotificationDispatcher = () => {
  const { dispatch: show } = useNotificationEvent('notification:show');
  const { dispatch: hide } = useNotificationEvent('notification:hide');
  const { dispatch: clearAll } = useNotificationEvent('notification:clear-all');
  const { dispatch: productAction } = useNotificationEvent('notification:product-action');
  const { dispatch: system } = useNotificationEvent('notification:system');

  return {
    show: (data: {
      message: string;
      type: 'success' | 'error' | 'info' | 'warning';
      duration?: number;
      action?: { label: string; onClick: () => void };
      persistent?: boolean;
    }) => show(data),

    hide: (data?: { id?: string }) => hide(data || {}),

    clearAll: () => clearAll(undefined),

    productAction: (data: {
      action: 'created' | 'updated' | 'deleted' | 'favorited';
      productName: string;
      type: 'success' | 'info';
    }) => productAction(data),

    system: (data: {
      message: string;
      type: 'maintenance' | 'update' | 'announcement';
      level: 'low' | 'medium' | 'high';
    }) => system(data),
  };
};
