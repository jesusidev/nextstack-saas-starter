import type { NextRequest } from 'next/server';
import { createRateLimiter } from '~/middleware/rateLimit';

export function withRateLimit(
  handler: (request: NextRequest) => Promise<Response>,
  windowMs: number = 60 * 1000,
  maxRequests: number = 10
) {
  const rateLimiter = createRateLimiter({ windowMs, maxRequests });

  return async (request: NextRequest): Promise<Response> => rateLimiter(request, handler);
}
