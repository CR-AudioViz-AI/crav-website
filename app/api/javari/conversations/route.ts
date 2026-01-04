// ================================================================================
// JAVARI CONVERSATIONS API - /api/javari/conversations
// Conversation management with rollover support
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

// GET - Get conversation by ID or list conversations
export async function GET(request: NextRequest) {
  const requestId = generateRequestId();
  const supabase = getSupabase();
  if (!supabase) return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
  
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const tenantId = searchParams.get('tenant_id') || '00000000-0000-0000-0000-000000000000';
  const userId = searchParams.get('user_id');
  const status = searchParams.get('status');
  
  if (id) {
    // Get single conversation with thread history
    const { data: conv, error } = await supabase
      .from('javari_conversations')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      return NextResponse.json({ error: error.message, request_id: requestId }, { status: 404 });
    }
    
    // Get thread chain
    let threadChain = null;
    if (conv.root_conversation_id) {
      const { data: threads } = await supabase
        .from('javari_conversations')
        .select('id, title, thread_number, status, created_at, message_count')
        .eq('root_conversation_id', conv.root_conversation_id)
        .order('thread_number', { ascending: true });
      threadChain = threads;
    }
    
    // Get last capsule
    let lastCapsule = null;
    if (conv.last_capsule_id) {
      const { data: capsule } = await supabase
        .from('javari_memory_capsules')
        .select('*')
        .eq('id', conv.last_capsule_id)
        .single();
      lastCapsule = capsule;
    }
    
    // Get recent messages
    const { data: messages } = await supabase
      .from('javari_messages')
      .select('*')
      .eq('conversation_id', id)
      .order('created_at', { ascending: true })
      .limit(50);
    
    return NextResponse.json({
      request_id: requestId,
      conversation: conv,
      thread_chain: threadChain,
      thread_position: `Thread ${conv.thread_number} of ${threadChain?.length || 1}`,
      last_capsule: lastCapsule,
      messages: messages,
      message_count: messages?.length || 0,
      rollover_links: {
        previous: conv.rollover_from_conversation_id,
        next: conv.rollover_to_conversation_id,
      },
    });
  }
  
  // List conversations
  let query = supabase
    .from('javari_conversations')
    .select('id, title, status, thread_number, message_count, token_estimate, created_at, updated_at')
    .eq('tenant_id', tenantId);
  
  if (userId) query = query.eq('user_id', userId);
  if (status) query = query.eq('status', status);
  
  const { data, error } = await query.order('updated_at', { ascending: false }).limit(50);
  
  if (error) {
    return NextResponse.json({ error: error.message, request_id: requestId }, { status: 500 });
  }
  
  return NextResponse.json({
    request_id: requestId,
    conversations: data,
    count: data?.length || 0,
  });
}

// POST - Create new conversation
export async function POST(request: NextRequest) {
  const requestId = generateRequestId();
  const supabase = getSupabase();
  if (!supabase) return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
  
  try {
    const body = await request.json();
    const {
      tenant_id = '00000000-0000-0000-0000-000000000000',
      user_id,
      title = 'New Conversation',
    } = body;
    
    // Create conversation
    const { data: conv, error } = await supabase
      .from('javari_conversations')
      .insert({
        tenant_id,
        user_id,
        title,
        status: 'active',
        thread_number: 1,
      })
      .select()
      .single();
    
    if (error) {
      return NextResponse.json({ error: error.message, request_id: requestId }, { status: 500 });
    }
    
    // Set root_conversation_id to self
    await supabase
      .from('javari_conversations')
      .update({ root_conversation_id: conv.id })
      .eq('id', conv.id);
    
    // Log event
    await supabase.from('javari_memory_events').insert({
      tenant_id,
      user_id,
      conversation_id: conv.id,
      event_type: 'conversation_created',
      payload: { title },
      request_id: requestId,
    });
    
    return NextResponse.json({
      request_id: requestId,
      conversation: { ...conv, root_conversation_id: conv.id },
    });
    
  } catch (error: any) {
    return NextResponse.json({ error: error.message, request_id: requestId }, { status: 500 });
  }
}
