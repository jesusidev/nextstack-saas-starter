import type { Status } from '@prisma/client';
import { useNotificationDispatcher } from '~/events';
import { api } from '~/utils/api';

type Category = {
  id: string;
  name: string;
  status: Status;
  userId: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export function useCategoryService() {
  const utils = api.useUtils();
  const notificationDispatcher = useNotificationDispatcher();

  function useCreateCategory() {
    return api.product.createCategory.useMutation({
      // Optimistic update
      onMutate: async (newCategory) => {
        // Cancel any outgoing refetches
        await utils.product.getUserCategories.cancel();

        // Snapshot the previous value
        const previousCategories = utils.product.getUserCategories.getData();

        // Optimistically update to the new value
        const optimisticCategory: Category = {
          id: `temp-${Date.now()}`, // Temporary ID
          name: newCategory.name,
          status: 'ACTIVE' as Status,
          userId: null, // Will be replaced by server response
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        utils.product.getUserCategories.setData(undefined, (old = []) => [
          ...old,
          optimisticCategory,
        ]);

        // Return a context object with the snapshotted value
        return { previousCategories, optimisticCategory };
      },

      onSuccess: (newCategory, _variables, context) => {
        // Replace the optimistic update with real data
        utils.product.getUserCategories.setData(undefined, (old = []) => {
          return (
            old?.map((category) =>
              category.id === context?.optimisticCategory.id ? newCategory : category
            ) ?? []
          );
        });

        // Invalidate related queries
        utils.product.products.invalidate();
        utils.product.getUserCategories.invalidate();

        // Show success notification
        notificationDispatcher.show({
          message: `Category "${newCategory.name}" has been created`,
          type: 'success',
        });
      },

      onError: (error, _variables, context) => {
        // Revert the optimistic update on error
        if (context?.previousCategories) {
          utils.product.getUserCategories.setData(undefined, context.previousCategories);
        }

        // Show error notification
        notificationDispatcher.show({
          message: `Failed to create category: ${error.message}`,
          type: 'error',
        });
      },

      // Always refetch after error or success to ensure consistency
      onSettled: () => {
        utils.product.getUserCategories.invalidate();
      },
    });
  }

  // Query hooks
  const useCategories = () => {
    return api.product.getUserCategories.useQuery();
  };

  // Convenience function to get mutations
  const useMutations = () => {
    return {
      createCategory: useCreateCategory(),
    };
  };

  return {
    // Query hooks
    useCategories,

    // Individual mutation hooks
    useCreateCategory,

    // All mutations in one convenient hook
    useMutations,
  };
}
