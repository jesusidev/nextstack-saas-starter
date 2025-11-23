import { type NextRequest, NextResponse } from 'next/server';

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  keyGenerator?: (request: NextRequest) => string;
}

interface RateLimitStore {
  get(key: string): Promise<number | null>;
  set(key: string, value: number, ttlMs: number): Promise<void>;
  increment(key: string, ttlMs: number): Promise<number>;
}

class MemoryRateLimitStore implements RateLimitStore {
  private store: Map<string, { count: number; expiresAt: number }> = new Map();

  async get(key: string): Promise<number | null> {
    const entry = this.store.get(key);
    if (!entry) {
      return null;
    }
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return entry.count;
  }

  async set(key: string, value: number, ttlMs: number): Promise<void> {
    this.store.set(key, {
      count: value,
      expiresAt: Date.now() + ttlMs,
    });
  }

  async increment(key: string, ttlMs: number): Promise<number> {
    const existing = await this.get(key);
    const newCount = (existing ?? 0) + 1;
    await this.set(key, newCount, ttlMs);
    return newCount;
  }

  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.expiresAt) {
        this.store.delete(key);
      }
    }
  }
}

const defaultStore = new MemoryRateLimitStore();

setInterval(() => {
  defaultStore.cleanup();
}, 60000);

function getClientIdentifier(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0]?.trim() : 'unknown';
  return ip || 'unknown';
}

export function createRateLimiter(config: RateLimitConfig, store: RateLimitStore = defaultStore) {
  const { windowMs, maxRequests, keyGenerator = getClientIdentifier } = config;

  return async function rateLimitMiddleware(
    request: NextRequest,
    handler: (request: NextRequest) => Promise<Response>
  ): Promise<Response> {
    try {
      const key = keyGenerator(request);
      const requestCount = await store.increment(key, windowMs);

      const remainingRequests = Math.max(0, maxRequests - requestCount);
      const resetTime = Date.now() + windowMs;

      if (requestCount > maxRequests) {
        return NextResponse.json(
          {
            success: false,
            error: 'Too many requests',
            message: `Rate limit exceeded. Please try again in ${Math.ceil(windowMs / 1000)} seconds.`,
          },
          {
            status: 429,
            headers: {
              'X-RateLimit-Limit': maxRequests.toString(),
              'X-RateLimit-Remaining': '0',
              'X-RateLimit-Reset': Math.ceil(resetTime / 1000).toString(),
              'Retry-After': Math.ceil(windowMs / 1000).toString(),
            },
          }
        );
      }

      const response = await handler(request);

      response.headers.set('X-RateLimit-Limit', maxRequests.toString());
      response.headers.set('X-RateLimit-Remaining', remainingRequests.toString());
      response.headers.set('X-RateLimit-Reset', Math.ceil(resetTime / 1000).toString());

      return response;
    } catch (error) {
      console.error('Rate limit error:', error);
      return handler(request);
    }
  };
}

export const uploadRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 10,
});

export const deleteRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 20,
});

export const confirmRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 15,
});
