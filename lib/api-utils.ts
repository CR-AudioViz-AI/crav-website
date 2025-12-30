// /lib/api-utils.ts
// API Utilities - Standardized Errors, Request IDs, Rate Limiting
// CR AudioViz AI - Production Hardening

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://kteobfyferrukqeolofj.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// ============================================================================
// REQUEST ID GENERATION
// ============================================================================

/**
 * Generate unique request ID for tracing
 */
export function generateRequestId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 10);
  return `req_${timestamp}_${random}`;
}

/**
 * Get or generate request ID from headers
 */
export function getRequestId(request: NextRequest): string {
  return request.headers.get('X-Request-ID') || generateRequestId();
}

// ============================================================================
// STANDARDIZED ERROR RESPONSES
// ============================================================================

export interface APIError {
  error: string;
  code: string;
  message?: string;
  details?: any;
  requestId?: string;
  timestamp?: string;
}

export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: APIError;
  meta?: {
    requestId: string;
    timestamp: string;
    version?: string;
  };
}

// Error taxonomy
export const ERROR_CODES = {
  // 400 - Bad Request
  VALIDATION_ERROR: { status: 400, code: 'VALIDATION_ERROR' },
  INVALID_PARAMETER: { status: 400, code: 'INVALID_PARAMETER' },
  MISSING_FIELD: { status: 400, code: 'MISSING_FIELD' },
  INVALID_FORMAT: { status: 400, code: 'INVALID_FORMAT' },
  
  // 401 - Unauthorized
  UNAUTHORIZED: { status: 401, code: 'UNAUTHORIZED' },
  INVALID_TOKEN: { status: 401, code: 'INVALID_TOKEN' },
  TOKEN_EXPIRED: { status: 401, code: 'TOKEN_EXPIRED' },
  INVALID_API_KEY: { status: 401, code: 'INVALID_API_KEY' },
  
  // 403 - Forbidden
  FORBIDDEN: { status: 403, code: 'FORBIDDEN' },
  INSUFFICIENT_PERMISSIONS: { status: 403, code: 'INSUFFICIENT_PERMISSIONS' },
  RESOURCE_ACCESS_DENIED: { status: 403, code: 'RESOURCE_ACCESS_DENIED' },
  
  // 404 - Not Found
  NOT_FOUND: { status: 404, code: 'NOT_FOUND' },
  RESOURCE_NOT_FOUND: { status: 404, code: 'RESOURCE_NOT_FOUND' },
  
  // 409 - Conflict
  CONFLICT: { status: 409, code: 'CONFLICT' },
  DUPLICATE_ENTRY: { status: 409, code: 'DUPLICATE_ENTRY' },
  ALREADY_EXISTS: { status: 409, code: 'ALREADY_EXISTS' },
  
  // 422 - Unprocessable
  UNPROCESSABLE: { status: 422, code: 'UNPROCESSABLE' },
  IDEMPOTENCY_CONFLICT: { status: 422, code: 'IDEMPOTENCY_CONFLICT' },
  
  // 429 - Rate Limit
  RATE_LIMITED: { status: 429, code: 'RATE_LIMITED' },
  
  // 500 - Server Error
  INTERNAL_ERROR: { status: 500, code: 'INTERNAL_ERROR' },
  DATABASE_ERROR: { status: 500, code: 'DATABASE_ERROR' },
  EXTERNAL_SERVICE_ERROR: { status: 500, code: 'EXTERNAL_SERVICE_ERROR' }
} as const;

/**
 * Create standardized success response
 */
export function successResponse<T>(
  data: T,
  requestId: string,
  status: number = 200
): NextResponse {
  const response: APIResponse<T> = {
    success: true,
    data,
    meta: {
      requestId,
      timestamp: new Date().toISOString(),
      version: '1.0'
    }
  };

  return NextResponse.json(response, {
    status,
    headers: {
      'X-Request-ID': requestId
    }
  });
}

/**
 * Create standardized error response
 */
export function errorResponse(
  errorType: keyof typeof ERROR_CODES,
  message: string,
  requestId: string,
  details?: any
): NextResponse {
  const errorDef = ERROR_CODES[errorType];
  
  const response: APIResponse = {
    success: false,
    error: {
      error: message,
      code: errorDef.code,
      requestId,
      timestamp: new Date().toISOString(),
      details
    },
    meta: {
      requestId,
      timestamp: new Date().toISOString()
    }
  };

  // Add rate limit headers if rate limited
  const headers: Record<string, string> = {
    'X-Request-ID': requestId
  };

  if (errorType === 'RATE_LIMITED' && details?.retryAfter) {
    headers['Retry-After'] = details.retryAfter.toString();
    headers['X-RateLimit-Remaining'] = '0';
    headers['X-RateLimit-Reset'] = details.resetAt || '';
  }

  return NextResponse.json(response, {
    status: errorDef.status,
    headers
  });
}

// ============================================================================
// RATE LIMITING
// ============================================================================

interface RateLimitConfig {
  windowMs: number;      // Time window in milliseconds
  maxRequests: number;   // Max requests per window
  keyGenerator?: (req: NextRequest) => string;  // Custom key generator
}

const DEFAULT_RATE_LIMITS: Record<string, RateLimitConfig> = {
  default: { windowMs: 60000, maxRequests: 60 },      // 60/minute
  strict: { windowMs: 60000, maxRequests: 10 },       // 10/minute
  relaxed: { windowMs: 60000, maxRequests: 300 },     // 300/minute
  auth: { windowMs: 300000, maxRequests: 5 },         // 5/5min for auth
  webhook: { windowMs: 1000, maxRequests: 100 }       // 100/second for webhooks
};

/**
 * Check rate limit for request
 */
export async function checkRateLimit(
  request: NextRequest,
  config: RateLimitConfig | keyof typeof DEFAULT_RATE_LIMITS = 'default'
): Promise<{
  allowed: boolean;
  remaining: number;
  resetAt: Date;
  retryAfter?: number;
}> {
  const cfg = typeof config === 'string' ? DEFAULT_RATE_LIMITS[config] : config;
  
  // Generate rate limit key
  const key = cfg.keyGenerator?.(request) || 
    request.headers.get('x-forwarded-for') || 
    request.headers.get('x-real-ip') || 
    'anonymous';

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
  
  const windowStart = new Date(Math.floor(Date.now() / cfg.windowMs) * cfg.windowMs);
  const windowEnd = new Date(windowStart.getTime() + cfg.windowMs);
  const bucketKey = `ratelimit:${key}:${windowStart.getTime()}`;

  // Increment counter
  const { data, error } = await supabase.rpc('increment_rate_limit', {
    p_bucket_key: bucketKey,
    p_window_end: windowEnd.toISOString()
  });

  // Fallback if RPC doesn't exist
  if (error) {
    // Simple in-memory fallback (not distributed, but works for single instance)
    return {
      allowed: true,
      remaining: cfg.maxRequests - 1,
      resetAt: windowEnd
    };
  }

  const count = data || 1;
  const remaining = Math.max(0, cfg.maxRequests - count);
  const allowed = count <= cfg.maxRequests;

  return {
    allowed,
    remaining,
    resetAt: windowEnd,
    retryAfter: allowed ? undefined : Math.ceil((windowEnd.getTime() - Date.now()) / 1000)
  };
}

/**
 * Rate limit middleware
 */
export function withRateLimit(config: RateLimitConfig | keyof typeof DEFAULT_RATE_LIMITS = 'default') {
  return function decorator<T extends (...args: any[]) => Promise<Response>>(
    handler: T
  ): T {
    return (async (request: NextRequest, ...args: any[]) => {
      const requestId = getRequestId(request);
      const rateLimit = await checkRateLimit(request, config);

      if (!rateLimit.allowed) {
        return errorResponse('RATE_LIMITED', 'Too many requests', requestId, {
          retryAfter: rateLimit.retryAfter,
          resetAt: rateLimit.resetAt.toISOString()
        });
      }

      const response = await handler(request, ...args);
      
      // Add rate limit headers to response
      const headers = new Headers(response.headers);
      headers.set('X-RateLimit-Limit', 
        (typeof config === 'string' ? DEFAULT_RATE_LIMITS[config] : config).maxRequests.toString()
      );
      headers.set('X-RateLimit-Remaining', rateLimit.remaining.toString());
      headers.set('X-RateLimit-Reset', rateLimit.resetAt.toISOString());

      return new NextResponse(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers
      });
    }) as T;
  };
}

// ============================================================================
// REQUEST VALIDATION
// ============================================================================

interface ValidationRule {
  required?: boolean;
  type?: 'string' | 'number' | 'boolean' | 'array' | 'object' | 'email' | 'uuid';
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: RegExp;
  enum?: any[];
  custom?: (value: any) => boolean | string;
}

interface ValidationSchema {
  [field: string]: ValidationRule;
}

/**
 * Validate request body against schema
 */
export function validateBody(
  body: any,
  schema: ValidationSchema
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  for (const [field, rules] of Object.entries(schema)) {
    const value = body[field];

    // Required check
    if (rules.required && (value === undefined || value === null || value === '')) {
      errors.push(`${field} is required`);
      continue;
    }

    // Skip further checks if not required and not provided
    if (value === undefined || value === null) continue;

    // Type check
    if (rules.type) {
      switch (rules.type) {
        case 'email':
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            errors.push(`${field} must be a valid email`);
          }
          break;
        case 'uuid':
          if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)) {
            errors.push(`${field} must be a valid UUID`);
          }
          break;
        case 'array':
          if (!Array.isArray(value)) {
            errors.push(`${field} must be an array`);
          }
          break;
        default:
          if (typeof value !== rules.type) {
            errors.push(`${field} must be a ${rules.type}`);
          }
      }
    }

    // String length
    if (rules.minLength && typeof value === 'string' && value.length < rules.minLength) {
      errors.push(`${field} must be at least ${rules.minLength} characters`);
    }
    if (rules.maxLength && typeof value === 'string' && value.length > rules.maxLength) {
      errors.push(`${field} must be at most ${rules.maxLength} characters`);
    }

    // Number range
    if (rules.min !== undefined && typeof value === 'number' && value < rules.min) {
      errors.push(`${field} must be at least ${rules.min}`);
    }
    if (rules.max !== undefined && typeof value === 'number' && value > rules.max) {
      errors.push(`${field} must be at most ${rules.max}`);
    }

    // Pattern
    if (rules.pattern && !rules.pattern.test(String(value))) {
      errors.push(`${field} has invalid format`);
    }

    // Enum
    if (rules.enum && !rules.enum.includes(value)) {
      errors.push(`${field} must be one of: ${rules.enum.join(', ')}`);
    }

    // Custom validation
    if (rules.custom) {
      const result = rules.custom(value);
      if (result !== true) {
        errors.push(typeof result === 'string' ? result : `${field} is invalid`);
      }
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Validation middleware
 */
export function withValidation(schema: ValidationSchema) {
  return function decorator<T extends (...args: any[]) => Promise<Response>>(
    handler: T
  ): T {
    return (async (request: NextRequest, ...args: any[]) => {
      const requestId = getRequestId(request);
      
      let body: any;
      try {
        body = await request.json();
      } catch {
        return errorResponse('INVALID_FORMAT', 'Invalid JSON body', requestId);
      }

      const validation = validateBody(body, schema);
      
      if (!validation.valid) {
        return errorResponse('VALIDATION_ERROR', 'Validation failed', requestId, {
          errors: validation.errors
        });
      }

      // Clone request with parsed body
      const requestWithBody = request.clone();
      (requestWithBody as any).parsedBody = body;

      return handler(requestWithBody, ...args);
    }) as T;
  };
}

// ============================================================================
// AUDIT LOGGING
// ============================================================================

interface AuditLogEntry {
  actorId?: string;
  actorType: 'user' | 'system' | 'api_key' | 'webhook';
  action: string;
  resource: string;
  resourceId?: string;
  details?: any;
  before?: any;
  after?: any;
  requestId: string;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Log action to audit trail
 */
export async function auditLog(entry: AuditLogEntry): Promise<void> {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  await supabase.from('moderation_audit_log').insert({
    actor_id: entry.actorId,
    actor_type: entry.actorType,
    action: entry.action,
    action_category: entry.resource,
    target_type: entry.resource,
    target_id: entry.resourceId,
    details: entry.details,
    previous_state: entry.before,
    new_state: entry.after,
    ip_address: entry.ipAddress,
    user_agent: entry.userAgent
  });
}

export default {
  generateRequestId,
  getRequestId,
  successResponse,
  errorResponse,
  checkRateLimit,
  withRateLimit,
  validateBody,
  withValidation,
  auditLog,
  ERROR_CODES
};
