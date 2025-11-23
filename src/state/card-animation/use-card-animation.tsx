import { useContext } from 'react';
import { CardAnimationContext } from './card-animation-context';

export function useCardAnimation() {
  const context = useContext(CardAnimationContext);
  if (context === undefined) {
    throw new Error('useCardAnimation must be used within a CardAnimationProvider');
  }
  return context;
}
