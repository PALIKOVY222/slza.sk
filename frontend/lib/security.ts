// Security utilities for API routes
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// Rate limiting store (in-memory, consider Redis for production)
const requestStore = new Map<string, { count: number; resetTime: number }>();

export interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Max requests per window
}

/**
 * Rate limiter middleware
 * Prevents brute force attacks and API abuse
 */
export function rateLimit(config: RateLimitConfig = { windowMs: 60000, maxRequests: 10 }) {
  return (req: NextRequest): { limited: boolean; response?: NextResponse } => {
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    const key = `${ip}:${req.nextUrl.pathname}`;
    const now = Date.now();

    const record = requestStore.get(key);

    if (!record || now > record.resetTime) {
      requestStore.set(key, {
        count: 1,
        resetTime: now + config.windowMs
      });
      return { limited: false };
    }

    if (record.count >= config.maxRequests) {
      return {
        limited: true,
        response: NextResponse.json(
          { error: 'Príliš veľa požiadaviek. Skúste neskôr.' },
          { status: 429 }
        )
      };
    }

    record.count++;
    return { limited: false };
  };
}

/**
 * Clean up old rate limit records (call periodically)
 */
export function cleanupRateLimits() {
  const now = Date.now();
  for (const [key, record] of requestStore.entries()) {
    if (now > record.resetTime) {
      requestStore.delete(key);
    }
  }
}

// Run cleanup every 5 minutes
if (typeof window === 'undefined') {
  setInterval(cleanupRateLimits, 5 * 60 * 1000);
}

/**
 * Input sanitization - prevents XSS and injection attacks
 */
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') return '';
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove < and > to prevent HTML injection
    .slice(0, 10000); // Limit length
}

/**
 * Validate email format
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 320;
}

/**
 * Validate phone number (SK format)
 */
export function validatePhone(phone: string): boolean {
  // Remove spaces and common separators
  const cleaned = phone.replace(/[\s\-()]/g, '');
  // Slovak phone: +421 or 0 followed by 9 digits
  const phoneRegex = /^(\+421|0)[0-9]{9}$/;
  return phoneRegex.test(cleaned);
}

/**
 * Generate CSRF token
 */
export function generateCSRFToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Verify CSRF token
 */
export function verifyCSRFToken(token: string | null, sessionToken: string | null): boolean {
  if (!token || !sessionToken) return false;
  return token === sessionToken;
}

/**
 * Hash sensitive data (for logging without exposing actual values)
 */
export function hashSensitiveData(data: string): string {
  return crypto.createHash('sha256').update(data).digest('hex').slice(0, 16);
}

/**
 * Validate session token from Authorization header
 */
export function getSessionToken(req: NextRequest): string | null {
  const authHeader = req.headers.get('authorization');
  if (!authHeader) return null;
  
  const match = authHeader.match(/^Bearer\s+(.+)$/);
  return match ? match[1] : null;
}

/**
 * Security headers middleware
 */
export function addSecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://widget.packeta.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://api.stripe.com https://widget.packeta.com"
  );
  
  return response;
}

/**
 * Check if request is authenticated (for admin routes)
 */
export async function isAuthenticated(req: NextRequest): Promise<{ authenticated: boolean; userId?: string }> {
  const token = getSessionToken(req);
  if (!token) return { authenticated: false };

  try {
    // In production, verify token against database
    // For now, basic token validation
    if (token.length < 32) return { authenticated: false };
    
    return { authenticated: true, userId: 'user-id' };
  } catch (error) {
    return { authenticated: false };
  }
}

/**
 * Obfuscate pricing source references
 */
export function sanitizePricingData(data: any): any {
  if (typeof data === 'string') {
    return data
      .replace(/typocon/gi, 'source')
      .replace(/anwell/gi, 'provider')
      .replace(/plotbase/gi, 'vendor');
  }
  
  if (Array.isArray(data)) {
    return data.map(sanitizePricingData);
  }
  
  if (typeof data === 'object' && data !== null) {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(data)) {
      const sanitizedKey = key
        .replace(/typocon/gi, 'source')
        .replace(/anwell/gi, 'provider')
        .replace(/plotbase/gi, 'vendor');
      sanitized[sanitizedKey] = sanitizePricingData(value);
    }
    return sanitized;
  }
  
  return data;
}

/**
 * Validate file upload
 */
export function validateFileUpload(file: { name: string; size: number; type?: string }): { valid: boolean; error?: string } {
  // Max 50MB
  if (file.size > 50 * 1024 * 1024) {
    return { valid: false, error: 'Súbor je príliš veľký (max 50MB)' };
  }
  
  // Allowed extensions
  const allowedExtensions = ['.pdf', '.jpg', '.jpeg', '.png', '.ai', '.eps', '.psd', '.svg'];
  const ext = file.name.toLowerCase().match(/\.[^.]+$/)?.[0];
  
  if (!ext || !allowedExtensions.includes(ext)) {
    return { valid: false, error: 'Nepovolený typ súboru' };
  }
  
  return { valid: true };
}
