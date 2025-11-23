'use client';

import { useCallback } from 'react';
import { useLenis } from '~/state/lenis';

interface ScrollToOptions {
  offset?: number;
  duration?: number;
  immediate?: boolean;
  lock?: boolean;
  onComplete?: () => void;
}

export function useLenisScroll() {
  const { lenis, scrollTo } = useLenis();

  const scrollToTop = useCallback(
    (options?: ScrollToOptions) => {
      if (!lenis) {
        return;
      }

      scrollTo(0, {
        offset: options?.offset ?? 0,
        duration: options?.duration,
        immediate: options?.immediate ?? false,
        lock: options?.lock ?? false,
        onComplete: options?.onComplete,
      });
    },
    [lenis, scrollTo]
  );

  const scrollToElement = useCallback(
    (selector: string, options?: ScrollToOptions) => {
      if (!lenis) {
        return;
      }

      const element = document.querySelector(selector);
      if (!element) {
        console.warn(`useLenisScroll: Element not found: ${selector}`);
        return;
      }

      scrollTo(element as HTMLElement, {
        offset: options?.offset ?? 0,
        duration: options?.duration,
        immediate: options?.immediate ?? false,
        lock: options?.lock ?? false,
        onComplete: options?.onComplete,
      });
    },
    [lenis, scrollTo]
  );

  const scrollToPosition = useCallback(
    (position: number, options?: ScrollToOptions) => {
      if (!lenis) {
        return;
      }

      scrollTo(position, {
        offset: options?.offset ?? 0,
        duration: options?.duration,
        immediate: options?.immediate ?? false,
        lock: options?.lock ?? false,
        onComplete: options?.onComplete,
      });
    },
    [lenis, scrollTo]
  );

  return {
    scrollToTop,
    scrollToElement,
    scrollToPosition,
    lenis,
  };
}
