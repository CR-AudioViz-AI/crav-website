/**
 * Deployment Monitor API Endpoint
 * 
 * Monitors all Vercel deployments for failures
 * Auto-creates tickets for failed deployments
 * 
 * GET /api/automation/deployment-monitor
 */

import { NextResponse } from 'next/server';
import automation from '@/lib/automation/system';

export async function GET() {
  try {
    const deployments = await automation.monitorDeployments();
    
    const failed = deployments.filter(d => d.state === 'ERROR');
    const building = deployments.filter(d => d.state === 'BUILDING');
    const ready = deployments.filter(d => d.state === 'READY');
    
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      total: deployments.length,
      ready: ready.length,
      building: building.length,
      failed: failed.length,
      failedDeployments: failed,
    });
  } catch (error) {
    console.error('Deployment monitor failed:', error);
    return NextResponse.json(
      { error: 'Monitor failed', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
