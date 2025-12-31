// app/api/javari/knowledge/route.ts
// CR AudioViz AI - Javari Knowledge Management API
// Henderson Standard: Fortune 50 Quality

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// GET: List knowledge sources and their status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const type = searchParams.get('type')
    const includeStats = searchParams.get('stats') === 'true'

    let query = supabase
      .from('javari_knowledge_sources')
      .select('*')
      .order('created_at', { ascending: false })

    if (status) {
      query = query.eq('status', status)
    }

    if (type) {
      query = query.eq('source_type', type)
    }

    const { data: sources, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Get stats if requested
    let stats = null
    if (includeStats) {
      const { data: statsData } = await supabase.rpc('get_knowledge_stats')
      stats = statsData
    }

    return NextResponse.json({
      sources,
      stats,
      total: sources?.length || 0
    })

  } catch (error) {
    console.error('Knowledge API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST: Add new knowledge source manually
export async function POST(request: NextRequest) {
  try {
    // Verify admin
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.split(' ')[1]
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Check admin role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || !['admin', 'super_admin'].includes(profile.role)) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const body = await request.json()
    const { source_type, source_name, source_path, title, description, product_id } = body

    if (!source_type || !source_name) {
      return NextResponse.json({ 
        error: 'source_type and source_name are required' 
      }, { status: 400 })
    }

    // Create knowledge source
    const { data: source, error: insertError } = await supabase
      .from('javari_knowledge_sources')
      .insert({
        source_type,
        source_name,
        source_path,
        title: title || source_name,
        description,
        product_id,
        status: 'pending'
      })
      .select()
      .single()

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      source,
      message: 'Knowledge source added and queued for processing'
    })

  } catch (error) {
    console.error('Add knowledge error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE: Remove knowledge source
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sourceId = searchParams.get('id')

    if (!sourceId) {
      return NextResponse.json({ error: 'Source ID required' }, { status: 400 })
    }

    // Verify admin (same as POST)
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.split(' ')[1]
    const { data: { user } } = await supabase.auth.getUser(token)
    
    if (!user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || !['admin', 'super_admin'].includes(profile.role)) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    // Delete source (cascades to chunks)
    const { error: deleteError } = await supabase
      .from('javari_knowledge_sources')
      .delete()
      .eq('id', sourceId)

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, deleted: sourceId })

  } catch (error) {
    console.error('Delete knowledge error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}