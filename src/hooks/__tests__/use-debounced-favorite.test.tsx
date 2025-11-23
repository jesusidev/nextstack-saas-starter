import { act, renderHook, waitFor } from '@testing-library/react';
import { useDebouncedFavorite } from '../use-debounced-favorite';

const mockMutate = jest.fn();
const mockUpdateProduct = {
  mutate: mockMutate,
  isPending: false,
  isSuccess: false,
  isError: false,
  data: undefined,
  error: null,
  reset: jest.fn(),
};

jest.mock('../service/useProductService', () => ({
  useProductService: () => ({
    useMutations: () => ({
      updateProduct: mockUpdateProduct,
      createProduct: {},
      deleteProduct: {},
      createCategory: {},
    }),
  }),
}));

describe('useDebouncedFavorite', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('basic functionality', () => {
    it('initializes with isProcessing false', () => {
      const { result } = renderHook(() => useDebouncedFavorite('product-1', false));

      expect(result.current.isProcessing).toBe(false);
      expect(typeof result.current.toggleFavorite).toBe('function');
    });

    it('returns stable toggleFavorite function', () => {
      const { result, rerender } = renderHook(() => useDebouncedFavorite('product-1', false));

      const firstToggle = result.current.toggleFavorite;
      rerender();
      const secondToggle = result.current.toggleFavorite;

      expect(firstToggle).toBe(secondToggle);
    });
  });

  describe('debounce behavior', () => {
    it('triggers mutation after default delay (500ms)', async () => {
      const { result } = renderHook(() => useDebouncedFavorite('product-1', false));

      act(() => {
        result.current.toggleFavorite();
      });

      expect(mockMutate).not.toHaveBeenCalled();

      act(() => {
        jest.advanceTimersByTime(500);
      });

      await waitFor(() => {
        expect(mockMutate).toHaveBeenCalledTimes(1);
        expect(mockMutate).toHaveBeenCalledWith(
          { id: 'product-1', isFavorite: true },
          expect.any(Object)
        );
      });
    });

    it('triggers mutation after custom delay', async () => {
      const { result } = renderHook(() => useDebouncedFavorite('product-1', false, 1000));

      act(() => {
        result.current.toggleFavorite();
      });

      act(() => {
        jest.advanceTimersByTime(500);
      });

      expect(mockMutate).not.toHaveBeenCalled();

      act(() => {
        jest.advanceTimersByTime(500);
      });

      await waitFor(() => {
        expect(mockMutate).toHaveBeenCalledTimes(1);
      });
    });

    it('prevents multiple mutations from rapid clicks', async () => {
      const { result } = renderHook(() => useDebouncedFavorite('product-1', false));

      act(() => {
        result.current.toggleFavorite();
        result.current.toggleFavorite();
        result.current.toggleFavorite();
      });

      act(() => {
        jest.advanceTimersByTime(500);
      });

      await waitFor(() => {
        expect(mockMutate).toHaveBeenCalledTimes(1);
      });
    });

    it('processes first click and ignores subsequent clicks while processing', async () => {
      const { result } = renderHook(() => useDebouncedFavorite('product-1', false));

      // First click sets isProcessing to true
      act(() => {
        result.current.toggleFavorite();
      });

      expect(result.current.isProcessing).toBe(true);

      // Advance time but not enough to complete
      act(() => {
        jest.advanceTimersByTime(300);
      });

      // Second click should be ignored because isProcessing is true
      act(() => {
        result.current.toggleFavorite();
      });

      // Complete the debounce delay
      act(() => {
        jest.advanceTimersByTime(200);
      });

      // Should have called mutate once (from first click)
      await waitFor(() => {
        expect(mockMutate).toHaveBeenCalledTimes(1);
      });
    });

    it('toggles favorite state correctly', async () => {
      const { result } = renderHook(() => useDebouncedFavorite('product-1', false));

      act(() => {
        result.current.toggleFavorite();
      });

      act(() => {
        jest.advanceTimersByTime(500);
      });

      await waitFor(() => {
        expect(mockMutate).toHaveBeenCalledWith(
          { id: 'product-1', isFavorite: true },
          expect.any(Object)
        );
      });

      const { result: result2 } = renderHook(() => useDebouncedFavorite('product-1', true));

      act(() => {
        result2.current.toggleFavorite();
      });

      act(() => {
        jest.advanceTimersByTime(500);
      });

      await waitFor(() => {
        expect(mockMutate).toHaveBeenCalledWith(
          { id: 'product-1', isFavorite: false },
          expect.any(Object)
        );
      });
    });
  });

  describe('processing state', () => {
    it('sets isProcessing to true on first click', () => {
      const { result } = renderHook(() => useDebouncedFavorite('product-1', false));

      act(() => {
        result.current.toggleFavorite();
      });

      expect(result.current.isProcessing).toBe(true);
    });

    it('prevents clicks while processing', async () => {
      const { result } = renderHook(() => useDebouncedFavorite('product-1', false));

      // First click
      act(() => {
        result.current.toggleFavorite();
      });

      expect(result.current.isProcessing).toBe(true);

      // Try to click again while processing (should be ignored)
      act(() => {
        result.current.toggleFavorite();
        result.current.toggleFavorite();
      });

      // Complete the debounce delay
      act(() => {
        jest.advanceTimersByTime(500);
      });

      // Should have called mutate only once (from first click)
      await waitFor(() => {
        expect(mockMutate).toHaveBeenCalledTimes(1);
      });
    });

    it('resets isProcessing after mutation settles', async () => {
      const { result } = renderHook(() => useDebouncedFavorite('product-1', false));

      act(() => {
        result.current.toggleFavorite();
      });

      expect(result.current.isProcessing).toBe(true);

      act(() => {
        jest.advanceTimersByTime(500);
      });

      await waitFor(() => {
        expect(mockMutate).toHaveBeenCalledTimes(1);
      });

      const onSettledCallback = mockMutate.mock.calls[0][1].onSettled;
      act(() => {
        onSettledCallback();
      });

      await waitFor(() => {
        expect(result.current.isProcessing).toBe(false);
      });
    });
  });

  describe('cleanup', () => {
    it('clears timeout on unmount', () => {
      const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout');
      const { result, unmount } = renderHook(() => useDebouncedFavorite('product-1', false));

      act(() => {
        result.current.toggleFavorite();
      });

      unmount();

      expect(clearTimeoutSpy).toHaveBeenCalled();
      clearTimeoutSpy.mockRestore();
    });

    it('does not fire mutation after unmount', async () => {
      const { result, unmount } = renderHook(() => useDebouncedFavorite('product-1', false));

      act(() => {
        result.current.toggleFavorite();
      });

      unmount();

      act(() => {
        jest.advanceTimersByTime(500);
      });

      expect(mockMutate).not.toHaveBeenCalled();
    });
  });

  describe('edge cases', () => {
    it('handles rapid unmount/remount gracefully', () => {
      const { unmount: unmount1 } = renderHook(() => useDebouncedFavorite('product-1', false));
      unmount1();

      const { result, unmount: unmount2 } = renderHook(() =>
        useDebouncedFavorite('product-1', false)
      );

      act(() => {
        result.current.toggleFavorite();
      });

      unmount2();

      expect(() => {
        act(() => {
          jest.advanceTimersByTime(500);
        });
      }).not.toThrow();
    });

    it('handles different product IDs independently', async () => {
      const { result: result1 } = renderHook(() => useDebouncedFavorite('product-1', false));
      const { result: result2 } = renderHook(() => useDebouncedFavorite('product-2', false));

      act(() => {
        result1.current.toggleFavorite();
        result2.current.toggleFavorite();
      });

      act(() => {
        jest.advanceTimersByTime(500);
      });

      await waitFor(() => {
        expect(mockMutate).toHaveBeenCalledTimes(2);
        expect(mockMutate).toHaveBeenCalledWith(
          { id: 'product-1', isFavorite: true },
          expect.any(Object)
        );
        expect(mockMutate).toHaveBeenCalledWith(
          { id: 'product-2', isFavorite: true },
          expect.any(Object)
        );
      });
    });
  });
});
