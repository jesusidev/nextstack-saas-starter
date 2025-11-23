import { useEvent } from '../hooks/use-event';
import type { PermissionEventName, PermissionEvents } from './permission-events';

/**
 * Domain-specific hook for permission events
 */
export const usePermissionEvent = <T extends PermissionEventName>(
  eventName: T,
  callback?: (payload: PermissionEvents[T]['detail']) => void
) => {
  return useEvent(eventName, callback);
};

/**
 * Helper hook to dispatch permission events easily
 */
export const usePermissionDispatcher = () => {
  const { dispatch: denied } = usePermissionEvent('permission:denied');
  const { dispatch: granted } = usePermissionEvent('permission:granted');
  const { dispatch: adminBypass } = usePermissionEvent('permission:admin-bypass');
  const { dispatch: ownershipTransferred } = usePermissionEvent('permission:ownership-transferred');

  return {
    /**
     * Dispatch when a user is denied permission to perform an action
     */
    denied: (data: {
      action: 'edit' | 'delete' | 'view' | 'create';
      resourceType: 'product' | 'project' | 'category' | 'resource';
      resourceId: string;
      userId: string;
      reason: 'not-owner' | 'not-found' | 'unauthorized';
    }) => denied(data),

    /**
     * Dispatch when a user is granted permission to perform an action
     */
    granted: (data: {
      action: 'edit' | 'delete' | 'view' | 'create';
      resourceType: 'product' | 'project' | 'category' | 'resource';
      resourceId: string;
      userId: string;
      isOwner: boolean;
      isAdmin: boolean;
    }) => granted(data),

    /**
     * Dispatch when an admin bypasses ownership checks
     */
    adminBypass: (data: {
      action: 'edit' | 'delete' | 'view' | 'create';
      resourceType: 'product' | 'project' | 'category' | 'resource';
      resourceId: string;
      adminUserId: string;
      resourceOwnerId: string;
    }) => adminBypass(data),

    /**
     * Dispatch when ownership is transferred
     */
    ownershipTransferred: (data: {
      resourceType: 'product' | 'project';
      resourceId: string;
      fromUserId: string;
      toUserId: string;
      transferredBy: string;
    }) => ownershipTransferred(data),
  };
};
