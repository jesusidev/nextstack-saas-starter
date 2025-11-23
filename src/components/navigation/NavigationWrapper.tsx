'use client';

import { useEffect, useState } from 'react';
import { NavigationPrimary } from './index';

export function NavigationWrapper() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return <NavigationPrimary />;
}
