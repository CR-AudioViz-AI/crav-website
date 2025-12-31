/**
 * CR AudioViz AI - Central Trading API
 * Trade matching and management for collectibles
 * 
 * @author CR AudioViz AI, LLC
 * @created December 31, 2025
 */

import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET /api/trading - Get trades or matches
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const user_id = searchParams.get('user_id');
    const trade_id = searchParams.get('trade_id');
    const status = searchParams.get('status');
    const find_matches = searchParams.get('find_matches') === 'true';
    const item_id = searchParams.get('item_id');

    // Get single trade
    if (trade_id) {
      const { data, error } = await supabase
        .from('trades')
        .select('*, trade_items(*), trade_messages(*)')
        .eq('id', trade_id)
        .single();

      if (error) return NextResponse.json({ error: 'Trade not found' }, { status: 404 });
      return NextResponse.json({ trade: data });
    }

    // Find trade matches for an item
    if (find_matches && item_id) {
      // Get the item's wishlist matches
      const { data: item } = await supabase
        .from('collectibles')
        .select('*')
        .eq('id', item_id)
        .single();

      if (!item) return NextResponse.json({ error: 'Item not found' }, { status: 404 });

      // Find users who want this item
      const { data: matches } = await supabase
        .from('wishlists')
        .select('user_id, collectibles!inner(*)')
        .ilike('item_name', `%${item.name}%`)
        .neq('user_id', item.user_id)
        .limit(20);

      return NextResponse.json({ matches: matches || [] });
    }

    // Get user's trades
    if (user_id) {
      let query = supabase
        .from('trades')
        .select('*, trade_items(*)')
        .or(`initiator_id.eq.${user_id},recipient_id.eq.${user_id}`)
        .order('created_at', { ascending: false });

      if (status) query = query.eq('status', status);

      const { data, error } = await query;

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ trades: data });
    }

    return NextResponse.json({ error: 'user_id or trade_id required' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/trading - Create trade offer
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      initiator_id, recipient_id,
      offered_items, requested_items,
      message, app_id
    } = body;

    if (!initiator_id || !recipient_id || !offered_items?.length) {
      return NextResponse.json(
        { error: 'initiator_id, recipient_id, and offered_items are required' },
        { status: 400 }
      );
    }

    // Create trade
    const { data: trade, error: tradeError } = await supabase
      .from('trades')
      .insert({
        initiator_id,
        recipient_id,
        status: 'pending',
        app_id: app_id || 'unknown',
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (tradeError) return NextResponse.json({ error: tradeError.message }, { status: 500 });

    // Add offered items
    for (const item_id of offered_items) {
      await supabase.from('trade_items').insert({
        trade_id: trade.id,
        item_id,
        type: 'offered',
        created_at: new Date().toISOString()
      });
    }

    // Add requested items
    if (requested_items?.length) {
      for (const item_id of requested_items) {
        await supabase.from('trade_items').insert({
          trade_id: trade.id,
          item_id,
          type: 'requested',
          created_at: new Date().toISOString()
        });
      }
    }

    // Add initial message if provided
    if (message) {
      await supabase.from('trade_messages').insert({
        trade_id: trade.id,
        user_id: initiator_id,
        message,
        created_at: new Date().toISOString()
      });
    }

    return NextResponse.json({ success: true, trade });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/trading - Update trade status
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { trade_id, status, user_id, message } = body;

    if (!trade_id || !status) {
      return NextResponse.json({ error: 'trade_id and status required' }, { status: 400 });
    }

    const validStatuses = ['pending', 'accepted', 'rejected', 'countered', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: `Invalid status. Must be: ${validStatuses.join(', ')}` }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('trades')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', trade_id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Add message if provided
    if (message && user_id) {
      await supabase.from('trade_messages').insert({
        trade_id,
        user_id,
        message,
        created_at: new Date().toISOString()
      });
    }

    return NextResponse.json({ success: true, trade: data });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
