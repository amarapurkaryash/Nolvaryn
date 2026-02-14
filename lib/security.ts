import crypto from 'crypto';

/**
 * Validates API key format (Gemini API keys)
 */
export const validateApiKeyFormat = (apiKey: string): boolean => {
  const geminiKeyPattern = /^[A-Za-z0-9_-]{39,}$/;
  return geminiKeyPattern.test(apiKey) && apiKey.length >= 39;
};

/**
 * Hashes sensitive data for logging
 */
export const hashForLogging = (data: string): string => {
  return crypto.createHash('sha256').update(data).digest('hex').substring(0, 8);
};

/**
 * Generates secure session token
 */
export const generateSecureToken = (): string => {
  return crypto.randomUUID();
};

/**
 * Generates CSRF token
 */
export const generateCsrfToken = (): string => {
  return crypto.randomBytes(32).toString('hex');
};

/**
 * Validates CSRF token
 */
export const validateCsrfToken = (request: any): boolean => {
  const csrfToken = request.headers.get('x-csrf-token');
  const cookieToken = request.cookies.get('csrf-token')?.value;

  // Both token and cookie must exist and match
  if (!csrfToken || !cookieToken) {
    return false;
  }

  // Token length validation
  if (csrfToken.length !== 64 || cookieToken.length !== 64) {
    return false;
  }

  // Token format validation (hexadecimal)
  const hexPattern = /^[0-9a-f]{64}$/i;
  if (!hexPattern.test(csrfToken) || !hexPattern.test(cookieToken)) {
    return false;
  }

  return csrfToken === cookieToken;
};
