'use client';

import { useEffect } from 'react';
import { cevent } from '~/components/analytics/clarity/interactions/event';
import { gevent } from '~/components/analytics/google/interactions/event';
import { useProductEvent } from '~/events';

/**
 * Domain-specific analytics service that forwards domain events
 * to Google Analytics and Microsoft Clarity
 */
export function DomainAnalyticsService() {
  // Listen to product events and forward to analytics platforms
  useProductEvent('product:created', (data) => {
    gevent('product_created', {
      category: 'product_management',
      label: data.productName,
      userId: data.userId,
      product_id: data.productId,
      category_id: data.categoryId,
    });

    cevent({
      event: {
        name: 'product_created',
        value: data.productName,
      },
    });
  });

  useProductEvent('product:updated', (data) => {
    gevent('product_updated', {
      category: 'product_management',
      label: data.productName,
      userId: data.userId,
      product_id: data.productId,
      changes: data.changes.join(','),
    });

    cevent({
      event: {
        name: 'product_updated',
        value: `${data.productName} (${data.changes.join(', ')})`,
      },
    });
  });

  useProductEvent('product:deleted', (data) => {
    gevent('product_deleted', {
      category: 'product_management',
      label: data.productName,
      userId: data.userId,
      product_id: data.productId,
    });

    cevent({
      event: {
        name: 'product_deleted',
        value: data.productName,
      },
    });
  });

  useProductEvent('product:favorited', (data) => {
    const action = data.isFavorited ? 'product_favorited' : 'product_unfavorited';

    gevent(action, {
      category: 'engagement',
      label: data.productName,
      userId: data.userId,
      product_id: data.productId,
      value: data.isFavorited ? 1 : 0,
    });

    cevent({
      event: {
        name: action,
        value: data.productName,
      },
    });
  });

  useProductEvent('product:view-toggled', (data) => {
    gevent('view_toggled', {
      category: 'ui_interaction',
      label: `${data.context}_${data.viewMode}`,
      userId: data.userId,
      view_mode: data.viewMode,
      context: data.context,
    });

    cevent({
      event: {
        name: 'view_toggled',
        value: `${data.context}: ${data.viewMode}`,
      },
    });
  });

  // UI events can be added later when we implement them

  useEffect(() => {
    console.log('🎯 DomainAnalyticsService: Forwarding domain events to GA and Clarity');
  }, []);

  return null;
}
