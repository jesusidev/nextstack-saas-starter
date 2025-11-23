'use client';

import { useContext } from 'react';
import { LenisContext } from './lenis-context';

export function useLenis() {
  const context = useContext(LenisContext);
  if (!context) {
    throw new Error('useLenis must be used within LenisProvider');
  }
  return context;
}
