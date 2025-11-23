import { useEvent } from '../hooks/use-event';
import type { AnalyticsEventName, AnalyticsEvents } from './analytics-events';

// Domain-specific hook for analytics events
export const useAnalyticsEvent = <T extends AnalyticsEventName>(
  eventName: T,
  callback?: (payload: AnalyticsEvents[T]['detail']) => void
) => {
  return useEvent(eventName, callback);
};

// Convenience hooks for specific analytics events
export const useAnalyticsTrack = (
  callback: (payload: {
    event: string;
    properties?: Record<string, unknown>;
    userId?: string;
    timestamp?: number;
  }) => void
) => useAnalyticsEvent('analytics:track', callback);

export const useAnalyticsPageView = (
  callback: (payload: { page: string; title?: string; referrer?: string; userId?: string }) => void
) => useAnalyticsEvent('analytics:page-view', callback);

export const useAnalyticsUserAction = (
  callback: (payload: {
    action: string;
    category: string;
    label?: string;
    value?: number;
    userId?: string;
  }) => void
) => useAnalyticsEvent('analytics:user-action', callback);

// Helper hook to dispatch analytics events easily
export const useAnalyticsDispatcher = () => {
  const { dispatch: track } = useAnalyticsEvent('analytics:track');
  const { dispatch: pageView } = useAnalyticsEvent('analytics:page-view');
  const { dispatch: userAction } = useAnalyticsEvent('analytics:user-action');
  const { dispatch: businessMetric } = useAnalyticsEvent('analytics:business-metric');
  const { dispatch: error } = useAnalyticsEvent('analytics:error');

  return {
    track: (data: {
      event: string;
      properties?: Record<string, unknown>;
      userId?: string;
      timestamp?: number;
    }) => track(data),

    pageView: (data: { page: string; title?: string; referrer?: string; userId?: string }) =>
      pageView(data),

    userAction: (data: {
      action: string;
      category: string;
      label?: string;
      value?: number;
      userId?: string;
    }) => userAction(data),

    businessMetric: (data: { metric: string; value: number; unit?: string; userId?: string }) =>
      businessMetric(data),

    error: (data: { error: string; context?: string; userId?: string; stack?: string }) =>
      error(data),
  };
};
