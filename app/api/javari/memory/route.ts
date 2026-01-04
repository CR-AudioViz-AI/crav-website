// ================================================================================
// JAVARI MEMORY API - /api/javari/memory
// Returns capsule + current state snapshot + pinned memories + CAR docs
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

// Generate request ID for tracing
const generateRequestId = () => `req_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

export async function GET(request: NextRequest) {
  const requestId = generateRequestId();
  const startTime = Date.now();
  
  try {
    const supabase = getSupabase();
    if (!supabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }
    
    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get('conversation_id');
    const userId = searchParams.get('user_id');
    const tenantId = searchParams.get('tenant_id') || '00000000-0000-0000-0000-000000000000';
    
    // Fetch current capsule
    const { data: capsule } = await supabase
      .from('javari_memory_capsules')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('is_current', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    // Fetch pinned memories
    const { data: pinnedMemories } = await supabase
      .from('javari_memory_items')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('is_pinned', true)
      .eq('is_active', true)
      .order('importance', { ascending: false });
    
    // Fetch recent memories (top 20 by last_used)
    const { data: recentMemories } = await supabase
      .from('javari_memory_items')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('is_active', true)
      .order('last_used_at', { ascending: false, nullsFirst: false })
      .limit(20);
    
    // Fetch current state snapshot
    const { data: stateSnapshot } = await supabase
      .from('javari_state_snapshots')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('snapshot_type', 'current_state')
      .eq('is_current', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    // Fetch conversation context if provided
    let conversation = null;
    let threadHistory = null;
    if (conversationId) {
      const { data: conv } = await supabase
        .from('javari_conversations')
        .select('*')
        .eq('id', conversationId)
        .single();
      conversation = conv;
      
      // Get thread chain if this is part of a rollover series
      if (conv?.root_conversation_id) {
        const { data: threads } = await supabase
          .from('javari_conversations')
          .select('id, title, thread_number, created_at, status')
          .eq('root_conversation_id', conv.root_conversation_id)
          .order('thread_number', { ascending: true });
        threadHistory = threads;
      }
    }
    
    // Fetch feature flags
    const { data: flags } = await supabase
      .from('javari_feature_flags')
      .select('flag_name, flag_value')
      .eq('tenant_id', tenantId);
    
    const featureFlags = flags?.reduce((acc, f) => {
      acc[f.flag_name] = f.flag_value;
      return acc;
    }, {} as Record<string, boolean>) || {};
    
    return NextResponse.json({
      request_id: requestId,
      timestamp: new Date().toISOString(),
      latency_ms: Date.now() - startTime,
      
      // Core memory state
      capsule: capsule ? {
        id: capsule.id,
        text: capsule.capsule_text,
        token_count: capsule.token_count,
        version: capsule.version,
        created_at: capsule.created_at,
        car_path: capsule.car_path,
      } : null,
      
      // Memory items
      pinned_memories: pinnedMemories || [],
      recent_memories: recentMemories || [],
      memory_count: {
        pinned: pinnedMemories?.length || 0,
        recent: recentMemories?.length || 0,
      },
      
      // State snapshot
      state_snapshot: stateSnapshot?.content || null,
      state_car_path: stateSnapshot?.car_path || null,
      
      // Conversation context
      conversation,
      thread_history: threadHistory,
      
      // Feature flags
      feature_flags: featureFlags,
      
      // CAR document links
      car_links: {
        operating_bible: 'memory/OPERATING_BIBLE.md',
        current_state: 'memory/CURRENT_STATE.json',
        latest_capsule: capsule?.car_path || null,
      },
    });
    
  } catch (error: any) {
    return NextResponse.json({
      error: 'Memory retrieval failed',
      message: error.message,
      request_id: requestId,
    }, { status: 500 });
  }
}
