'use client';

import { useUser } from '@clerk/nextjs';
import { useCallback } from 'react';
import { useAnalyticsDispatcher } from '~/events';

/**
 * Simplified analytics hook that dispatches events to our unified event system.
 * The UnifiedAnalyticsService will automatically forward these to GA and Clarity.
 */
export const useAnalytics = () => {
  const { user } = useUser();
  const analyticsDispatcher = useAnalyticsDispatcher();

  const track = useCallback(
    (data: { event: string; properties?: Record<string, unknown> }) => {
      analyticsDispatcher.track({
        ...data,
        userId: user?.id,
        timestamp: Date.now(),
      });
    },
    [analyticsDispatcher, user?.id]
  );

  const trackPageView = useCallback(
    (data: { page: string; title?: string; referrer?: string }) => {
      analyticsDispatcher.pageView({
        ...data,
        userId: user?.id,
      });
    },
    [analyticsDispatcher, user?.id]
  );

  const trackUserAction = useCallback(
    (data: { action: string; category: string; label?: string; value?: number }) => {
      analyticsDispatcher.userAction({
        ...data,
        userId: user?.id,
      });
    },
    [analyticsDispatcher, user?.id]
  );

  const trackBusinessMetric = useCallback(
    (data: { metric: string; value: number; unit?: string }) => {
      analyticsDispatcher.businessMetric({
        ...data,
        userId: user?.id,
      });
    },
    [analyticsDispatcher, user?.id]
  );

  const trackError = useCallback(
    (data: { error: string; context?: string; stack?: string }) => {
      analyticsDispatcher.error({
        ...data,
        userId: user?.id,
      });
    },
    [analyticsDispatcher, user?.id]
  );

  return {
    track,
    trackPageView,
    trackUserAction,
    trackBusinessMetric,
    trackError,
  };
};
