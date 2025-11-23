/**
 * Permission Events
 *
 * Events related to ownership-based access control and permissions.
 * Used for analytics, monitoring, and security auditing.
 */

export interface PermissionEvents {
  /**
   * Fired when a user attempts an action they don't have permission for
   */
  'permission:denied': CustomEvent<{
    action: 'edit' | 'delete' | 'view' | 'create';
    resourceType: 'product' | 'project' | 'category' | 'resource';
    resourceId: string;
    userId: string;
    reason: 'not-owner' | 'not-found' | 'unauthorized';
  }>;

  /**
   * Fired when a user successfully performs an action they have permission for
   */
  'permission:granted': CustomEvent<{
    action: 'edit' | 'delete' | 'view' | 'create';
    resourceType: 'product' | 'project' | 'category' | 'resource';
    resourceId: string;
    userId: string;
    isOwner: boolean;
    isAdmin: boolean;
  }>;

  /**
   * Fired when admin bypass is used
   */
  'permission:admin-bypass': CustomEvent<{
    action: 'edit' | 'delete' | 'view' | 'create';
    resourceType: 'product' | 'project' | 'category' | 'resource';
    resourceId: string;
    adminUserId: string;
    resourceOwnerId: string;
  }>;

  /**
   * Fired when ownership is transferred
   */
  'permission:ownership-transferred': CustomEvent<{
    resourceType: 'product' | 'project';
    resourceId: string;
    fromUserId: string;
    toUserId: string;
    transferredBy: string;
  }>;
}

export type PermissionEventName = keyof PermissionEvents;
