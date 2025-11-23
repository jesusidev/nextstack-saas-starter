import { act, renderHook } from '@testing-library/react';
import { useScrollDepth } from '../use-scroll-depth';

describe('useScrollDepth', () => {
  const mockOnThresholdReached = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    sessionStorage.clear();

    // Mock window scroll properties
    Object.defineProperty(window, 'scrollY', {
      writable: true,
      configurable: true,
      value: 0,
    });

    Object.defineProperty(document.documentElement, 'scrollHeight', {
      writable: true,
      configurable: true,
      value: 2000,
    });

    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 800,
    });
  });

  describe('initialization', () => {
    it('should initialize with 0 scroll depth', () => {
      const { result } = renderHook(() =>
        useScrollDepth({
          threshold: 40,
          onThresholdReached: mockOnThresholdReached,
        })
      );

      expect(result.current.scrollDepth).toBe(0);
      expect(result.current.hasReachedThreshold).toBe(false);
    });

    it('should check session storage on initialization', () => {
      sessionStorage.setItem('test-key', 'true');

      const { result } = renderHook(() =>
        useScrollDepth({
          threshold: 40,
          onThresholdReached: mockOnThresholdReached,
          sessionKey: 'test-key',
        })
      );

      expect(result.current.hasReachedThreshold).toBe(true);
    });
  });

  describe('scroll depth calculation', () => {
    it('should calculate scroll depth correctly', () => {
      const { result } = renderHook(() =>
        useScrollDepth({
          threshold: 40,
          onThresholdReached: mockOnThresholdReached,
        })
      );

      // Scroll to 40% - (2000 - 800) * 0.4 = 480
      act(() => {
        Object.defineProperty(window, 'scrollY', { value: 480, writable: true });
        window.dispatchEvent(new Event('scroll'));
      });

      expect(result.current.scrollDepth).toBe(40);
    });

    it('should handle zero scrollable height', () => {
      Object.defineProperty(document.documentElement, 'scrollHeight', {
        writable: true,
        configurable: true,
        value: 800,
      });

      const { result } = renderHook(() =>
        useScrollDepth({
          threshold: 40,
          onThresholdReached: mockOnThresholdReached,
        })
      );

      act(() => {
        window.dispatchEvent(new Event('scroll'));
      });

      expect(result.current.scrollDepth).toBe(0);
      expect(mockOnThresholdReached).not.toHaveBeenCalled();
    });

    it('should update scroll depth on scroll event', () => {
      const { result } = renderHook(() =>
        useScrollDepth({
          threshold: 40,
          onThresholdReached: mockOnThresholdReached,
        })
      );

      // Scroll to 20%
      act(() => {
        Object.defineProperty(window, 'scrollY', { value: 240, writable: true });
        window.dispatchEvent(new Event('scroll'));
      });

      expect(result.current.scrollDepth).toBe(20);

      // Scroll to 60%
      act(() => {
        Object.defineProperty(window, 'scrollY', { value: 720, writable: true });
        window.dispatchEvent(new Event('scroll'));
      });

      expect(result.current.scrollDepth).toBe(60);
    });
  });

  describe('threshold behavior', () => {
    it('should trigger callback when threshold is reached', () => {
      renderHook(() =>
        useScrollDepth({
          threshold: 40,
          onThresholdReached: mockOnThresholdReached,
        })
      );

      act(() => {
        Object.defineProperty(window, 'scrollY', { value: 480, writable: true });
        window.dispatchEvent(new Event('scroll'));
      });

      expect(mockOnThresholdReached).toHaveBeenCalledTimes(1);
    });

    it('should only trigger callback once', () => {
      renderHook(() =>
        useScrollDepth({
          threshold: 40,
          onThresholdReached: mockOnThresholdReached,
          sessionKey: 'test-key',
        })
      );

      // Reach threshold
      act(() => {
        Object.defineProperty(window, 'scrollY', { value: 480, writable: true });
        window.dispatchEvent(new Event('scroll'));
      });

      expect(mockOnThresholdReached).toHaveBeenCalledTimes(1);

      // Scroll again
      act(() => {
        Object.defineProperty(window, 'scrollY', { value: 600, writable: true });
        window.dispatchEvent(new Event('scroll'));
      });

      expect(mockOnThresholdReached).toHaveBeenCalledTimes(1);
    });

    it('should not trigger if already triggered in session', () => {
      sessionStorage.setItem('test-key', 'true');

      renderHook(() =>
        useScrollDepth({
          threshold: 40,
          onThresholdReached: mockOnThresholdReached,
          sessionKey: 'test-key',
        })
      );

      act(() => {
        Object.defineProperty(window, 'scrollY', { value: 480, writable: true });
        window.dispatchEvent(new Event('scroll'));
      });

      expect(mockOnThresholdReached).not.toHaveBeenCalled();
    });

    it('should set session storage when threshold reached', () => {
      renderHook(() =>
        useScrollDepth({
          threshold: 40,
          onThresholdReached: mockOnThresholdReached,
          sessionKey: 'test-key',
        })
      );

      act(() => {
        Object.defineProperty(window, 'scrollY', { value: 480, writable: true });
        window.dispatchEvent(new Event('scroll'));
      });

      expect(sessionStorage.getItem('test-key')).toBe('true');
    });
  });

  describe('enabled flag', () => {
    it('should not trigger when disabled', () => {
      renderHook(() =>
        useScrollDepth({
          threshold: 40,
          onThresholdReached: mockOnThresholdReached,
          enabled: false,
        })
      );

      act(() => {
        Object.defineProperty(window, 'scrollY', { value: 480, writable: true });
        window.dispatchEvent(new Event('scroll'));
      });

      expect(mockOnThresholdReached).not.toHaveBeenCalled();
    });

    it('should not update scroll depth when disabled', () => {
      const { result } = renderHook(() =>
        useScrollDepth({
          threshold: 40,
          onThresholdReached: mockOnThresholdReached,
          enabled: false,
        })
      );

      act(() => {
        Object.defineProperty(window, 'scrollY', { value: 480, writable: true });
        window.dispatchEvent(new Event('scroll'));
      });

      expect(result.current.scrollDepth).toBe(0);
    });
  });

  describe('cleanup', () => {
    it('should remove event listener on unmount', () => {
      const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');

      const { unmount } = renderHook(() =>
        useScrollDepth({
          threshold: 40,
          onThresholdReached: mockOnThresholdReached,
        })
      );

      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith('scroll', expect.any(Function));

      removeEventListenerSpy.mockRestore();
    });
  });
});
