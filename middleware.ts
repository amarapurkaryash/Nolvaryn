import { NextRequest, NextResponse } from 'next/server';

// Vercel Edge-compatible security headers
export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  
  // Security headers for Edge Runtime
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Permissions-Policy', 
    'geolocation=(), microphone=(), camera=(), payment=(), usb=(), magnetometer=(), gyroscope=()'
  );
  response.headers.set('Server', '');
  response.headers.delete('X-Powered-By');

  // CORS Configuration
  response.headers.set('Access-Control-Allow-Origin', process.env.NEXT_PUBLIC_DOMAIN || 'https://nolvaryn.com');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-csrf-token');
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  
  // Content Security Policy - Strengthened
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
  
  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
