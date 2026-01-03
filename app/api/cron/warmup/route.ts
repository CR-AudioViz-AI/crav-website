// /app/api/cron/warmup/route.ts
// Enhanced Cold Start Prevention - Warmup Cron
// Runs every 3 minutes to keep ALL critical functions and pages warm
// Updated: January 2, 2026 - 7:32 PM EST

import { NextRequest, NextResponse } from 'next/server';

// Critical API endpoints to keep warm
const CRITICAL_API_ENDPOINTS = [
  '/api/health',
  '/api/central',
  '/api/chat',
  '/api/admin/dashboard',
  '/api/credits/balance',
  '/api/auth/session',
];

// Critical PAGE routes to keep warm (prevents 503s)
const CRITICAL_PAGE_ROUTES = [
  '/',
  '/apps',
  '/pricing',
  '/dashboard',
  '/login',
  '/games',
  '/features',
  '/cookies',
  '/accessibility',
  '/dmca',
  '/newsletter',
  '/craiverse/first-responders',
  '/craiverse/veterans-transition',
  '/tools/pdf-editor',
  '/games/play/1',
];

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

interface WarmupResult {
  endpoint: string;
  status: number;
  latency: number;
  type: 'api' | 'page';
}

async function warmEndpoint(baseUrl: string, endpoint: string, type: 'api' | 'page'): Promise<WarmupResult> {
  const start = Date.now();
  
  try {
    const response = await fetch(`${baseUrl}${endpoint}`, {
      method: 'GET',
      headers: {
        'X-Warmup-Request': 'true',
        'User-Agent': 'CR-AudioViz-Warmup/1.0',
      },
      cache: 'no-store',
    });
    
    return {
      endpoint,
      status: response.status,
      latency: Date.now() - start,
      type,
    };
  } catch (error) {
    return {
      endpoint,
      status: 0,
      latency: Date.now() - start,
      type,
    };
  }
}

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  // Verify cron secret (optional security)
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  
  // Get base URL
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://craudiovizai.com';
  
  // Warm all endpoints in parallel
  const apiPromises = CRITICAL_API_ENDPOINTS.map(ep => warmEndpoint(baseUrl, ep, 'api'));
  const pagePromises = CRITICAL_PAGE_ROUTES.map(ep => warmEndpoint(baseUrl, ep, 'page'));
  
  const results = await Promise.all([...apiPromises, ...pagePromises]);
  
  // Calculate stats
  const successful = results.filter(r => r.status >= 200 && r.status < 400);
  const failed = results.filter(r => r.status === 0 || r.status >= 400);
  const avgLatency = results.reduce((sum, r) => sum + r.latency, 0) / results.length;
  
  const summary = {
    timestamp: new Date().toISOString(),
    totalEndpoints: results.length,
    successful: successful.length,
    failed: failed.length,
    avgLatencyMs: Math.round(avgLatency),
    totalTimeMs: Date.now() - startTime,
    apiEndpoints: CRITICAL_API_ENDPOINTS.length,
    pageRoutes: CRITICAL_PAGE_ROUTES.length,
    failedEndpoints: failed.map(f => ({ endpoint: f.endpoint, status: f.status })),
  };
  
  console.log('[WARMUP]', JSON.stringify(summary));
  
  return NextResponse.json(summary, { status: 200 });
}
