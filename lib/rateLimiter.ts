// Serverless rate limiting for Vercel Edge Functions
interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// In-memory store (works for Vercel serverless)
const rateLimitStore = new Map<string, RateLimitEntry>();

// Get rate limit configuration from environment variables with fallbacks
const RATE_LIMIT_WINDOW_MS = Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000; // Default: 15 minutes
const RATE_LIMIT_MAX_REQUESTS = Number(process.env.RATE_LIMIT_MAX_REQUESTS) || 10; // Default: 10 requests

export const rateLimiter = {
  checkLimit: (fingerprint: string, maxRequests: number = RATE_LIMIT_MAX_REQUESTS): {
    allowed: boolean;
    remaining: number;
    resetTime: number;
  } => {
    const now = Date.now();
    const windowMs = RATE_LIMIT_WINDOW_MS;
    const entry = rateLimitStore.get(fingerprint);
    
    if (!entry || now > entry.resetTime) {
      // New window
      rateLimitStore.set(fingerprint, {
        count: 1,
        resetTime: now + windowMs,
      });
      return {
        allowed: true,
        remaining: maxRequests - 1,
        resetTime: now + windowMs,
      };
    }
    
    if (entry.count >= maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.resetTime,
      };
    }
    
    entry.count++;
    return {
      allowed: true,
      remaining: maxRequests - entry.count,
      resetTime: entry.resetTime,
    };
  },
  
  // Cleanup function (optional, called periodically)
  cleanup: () => {
    const now = Date.now();
    for (const [key, entry] of rateLimitStore.entries()) {
      if (now > entry.resetTime) {
        rateLimitStore.delete(key);
      }
    }
  }
};