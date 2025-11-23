import { createContext } from 'react';

export interface CardAnimationContextValue {
  showGlow: boolean;
  showOverlay: boolean;
  currentFavoriteState: boolean;
  triggerAnimation: (isFavorite: boolean) => void;
}

export const CardAnimationContext = createContext<CardAnimationContextValue | undefined>(undefined);
