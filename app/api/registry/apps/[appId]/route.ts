/**
 * CR AudioViz AI - Registry Apps API
 * ====================================
 * 
 * Get specific app details from the registry.
 */

import { NextRequest, NextResponse } from 'next/server';

// App registry data
const APP_REGISTRY: Record<string, any> = {
  'javariverse-hub': { id: 'javariverse-hub', name: 'CR AudioViz AI Hub', url: 'https://craudiovizai.com', category: 'platform', description: 'Central hub for all CR AudioViz AI services' },
  'javari-market': { id: 'javari-market', name: 'Market Oracle', url: 'https://market.craudiovizai.com', category: 'finance', description: 'AI-powered stock and crypto predictions' },
  'javari-invoice': { id: 'javari-invoice', name: 'Invoice Generator', url: 'https://invoice.craudiovizai.com', category: 'business', description: 'Professional invoice creation tool' },
  'crochet-platform': { id: 'crochet-platform', name: 'CrochetAI', url: 'https://crochet.craudiovizai.com', category: 'creative', description: 'AI-powered crochet pattern generator' },
  'knitting-platform': { id: 'knitting-platform', name: 'KnittingAI', url: 'https://knitting.craudiovizai.com', category: 'creative', description: 'AI-powered knitting pattern generator' },
  'machineknit-platform': { id: 'machineknit-platform', name: 'MachineKnitAI', url: 'https://machineknit.craudiovizai.com', category: 'creative', description: 'AI-powered machine knitting patterns' },
  'javari-travel': { id: 'javari-travel', name: 'Travel Planner', url: 'https://travel.craudiovizai.com', category: 'travel', description: 'AI travel itinerary planning' },
  'javari-realty': { id: 'javari-realty', name: 'AgentOS', url: 'https://realty.craudiovizai.com', category: 'realestate', description: 'Real estate agent operating system' },
  'javari-games-hub': { id: 'javari-games-hub', name: 'Games Hub', url: 'https://games.craudiovizai.com', category: 'games', description: 'Collection of AI-powered games' },
  'javari-pdf-tools': { id: 'javari-pdf-tools', name: 'PDF Tools', url: 'https://pdf.craudiovizai.com', category: 'tools', description: 'PDF manipulation and conversion tools' },
  'javari-ebook': { id: 'javari-ebook', name: 'eBook Creator', url: 'https://ebook.craudiovizai.com', category: 'creative', description: 'AI-powered eBook creation' },
};

// GET /api/registry/apps/[appId]
export async function GET(
  request: NextRequest,
  { params }: { params: { appId: string } }
) {
  const appId = params.appId;
  const app = APP_REGISTRY[appId];
  
  if (!app) {
    return NextResponse.json(
      { success: false, error: 'App not found' },
      { status: 404 }
    );
  }
  
  return NextResponse.json({
    success: true,
    data: app
  });
}
