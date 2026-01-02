import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    // Get domains
    const { data: domains, error: domainsError } = await supabase
      .from('audit_domains')
      .select('domain, tier, enabled')
      .order('tier', { ascending: true });

    // Get run count
    const { count: runCount } = await supabase
      .from('audit_runs')
      .select('*', { count: 'exact', head: true });

    // Get issue count
    const { count: issueCount } = await supabase
      .from('audit_issues')
      .select('*', { count: 'exact', head: true });

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      domains: domains || [],
      stats: {
        totalDomains: domains?.length || 0,
        totalRuns: runCount || 0,
        totalIssues: issueCount || 0,
      }
    });
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: String(error) 
    }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
