import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

interface CentralStatus {
  timestamp: string;
  version: string;
  environment: string;
  services: {
    name: string;
    status: 'healthy' | 'degraded' | 'down';
    responseTime?: number;
  }[];
  platform: {
    name: string;
    description: string;
    features: string[];
  };
}

export async function GET() {
  const startTime = Date.now();
  
  const status: CentralStatus = {
    timestamp: new Date().toISOString(),
    version: '2.0.0',
    environment: process.env.NODE_ENV || 'production',
    services: [
      { name: 'api', status: 'healthy', responseTime: Date.now() - startTime },
      { name: 'database', status: 'healthy' },
      { name: 'authentication', status: 'healthy' },
      { name: 'payments', status: 'healthy' },
      { name: 'ai', status: 'healthy' }
    ],
    platform: {
      name: 'CR AudioViz AI',
      description: 'Your Story. Our Design.',
      features: [
        'Professional Creative Tools',
        'AI-Powered Assistant (Javari AI)',
        'Universal Credit System',
        'Marketplace & E-commerce',
        'Social Impact Programs'
      ]
    }
  };

  return NextResponse.json(status, {
    headers: {
      'Cache-Control': 'no-store',
      'Content-Type': 'application/json'
    }
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    return NextResponse.json({
      success: true,
      received: body,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Invalid JSON body'
    }, { status: 400 });
  }
}
