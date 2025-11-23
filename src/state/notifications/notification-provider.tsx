'use client';

import { type ReactNode, useCallback, useMemo, useState } from 'react';
import { NotificationContext, type NotificationItem } from './notification-context';

// Provider
interface NotificationProviderProps {
  children: ReactNode;
  maxNotifications?: number;
  defaultDuration?: number;
}

export function NotificationProvider({
  children,
  maxNotifications = 5,
  defaultDuration = 5000,
}: NotificationProviderProps) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== id));
  }, []);

  const addNotification = useCallback(
    (notification: Omit<NotificationItem, 'id' | 'timestamp'>) => {
      const id = crypto.randomUUID();
      const newNotification: NotificationItem = {
        ...notification,
        id,
        timestamp: Date.now(),
        autoHide: notification.autoHide ?? true,
        duration: notification.duration ?? defaultDuration,
      };

      setNotifications((prev) => {
        const updated = [newNotification, ...prev];
        // Limit the number of notifications
        return updated.slice(0, maxNotifications);
      });

      // Auto-remove notification if autoHide is enabled
      if (newNotification.autoHide) {
        setTimeout(() => {
          removeNotification(id);
        }, newNotification.duration);
      }

      return id;
    },
    [maxNotifications, defaultDuration, removeNotification]
  );

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Convenience methods
  const success = useCallback(
    (title: string, message?: string) => {
      return addNotification({ type: 'success', title, message });
    },
    [addNotification]
  );

  const error = useCallback(
    (title: string, message?: string) => {
      return addNotification({ type: 'error', title, message, autoHide: false });
    },
    [addNotification]
  );

  const warning = useCallback(
    (title: string, message?: string) => {
      return addNotification({ type: 'warning', title, message });
    },
    [addNotification]
  );

  const info = useCallback(
    (title: string, message?: string) => {
      return addNotification({ type: 'info', title, message });
    },
    [addNotification]
  );

  const value = useMemo(
    () => ({
      notifications,
      addNotification,
      removeNotification,
      clearAllNotifications,
      success,
      error,
      warning,
      info,
    }),
    [
      notifications,
      addNotification,
      removeNotification,
      clearAllNotifications,
      success,
      error,
      warning,
      info,
    ]
  );

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}
