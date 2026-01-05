// GET /api/assets/[id] - Get single asset by ID
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ success: false, error: 'ID required' }, { status: 400 });
    }

    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    
    let query = supabase.from('universal_assets').select('*');
    query = isUUID ? query.eq('id', id) : query.eq('asset_id', id);

    const { data, error } = await query.single();

    if (error || !data) {
      return NextResponse.json({ success: false, error: 'Asset not found' }, { status: 404 });
    }

    // Increment view count
    await supabase
      .from('universal_assets')
      .update({ view_count: (data.view_count || 0) + 1, last_accessed_at: new Date().toISOString() })
      .eq('id', data.id);

    return NextResponse.json({ success: true, asset: data });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch asset' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const body = await request.json();
    
    const { asset_id, id: _id, created_at, legacy_table, legacy_id, ...updates } = body;

    const { data, error } = await supabase
      .from('universal_assets')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, asset: data });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to update asset' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    const { error } = await supabase
      .from('universal_assets')
      .update({ status: 'deleted' })
      .eq('id', id);

    if (error) throw error;
    return NextResponse.json({ success: true, message: 'Asset deleted' });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to delete asset' }, { status: 500 });
  }
}
