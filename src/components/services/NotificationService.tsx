'use client';

import { notifications } from '@mantine/notifications';
import {
  IconAlertTriangle,
  IconCircleCheck,
  IconCircleX,
  IconInfoCircle,
} from '@tabler/icons-react';
import { useEffect } from 'react';
import { useNotificationEvent } from '~/events';

// Service component that converts notification events to Mantine notifications
export function NotificationService() {
  // Listen for general notification events
  useNotificationEvent('notification:show', (data) => {
    notifications.show({
      message: data.message,
      color: getColorForType(data.type),
      icon: getIconForType(data.type),
      autoClose: data.persistent ? false : data.duration || 5000,
    });
  });

  // Listen for product-specific notification events
  useNotificationEvent('notification:product-action', (data) => {
    const message = getProductActionMessage(data.action, data.productName);
    notifications.show({
      message,
      color: data.type === 'success' ? 'green.5' : 'blue.5',
      icon: data.type === 'success' ? <IconCircleCheck /> : <IconInfoCircle />,
    });
  });

  // Listen for system notifications
  useNotificationEvent('notification:system', (data) => {
    notifications.show({
      title: getSystemTitle(data.type),
      message: data.message,
      color: getSystemColor(data.level),
      icon: <IconInfoCircle />,
      autoClose: data.level === 'high' ? false : 10000,
    });
  });

  // Listen for hide events
  useNotificationEvent('notification:hide', (data) => {
    if (data.id) {
      notifications.hide(data.id);
    }
  });

  // Listen for clear all events
  useNotificationEvent('notification:clear-all', () => {
    notifications.clean();
  });

  useEffect(() => {
    console.log('🔔 NotificationService: Listening for notification events');
  }, []);

  return null;
}

// Helper functions
function getColorForType(type: 'success' | 'error' | 'info' | 'warning') {
  switch (type) {
    case 'success':
      return 'green.5';
    case 'error':
      return 'red.5';
    case 'info':
      return 'blue.5';
    case 'warning':
      return 'yellow.5';
    default:
      return 'blue.5';
  }
}

function getIconForType(type: 'success' | 'error' | 'info' | 'warning') {
  switch (type) {
    case 'success':
      return <IconCircleCheck />;
    case 'error':
      return <IconCircleX />;
    case 'info':
      return <IconInfoCircle />;
    case 'warning':
      return <IconAlertTriangle />;
    default:
      return <IconInfoCircle />;
  }
}

function getProductActionMessage(
  action: 'created' | 'updated' | 'deleted' | 'favorited',
  productName: string
) {
  switch (action) {
    case 'created':
      return `${productName} has been created successfully`;
    case 'updated':
      return `${productName} has been updated successfully`;
    case 'deleted':
      return `${productName} has been deleted successfully`;
    case 'favorited':
      return `${productName} has been favorited`;
    default:
      return `Action completed for ${productName}`;
  }
}

function getSystemTitle(type: 'maintenance' | 'update' | 'announcement') {
  switch (type) {
    case 'maintenance':
      return 'System Maintenance';
    case 'update':
      return 'System Update';
    case 'announcement':
      return 'Announcement';
    default:
      return 'System Notice';
  }
}

function getSystemColor(level: 'low' | 'medium' | 'high') {
  switch (level) {
    case 'low':
      return 'blue.5';
    case 'medium':
      return 'yellow.5';
    case 'high':
      return 'red.5';
    default:
      return 'blue.5';
  }
}
