// ================================================================================
// CR AUDIOVIZ AI - CREDITS API ENDPOINT
// Get/manage user credits
// ================================================================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const getSupabase = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
};

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const authHeader = request.headers.get('authorization');

    // If no userId and no auth, return default credits (guest)
    if (!userId && !authHeader) {
      return NextResponse.json({
        balance: 0,
        lifetime_earned: 0,
        lifetime_spent: 0,
        plan: 'guest',
        message: 'Sign in to earn credits'
      });
    }

    const supabase = getSupabase();
    if (!supabase) {
      return NextResponse.json({
        balance: 0,
        error: 'Database not configured'
      });
    }

    let targetUserId = userId;

    // If auth header but no userId, get user from token
    if (!targetUserId && authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabase.auth.getUser(token);
      if (user) targetUserId = user.id;
    }

    if (!targetUserId) {
      return NextResponse.json({
        balance: 0,
        plan: 'guest',
        message: 'Sign in to earn credits'
      });
    }

    const { data: credits, error } = await supabase
      .from('credits')
      .select('*')
      .eq('user_id', targetUserId)
      .single();

    if (error || !credits) {
      // No credits record yet - return defaults
      return NextResponse.json({
        balance: 50, // New users get 50 free credits
        lifetime_earned: 50,
        lifetime_spent: 0,
        plan: 'free',
        user_id: targetUserId
      });
    }

    return NextResponse.json(credits);

  } catch (error: any) {
    console.error('Credits API error:', error);
    return NextResponse.json({
      balance: 0,
      error: 'Failed to fetch credits'
    }, { status: 200 }); // Graceful handling
  }
}
