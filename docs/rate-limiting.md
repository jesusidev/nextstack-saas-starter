# Rate Limiting Implementation

## Overview

Rate limiting middleware to protect file operation endpoints from abuse and excessive usage.

## Implementation Status

✅ **Middleware Created**: `src/middleware/rateLimit.ts`
✅ **Utility Wrapper**: `src/utils/withRateLimit.ts`
⏳ **Applied to Routes**: Ready for integration

## Configuration

### Default Limits

- **Upload endpoint** (`/api/files/upload`): 10 requests per minute
- **Confirm endpoint** (`/api/files/confirm`): 15 requests per minute
- **Delete endpoint** (`/api/files/delete`): 20 requests per minute

### Storage

**Current**: In-memory store (per process)
- Suitable for single-server deployments
- Automatic cleanup every 60 seconds
- No external dependencies

**Future**: Redis/Upstash for distributed systems
- Recommended for multi-server deployments
- Consistent limits across instances
- Persistent state

## Usage

### Applying Rate Limiting

To apply rate limiting to an API route:

```typescript
import { withRateLimit } from '~/utils/withRateLimit';

async function handleRequest(request: NextRequest) {
  // Your handler logic
}

export const POST = withRateLimit(handleRequest, 60 * 1000, 10);
// windowMs: 60 seconds, maxRequests: 10
```

### Custom Configuration

```typescript
import { createRateLimiter } from '~/middleware/rateLimit';

const customLimiter = createRateLimiter({
  windowMs: 5 * 60 * 1000, // 5 minutes
  maxRequests: 100,
  keyGenerator: (request) => {
    // Custom key logic (e.g., by user ID)
    return request.headers.get('x-user-id') || 'anonymous';
  },
});

export const POST = (request: NextRequest) => 
  customLimiter(request, handleRequest);
```

## Response Headers

Rate limit information is included in response headers:

```
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 7
X-RateLimit-Reset: 1699308000
```

## Error Response

When rate limit is exceeded (HTTP 429):

```json
{
  "success": false,
  "error": "Too many requests",
  "message": "Rate limit exceeded. Please try again in 60 seconds."
}
```

Headers:
```
Retry-After: 60
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1699308060
```

## Client-Side Handling

```typescript
async function uploadFile(file: File) {
  try {
    const response = await fetch('/api/files/upload', {
      method: 'POST',
      body: JSON.stringify({ ... }),
    });

    if (response.status === 429) {
      const retryAfter = response.headers.get('Retry-After');
      throw new Error(
        `Rate limit exceeded. Please try again in ${retryAfter} seconds.`
      );
    }

    return response.json();
  } catch (error) {
    // Handle rate limit error
    console.error(error);
  }
}
```

## Monitoring

### Check Rate Limit Status

Monitor rate limit hits by checking logs:

```typescript
// In rateLimit.ts, add logging:
if (requestCount > maxRequests) {
  console.warn('Rate limit exceeded', {
    key,
    requestCount,
    maxRequests,
    timestamp: new Date().toISOString(),
  });
}
```

### Metrics to Track

- Number of rate limit hits (429 responses)
- Most frequently limited IPs/users
- Time of day patterns
- Adjust limits based on legitimate usage patterns

## Upgrading to Redis

For production deployments with multiple servers:

1. **Install Upstash Redis package**:
   ```bash
   npm install @upstash/redis
   ```

2. **Create Redis store**:
   ```typescript
   import { Redis } from '@upstash/redis';
   
   const redis = new Redis({
     url: process.env.UPSTASH_REDIS_REST_URL,
     token: process.env.UPSTASH_REDIS_REST_TOKEN,
   });
   
   class RedisRateLimitStore implements RateLimitStore {
     async get(key: string): Promise<number | null> {
       return redis.get(key);
     }
     
     async increment(key: string, ttlMs: number): Promise<number> {
       const count = await redis.incr(key);
       if (count === 1) {
         await redis.expire(key, Math.ceil(ttlMs / 1000));
       }
       return count;
     }
     
     // ... other methods
   }
   ```

3. **Use Redis store**:
   ```typescript
   const redisStore = new RedisRateLimitStore();
   const limiter = createRateLimiter(config, redisStore);
   ```

## Security Considerations

1. **IP Spoofing**: Consider validating `x-forwarded-for` header
2. **DDoS Protection**: Rate limiting alone is not sufficient
3. **Per-User Limits**: Implement user-based limits for authenticated requests
4. **Burst Protection**: Consider token bucket algorithm for more flexibility

## Tuning Recommendations

### Development
- Disable or increase limits significantly
- Log all rate limit decisions
- Test with automated tools

### Staging
- Production-like limits
- Monitor for false positives
- Adjust based on load testing

### Production
- Conservative limits initially
- Monitor real usage patterns
- Adjust incrementally
- Consider different limits per endpoint

## Known Limitations

1. **Memory Store**: Not shared across server instances
2. **No Persistence**: Limits reset on server restart
3. **Basic Algorithm**: Fixed window (not sliding window)
4. **No Burst Handling**: Strict per-window limits

## Future Enhancements

- [ ] Sliding window algorithm
- [ ] Token bucket implementation  
- [ ] Per-user rate limiting (authenticated)
- [ ] Redis/Upstash integration
- [ ] Rate limit analytics dashboard
- [ ] Dynamic limit adjustment
- [ ] Whitelist/blacklist IP ranges
- [ ] Integration with Next.js middleware

## Testing

```typescript
// Test rate limiting
describe('Rate Limiting', () => {
  it('should allow requests within limit', async () => {
    for (let i = 0; i < 10; i++) {
      const response = await fetch('/api/files/upload', { ... });
      expect(response.status).toBe(200);
    }
  });
  
  it('should block requests exceeding limit', async () => {
    // Make 10 requests (at limit)
    for (let i = 0; i < 10; i++) {
      await fetch('/api/files/upload', { ... });
    }
    
    // 11th request should be rate limited
    const response = await fetch('/api/files/upload', { ... });
    expect(response.status).toBe(429);
  });
  
  it('should reset after window expires', async () => {
    // Fill the limit
    for (let i = 0; i < 10; i++) {
      await fetch('/api/files/upload', { ... });
    }
    
    // Wait for window to expire
    await new Promise(resolve => setTimeout(resolve, 61000));
    
    // Should allow again
    const response = await fetch('/api/files/upload', { ... });
    expect(response.status).toBe(200);
  });
});
```

## References

- [OWASP Rate Limiting Guide](https://cheatsheetseries.owasp.org/cheatsheets/Denial_of_Service_Cheat_Sheet.html)
- [MDN: HTTP 429 Too Many Requests](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/429)
- [Upstash Rate Limiting](https://upstash.com/docs/redis/features/ratelimiting)
