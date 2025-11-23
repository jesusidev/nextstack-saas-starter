import { useEvent } from '../hooks/use-event';
import type { ProductEventName, ProductEvents } from './product-events';

// Domain-specific hook for product events
export const useProductEvent = <T extends ProductEventName>(
  eventName: T,
  callback?: (payload: ProductEvents[T]['detail']) => void
) => {
  return useEvent(eventName, callback);
};

// Convenience hooks for specific product events
export const useProductCreated = (
  callback: (payload: {
    productId: string;
    productName: string;
    categoryId?: string;
    userId: string;
  }) => void
) => useProductEvent('product:created', callback);

export const useProductFavorited = (
  callback: (payload: {
    productId: string;
    productName: string;
    userId: string;
    isFavorited: boolean;
  }) => void
) => useProductEvent('product:favorited', callback);

export const useProductViewToggled = (
  callback: (payload: {
    viewMode: 'cards' | 'table';
    context: 'products' | 'projects';
    userId?: string;
  }) => void
) => useProductEvent('product:view-toggled', callback);

// Helper hook to dispatch product events easily
export const useProductDispatcher = () => {
  const { dispatch: productCreated } = useProductEvent('product:created');
  const { dispatch: productUpdated } = useProductEvent('product:updated');
  const { dispatch: productDeleted } = useProductEvent('product:deleted');
  const { dispatch: productFavorited } = useProductEvent('product:favorited');
  const { dispatch: viewToggled } = useProductEvent('product:view-toggled');

  return {
    productCreated: (data: {
      productId: string;
      productName: string;
      categoryId?: string;
      userId: string;
    }) => productCreated(data),

    productUpdated: (data: {
      productId: string;
      productName: string;
      changes: string[];
      userId: string;
    }) => productUpdated(data),

    productDeleted: (data: { productId: string; productName: string; userId: string }) =>
      productDeleted(data),

    productFavorited: (data: {
      productId: string;
      productName: string;
      userId: string;
      isFavorited: boolean;
    }) => productFavorited(data),

    viewToggled: (data: {
      viewMode: 'cards' | 'table';
      context: 'products' | 'projects';
      userId?: string;
    }) => viewToggled(data),
  };
};
