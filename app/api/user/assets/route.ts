// /app/api/user/assets/route.ts
// Fetch user's personal assets from the library
// Timestamp: January 3, 2026 - 4:30 PM EST
// CR AudioViz AI - Henderson Standard
// Uses owned_by field (existing column) for user ownership

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Admin emails that get access to all assets for testing
const ADMIN_EMAILS = [
  'royhenderson@craudiovizai.com',
  'cindyhenderson@craudiovizai.com'
]

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    // Get session from cookie or header
    const authHeader = request.headers.get('authorization')
    let userId: string | null = null
    let userEmail: string | null = null

    // Try to get user from Supabase auth
    const accessToken = cookieStore.get('sb-access-token')?.value ||
                       cookieStore.get('supabase-auth-token')?.value ||
                       authHeader?.replace('Bearer ', '')

    if (accessToken) {
      const { data: { user }, error } = await supabase.auth.getUser(accessToken)
      if (user && !error) {
        userId = user.id
        userEmail = user.email || null
      }
    }

    // Also check for session in profiles table via cookie
    if (!userId) {
      const sessionId = cookieStore.get('session_id')?.value
      if (sessionId) {
        const { data: session } = await supabase
          .from('sessions')
          .select('user_id, profiles(email)')
          .eq('id', sessionId)
          .single()
        
        if (session?.user_id) {
          userId = session.user_id
          userEmail = (session as any).profiles?.email
        }
      }
    }

    // If still no user, return 401
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Please log in to view your library' },
        { status: 401 }
      )
    }

    const isAdmin = userEmail && ADMIN_EMAILS.includes(userEmail)

    // Parse query params
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') // 'audiobook', 'ebook', 'document', 'all'
    const limit = parseInt(searchParams.get('limit') || '100')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Build query - use owned_by OR uploaded_by (existing columns)
    let query = supabase
      .from('assets')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)
      .range(offset, offset + limit - 1)

    // Filter by user ownership
    if (!isAdmin) {
      query = query.or(`owned_by.eq.${userId},uploaded_by.eq.${userId}`)
    }

    // Filter by type
    if (type && type !== 'all') {
      switch (type) {
        case 'audiobook':
          query = query.in('file_extension', ['mp3', 'wav', 'ogg', 'm4a'])
          break
        case 'ebook':
          query = query.in('file_extension', ['pdf', 'epub', 'mobi'])
          break
        case 'document':
          query = query.in('file_extension', ['docx', 'txt', 'md', 'doc'])
          break
      }
    }

    // For non-admins, only show assets they own
    if (!isAdmin) {
      // The or() clause above already handles this
    }

    const { data: assets, error: fetchError } = await query

    if (fetchError) {
      console.error('Failed to fetch assets:', fetchError)
      return NextResponse.json(
        { error: 'Failed to fetch assets', details: fetchError.message },
        { status: 500 }
      )
    }

    // Get total count for pagination
    let countQuery = supabase
      .from('assets')
      .select('id', { count: 'exact', head: true })

    if (!isAdmin) {
      countQuery = countQuery.or(`owned_by.eq.${userId},uploaded_by.eq.${userId}`)
    }

    const { count } = await countQuery

    return NextResponse.json({
      success: true,
      assets: assets || [],
      total: count || 0,
      userId,
      isAdmin,
      pagination: {
        limit,
        offset,
        hasMore: (assets?.length || 0) === limit
      }
    })

  } catch (error) {
    console.error('User assets API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE - Remove an asset from user's library
export async function DELETE(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    const body = await request.json()
    const { assetId } = body

    if (!assetId) {
      return NextResponse.json(
        { error: 'Asset ID required' },
        { status: 400 }
      )
    }

    // Get user session
    const accessToken = cookieStore.get('sb-access-token')?.value
    if (!accessToken) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { data: { user } } = await supabase.auth.getUser(accessToken)
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const isAdmin = user.email && ADMIN_EMAILS.includes(user.email)

    // Verify ownership (unless admin)
    if (!isAdmin) {
      const { data: asset } = await supabase
        .from('assets')
        .select('owned_by, uploaded_by')
        .eq('id', assetId)
        .single()

      if (!asset || (asset.owned_by !== user.id && asset.uploaded_by !== user.id)) {
        return NextResponse.json(
          { error: 'Asset not found or access denied' },
          { status: 403 }
        )
      }
    }

    // Soft delete - just remove user association
    const { error: deleteError } = await supabase
      .from('assets')
      .update({ 
        owned_by: null,
        status: 'archived',
        archived_at: new Date().toISOString()
      })
      .eq('id', assetId)

    if (deleteError) {
      return NextResponse.json(
        { error: 'Failed to delete asset' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Asset removed from library'
    })

  } catch (error) {
    console.error('Delete asset error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
