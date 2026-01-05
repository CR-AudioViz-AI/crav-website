// GET /api/assets/stats - Get asset statistics
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    // Get total count
    const { count: total } = await supabase
      .from('universal_assets')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active');

    // Get counts by type using RPC or aggregation
    const { data: typeData } = await supabase.rpc('get_asset_type_counts');
    
    // Fallback if RPC doesn't exist
    const { data: sources } = await supabase
      .from('asset_sources_unified')
      .select('source_code, source_name, total_harvested, status')
      .order('total_harvested', { ascending: false });

    return NextResponse.json({
      success: true,
      stats: {
        total: total || 0,
        sources: sources || [],
        lastUpdated: new Date().toISOString()
      }
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch stats' }, { status: 500 });
  }
}
