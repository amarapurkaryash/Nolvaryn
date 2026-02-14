import { NextRequest, NextResponse } from 'next/server';
import { generateCsrfToken } from '../../../lib/security';
import { addSecurityHeaders } from '../../../lib/securityMiddleware';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const csrfToken = generateCsrfToken();
  
  // Create response
  const response = NextResponse.json({ 
    success: true,
    csrfToken
  });

  // Set secure CSRF cookie
  response.cookies.set('csrf-token', csrfToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 // 24 hours
  });

  return addSecurityHeaders(response);
}

// Handle OPTIONS requests for CORS
export async function OPTIONS(request: NextRequest) {
  const response = new Response(null, { status: 200 });
  return addSecurityHeaders(response as any);
}
