import { QueryClient } from '@tanstack/react-query';

/**
 * Enhanced QueryClient configuration following TanStack Query v5 best practices
 */
export const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        // Cache data for 5 minutes before considering it stale
        staleTime: 1000 * 60 * 5,

        // Keep data in cache for 10 minutes after components unmount
        gcTime: 1000 * 60 * 10, // Previously 'cacheTime' in v4

        // Retry failed requests with smart logic
        retry: (failureCount, error) => {
          // Don't retry auth errors or client errors (4xx)
          if (
            error?.message?.includes('UNAUTHORIZED') ||
            error?.message?.includes('FORBIDDEN') ||
            error?.message?.includes('NOT_FOUND')
          ) {
            return false;
          }

          // Retry network errors up to 2 times
          return failureCount < 2;
        },

        // Retry delay with exponential backoff
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),

        // Refetch on window focus only if data is stale
        refetchOnWindowFocus: true,

        // Refetch on reconnect
        refetchOnReconnect: true,

        // Don't refetch on mount if data is fresh
        refetchOnMount: true,
      },
      mutations: {
        // Network error retry for mutations (but not business logic errors)
        retry: (failureCount, error) => {
          // Only retry network errors, not business logic errors
          if (
            error?.message?.includes('fetch') ||
            error?.message?.includes('network') ||
            error?.message?.includes('timeout')
          ) {
            return failureCount < 1; // Only retry once for mutations
          }
          return false;
        },
      },
    },
  });

/**
 * Enhanced QueryClient configuration for production environments
 */
export const createProdQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        // Longer stale time in production
        staleTime: 1000 * 60 * 10, // 10 minutes

        // Longer cache time in production
        gcTime: 1000 * 60 * 30, // 30 minutes

        // More conservative retry logic
        retry: (failureCount, error) => {
          if (
            error?.message?.includes('UNAUTHORIZED') ||
            error?.message?.includes('FORBIDDEN') ||
            error?.message?.includes('NOT_FOUND')
          ) {
            return false;
          }
          return failureCount < 1; // Only retry once in production
        },

        retryDelay: (attemptIndex) => Math.min(2000 * 2 ** attemptIndex, 60000),

        // Less aggressive refetching in production
        refetchOnWindowFocus: false,
        refetchOnReconnect: true,
        refetchOnMount: false,
      },
      mutations: {
        retry: false,
      },
    },
  });

/**
 * QueryClient configuration for development with more aggressive refetching
 */
export const createDevQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        // Shorter stale time for development
        staleTime: 1000 * 30, // 30 seconds

        // Shorter cache time for development
        gcTime: 1000 * 60 * 5, // 5 minutes

        // More aggressive retry for development
        retry: (failureCount, error) => {
          if (error?.message?.includes('UNAUTHORIZED') || error?.message?.includes('FORBIDDEN')) {
            return false;
          }
          return failureCount < 3;
        },

        // Faster retry in development
        retryDelay: (attemptIndex) => Math.min(500 * 2 ** attemptIndex, 5000),

        // Aggressive refetching for development
        refetchOnWindowFocus: true,
        refetchOnReconnect: true,
        refetchOnMount: true,
      },
      mutations: {
        retry: (failureCount, error) => {
          if (error?.message?.includes('fetch') || error?.message?.includes('network')) {
            return failureCount < 2;
          }
          return false;
        },
      },
    },
  });

/**
 * Get the appropriate QueryClient based on environment
 */
export const getQueryClient = () => {
  if (process.env.NODE_ENV === 'production') {
    return createProdQueryClient();
  }

  if (process.env.NODE_ENV === 'development') {
    return createDevQueryClient();
  }

  return createQueryClient();
};
