// /lib/idempotency.ts
// Idempotency Key System - CR AudioViz AI
// Prevents duplicate financial operations (orders, payouts, refunds)

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://kteobfyferrukqeolofj.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Idempotency key expiration (24 hours)
const IDEMPOTENCY_TTL_HOURS = 24;

interface IdempotencyRecord {
  id: string;
  idempotency_key: string;
  operation_type: string;
  request_hash: string;
  response_status: number;
  response_body: any;
  created_at: string;
  expires_at: string;
}

/**
 * Check if an idempotency key exists and return cached response if so
 */
export async function checkIdempotency(
  idempotencyKey: string,
  operationType: string,
  requestHash: string
): Promise<{ exists: boolean; response?: { status: number; body: any } }> {
  if (!idempotencyKey) {
    return { exists: false };
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  const { data, error } = await supabase
    .from('idempotency_keys')
    .select('*')
    .eq('idempotency_key', idempotencyKey)
    .eq('operation_type', operationType)
    .gt('expires_at', new Date().toISOString())
    .single();

  if (error || !data) {
    return { exists: false };
  }

  // Check if request hash matches (same request)
  if (data.request_hash !== requestHash) {
    // Same key, different request - this is an error
    return {
      exists: true,
      response: {
        status: 422,
        body: {
          error: 'Idempotency key already used with different request parameters',
          code: 'IDEMPOTENCY_KEY_REUSED'
        }
      }
    };
  }

  // Return cached response
  return {
    exists: true,
    response: {
      status: data.response_status,
      body: data.response_body
    }
  };
}

/**
 * Store idempotency key with response
 */
export async function storeIdempotency(
  idempotencyKey: string,
  operationType: string,
  requestHash: string,
  responseStatus: number,
  responseBody: any
): Promise<void> {
  if (!idempotencyKey) {
    return;
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + IDEMPOTENCY_TTL_HOURS);

  await supabase.from('idempotency_keys').upsert({
    idempotency_key: idempotencyKey,
    operation_type: operationType,
    request_hash: requestHash,
    response_status: responseStatus,
    response_body: responseBody,
    expires_at: expiresAt.toISOString()
  }, {
    onConflict: 'idempotency_key,operation_type'
  });
}

/**
 * Generate request hash from body
 */
export function generateRequestHash(body: any): string {
  const str = JSON.stringify(body, Object.keys(body).sort());
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString(36);
}

/**
 * Idempotency wrapper for API handlers
 */
export function withIdempotency(operationType: string) {
  return function decorator(
    handler: (req: Request, body: any) => Promise<{ status: number; body: any }>
  ) {
    return async function wrappedHandler(req: Request): Promise<Response> {
      const idempotencyKey = req.headers.get('Idempotency-Key');
      
      let body: any;
      try {
        body = await req.json();
      } catch {
        body = {};
      }

      const requestHash = generateRequestHash(body);

      // Check for existing idempotent request
      if (idempotencyKey) {
        const existing = await checkIdempotency(idempotencyKey, operationType, requestHash);
        
        if (existing.exists && existing.response) {
          return new Response(JSON.stringify(existing.response.body), {
            status: existing.response.status,
            headers: {
              'Content-Type': 'application/json',
              'Idempotency-Replayed': 'true'
            }
          });
        }
      }

      // Execute handler
      const result = await handler(req, body);

      // Store result for idempotency
      if (idempotencyKey && result.status < 500) {
        await storeIdempotency(
          idempotencyKey,
          operationType,
          requestHash,
          result.status,
          result.body
        );
      }

      return new Response(JSON.stringify(result.body), {
        status: result.status,
        headers: {
          'Content-Type': 'application/json',
          'Idempotency-Key': idempotencyKey || ''
        }
      });
    };
  };
}

/**
 * Clean up expired idempotency keys (run periodically)
 */
export async function cleanupExpiredKeys(): Promise<number> {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  const { data, error } = await supabase
    .from('idempotency_keys')
    .delete()
    .lt('expires_at', new Date().toISOString())
    .select('id');

  return data?.length || 0;
}

// Operation types for reference
export const OPERATIONS = {
  ORDER_CREATE: 'order.create',
  ORDER_CANCEL: 'order.cancel',
  PAYOUT_REQUEST: 'payout.request',
  PAYOUT_PROCESS: 'payout.process',
  REFUND_CREATE: 'refund.create',
  CREDIT_ADD: 'credit.add',
  CREDIT_DEDUCT: 'credit.deduct',
  WEBHOOK_DELIVER: 'webhook.deliver'
} as const;
