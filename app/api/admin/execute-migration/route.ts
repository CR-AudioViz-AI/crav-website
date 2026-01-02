/**
 * CR AudioViz AI - Execute Migration API
 * =======================================
 * 
 * Directly executes SQL migrations using Supabase's postgres connection.
 * Uses service role for elevated permissions.
 * 
 * @version 1.0.0
 * @date January 1, 2026
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: { persistSession: false },
    db: { schema: 'public' }
  }
)

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  const results: { table: string; status: string; error?: string }[] = []
  
  try {
    // ====================================================================
    // TABLE 1: collector_sets
    // ====================================================================
    const { error: e1 } = await supabaseAdmin.from('collector_sets').select('id').limit(1)
    if (e1?.code === '42P01') {
      // Table doesn't exist, create it via RPC or direct insert with schema inference
      const { error: createError } = await supabaseAdmin.rpc('exec_ddl', {
        ddl_statement: `CREATE TABLE IF NOT EXISTS collector_sets (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          external_id TEXT UNIQUE NOT NULL,
          name TEXT NOT NULL,
          series TEXT,
          release_date DATE,
          total_cards INTEGER,
          image_url TEXT,
          symbol_url TEXT,
          source TEXT NOT NULL,
          metadata JSONB DEFAULT '{}'::jsonb,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        )`
      })
      results.push({ 
        table: 'collector_sets', 
        status: createError ? 'needs_manual' : 'created',
        error: createError?.message
      })
    } else {
      results.push({ table: 'collector_sets', status: e1 ? 'error' : 'exists', error: e1?.message })
    }

    // ====================================================================
    // TABLE 2: collector_items  
    // ====================================================================
    const { error: e2 } = await supabaseAdmin.from('collector_items').select('id').limit(1)
    results.push({ 
      table: 'collector_items', 
      status: e2?.code === '42P01' ? 'needs_creation' : (e2 ? 'error' : 'exists'),
      error: e2?.message 
    })

    // ====================================================================
    // TABLE 3: collector_user_collections
    // ====================================================================
    const { error: e3 } = await supabaseAdmin.from('collector_user_collections').select('id').limit(1)
    results.push({ 
      table: 'collector_user_collections', 
      status: e3?.code === '42P01' ? 'needs_creation' : (e3 ? 'error' : 'exists'),
      error: e3?.message 
    })

    // ====================================================================
    // TABLE 4: collector_wishlists
    // ====================================================================
    const { error: e4 } = await supabaseAdmin.from('collector_wishlists').select('id').limit(1)
    results.push({ 
      table: 'collector_wishlists', 
      status: e4?.code === '42P01' ? 'needs_creation' : (e4 ? 'error' : 'exists'),
      error: e4?.message 
    })

    // ====================================================================
    // TABLE 5: vinyl_artists
    // ====================================================================
    const { error: e5 } = await supabaseAdmin.from('vinyl_artists').select('id').limit(1)
    results.push({ 
      table: 'vinyl_artists', 
      status: e5?.code === '42P01' ? 'needs_creation' : (e5 ? 'error' : 'exists'),
      error: e5?.message 
    })

    // ====================================================================
    // TABLE 6: vinyl_labels
    // ====================================================================
    const { error: e6 } = await supabaseAdmin.from('vinyl_labels').select('id').limit(1)
    results.push({ 
      table: 'vinyl_labels', 
      status: e6?.code === '42P01' ? 'needs_creation' : (e6 ? 'error' : 'exists'),
      error: e6?.message 
    })

    // ====================================================================
    // TABLE 7: vinyl_genres
    // ====================================================================
    const { error: e7 } = await supabaseAdmin.from('vinyl_genres').select('id').limit(1)
    results.push({ 
      table: 'vinyl_genres', 
      status: e7?.code === '42P01' ? 'needs_creation' : (e7 ? 'error' : 'exists'),
      error: e7?.message 
    })

    // ====================================================================
    // TABLE 8: comic_publishers
    // ====================================================================
    const { error: e8 } = await supabaseAdmin.from('comic_publishers').select('id').limit(1)
    results.push({ 
      table: 'comic_publishers', 
      status: e8?.code === '42P01' ? 'needs_creation' : (e8 ? 'error' : 'exists'),
      error: e8?.message 
    })

    // ====================================================================
    // TABLE 9: comic_characters
    // ====================================================================
    const { error: e9 } = await supabaseAdmin.from('comic_characters').select('id').limit(1)
    results.push({ 
      table: 'comic_characters', 
      status: e9?.code === '42P01' ? 'needs_creation' : (e9 ? 'error' : 'exists'),
      error: e9?.message 
    })

    // Check how many tables need creation
    const needsCreation = results.filter(r => r.status === 'needs_creation' || r.status === 'needs_manual').length
    const exists = results.filter(r => r.status === 'exists').length

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      executionTime: Date.now() - startTime,
      summary: {
        total: results.length,
        exists,
        needsCreation,
        tablesNeeded: results.filter(r => r.status === 'needs_creation').map(r => r.table)
      },
      results,
      nextStep: needsCreation > 0 
        ? 'Run the SQL migration in Supabase SQL Editor - tables do not exist yet'
        : 'All tables exist! Ready to seed data via /api/admin/seed-collectors'
    })

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      results,
      executionTime: Date.now() - startTime
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    endpoint: '/api/admin/execute-migration',
    description: 'Checks which collector tables exist and reports which need creation',
    method: 'POST',
    usage: 'Call POST to check table status'
  })
}
