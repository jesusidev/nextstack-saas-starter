import { Skeleton } from '@mantine/core';
import type { ReactNode } from 'react';
import { usePermissions } from '~/hooks/use-permissions';

type PermissionType = 'edit' | 'delete' | 'view';

type ResourceWithOwnership = {
  userId: string | null;
  [key: string]: unknown;
};

interface ResourceOwnerProps {
  resource: ResourceWithOwnership | undefined;
  permission: PermissionType;
  children: ReactNode;
  fallback?: ReactNode;
  showLoadingSkeleton?: boolean;
}

export const ResourceOwner = ({
  resource,
  permission,
  children,
  fallback = null,
  showLoadingSkeleton = false,
}: ResourceOwnerProps) => {
  const { canEdit, canDelete, canView, isLoading } = usePermissions();

  if (isLoading && showLoadingSkeleton) {
    return <Skeleton height={32} width={100} />;
  }

  if (isLoading) {
    return null;
  }

  const hasPermission = () => {
    switch (permission) {
      case 'edit':
        return canEdit(resource);
      case 'delete':
        return canDelete(resource);
      case 'view':
        return canView(resource);
      default:
        return false;
    }
  };

  if (hasPermission()) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
};
