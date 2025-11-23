'use client';

import { useEffect } from 'react';
import { useNotificationEvent } from '~/events';

export function NotificationEventListener() {
  // Listen to all notification events for debugging
  useNotificationEvent('notification:show', (data) => {
    console.log('🔔 Notification Show:', data);
  });

  useNotificationEvent('notification:hide', (data) => {
    console.log('🙈 Notification Hide:', data);
  });

  useNotificationEvent('notification:clear-all', () => {
    console.log('🧹 Notification Clear All');
  });

  useNotificationEvent('notification:product-action', (data) => {
    console.log('📦 Product Action Notification:', data);
  });

  useNotificationEvent('notification:system', (data) => {
    console.log('⚙️ System Notification:', data);
  });

  useEffect(() => {
    console.log('🔔 NotificationEventListener: Listening for all notification events');
  }, []);

  return null;
}
