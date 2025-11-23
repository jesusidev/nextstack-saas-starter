import { api } from '~/utils/trpc';

type Resource = {
  userId: string | null;
  [key: string]: any;
};

export const usePermissions = () => {
  const { data: currentUser, isLoading } = api.user.get.useQuery();

  const canEdit = (resource: Resource | undefined): boolean => {
    if (!resource || !currentUser) {
      return false;
    }
    if (currentUser.role === 'ADMIN') {
      return true;
    }
    if (!resource.userId) {
      return false;
    }
    return resource.userId === currentUser.id;
  };

  const canDelete = (resource: Resource | undefined): boolean => {
    return canEdit(resource);
  };

  const canView = (resource: Resource | undefined): boolean => {
    return canEdit(resource);
  };

  const isOwner = (resource: Resource | undefined): boolean => {
    if (!resource || !currentUser) {
      return false;
    }
    if (!resource.userId) {
      return false;
    }
    return resource.userId === currentUser.id;
  };

  return {
    canEdit,
    canDelete,
    canView,
    isOwner,
    currentUser,
    isAdmin: currentUser?.role === 'ADMIN',
    isLoading,
  };
};
