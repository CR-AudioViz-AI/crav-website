// ================================================================================
// CR AUDIOVIZ AI - ENHANCEMENT REQUESTS API
// Feature requests with voting, AI analysis, and prioritization
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

async function getUser(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader) return null;
  const supabase = getSupabase();
  if (!supabase) return null;
  const token = authHeader.replace('Bearer ', '');
  const { data: { user } } = await supabase.auth.getUser(token);
  return user;
}

function generateRequestNumber(): string {
  const date = new Date();
  const prefix = 'ENH';
  const timestamp = date.getFullYear().toString().slice(-2) + 
    (date.getMonth() + 1).toString().padStart(2, '0') +
    date.getDate().toString().padStart(2, '0');
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

// ============================================================================
// GET /api/enhancements - List enhancement requests
// ============================================================================
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const sortBy = searchParams.get('sort') || 'votes'; // votes, recent, priority
    const limit = parseInt(searchParams.get('limit') || '50');

    const supabase = getSupabase();
    if (!supabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    let query = supabase
      .from('enhancement_requests')
      .select('*', { count: 'exact' })
      .limit(limit);

    if (status) query = query.eq('status', status);
    if (category) query = query.eq('category', category);

    // Sort options
    if (sortBy === 'votes') {
      query = query.order('upvotes', { ascending: false });
    } else if (sortBy === 'priority') {
      query = query.order('priority', { ascending: true });
    } else {
      query = query.order('created_at', { ascending: false });
    }

    const { data: enhancements, error, count } = await query;

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch enhancements' }, { status: 500 });
    }

    // Stats
    const stats = {
      total: count || 0,
      pending_review: enhancements?.filter(e => e.status === 'pending').length || 0,
      approved: enhancements?.filter(e => e.approval_status === 'approved').length || 0,
      in_progress: enhancements?.filter(e => e.status === 'in_progress').length || 0,
      completed: enhancements?.filter(e => e.status === 'completed').length || 0
    };

    return NextResponse.json({
      enhancements: enhancements || [],
      total: count || 0,
      stats,
      limit
    });

  } catch (error: any) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ============================================================================
// POST /api/enhancements - Create new enhancement request
// ============================================================================
export async function POST(request: NextRequest) {
  try {
    const user = await getUser(request);
    const supabase = getSupabase();
    if (!supabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    const body = await request.json();
    const {
      title,
      description,
      use_case,
      expected_benefit,
      category = 'feature',
      priority = 'medium',
      source_app
    } = body;

    if (!title || !description) {
      return NextResponse.json({ error: 'title and description required' }, { status: 400 });
    }

    const requestNumber = generateRequestNumber();

    const { data: enhancement, error } = await supabase
      .from('enhancement_requests')
      .insert({
        request_number: requestNumber,
        user_id: user?.id,
        user_email: user?.email || body.email,
        user_name: body.name || user?.user_metadata?.full_name,
        title,
        description,
        use_case,
        expected_benefit,
        category,
        priority,
        status: 'pending',
        source_app,
        upvotes: 1, // Creator's implicit upvote
        downvotes: 0,
        view_count: 0,
        comment_count: 0
      })
      .select()
      .single();

    if (error) {
      console.error('Enhancement creation error:', error);
      return NextResponse.json({ error: 'Failed to create enhancement request' }, { status: 500 });
    }

    // Audit log
    await supabase.from('audit_logs').insert({
      user_id: user?.id,
      action: 'enhancement_created',
      resource_type: 'enhancement_request',
      resource_id: enhancement.id,
      details: { request_number: requestNumber, title, category }
    });

    return NextResponse.json({
      enhancement,
      success: true,
      message: `Enhancement request ${requestNumber} submitted`
    }, { status: 201 });

  } catch (error: any) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ============================================================================
// PATCH /api/enhancements - Update or vote on enhancement
// ============================================================================
export async function PATCH(request: NextRequest) {
  try {
    const user = await getUser(request);
    const supabase = getSupabase();
    if (!supabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    const body = await request.json();
    const { id, action, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'Enhancement ID required' }, { status: 400 });
    }

    // Handle voting
    if (action === 'upvote') {
      const { error } = await supabase.rpc('increment_upvotes', { enhancement_id: id });
      if (error) {
        // Fallback if RPC doesn't exist
        await supabase
          .from('enhancement_requests')
          .update({ upvotes: supabase.sql`upvotes + 1` })
          .eq('id', id);
      }
      return NextResponse.json({ success: true, action: 'upvoted' });
    }

    if (action === 'downvote') {
      await supabase
        .from('enhancement_requests')
        .update({ downvotes: supabase.sql`downvotes + 1` })
        .eq('id', id);
      return NextResponse.json({ success: true, action: 'downvoted' });
    }

    // Regular update
    updates.updated_at = new Date().toISOString();

    const { data: enhancement, error } = await supabase
      .from('enhancement_requests')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: 'Failed to update enhancement' }, { status: 500 });
    }

    return NextResponse.json({ enhancement, success: true });

  } catch (error: any) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
