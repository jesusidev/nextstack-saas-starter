'use client';

import { type ReactNode, useCallback, useMemo, useState } from 'react';
import { CardAnimationContext } from './card-animation-context';

interface CardAnimationProviderProps {
  children: ReactNode;
}

export function CardAnimationProvider({ children }: CardAnimationProviderProps) {
  const [showGlow, setShowGlow] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);
  const [currentFavoriteState, setCurrentFavoriteState] = useState(false);

  const triggerAnimation = useCallback((isFavorite: boolean) => {
    setCurrentFavoriteState(isFavorite);
    setShowGlow(true);
    setShowOverlay(true);
    setTimeout(() => setShowGlow(false), 800);
    setTimeout(() => setShowOverlay(false), 1500);
  }, []);

  const value = useMemo(
    () => ({
      showGlow,
      showOverlay,
      currentFavoriteState,
      triggerAnimation,
    }),
    [showGlow, showOverlay, currentFavoriteState, triggerAnimation]
  );

  return <CardAnimationContext.Provider value={value}>{children}</CardAnimationContext.Provider>;
}
