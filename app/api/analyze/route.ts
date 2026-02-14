import { NextRequest } from 'next/server';
import crypto from 'crypto';
import { analyzeEmailServer } from '../../../services/analyzeEmailServer';
import { 
  validateRequest, 
  sanitizeInput, 
  createSecureResponse, 
  createSecureErrorResponse,
  addSecurityHeaders 
} from '../../../lib/securityMiddleware';
import { 
  validateApiKeyFormat,
  hashForLogging,
  generateSecureToken,
  validateCsrfToken
} from '../../../lib/security';
import { auditLogger } from '../../../lib/auditLogger';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const requestId = generateSecureToken();
  let validation: any = null;
  
  try {
    // Validate Content-Type
    const contentType = request.headers.get('content-type');
    if (!contentType?.includes('application/json')) {
      const fingerprint = crypto.createHash('sha256')
        .update(`${request.headers.get('x-forwarded-for') || 'unknown'}:${request.headers.get('user-agent') || 'unknown'}`)
        .digest('hex')
        .substring(0, 16);
        
      auditLogger.logSecurityEvent('INVALID_CONTENT_TYPE', {
        requestId,
        contentType,
        ip: request.headers.get('x-forwarded-for') || 'unknown',
        fingerprint,
      }, 'ERROR');
      return createSecureErrorResponse('Invalid request format', 415, fingerprint);
    }

    // Validate CSRF token
    if (!validateCsrfToken(request)) {
      const fingerprint = crypto.createHash('sha256')
        .update(`${request.headers.get('x-forwarded-for') || 'unknown'}:${request.headers.get('user-agent') || 'unknown'}`)
        .digest('hex')
        .substring(0, 16);
        
      auditLogger.logSecurityEvent('CSRF_VALIDATION_FAILED', {
        requestId,
        fingerprint,
        ip: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
      }, 'ERROR');
      return createSecureErrorResponse('Invalid security token', 403, fingerprint);
    }

    // Validate request security
    validation = await validateRequest(request);
    if (!validation.isValid) {
      auditLogger.logSecurityEvent('SECURITY_VALIDATION_FAILED', {
        requestId,
        error: validation.error,
        fingerprint: validation.fingerprint,
      }, 'ERROR');
      return createSecureErrorResponse(validation.error!, 403, validation.fingerprint);
    }

    // Parse and validate request body
    let body;
    try {
      const bodyText = await request.text();
      if (!bodyText.trim()) {
        return createSecureErrorResponse('Request body cannot be empty', 400, validation.fingerprint);
      }
      body = JSON.parse(bodyText);
    } catch (parseError) {
      auditLogger.logSecurityEvent('INVALID_JSON', {
        requestId,
        fingerprint: validation.fingerprint,
      }, 'WARN');
      return createSecureErrorResponse('Invalid JSON in request body', 400, validation.fingerprint);
    }

    // Sanitize and validate inputs
    const emlContent = sanitizeInput(body?.emlContent);
    const apiKey = sanitizeInput(body?.apiKey);

    if (!emlContent) {
      auditLogger.logSecurityEvent('MISSING_EML_CONTENT', {
        requestId,
        fingerprint: validation.fingerprint,
      }, 'WARN');
      return createSecureErrorResponse('Valid emlContent is required', 400, validation.fingerprint);
    }

    if (!apiKey) {
      auditLogger.logSecurityEvent('MISSING_API_KEY', {
        requestId,
        fingerprint: validation.fingerprint,
      }, 'WARN');
      return createSecureErrorResponse('Valid apiKey is required', 400, validation.fingerprint);
    }

    // Validate API key format
    if (!validateApiKeyFormat(apiKey)) {
      auditLogger.logSecurityEvent('INVALID_API_KEY_FORMAT', {
        requestId,
        fingerprint: validation.fingerprint,
        keyHash: hashForLogging(apiKey),
      }, 'ERROR');
      return createSecureErrorResponse('Invalid API key format', 400, validation.fingerprint);
    }

    auditLogger.logApiRequest('API_REQUEST', {
      requestId,
      fingerprint: validation.fingerprint,
      keyHash: hashForLogging(apiKey),
      emlSize: emlContent.length,
    });

    // Validate EML content
    if (!emlContent.toLowerCase().includes('from:') || 
        !emlContent.toLowerCase().includes('to:')) {
      auditLogger.logSecurityEvent('INVALID_EML_FORMAT', {
        requestId,
        fingerprint: validation.fingerprint,
        emlSize: emlContent.length,
      }, 'WARN');
      return createSecureErrorResponse('Invalid EML file format', 400, validation.fingerprint);
    }

    // Perform analysis
    const result = await analyzeEmailServer(emlContent, apiKey);
    
    auditLogger.logApiRequest('ANALYSIS_COMPLETED', {
      requestId,
      fingerprint: validation.fingerprint,
      emlSize: emlContent.length,
      hasIndicators: !!result.indicators,
      riskLevel: result.riskLevel,
    });

    return createSecureResponse({
      ...result,
      requestId,
      timestamp: new Date().toISOString(),
      analysisTime: result.analysisTime || 0, // Include timing in response
    });

  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unknown error occurred.';
    
    auditLogger.logSecurityEvent('ANALYSIS_ERROR', {
      requestId,
      fingerprint: validation?.fingerprint,
      error: message,
      stack: error instanceof Error ? error.stack : undefined,
    }, 'ERROR');

    // Prevent information leakage - return generic error message
    return createSecureErrorResponse('Analysis failed. Please try again later.', 500, validation?.fingerprint);
  }
}

// Handle OPTIONS requests for CORS
export async function OPTIONS(request: NextRequest) {
  const response = new Response(null, { status: 200 });
  return addSecurityHeaders(response as any);
}