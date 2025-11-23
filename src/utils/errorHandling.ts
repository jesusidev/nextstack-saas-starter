import { TRPCClientError } from '@trpc/client';

/**
 * Error Handling Utilities for Ownership-Based Access Control
 *
 * These utilities follow the notification dispatcher pattern used throughout the codebase.
 * Instead of directly calling Mantine's notifications.show(), they return error info objects
 * that should be passed to the notification dispatcher.
 *
 * **Why this pattern?**
 * - Maintains architectural consistency with the event-based notification system
 * - Enables centralized notification logic (analytics, tracking, formatting)
 * - Improves testability (no need to mock Mantine directly)
 * - Separates error handling logic from UI notification logic
 *
 * **Migration Guide:**
 *
 * Before (direct Mantine calls):
 * ```typescript
 * import { notifications } from '@mantine/notifications';
 *
 * onError: (error) => {
 *   notifications.show({
 *     title: 'Error',
 *     message: 'Something went wrong',
 *     color: 'red',
 *   });
 * }
 * ```
 *
 * After (notification dispatcher pattern):
 * ```typescript
 * import { useNotificationDispatcher } from '~/events';
 * import { getPermissionErrorInfo } from '~/utils/errorHandling';
 *
 * const notificationDispatcher = useNotificationDispatcher();
 *
 * onError: (error) => {
 *   const errorInfo = getPermissionErrorInfo(error, 'product');
 *   if (errorInfo) {
 *     notificationDispatcher.show(errorInfo);
 *   }
 * }
 * ```
 *
 * @see useNotificationDispatcher in ~/events/use-notification-events.ts
 */

/**
 * Get permission error information from a tRPC error.
 * Returns an error info object that should be passed to the notification dispatcher.
 *
 * @param error - The error object (typically from tRPC mutation)
 * @param resourceType - The type of resource (e.g., 'product', 'project')
 * @returns Error info object with message and type, or null if no error
 *
 * @example
 * const notificationDispatcher = useNotificationDispatcher();
 * const errorInfo = getPermissionErrorInfo(error, 'product');
 * if (errorInfo) {
 *   notificationDispatcher.show(errorInfo);
 * }
 */
export const getPermissionErrorInfo = (
  error: unknown,
  resourceType: string = 'resource'
): { message: string; type: 'error' | 'warning' } | null => {
  if (error instanceof TRPCClientError) {
    if (error.data?.code === 'FORBIDDEN') {
      return {
        message: `You don't have permission to modify this ${resourceType}.`,
        type: 'error',
      };
    }

    if (error.data?.code === 'NOT_FOUND') {
      return {
        message: `This ${resourceType} could not be found.`,
        type: 'warning',
      };
    }
  }

  console.error('Unexpected error:', error);
  return {
    message: 'An unexpected error occurred. Please try again.',
    type: 'error',
  };
};

/**
 * Get permission toast message info.
 * Use with notification dispatcher for consistent notification handling.
 */
export const getPermissionToastInfo = (
  action: string,
  resourceType: string
): { message: string; type: 'warning' } => {
  return {
    message: `You need owner permissions to ${action} this ${resourceType}.`,
    type: 'warning',
  };
};

/**
 * Get success toast message info.
 * Use with notification dispatcher for consistent notification handling.
 */
export const getSuccessToastInfo = (
  action: string,
  resourceType: string
): { message: string; type: 'success' } => {
  return {
    message: `${resourceType} ${action} successfully.`,
    type: 'success',
  };
};
