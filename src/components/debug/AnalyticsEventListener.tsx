'use client';

import { useEffect } from 'react';
import { useAnalyticsEvent } from '~/events';

export function AnalyticsEventListener() {
  // Listen to all analytics events using the generic hook
  useAnalyticsEvent('analytics:track', (data) => {
    console.log('📊 Analytics Track:', data);
  });

  useAnalyticsEvent('analytics:page-view', (data) => {
    console.log('👁️ Page View:', data);
  });

  useAnalyticsEvent('analytics:user-action', (data) => {
    console.log('🎯 User Action:', data);
  });

  useAnalyticsEvent('analytics:business-metric', (data) => {
    console.log('💰 Business Metric:', data);
  });

  useAnalyticsEvent('analytics:error', (data) => {
    console.log('🚨 Analytics Error:', data);
  });

  useEffect(() => {
    console.log('📈 AnalyticsEventListener: Listening for all analytics events');
  }, []);

  return null;
}
