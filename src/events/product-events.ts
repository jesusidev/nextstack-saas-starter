// Product-specific event definitions tailored for NextStack SaaS Starter
import type { AppEvent } from './types';
export interface ProductEvents {
  'product:created': AppEvent<{
    productId: string;
    productName: string;
    categoryId?: string;
    userId: string;
  }>;
  'product:updated': AppEvent<{
    productId: string;
    productName: string;
    changes: string[];
    userId: string;
  }>;
  'product:deleted': AppEvent<{
    productId: string;
    productName: string;
    userId: string;
  }>;
  'product:favorited': AppEvent<{
    productId: string;
    productName: string;
    userId: string;
    isFavorited: boolean;
  }>;
  'product:view-toggled': AppEvent<{
    viewMode: 'cards' | 'table';
    context: 'products' | 'projects';
    userId?: string;
  }>;
  'product:search': AppEvent<{
    query: string;
    resultCount: number;
    userId?: string;
  }>;
  'product:filtered': AppEvent<{
    filters: Record<string, unknown>;
    resultCount: number;
    userId?: string;
  }>;
}

// Type-safe product event names
export type ProductEventName = keyof ProductEvents;
