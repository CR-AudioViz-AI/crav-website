// app/api/credits/balance/route.ts
// Get user credit balance
// Timestamp: Dec 11, 2025 11:55 PM EST

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('user_id');

  if (!userId) {
    return NextResponse.json({ error: 'user_id required' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('user_credits')
    .select('balance, lifetime_earned, lifetime_spent')
    .eq('user_id', userId)
    .single();

  if (error) {
    // Return 0 if no record exists
    return NextResponse.json({ balance: 0, lifetime_earned: 0, lifetime_spent: 0 });
  }

  return NextResponse.json(data);
}
