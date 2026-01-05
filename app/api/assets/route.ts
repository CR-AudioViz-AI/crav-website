// =============================================================================
// UNIVERSAL ASSET API
// CR AudioViz AI - Single API for ALL assets across the ecosystem
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET /api/assets - Search and list assets
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Query parameters
    const search = searchParams.get('search');
    const type = searchParams.get('type');           // 'spirit', 'ebook', 'image', etc.
    const category = searchParams.get('category');    // 'beverage', 'document', 'graphics', etc.
    const subcategory = searchParams.get('subcategory');
    const owner = searchParams.get('owner');          // user ID
    const source = searchParams.get('source');        // source_code
    const isFree = searchParams.get('is_free');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const sortBy = searchParams.get('sort') || 'created_at';
    const sortOrder = searchParams.get('order') || 'desc';

    // Build query
    let query = supabase
      .from('universal_assets')
      .select('*', { count: 'exact' })
      .eq('status', 'active');

    // Apply filters
    if (type) query = query.eq('asset_type', type);
    if (category) query = query.eq('category', category);
    if (subcategory) query = query.eq('subcategory', subcategory);
    if (owner) query = query.eq('owner_id', owner);
    if (isFree !== null) query = query.eq('is_free', isFree === 'true');
    
    // Text search
    if (search) {
      query = query.textSearch('search_vector', search, { type: 'websearch' });
    }
    
    // Sorting
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });
    
    // Pagination
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) throw error;

    return NextResponse.json({
      success: true,
      assets: data,
      total: count,
      limit,
      offset,
      hasMore: (offset + limit) < (count || 0)
    });

  } catch (error) {
    console.error('Asset search error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to search assets' 
    }, { status: 500 });
  }
}

// POST /api/assets - Create new asset
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      asset_type,
      category,
      subcategory,
      name,
      description,
      tags,
      file_path,
      file_url,
      file_size_bytes,
      mime_type,
      file_extension,
      metadata,
      owner_id,
      is_public = true,
      is_free = true,
      source_id,
      created_by_app
    } = body;

    // Validate required fields
    if (!asset_type || !category || !name) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing required fields: asset_type, category, name' 
      }, { status: 400 });
    }

    // Normalize name for search
    const name_normalized = name.toLowerCase().replace(/[^a-z0-9]/g, '');

    const { data, error } = await supabase
      .from('universal_assets')
      .insert({
        asset_type,
        category,
        subcategory,
        name,
        name_normalized,
        description,
        tags: tags || [],
        file_path,
        file_url,
        file_size_bytes,
        mime_type,
        file_extension,
        metadata: metadata || {},
        owner_id,
        owner_type: owner_id ? 'user' : 'system',
        is_public,
        is_free,
        source_id,
        created_by_app
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      asset: data
    });

  } catch (error) {
    console.error('Asset creation error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to create asset' 
    }, { status: 500 });
  }
}
