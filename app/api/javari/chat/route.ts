// ================================================================================
// JAVARI CHAT API - /api/javari/chat (FINAL - SESSION_ID UNIFIED)
// Main chat endpoint with auto-rollover support
// ================================================================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';
export const maxDuration = 60;

const getSupabase = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
};

const generateRequestId = () => `req_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
const generateSessionId = () => `sess_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;

// Rollover thresholds
const ROLLOVER_THRESHOLDS = {
  MESSAGE_COUNT: 120,
  TOKEN_ESTIMATE: 90000,
  LATENCY_MS_AVG: 2500,
};

// Check if rollover should be triggered
async function shouldRollover(supabase: any, sessionId: string): Promise<{ trigger: boolean; reason: string }> {
  // Get message count
  const { data: messages } = await supabase
    .from('javari_conversation_memory')
    .select('id, tokens_used, latency_ms')
    .eq('session_id', sessionId);
  
  const count = messages?.length || 0;
  
  if (count >= ROLLOVER_THRESHOLDS.MESSAGE_COUNT) {
    return { trigger: true, reason: `message_count_${count}` };
  }
  
  // Check token estimate
  const totalTokens = messages?.reduce((sum: number, m: any) => sum + (m.tokens_used || 0), 0) || 0;
  if (totalTokens >= ROLLOVER_THRESHOLDS.TOKEN_ESTIMATE) {
    return { trigger: true, reason: `token_estimate_${totalTokens}` };
  }
  
  // Check recent latency (last 10 messages)
  const recentMessages = messages?.slice(-10) || [];
  if (recentMessages.length >= 5) {
    const avgLatency = recentMessages.reduce((sum: number, m: any) => sum + (m.latency_ms || 0), 0) / recentMessages.length;
    if (avgLatency >= ROLLOVER_THRESHOLDS.LATENCY_MS_AVG) {
      return { trigger: true, reason: `latency_avg_${avgLatency}` };
    }
  }
  
  return { trigger: false, reason: 'none' };
}

// Generate capsule from session
async function generateCapsule(supabase: any, sessionId: string): Promise<string> {
  const { data: messages } = await supabase
    .from('javari_conversation_memory')
    .select('role, content, created_at')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: false })
    .limit(20);
  
  const lines = [
    '# Conversation Capsule',
    `Session: ${sessionId}`,
    `Generated: ${new Date().toISOString()}`,
    `Messages: ${messages?.length || 0}`,
    '',
    '## Key Discussion Points',
  ];
  
  const userMessages = messages?.filter((m: any) => m.role === 'user') || [];
  userMessages.slice(0, 5).forEach((m: any) => {
    lines.push(`- ${m.content?.slice(0, 80)}...`);
  });
  
  return lines.join('\n');
}

// Execute rollover
async function executeRollover(
  supabase: any,
  oldSessionId: string,
  userId: string | null,
  requestId: string
): Promise<{ newSessionId: string; capsuleText: string; threadNumber: number }> {
  
  // Get thread number from old session
  const { data: oldSystem } = await supabase
    .from('javari_conversation_memory')
    .select('extracted_facts')
    .eq('session_id', oldSessionId)
    .eq('role', 'system')
    .limit(1)
    .single();
  
  const oldFacts = oldSystem?.extracted_facts || {};
  const threadNumber = (oldFacts.thread_number || 1) + 1;
  
  // Generate capsule
  const capsuleText = await generateCapsule(supabase, oldSessionId);
  
  // Create new session
  const newSessionId = generateSessionId();
  
  // Insert system message with capsule into new session
  await supabase
    .from('javari_conversation_memory')
    .insert({
      user_id: userId,
      session_id: newSessionId,
      role: 'system',
      content: `[Thread ${threadNumber}] Continuing from ${oldSessionId}.\n\n${capsuleText}`,
      tokens_used: Math.ceil(capsuleText.length / 4),
      extracted_facts: {
        thread_number: threadNumber,
        rollover_from: oldSessionId,
        rollover_timestamp: new Date().toISOString(),
      },
    });
  
  // Mark old session as rolled over (add marker message)
  await supabase
    .from('javari_conversation_memory')
    .insert({
      user_id: userId,
      session_id: oldSessionId,
      role: 'system',
      content: `[ROLLED OVER] → ${newSessionId}`,
      extracted_facts: {
        rollover_to: newSessionId,
        rollover_timestamp: new Date().toISOString(),
      },
    });
  
  return { newSessionId, capsuleText, threadNumber };
}

export async function POST(request: NextRequest) {
  const requestId = generateRequestId();
  const startTime = Date.now();
  
  try {
    const supabase = getSupabase();
    if (!supabase) {
      return NextResponse.json({ error: 'Database not configured', request_id: requestId }, { status: 500 });
    }
    
    const body = await request.json();
    
    // Accept either session_id or conversation_id (normalize to session_id)
    let sessionId = body.session_id || body.conversation_id;
    const userId = body.user_id || null;
    const message = body.message;
    const forceRollover = body.force_rollover === true;
    
    if (!message) {
      return NextResponse.json({ error: 'Message required', request_id: requestId }, { status: 400 });
    }
    
    // Create new session if not provided
    if (!sessionId) {
      sessionId = generateSessionId();
      
      // Initialize session with system message
      await supabase
        .from('javari_conversation_memory')
        .insert({
          user_id: userId,
          session_id: sessionId,
          role: 'system',
          content: `[Thread 1] New conversation started.`,
          extracted_facts: { thread_number: 1 },
        });
    }
    
    // Check rollover conditions
    let rolledOver = false;
    let rolloverInfo: any = null;
    
    const rolloverCheck = await shouldRollover(supabase, sessionId);
    
    if (forceRollover || rolloverCheck.trigger) {
      const result = await executeRollover(supabase, sessionId, userId, requestId);
      const oldSessionId = sessionId;
      sessionId = result.newSessionId;
      rolledOver = true;
      rolloverInfo = {
        old_session_id: oldSessionId,
        new_session_id: result.newSessionId,
        thread_number: result.threadNumber,
        trigger_reason: forceRollover ? 'force_rollover' : rolloverCheck.reason,
        capsule_generated: true,
        message: 'Continuing in a new thread to keep performance fast.',
      };
    }
    
    // Store user message
    const userTokens = Math.ceil(message.length / 4);
    await supabase
      .from('javari_conversation_memory')
      .insert({
        user_id: userId,
        session_id: sessionId,
        role: 'user',
        content: message,
        tokens_used: userTokens,
      });
    
    // Generate assistant response (placeholder - real impl would call LLM)
    const responsePrefix = rolledOver ? '[Thread continued] ' : '';
    const assistantResponse = `${responsePrefix}Received: "${message.slice(0, 40)}..."`;
    const responseLatency = Date.now() - startTime;
    const responseTokens = Math.ceil(assistantResponse.length / 4);
    
    // Store assistant response
    await supabase
      .from('javari_conversation_memory')
      .insert({
        user_id: userId,
        session_id: sessionId,
        role: 'assistant',
        content: assistantResponse,
        tokens_used: responseTokens,
        latency_ms: responseLatency,
        model: 'javari-v1',
      });
    
    return NextResponse.json({
      request_id: requestId,
      session_id: sessionId,
      conversation_id: sessionId, // Alias for compatibility
      response: assistantResponse,
      tokens: {
        input: userTokens,
        output: responseTokens,
        total: userTokens + responseTokens,
      },
      latency_ms: responseLatency,
      rolled_over: rolledOver,
      rollover_info: rolloverInfo,
    });
    
  } catch (error: any) {
    return NextResponse.json({
      error: 'Chat failed',
      message: error.message,
      request_id: requestId,
    }, { status: 500 });
  }
}
