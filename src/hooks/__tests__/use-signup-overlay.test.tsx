import { act, renderHook } from '@testing-library/react';
import { useSignUpOverlay } from '../use-signup-overlay';

describe('useSignUpOverlay', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  describe('initialization', () => {
    it('should initialize with closed state', () => {
      const { result } = renderHook(() => useSignUpOverlay());

      expect(result.current.opened).toBe(false);
      expect(result.current.triggerSource).toBeNull();
      expect(result.current.hasShownThisSession).toBe(false);
    });

    it('should check session storage on initialization', () => {
      sessionStorage.setItem('signup-overlay-shown', 'true');

      const { result } = renderHook(() => useSignUpOverlay());

      expect(result.current.hasShownThisSession).toBe(true);
    });
  });

  describe('showOverlay', () => {
    it('should open overlay with card_click trigger', () => {
      const { result } = renderHook(() => useSignUpOverlay());

      act(() => {
        result.current.showOverlay('card');
      });

      expect(result.current.opened).toBe(true);
      expect(result.current.triggerSource).toBe('card');
    });

    it('should open overlay with favorite_click trigger', () => {
      const { result } = renderHook(() => useSignUpOverlay());

      act(() => {
        result.current.showOverlay('favorite');
      });

      expect(result.current.opened).toBe(true);
      expect(result.current.triggerSource).toBe('favorite');
    });

    it('should open overlay with scroll_trigger trigger', () => {
      const { result } = renderHook(() => useSignUpOverlay());

      act(() => {
        result.current.showOverlay('scroll');
      });

      expect(result.current.opened).toBe(true);
      expect(result.current.triggerSource).toBe('scroll');
    });

    it('should not open if already shown this session', () => {
      sessionStorage.setItem('signup-overlay-shown', 'true');

      const { result } = renderHook(() => useSignUpOverlay());

      act(() => {
        result.current.showOverlay('card');
      });

      expect(result.current.opened).toBe(false);
      expect(result.current.triggerSource).toBeNull();
    });

    it('should not open after being closed in same session', () => {
      const { result } = renderHook(() => useSignUpOverlay());

      // Open and close
      act(() => {
        result.current.showOverlay('card');
      });

      act(() => {
        result.current.closeOverlay();
      });

      // Try to open again
      act(() => {
        result.current.showOverlay('favorite');
      });

      expect(result.current.opened).toBe(false);
    });
  });

  describe('closeOverlay', () => {
    it('should close the overlay', () => {
      const { result } = renderHook(() => useSignUpOverlay());

      act(() => {
        result.current.showOverlay('card');
      });

      expect(result.current.opened).toBe(true);

      act(() => {
        result.current.closeOverlay();
      });

      expect(result.current.opened).toBe(false);
    });

    it('should set session storage when closed', () => {
      const { result } = renderHook(() => useSignUpOverlay());

      act(() => {
        result.current.showOverlay('card');
      });

      act(() => {
        result.current.closeOverlay();
      });

      expect(sessionStorage.getItem('signup-overlay-shown')).toBe('true');
    });

    it('should update hasShownThisSession flag', () => {
      const { result } = renderHook(() => useSignUpOverlay());

      act(() => {
        result.current.showOverlay('card');
      });

      expect(result.current.hasShownThisSession).toBe(false);

      act(() => {
        result.current.closeOverlay();
      });

      expect(result.current.hasShownThisSession).toBe(true);
    });
  });

  describe('trigger source tracking', () => {
    it('should track different trigger sources', () => {
      const { result, rerender } = renderHook(() => useSignUpOverlay());

      act(() => {
        result.current.showOverlay('card');
      });

      expect(result.current.triggerSource).toBe('card');

      act(() => {
        result.current.closeOverlay();
      });

      // Clear session for testing
      sessionStorage.clear();
      rerender();

      act(() => {
        result.current.showOverlay('favorite');
      });

      expect(result.current.triggerSource).toBe('favorite');
    });

    it('should preserve trigger source while open', () => {
      const { result } = renderHook(() => useSignUpOverlay());

      act(() => {
        result.current.showOverlay('scroll');
      });

      expect(result.current.triggerSource).toBe('scroll');
      expect(result.current.opened).toBe(true);
    });
  });

  describe('session persistence', () => {
    it('should respect session storage across re-renders', () => {
      sessionStorage.setItem('signup-overlay-shown', 'true');

      const { result, rerender } = renderHook(() => useSignUpOverlay());

      expect(result.current.hasShownThisSession).toBe(true);

      rerender();

      expect(result.current.hasShownThisSession).toBe(true);
    });

    it('should allow reopening after clearing session storage', () => {
      const { result } = renderHook(() => useSignUpOverlay());

      act(() => {
        result.current.showOverlay('card');
      });

      act(() => {
        result.current.closeOverlay();
      });

      expect(result.current.hasShownThisSession).toBe(true);

      // Simulate clearing session storage
      sessionStorage.clear();

      // Create new instance
      const { result: result2 } = renderHook(() => useSignUpOverlay());

      act(() => {
        result2.current.showOverlay('card');
      });

      expect(result2.current.opened).toBe(true);
    });
  });
});
