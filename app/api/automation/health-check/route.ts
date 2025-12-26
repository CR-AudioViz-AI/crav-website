/**
 * Health Check API Endpoint
 * 
 * Runs health checks on all monitored apps
 * Can be triggered by cron or manually
 * 
 * GET /api/automation/health-check
 */

import { NextResponse } from 'next/server';
import automation from '@/lib/automation/system';

export async function GET() {
  try {
    const results = await automation.runAllHealthChecks();
    
    const summary = {
      timestamp: new Date().toISOString(),
      total: results.length,
      healthy: results.filter(r => r.status === 'healthy').length,
      degraded: results.filter(r => r.status === 'degraded').length,
      down: results.filter(r => r.status === 'down').length,
      results,
    };
    
    return NextResponse.json(summary);
  } catch (error) {
    console.error('Health check failed:', error);
    return NextResponse.json(
      { error: 'Health check failed', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    );
  }
}

// For Vercel Cron - runs every 5 minutes
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
