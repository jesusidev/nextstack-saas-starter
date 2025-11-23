import { useCallback, useEffect, useRef, useState } from 'react';
import { useProductService } from './service/useProductService';

export function useDebouncedFavorite(
  productId: string,
  currentState: boolean,
  delay: number = 500
) {
  const [isProcessing, setIsProcessing] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const productService = useProductService();
  const mutations = productService.useMutations();
  const updateProduct = mutations.updateProduct;

  const toggleFavorite = useCallback(() => {
    if (isProcessing) {
      return;
    }

    setIsProcessing(true);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      updateProduct.mutate(
        { id: productId, isFavorite: !currentState },
        {
          onSettled: () => {
            setIsProcessing(false);
          },
        }
      );
    }, delay);
  }, [productId, currentState, delay, isProcessing, updateProduct]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return { toggleFavorite, isProcessing };
}
