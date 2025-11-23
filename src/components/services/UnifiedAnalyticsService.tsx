'use client';

import { useUser } from '@clerk/nextjs';
import { useEffect } from 'react';
import { cevent } from '~/components/analytics/clarity/interactions/event';
import { gevent } from '~/components/analytics/google/interactions/event';
import { pageView } from '~/components/analytics/google/interactions/pageView';
import { useAnalyticsEvent } from '~/events';

/**
 * Unified Analytics Service that listens to our custom events
 * and forwards them to Google Analytics and Microsoft Clarity
 */
export function UnifiedAnalyticsService() {
  const { user } = useUser();

  // Listen to analytics track events and forward to GA/Clarity
  useAnalyticsEvent('analytics:track', (data) => {
    console.log('📊 Forwarding track event to GA/Clarity:', data);

    // Forward to Google Analytics
    gevent(data.event, {
      category: 'custom',
      label: data.event,
      userId: data.userId,
      ...data.properties,
    });

    // Forward to Microsoft Clarity as custom tag
    cevent({
      event: {
        name: data.event,
        value: JSON.stringify(data.properties || {}),
      },
    });
  });

  // Listen to page view events and forward to GA/Clarity
  useAnalyticsEvent('analytics:page-view', (data) => {
    console.log('👁️ Forwarding page view to GA/Clarity:', data);

    // Forward to Google Analytics
    pageView({
      title: data.title,
      path: data.page,
      userId: data.userId,
    });

    // Forward to Microsoft Clarity
    cevent({
      event: {
        name: 'page_view',
        value: data.page,
      },
    });
  });

  // Listen to user action events and forward to GA/Clarity
  useAnalyticsEvent('analytics:user-action', (data) => {
    console.log('🎯 Forwarding user action to GA/Clarity:', data);

    // Forward to Google Analytics
    gevent(data.action, {
      category: data.category,
      label: data.label,
      value: data.value,
      userId: data.userId,
    });

    // Forward to Microsoft Clarity
    cevent({
      event: {
        name: `${data.category}_${data.action}`,
        value: data.label || data.action,
      },
    });
  });

  // Listen to business metric events and forward to GA/Clarity
  useAnalyticsEvent('analytics:business-metric', (data) => {
    console.log('💰 Forwarding business metric to GA/Clarity:', data);

    // Forward to Google Analytics
    gevent('business_metric', {
      category: 'business',
      label: data.metric,
      value: data.value,
      userId: data.userId,
      unit: data.unit,
    });

    // Forward to Microsoft Clarity
    cevent({
      event: {
        name: `business_${data.metric}`,
        value: `${data.value}${data.unit ? ` ${data.unit}` : ''}`,
      },
    });
  });

  // Listen to error events and forward to GA/Clarity
  useAnalyticsEvent('analytics:error', (data) => {
    console.log('🚨 Forwarding error to GA/Clarity:', data);

    // Forward to Google Analytics
    gevent('exception', {
      category: 'error',
      label: data.error,
      userId: data.userId,
      description: data.error,
      fatal: false,
    });

    // Forward to Microsoft Clarity
    cevent({
      event: {
        name: 'error',
        value: data.context ? `${data.context}: ${data.error}` : data.error,
      },
    });
  });

  // Set user identification in both platforms when available
  useEffect(() => {
    if (user?.id) {
      // Set user ID in Microsoft Clarity
      cevent({
        identify: {
          userId: user.id,
          sessionId: `session_${Date.now()}`,
        },
      });

      // Set user ID in Google Analytics (already handled by gevent userId parameter)
      console.log('👤 User identified in analytics:', user.id);
    }
  }, [user?.id]);

  useEffect(() => {
    console.log('🔗 UnifiedAnalyticsService: Forwarding events to GA and Clarity');
  }, []);

  return null;
}
