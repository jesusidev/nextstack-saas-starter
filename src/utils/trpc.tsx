'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { loggerLink, unstable_httpBatchStreamLink } from '@trpc/client';
import { createTRPCReact } from '@trpc/react-query';
import type { inferRouterInputs, inferRouterOutputs } from '@trpc/server';
import { useState } from 'react';
import superjson from 'superjson';

import type { AppRouter } from '~/server/api/root';
import { getQueryClient } from './queryClient';

let clientQueryClientSingleton: ReturnType<typeof getQueryClient> | undefined;
const getClientQueryClient = () => {
  if (typeof window === 'undefined') {
    // Server: always make a new query client
    return getQueryClient();
  } else {
    // Browser: use singleton pattern to keep the same query client
    if (!clientQueryClientSingleton) {
      clientQueryClientSingleton = getQueryClient();
    }
    return clientQueryClientSingleton;
  }
};

export const api = createTRPCReact<AppRouter>();

/**
 * Inference helper for inputs.
 *
 * @example type HelloInput = RouterInputs['example']['hello']
 */
export type RouterInputs = inferRouterInputs<AppRouter>;

/**
 * Inference helper for outputs.
 *
 * @example type HelloOutput = RouterOutputs['example']['hello']
 */
export type RouterOutputs = inferRouterOutputs<AppRouter>;

export function TRPCReactProvider(props: { children: React.ReactNode; showDevtools?: boolean }) {
  const queryClient = getClientQueryClient();

  const [trpcClient] = useState(() =>
    api.createClient({
      links: [
        loggerLink({
          enabled: (op) => op.direction === 'down' && op.result instanceof Error,
        }),
        unstable_httpBatchStreamLink({
          transformer: superjson,
          url: `${getBaseUrl()}/api/trpc`,
          headers: () => {
            const headers = new Headers();
            headers.set('x-trpc-source', 'nextjs-react');
            return headers;
          },
          // Enhanced error handling
          fetch: (url, options) => {
            return fetch(url, {
              ...options,
              // Add timeout to prevent hanging requests
              signal: AbortSignal.timeout(30000), // 30 seconds
            }).catch((error) => {
              // Enhanced error handling for network issues
              if (error.name === 'TimeoutError') {
                throw new Error('Request timeout - please try again');
              }
              if (error.name === 'TypeError' && error.message.includes('fetch')) {
                throw new Error('Network error - please check your connection');
              }
              throw error;
            });
          },
        }),
      ],
    })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <api.Provider client={trpcClient} queryClient={queryClient}>
        {props.children}
        {/* Show React Query Devtools in development */}
        {(props.showDevtools || process.env.NODE_ENV === 'development') && (
          <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-right" />
        )}
      </api.Provider>
    </QueryClientProvider>
  );
}

function getBaseUrl() {
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return `http://localhost:${process.env.PORT ?? 3000}`;
}
