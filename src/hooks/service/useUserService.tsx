import { useNotificationDispatcher } from '~/events';
import { api } from '~/utils/trpc';

/**
 * Modern User Service Hook following TRPC v11 and TanStack Query v5 best practices
 */
export function useUserService() {
  const utils = api.useUtils();
  const notificationDispatcher = useNotificationDispatcher();

  // QUERIES
  function useUser() {
    return api.user.get.useQuery(undefined, {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: (failureCount, error) => {
        return failureCount < 2 && !error.message.includes('UNAUTHORIZED');
      },
    });
  }

  // MUTATIONS
  function useCreateUser() {
    return api.user.create.useMutation({
      onSuccess: (_createdUser, variables) => {
        // Invalidate user queries
        utils.user.get.invalidate();

        notificationDispatcher.show({
          message: `Account for ${variables.email} has been created successfully`,
          type: 'success',
        });
      },
      onError: (error, variables) => {
        notificationDispatcher.show({
          message: `Failed to create account for ${variables.email}: ${error.message}`,
          type: 'error',
        });
      },
    });
  }

  function useUpdateUser() {
    return api.user.update.useMutation({
      onSuccess: (_updatedUser, _variables) => {
        // Invalidate user queries
        utils.user.get.invalidate();

        notificationDispatcher.show({
          message: 'Your profile has been updated successfully',
          type: 'success',
        });
      },
      onError: (error, _variables) => {
        notificationDispatcher.show({
          message: `Failed to update profile: ${error.message}`,
          type: 'error',
        });
      },
    });
  }

  // Convenience function to get all mutations at once
  function useMutations() {
    return {
      createUser: useCreateUser(),
      updateUser: useUpdateUser(),
    };
  }

  return {
    // Modern Query Hooks
    useUser,

    // All mutations in one convenient hook
    useMutations,

    // Utils for manual cache management if needed
    utils: utils.user,
  };
}
