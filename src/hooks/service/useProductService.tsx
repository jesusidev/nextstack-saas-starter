import type { z } from 'zod';
import { useNotificationDispatcher, useProductDispatcher } from '~/events';
import { useAnalytics } from '~/hooks/analytics/useAnalytics';
import type { Product, productQueryInput } from '~/types/product';
import { getPermissionErrorInfo, getSuccessToastInfo } from '~/utils/errorHandling';
import { api } from '~/utils/trpc';

/**
 * Modern Product Service Hook following TRPC v11 and TanStack Query v5 best practices
 *
 * Key improvements:
 * - Direct TRPC hook usage instead of unnecessary abstraction
 * - Proper optimistic updates using invalidateQueries
 * - Consistent error handling and notifications
 * - Better TypeScript integration
 * - Simplified API surface
 */
export function useProductService() {
  const utils = api.useUtils();
  const productDispatcher = useProductDispatcher();
  const notificationDispatcher = useNotificationDispatcher();
  const analytics = useAnalytics();

  // QUERIES
  /**
   * Consolidated hook for all product list queries
   * Handles: all products, filtered products, project products, public/private products
   *
   * @param params - Query parameters
   * @param params.show - Filter type ('all' for all products)
   * @param params.projectId - Filter by project ID
   * @param params.isPublic - Whether to fetch public products (default: false)
   */
  function useProducts(params?: z.infer<typeof productQueryInput> & { isPublic?: boolean }) {
    const result = api.product.products.useQuery(
      {
        show: params?.show,
        projectId: params?.projectId,
        isPublic: params?.isPublic ?? false,
      },
      {
        enabled: params?.projectId !== undefined || params?.projectId === undefined, // Always enabled unless explicitly disabled
        staleTime: params?.isPublic ? 1000 * 60 * 10 : 1000 * 60 * 5, // 10 min for public, 5 min for private
        retry: (failureCount, error) => {
          // Retry network errors up to 2 times, but not auth errors
          return failureCount < 2 && !error.message.includes('UNAUTHORIZED');
        },
      }
    );

    // Ensure we always return an array for list queries
    return {
      ...result,
      data: Array.isArray(result.data) ? result.data : result.data ? [result.data] : [],
    };
  }

  /**
   * Hook for fetching a single product by ID
   *
   * @param productId - The ID of the product to fetch
   */
  function useProduct(productId: string) {
    const result = api.product.products.useQuery(
      { id: productId },
      {
        enabled: !!productId,
        staleTime: 1000 * 60 * 5,
        retry: (failureCount, error) => {
          // Retry network errors up to 2 times, but not auth errors
          return failureCount < 2 && !error.message.includes('UNAUTHORIZED');
        },
      }
    );

    // For single product queries, ensure we return the product (not an array)
    return {
      ...result,
      data: Array.isArray(result.data) ? result.data[0] : result.data,
    };
  }

  // MUTATIONS - Simplified with proper optimistic updates
  function useCreateProduct() {
    return api.product.create.useMutation({
      onMutate: async (newProduct) => {
        // Cancel outgoing refetches
        await utils.product.products.cancel();

        // Snapshot previous value for rollback
        const previousProducts = utils.product.products.getData(
          newProduct.projectId ? { projectId: newProduct.projectId } : undefined
        );

        // Optimistically update to the new value
        const optimisticProduct: Product = {
          id: `temp-${Date.now()}`,
          name: newProduct.name ?? 'New Product',
          brand: newProduct.brand ?? null,
          sku: newProduct.sku ?? null,
          description: newProduct.description ?? null,
          status: (newProduct.status ?? 'ACTIVE') as 'ACTIVE' | 'INACTIVE',
          isFavorite: newProduct.isFavorite ?? false,
          createdAt: new Date(),
          updatedAt: new Date(),
          userId: 'temp',
          storeId: 'temp',
          projectId: newProduct.projectId ?? null,
          remaining: {
            id: 'temp',
            quantity: newProduct.quantity ?? 0,
            productId: 'temp',
          },
          user: {
            id: 'temp',
            firstName: 'Loading',
            lastName: '...',
          },
          categories: [],
          favoriteProducts: [],
          images: newProduct.imageUrls ?? [],
        };

        utils.product.products.setData(
          newProduct.projectId ? { projectId: newProduct.projectId } : undefined,
          (old) => (Array.isArray(old) ? [optimisticProduct, ...old] : [optimisticProduct])
        );

        return { previousProducts, optimisticProduct };
      },
      onSuccess: (createdProduct, _variables) => {
        // Invalidate and refetch
        void utils.product.products.invalidate();

        // Dispatch product created event
        if (createdProduct?.userId) {
          productDispatcher.productCreated({
            productId: createdProduct.id,
            productName: createdProduct.name,
            categoryId: createdProduct.categories?.[0]?.categoryId,
            userId: createdProduct.userId,
          });

          // Track analytics for product creation
          analytics.trackUserAction({
            action: 'create_product',
            category: 'product_management',
            label: createdProduct.name,
          });
        }

        // Show success notification via events
        if (createdProduct) {
          notificationDispatcher.productAction({
            action: 'created',
            productName: createdProduct.name,
            type: 'success',
          });
        }
      },
      onError: (error, variables, context) => {
        // Rollback optimistic update
        if (context?.previousProducts) {
          utils.product.products.setData(
            variables.projectId ? { projectId: variables.projectId } : undefined,
            context.previousProducts
          );
        }

        // Show error notification via events
        notificationDispatcher.show({
          message: `Failed to create product: ${error.message}`,
          type: 'error',
        });
      },
    });
  }

  function useUpdateProduct() {
    return api.product.update.useMutation({
      onSuccess: (updatedProduct, variables) => {
        // Show success notification using dispatcher
        const successInfo = getSuccessToastInfo('updated', 'Product');
        notificationDispatcher.show(successInfo);

        // Invalidate all product queries to refresh data
        void utils.product.products.invalidate();

        // Dispatch product updated event
        if (updatedProduct?.userId) {
          productDispatcher.productUpdated({
            productId: updatedProduct.id,
            productName: updatedProduct.name,
            changes: Object.keys(variables).filter((key) => key !== 'id'), // Track which fields were updated
            userId: updatedProduct.userId,
          });

          // Also dispatch favorite event if isFavorite was changed
          if ('isFavorite' in variables) {
            productDispatcher.productFavorited({
              productId: updatedProduct.id,
              productName: updatedProduct.name,
              userId: updatedProduct.userId,
              isFavorited: variables.isFavorite ?? false,
            });

            // Track analytics for favorite/unfavorite
            analytics.trackUserAction({
              action: variables.isFavorite ? 'favorite_product' : 'unfavorite_product',
              category: 'product_management',
              label: updatedProduct.name,
            });
          } else {
            // Track analytics for general product update
            analytics.trackUserAction({
              action: 'update_product',
              category: 'product_management',
              label: updatedProduct.name,
            });
          }
        }
      },
      onError: (error, _variables) => {
        // Handle permission errors using dispatcher
        const errorInfo = getPermissionErrorInfo(error, 'product');
        if (errorInfo) {
          notificationDispatcher.show(errorInfo);
        }
      },
    });
  }

  function useDeleteProduct() {
    return api.product.delete.useMutation({
      onSuccess: (deletedProduct) => {
        // Invalidate all product queries to refresh data
        void utils.product.products.invalidate();

        // Dispatch product deleted event
        if (deletedProduct?.userId) {
          productDispatcher.productDeleted({
            productId: deletedProduct.id,
            productName: deletedProduct.name,
            userId: deletedProduct.userId,
          });

          // Track analytics for product deletion
          analytics.trackUserAction({
            action: 'delete_product',
            category: 'product_management',
            label: deletedProduct.name,
          });
        }

        // Show success notification using dispatcher
        const successInfo = getSuccessToastInfo('deleted', 'Product');
        notificationDispatcher.show(successInfo);
      },
      onError: (error, _variables) => {
        // Handle permission errors using dispatcher
        const errorInfo = getPermissionErrorInfo(error, 'product');
        if (errorInfo) {
          notificationDispatcher.show(errorInfo);
        }
      },
    });
  }

  function useCreateCategory() {
    return api.product.createCategory.useMutation({
      onSuccess: (_, variables) => {
        // Invalidate all product queries to refresh data
        void utils.product.products.invalidate();

        // Show success notification via events
        notificationDispatcher.show({
          message: `Category "${variables.name}" has been added`,
          type: 'success',
        });
      },
      onError: (error, _variables) => {
        // Show error notification via events
        notificationDispatcher.show({
          message: `Failed to add category: ${error.message}`,
          type: 'error',
        });
      },
    });
  }

  // Convenience wrapper for project products - now uses the consolidated function
  function useProductsByProject(projectId: string) {
    return useProducts({ projectId, isPublic: false });
  }

  // Convenience function to get all mutations at once
  function useMutations() {
    return {
      createProduct: useCreateProduct(),
      updateProduct: useUpdateProduct(),
      deleteProduct: useDeleteProduct(),
      createCategory: useCreateCategory(),
    };
  }

  return {
    // Modern Query Hooks
    useProducts,
    useProduct,
    useProductsByProject,

    // All mutations in one convenient hook
    useMutations,

    // Utils for manual cache management if needed
    utils: utils.product,
  };
}
