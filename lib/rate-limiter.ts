/**
 * CR AudioViz AI - Rate Limiter & Circuit Breaker
 * ================================================
 * 
 * Enterprise-grade rate limiting with:
 * - Per-IP rate limiting
 * - Per-user rate limiting
 * - Per-route rate limiting
 * - Circuit breaker for external services
 * - Exponential backoff for retries
 * 
 * @version 1.0.0
 * @date January 2, 2026 - 2:04 AM EST
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Rate limit configurations by route category
export const RATE_LIMITS = {
  // AI endpoints - strictest limits
  ai: {
    requests_per_minute: 10,
    requests_per_hour: 100,
    requests_per_day: 500,
    burst_limit: 5
  },
  // Payment endpoints - medium limits
  payment: {
    requests_per_minute: 20,
    requests_per_hour: 200,
    requests_per_day: 1000,
    burst_limit: 10
  },
  // API endpoints - standard limits
  api: {
    requests_per_minute: 60,
    requests_per_hour: 1000,
    requests_per_day: 10000,
    burst_limit: 30
  },
  // Public endpoints - generous limits
  public: {
    requests_per_minute: 120,
    requests_per_hour: 3000,
    requests_per_day: 50000,
    burst_limit: 60
  }
}

// Circuit breaker states
type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN'

interface CircuitBreaker {
  state: CircuitState
  failures: number
  last_failure: number
  next_attempt: number
}

// In-memory circuit breakers (per service)
const circuitBreakers: Map<string, CircuitBreaker> = new Map()

// Circuit breaker configuration
const CIRCUIT_CONFIG = {
  failure_threshold: 5,      // Open circuit after 5 failures
  recovery_timeout: 30000,   // Try again after 30 seconds
  half_open_requests: 3      // Allow 3 test requests in half-open state
}

/**
 * Get rate limit category for a route
 */
export function getRateLimitCategory(pathname: string): keyof typeof RATE_LIMITS {
  if (pathname.startsWith('/api/ai') || pathname.startsWith('/api/chat')) {
    return 'ai'
  }
  if (pathname.startsWith('/api/stripe') || pathname.startsWith('/api/paypal') || pathname.startsWith('/api/checkout')) {
    return 'payment'
  }
  if (pathname.startsWith('/api/')) {
    return 'api'
  }
  return 'public'
}

/**
 * Check rate limit using sliding window algorithm
 */
export async function checkRateLimit(
  identifier: string,
  category: keyof typeof RATE_LIMITS,
  supabase: any
): Promise<{ allowed: boolean; remaining: number; reset: number }> {
  const limits = RATE_LIMITS[category]
  const now = Date.now()
  const minute_ago = now - 60000
  const hour_ago = now - 3600000
  const day_ago = now - 86400000
  
  // Get recent requests from rate_limits table
  const { data: requests, error } = await supabase
    .from('rate_limits')
    .select('timestamp')
    .eq('identifier', identifier)
    .gte('timestamp', new Date(day_ago).toISOString())
    .order('timestamp', { ascending: false })
  
  if (error) {
    console.error('Rate limit check error:', error)
    // Fail open - allow request but log
    return { allowed: true, remaining: limits.requests_per_minute, reset: 60 }
  }
  
  const requestsArray = requests || []
  
  // Count requests in each window
  const minute_count = requestsArray.filter((r: any) => 
    new Date(r.timestamp).getTime() > minute_ago
  ).length
  
  const hour_count = requestsArray.filter((r: any) => 
    new Date(r.timestamp).getTime() > hour_ago
  ).length
  
  const day_count = requestsArray.length
  
  // Check limits
  if (minute_count >= limits.requests_per_minute) {
    return { 
      allowed: false, 
      remaining: 0, 
      reset: Math.ceil((minute_ago + 60000 - now) / 1000)
    }
  }
  
  if (hour_count >= limits.requests_per_hour) {
    return { 
      allowed: false, 
      remaining: 0, 
      reset: Math.ceil((hour_ago + 3600000 - now) / 1000)
    }
  }
  
  if (day_count >= limits.requests_per_day) {
    return { 
      allowed: false, 
      remaining: 0, 
      reset: Math.ceil((day_ago + 86400000 - now) / 1000)
    }
  }
  
  // Record this request
  await supabase.from('rate_limits').insert({
    identifier,
    category,
    timestamp: new Date().toISOString()
  })
  
  // Cleanup old entries (async, don't wait)
  supabase
    .from('rate_limits')
    .delete()
    .lt('timestamp', new Date(day_ago).toISOString())
    .then(() => {})
  
  return {
    allowed: true,
    remaining: limits.requests_per_minute - minute_count - 1,
    reset: 60
  }
}

/**
 * Circuit breaker for external services
 */
export function getCircuitBreaker(service: string): CircuitBreaker {
  if (!circuitBreakers.has(service)) {
    circuitBreakers.set(service, {
      state: 'CLOSED',
      failures: 0,
      last_failure: 0,
      next_attempt: 0
    })
  }
  return circuitBreakers.get(service)!
}

export function canMakeRequest(service: string): boolean {
  const breaker = getCircuitBreaker(service)
  const now = Date.now()
  
  switch (breaker.state) {
    case 'CLOSED':
      return true
      
    case 'OPEN':
      if (now >= breaker.next_attempt) {
        breaker.state = 'HALF_OPEN'
        return true
      }
      return false
      
    case 'HALF_OPEN':
      return true
  }
}

export function recordSuccess(service: string): void {
  const breaker = getCircuitBreaker(service)
  breaker.failures = 0
  breaker.state = 'CLOSED'
}

export function recordFailure(service: string): void {
  const breaker = getCircuitBreaker(service)
  breaker.failures++
  breaker.last_failure = Date.now()
  
  if (breaker.failures >= CIRCUIT_CONFIG.failure_threshold) {
    breaker.state = 'OPEN'
    breaker.next_attempt = Date.now() + CIRCUIT_CONFIG.recovery_timeout
    console.warn(`Circuit breaker OPEN for ${service}`)
  }
}

/**
 * Exponential backoff helper
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  service: string,
  maxRetries: number = 3
): Promise<T> {
  let lastError: Error | null = null
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    if (!canMakeRequest(service)) {
      throw new Error(`Circuit breaker open for ${service}`)
    }
    
    try {
      const result = await fn()
      recordSuccess(service)
      return result
    } catch (error: any) {
      lastError = error
      recordFailure(service)
      
      if (attempt < maxRetries - 1) {
        const delay = Math.pow(2, attempt) * 1000 + Math.random() * 1000
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
  }
  
  throw lastError
}

/**
 * Rate limit middleware response
 */
export function rateLimitResponse(remaining: number, reset: number): NextResponse {
  return NextResponse.json(
    { 
      error: 'Rate limit exceeded',
      message: 'Too many requests. Please try again later.',
      retry_after: reset
    },
    { 
      status: 429,
      headers: {
        'X-RateLimit-Remaining': remaining.toString(),
        'X-RateLimit-Reset': reset.toString(),
        'Retry-After': reset.toString()
      }
    }
  )
}

/**
 * Credit enforcement - atomic decrement
 */
export async function enforceCredits(
  userId: string,
  required: number,
  supabase: any
): Promise<{ allowed: boolean; remaining: number }> {
  // Use a transaction to atomically check and decrement
  const { data, error } = await supabase.rpc('decrement_credits_if_available', {
    p_user_id: userId,
    p_amount: required
  })
  
  if (error) {
    // Fallback to non-atomic check
    const { data: profile } = await supabase
      .from('profiles')
      .select('credits_balance')
      .eq('id', userId)
      .single()
    
    if (!profile || profile.credits_balance < required) {
      return { allowed: false, remaining: profile?.credits_balance || 0 }
    }
    
    // Decrement
    await supabase
      .from('profiles')
      .update({ credits_balance: profile.credits_balance - required })
      .eq('id', userId)
    
    return { allowed: true, remaining: profile.credits_balance - required }
  }
  
  return { allowed: data.success, remaining: data.remaining }
}
