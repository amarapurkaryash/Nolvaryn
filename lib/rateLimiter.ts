// Serverless rate limiting for Vercel Edge Functions
interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// In-memory store (works for Vercel serverless)
const rateLimitStore = new Map<string, RateLimitEntry>();

export const rateLimiter = {
  checkLimit: (fingerprint: string, maxRequests: number = 10): {
    allowed: boolean;
    remaining: number;
    resetTime: number;
  } => {
    const now = Date.now();
    const windowMs = 15 * 60 * 1000; // 15 minutes
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