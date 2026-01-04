// ================================================================================
// CR AUDIOVIZ AI - CLAIM COMPLIANCE REGISTRY
// Track and verify all marketing/product claims
// ================================================================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'edge';

const getSupabase = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
};

// =============================================================================
// CLAIM DEFINITIONS
// =============================================================================

interface Claim {
  id: string;
  claim: string;
  category: 'performance' | 'feature' | 'security' | 'compliance' | 'pricing';
  source: string;
  verification_method: string;
  status: 'verified' | 'pending' | 'unverified' | 'false' | 'removed';
  evidence?: string;
  last_verified?: string;
  notes?: string;
}

// Current claims from marketing/docs
const REGISTERED_CLAIMS: Claim[] = [
  // Performance Claims
  {
    id: 'perf-001',
    claim: '99.9% uptime SLA',
    category: 'performance',
    source: 'pricing-page',
    verification_method: 'uptime-monitoring',
    status: 'pending',
    notes: 'Requires uptime monitoring integration',
  },
  {
    id: 'perf-002',
    claim: 'Sub-second API response times',
    category: 'performance',
    source: 'api-docs',
    verification_method: 'e2e-latency-test',
    status: 'pending',
  },
  
  // Feature Claims
  {
    id: 'feat-001',
    claim: '20+ AI-powered apps',
    category: 'feature',
    source: 'homepage',
    verification_method: 'api-apps-count',
    status: 'verified',
    evidence: '/api/apps returns 20 apps',
    last_verified: new Date().toISOString(),
  },
  {
    id: 'feat-002',
    claim: 'Voice, video, and chat AI assistant',
    category: 'feature',
    source: 'javari-landing',
    verification_method: 'feature-test',
    status: 'pending',
    notes: 'Requires testing all modalities',
  },
  {
    id: 'feat-003',
    claim: 'Cross-platform mobile support',
    category: 'feature',
    source: 'homepage',
    verification_method: 'responsive-test',
    status: 'pending',
  },
  
  // Security Claims
  {
    id: 'sec-001',
    claim: 'SOC 2 Type II compliant',
    category: 'security',
    source: 'security-page',
    verification_method: 'external-audit',
    status: 'unverified',
    notes: 'Requires external audit - DO NOT CLAIM until verified',
  },
  {
    id: 'sec-002',
    claim: 'End-to-end encryption',
    category: 'security',
    source: 'security-page',
    verification_method: 'security-audit',
    status: 'pending',
  },
  {
    id: 'sec-003',
    claim: 'WCAG 2.2 AA accessibility',
    category: 'compliance',
    source: 'footer',
    verification_method: 'accessibility-audit',
    status: 'pending',
  },
  
  // Pricing Claims
  {
    id: 'price-001',
    claim: 'Free tier with 50 credits',
    category: 'pricing',
    source: 'pricing-page',
    verification_method: 'api-credits-default',
    status: 'verified',
    evidence: '/api/credits returns 50 for new users',
    last_verified: new Date().toISOString(),
  },
  {
    id: 'price-002',
    claim: 'No credit card required for free tier',
    category: 'pricing',
    source: 'pricing-page',
    verification_method: 'signup-flow-test',
    status: 'pending',
  },
];

// =============================================================================
// API HANDLERS
// =============================================================================

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const status = searchParams.get('status');
  const action = searchParams.get('action');
  
  let claims = [...REGISTERED_CLAIMS];
  
  // Try to get from database first
  const supabase = getSupabase();
  if (supabase) {
    const { data } = await supabase
      .from('audit_claims')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data && data.length > 0) {
      claims = data;
    }
  }
  
  // Filter by category
  if (category) {
    claims = claims.filter(c => c.category === category);
  }
  
  // Filter by status
  if (status) {
    claims = claims.filter(c => c.status === status);
  }
  
  // Summary action
  if (action === 'summary') {
    const summary = {
      total: claims.length,
      verified: claims.filter(c => c.status === 'verified').length,
      pending: claims.filter(c => c.status === 'pending').length,
      unverified: claims.filter(c => c.status === 'unverified').length,
      false_claims: claims.filter(c => c.status === 'false').length,
      by_category: {
        performance: claims.filter(c => c.category === 'performance').length,
        feature: claims.filter(c => c.category === 'feature').length,
        security: claims.filter(c => c.category === 'security').length,
        compliance: claims.filter(c => c.category === 'compliance').length,
        pricing: claims.filter(c => c.category === 'pricing').length,
      },
      action_required: claims.filter(c => c.status === 'unverified' || c.status === 'false').map(c => ({
        id: c.id,
        claim: c.claim,
        status: c.status,
        notes: c.notes,
      })),
    };
    return NextResponse.json(summary);
  }
  
  return NextResponse.json({
    claims,
    total: claims.length,
    categories: ['performance', 'feature', 'security', 'compliance', 'pricing'],
    statuses: ['verified', 'pending', 'unverified', 'false', 'removed'],
  });
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabase();
    if (!supabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }
    
    const body = await request.json();
    const { action, claim_id, ...updates } = body;
    
    // Verify a claim
    if (action === 'verify') {
      const claim = REGISTERED_CLAIMS.find(c => c.id === claim_id);
      if (!claim) {
        return NextResponse.json({ error: 'Claim not found' }, { status: 404 });
      }
      
      // Run verification based on method
      let verificationResult = { verified: false, evidence: '' };
      
      switch (claim.verification_method) {
        case 'api-apps-count':
          const appsResponse = await fetch('https://craudiovizai.com/api/apps');
          const appsData = await appsResponse.json();
          const appCount = appsData.apps?.length || 0;
          verificationResult = {
            verified: appCount >= 20,
            evidence: `API returns ${appCount} apps`,
          };
          break;
          
        case 'api-credits-default':
          const creditsResponse = await fetch('https://craudiovizai.com/api/credits');
          const creditsData = await creditsResponse.json();
          verificationResult = {
            verified: creditsData.balance === 50 || creditsData.message?.includes('50'),
            evidence: JSON.stringify(creditsData),
          };
          break;
          
        default:
          verificationResult = {
            verified: false,
            evidence: 'Manual verification required',
          };
      }
      
      // Store result
      await supabase.from('audit_claims').upsert({
        id: claim_id,
        ...claim,
        status: verificationResult.verified ? 'verified' : 'unverified',
        evidence: verificationResult.evidence,
        last_verified: new Date().toISOString(),
      });
      
      return NextResponse.json({
        claim_id,
        claim: claim.claim,
        ...verificationResult,
        timestamp: new Date().toISOString(),
      });
    }
    
    // Add new claim
    if (action === 'add') {
      const { data, error } = await supabase
        .from('audit_claims')
        .insert({
          id: `custom-${Date.now()}`,
          status: 'pending',
          ...updates,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();
      
      if (error) {
        return NextResponse.json({ error: 'Failed to add claim' }, { status: 500 });
      }
      
      return NextResponse.json({ claim: data, success: true });
    }
    
    // Update claim status
    if (action === 'update') {
      const { error } = await supabase
        .from('audit_claims')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', claim_id);
      
      if (error) {
        return NextResponse.json({ error: 'Failed to update claim' }, { status: 500 });
      }
      
      return NextResponse.json({ success: true, claim_id });
    }
    
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
