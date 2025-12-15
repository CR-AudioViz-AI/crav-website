// app/api/admin/grants/route.ts
// Grant CRUD API - Create, Read, Update grants
// Timestamp: Saturday, December 13, 2025 - 12:45 PM EST

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

// GET - List all grants with filters
export async function GET(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single();

  if (!profile?.is_admin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const priority = searchParams.get('priority');
  const module = searchParams.get('module');
  const search = searchParams.get('search');
  const limit = parseInt(searchParams.get('limit') || '50');

  let query = supabase
    .from('grant_opportunities')
    .select('*')
    .order('application_deadline', { ascending: true, nullsFirst: false })
    .limit(limit);

  if (status && status !== 'all') {
    query = query.eq('status', status);
  }

  if (priority) {
    query = query.eq('priority', priority);
  }

  if (module) {
    query = query.contains('target_modules', [module]);
  }

  if (search) {
    query = query.or(`grant_name.ilike.%${search}%,agency_name.ilike.%${search}%,description.ilike.%${search}%`);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ grants: data });
}

// POST - Create new grant
export async function POST(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single();

  if (!profile?.is_admin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.grant_name || !body.agency_name) {
      return NextResponse.json({ 
        error: 'Grant name and agency name are required' 
      }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('grant_opportunities')
      .insert({
        ...body,
        created_by: user.id,
        updated_by: user.id,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);

  } catch (error) {
    console.error('Error creating grant:', error);
    return NextResponse.json({ 
      error: 'Failed to create grant',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
