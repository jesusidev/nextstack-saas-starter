'use client';

import { useEffect } from 'react';

export function ColorSchemeProvider() {
  useEffect(() => {
    // Set initial color scheme from localStorage or default to light
    const storedColorScheme = localStorage.getItem('mantine-color-scheme') || 'light';
    document.documentElement.setAttribute('data-mantine-color-scheme', storedColorScheme);
  }, []);

  return null;
}
