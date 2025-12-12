// app/api/javari/session/route.ts
// Javari Session Management
// Timestamp: Dec 11, 2025 11:02 PM EST

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { user_id } = await request.json();

    // Create new session
    const { data: session, error } = await supabase
      .from('javari_sessions')
      .insert({
        user_id,
        started_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      session_id: session.id,
    });

  } catch (error) {
    console.error('Session error:', error);
    return NextResponse.json(
      { error: 'Failed to create session' },
      { status: 500 }
    );
  }
}

// End session
export async function PATCH(request: NextRequest) {
  try {
    const { session_id, satisfaction_rating } = await request.json();

    await supabase
      .from('javari_sessions')
      .update({
        ended_at: new Date().toISOString(),
        user_satisfaction: satisfaction_rating,
      })
      .eq('id', session_id);

    return NextResponse.json({ success: true });

  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to end session' },
      { status: 500 }
    );
  }
}
