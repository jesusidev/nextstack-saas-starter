'use client';

import Lenis from 'lenis';
import { type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { LenisContext } from './lenis-context';

interface LenisProviderProps {
  children: ReactNode;
  duration?: number;
  easing?: (t: number) => number;
  lerp?: number;
  orientation?: 'vertical' | 'horizontal';
  gestureOrientation?: 'vertical' | 'horizontal' | 'both';
  smoothWheel?: boolean;
  syncTouch?: boolean;
  touchMultiplier?: number;
}

export function LenisProvider({
  children,
  duration = 1.2,
  easing = (t) => Math.min(1, 1.001 - 2 ** (-10 * t)),
  lerp = 0.1,
  orientation = 'vertical',
  gestureOrientation = 'vertical',
  smoothWheel = true,
  syncTouch = false,
  touchMultiplier = 1,
}: LenisProviderProps) {
  const [lenis, setLenis] = useState<Lenis | null>(null);
  const rafRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    const lenisInstance = new Lenis({
      duration,
      easing,
      lerp,
      orientation,
      gestureOrientation,
      smoothWheel,
      syncTouch,
      touchMultiplier,
    });

    setLenis(lenisInstance);

    function raf(time: number) {
      lenisInstance.raf(time);
      rafRef.current = requestAnimationFrame(raf);
    }

    rafRef.current = requestAnimationFrame(raf);

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      lenisInstance.destroy();
    };
  }, [
    duration,
    easing,
    lerp,
    orientation,
    gestureOrientation,
    smoothWheel,
    syncTouch,
    touchMultiplier,
  ]);

  const scrollTo = useCallback(
    (
      target: string | number | HTMLElement,
      options?: {
        offset?: number;
        duration?: number;
        immediate?: boolean;
        lock?: boolean;
        onComplete?: () => void;
      }
    ) => {
      lenis?.scrollTo(target, options);
    },
    [lenis]
  );

  const value = useMemo(
    () => ({
      lenis,
      scrollTo,
    }),
    [lenis, scrollTo]
  );

  return <LenisContext.Provider value={value}>{children}</LenisContext.Provider>;
}
