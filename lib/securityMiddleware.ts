import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { rateLimiter } from './rateLimiter';
import { auditLogger } from './auditLogger';

// Vercel-optimized security headers
export const addSecurityHeaders = (response: NextResponse): NextResponse => {
  // Content Security Policy - optimized for Next.js and Vercel
  response.headers.set(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://vercel.live https://unpkg.com https://cdn.jsdelivr.net",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://unpkg.com",
      "img-src 'self' data: https: https://vercel.live",
      "font-src 'self' https://fonts.gstatic.com data:",
      "connect-src 'self' https://generativelanguage.googleapis.com https://vercel.live https://fonts.googleapis.com https://unpkg.com",
      "frame-ancestors 'none'",
      "form-action 'self'",
      "base-uri 'self'",
      "object-src 'none'",
      "media-src 'self'",
      "worker-src 'self'",
    ].join('; ')
  );

  // Essential security headers
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Permissions-Policy', 
    'geolocation=(), microphone=(), camera=(), payment=(), usb=(), magnetometer=(), gyroscope=()'
  );
  
  // Remove server info
  response.headers.set('Server', '');
  response.headers.delete('X-Powered-By');
  
  return response;
};

// Request fingerprinting for Vercel Edge
export const generateFingerprint = (request: NextRequest): string => {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 
    request.headers.get('x-real-ip') || 
    'unknown';
  
  const userAgent = request.headers.get('user-agent') || 'unknown';
  const acceptLanguage = request.headers.get('accept-language') || 'unknown';
  
  return crypto
    .createHash('sha256')
    .update(`${ip}:${userAgent}:${acceptLanguage}`)
    .digest('hex')
    .substring(0, 16);
};

// Enhanced security validation for Vercel
export const validateRequest = async (request: NextRequest): Promise<{
  isValid: boolean;
  error?: string;
  fingerprint?: string;
}> => {
  const fingerprint = generateFingerprint(request);
  
  // Rate limiting check
  const rateLimitResult = rateLimiter.checkLimit(fingerprint);
  if (!rateLimitResult.allowed) {
    auditLogger.logSecurityEvent('RATE_LIMIT_EXCEEDED', {
      fingerprint,
      ip: request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown',
      userAgent: request.headers.get('user-agent'),
    });
    return {
      isValid: false,
      error: 'Rate limit exceeded. Please try again later.',
      fingerprint,
    };
  }

  // Check for suspicious patterns (simplified for Vercel)
  const userAgent = request.headers.get('user-agent') || '';
  const suspiciousPatterns = [
    /bot/i,
    /crawler/i,
    /scanner/i,
    /curl/i,
    /wget/i,
  ];
  
  const isSuspicious = suspiciousPatterns.some(pattern => pattern.test(userAgent));
  if (isSuspicious) {
    auditLogger.logSecurityEvent('SUSPICIOUS_USER_AGENT', {
      fingerprint,
      userAgent,
      ip: request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown',
    });
    
    // Stricter rate limiting for suspicious clients
    const strictRateLimitResult = rateLimiter.checkLimit(fingerprint, 2);
    if (!strictRateLimitResult.allowed) {
      return {
        isValid: false,
        error: 'Access denied for automated clients.',
        fingerprint,
      };
    }
  }

  return { isValid: true, fingerprint };
};

// Enhanced input sanitization
export const sanitizeInput = (input: unknown): string | null => {
  if (typeof input !== 'string') return null;
  
  // Remove potential malicious content with enhanced security
  const sanitized = input
    .replace(/[\x00-\x1F\x7F]/g, '') // Remove control characters
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove scripts
    .replace(/javascript:/gi, '') // Remove javascript protocol
    .replace(/vbscript:/gi, '') // Remove vbscript protocol
    .replace(/data:/gi, '') // Remove data protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .replace(/<\s*\/?\s*[a-zA-Z][\s\S]*?>/g, '') // Remove all HTML tags
    .trim();
  
  // Length validation (Vercel serverless limits)
  if (sanitized.length > 2_000_000) return null; // 2MB max for serverless
  
  // Check for potentially malicious patterns
  const maliciousPatterns = [
    /eval\(/i,
    /document\.cookie/i,
    /window\.location/i,
    /alert\(/i,
    /prompt\(/i,
    /confirm\(/i,
    /unescape\(/i,
    /escape\(/i
  ];
  
  if (maliciousPatterns.some(pattern => pattern.test(sanitized))) {
    return null;
  }
  
  return sanitized;
};

// Secure error responses
export const createSecureErrorResponse = (
  error: string,
  status: number,
  fingerprint?: string
): NextResponse => {
  const response = NextResponse.json(
    { 
      error: status === 500 ? 'Internal server error' : error,
      requestId: crypto.randomUUID(),
    },
    { status }
  );
  
  return addSecurityHeaders(response);
};

// Secure success responses
export const createSecureResponse = (
  data: unknown,
  status: number = 200
): NextResponse => {
  const response = NextResponse.json(data, { status });
  return addSecurityHeaders(response);
};