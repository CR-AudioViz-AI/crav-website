// ================================================================================
// UNIVERSAL ASSETS API - /api/assets
// Single source of truth for all asset operations
// ================================================================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';

const getSupabase = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
};

const generateRequestId = () => `req_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

// Generate asset_id: AST-{TYPE}-{YEAR}-{SEQ}
const generateAssetId = (type: string) => {
  const typeMap: Record<string, string> = {
    'image': 'IMG', 'audio': 'AUD', 'video': 'VID', 'document': 'DOC',
    'ebook': 'EBK', 'font': 'FNT', 'model_3d': 'M3D', 'sprite': 'SPR',
    'template': 'TPL', 'spirit': 'SPI', 'cocktail': 'CTL', 'other': 'OTH'
  };
  const code = typeMap[type] || 'OTH';
  const year = new Date().getFullYear();
  const seq = Math.floor(Math.random() * 999999).toString().padStart(6, '0');
  return `AST-${code}-${year}-${seq}`;
};

// GET - List or search assets
export async function GET(request: NextRequest) {
  const requestId = generateRequestId();
  const supabase = getSupabase();
  if (!supabase) return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
  
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const search = searchParams.get('search');
  const type = searchParams.get('type');
  const category = searchParams.get('category');
  const source = searchParams.get('source');
  const owner = searchParams.get('owner');
  const license = searchParams.get('license');
  const limit = parseInt(searchParams.get('limit') || '50');
  const offset = parseInt(searchParams.get('offset') || '0');
  
  // Get single asset by ID
  if (id) {
    const { data, error } = await supabase
      .from('assets')
      .select('*, asset_categories(name, slug)')
      .eq('id', id)
      .single();
    
    if (error) {
      return NextResponse.json({ error: error.message, request_id: requestId }, { status: 404 });
    }
    
    return NextResponse.json({
      request_id: requestId,
      asset: data,
    });
  }
  
  // Build query
  let query = supabase
    .from('assets')
    .select('*, asset_categories(name, slug)', { count: 'exact' });
  
  // Apply filters
  if (search) {
    query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%,tags.cs.{${search}}`);
  }
  if (type) {
    query = query.eq('mime_type', type);
  }
  if (category) {
    query = query.eq('category_id', category);
  }
  if (owner) {
    query = query.eq('owned_by', owner);
  }
  if (license) {
    query = query.contains('metadata', { license_type: license });
  }
  
  // Apply status filter
  query = query.eq('status', 'active');
  
  // Apply pagination
  query = query.range(offset, offset + limit - 1).order('created_at', { ascending: false });
  
  const { data, error, count } = await query;
  
  if (error) {
    return NextResponse.json({ error: error.message, request_id: requestId }, { status: 500 });
  }
  
  return NextResponse.json({
    request_id: requestId,
    assets: data || [],
    count: data?.length || 0,
    total: count || 0,
    offset,
    limit,
  });
}

// POST - Upload/create asset
export async function POST(request: NextRequest) {
  const requestId = generateRequestId();
  const supabase = getSupabase();
  if (!supabase) return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
  
  try {
    const body = await request.json();
    const {
      name,
      description,
      asset_type = 'other',
      category_id,
      license_type = 'proprietary',
      source_url,
      source_name,
      tags = [],
      metadata = {},
      owner_id,
      tenant_id,
    } = body;
    
    if (!name) {
      return NextResponse.json({ error: 'Name required', request_id: requestId }, { status: 400 });
    }
    
    // Generate slug
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 100);
    
    // Build asset record
    const assetData: any = {
      name,
      slug: `${slug}-${Date.now()}`,
      description,
      tags,
      owned_by: owner_id,
      status: 'active',
      is_public: true,
      is_free: license_type === 'CC0' || license_type === 'MIT',
      metadata: {
        ...metadata,
        asset_id: generateAssetId(asset_type),
        license_type,
        source_url,
        source_name,
        tenant_id,
        commercial_use_ok: ['CC0', 'MIT', 'Apache-2.0'].includes(license_type),
        attribution_required: ['CC-BY', 'CC-BY-SA', 'CC-BY-NC'].includes(license_type),
      },
    };
    
    if (category_id) {
      assetData.category_id = category_id;
    }
    
    const { data, error } = await supabase
      .from('assets')
      .insert(assetData)
      .select()
      .single();
    
    if (error) {
      return NextResponse.json({ error: error.message, request_id: requestId }, { status: 500 });
    }
    
    // Store evidence artifact
    await supabase.from('evidence_artifacts').insert({
      artifact_type: 'asset_created',
      domain: 'craudiovizai.com',
      file_path: `assets/${data.id}`,
      metadata: {
        asset_id: data.metadata?.asset_id,
        name,
        license_type,
        source_name,
      },
    });
    
    return NextResponse.json({
      request_id: requestId,
      asset: data,
      asset_id: data.metadata?.asset_id,
    });
    
  } catch (error: any) {
    return NextResponse.json({ error: error.message, request_id: requestId }, { status: 500 });
  }
}

// PUT - Update asset
export async function PUT(request: NextRequest) {
  const requestId = generateRequestId();
  const supabase = getSupabase();
  if (!supabase) return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
  
  try {
    const body = await request.json();
    const { id, ...updates } = body;
    
    if (!id) {
      return NextResponse.json({ error: 'ID required', request_id: requestId }, { status: 400 });
    }
    
    const { data, error } = await supabase
      .from('assets')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      return NextResponse.json({ error: error.message, request_id: requestId }, { status: 500 });
    }
    
    return NextResponse.json({
      request_id: requestId,
      asset: data,
      updated: true,
    });
    
  } catch (error: any) {
    return NextResponse.json({ error: error.message, request_id: requestId }, { status: 500 });
  }
}

// DELETE - Archive asset
export async function DELETE(request: NextRequest) {
  const requestId = generateRequestId();
  const supabase = getSupabase();
  if (!supabase) return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
  
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  
  if (!id) {
    return NextResponse.json({ error: 'ID required', request_id: requestId }, { status: 400 });
  }
  
  // Soft delete (archive)
  const { data, error } = await supabase
    .from('assets')
    .update({ status: 'archived', archived_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    return NextResponse.json({ error: error.message, request_id: requestId }, { status: 500 });
  }
  
  return NextResponse.json({
    request_id: requestId,
    asset_id: id,
    archived: true,
  });
}
