// app/api/notifications/route.ts
// Get user notifications
// Timestamp: Dec 11, 2025 11:55 PM EST

import { NextRequest, NextResponse } from 'next/server';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET() {
  const supabase = createServerComponentClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: notifications } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false })
    .limit(20);

  return NextResponse.json({ notifications: notifications || [] });
}

export async function POST(request: NextRequest) {
  const supabase = createServerComponentClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  
  await supabase.from('notifications').insert({
    user_id: body.user_id || session.user.id,
    type: body.type,
    title: body.title,
    message: body.message,
    action_url: body.action_url,
  });

  return NextResponse.json({ success: true });
}
