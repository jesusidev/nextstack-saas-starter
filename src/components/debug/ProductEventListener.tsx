'use client';

import { useEffect } from 'react';
import {
  useProductCreated,
  useProductEvent,
  useProductFavorited,
  useProductViewToggled,
} from '~/events';

export function ProductEventListener() {
  // Listen to available product events using the dedicated hooks
  useProductViewToggled((data) => {
    console.log('🔄 Product View Toggled:', data);
  });

  useProductCreated((data) => {
    console.log('✅ Product Created:', data);
  });

  useProductFavorited((data) => {
    console.log('⭐ Product Favorited:', data);
  });

  // Use the generic hook for events that don't have convenience hooks
  useProductEvent('product:updated', (data) => {
    console.log('� Product Updated:', data);
  });

  useProductEvent('product:deleted', (data) => {
    console.log('🗑️ Product Deleted:', data);
  });

  useEffect(() => {
    console.log('👂 ProductEventListener: Listening for all product events');
  }, []);

  return null;
}
