// /app/api/user/credits/route.ts
// User Credits API - CR AudioViz AI
// Get balance, history, and manage credits

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET: Get user's credit balance and history
export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 401 });
    }

    // Get current balance from profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('credits, subscription_tier')
      .eq('id', userId)
      .single();

    if (profileError) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get recent credit history
    const { data: history, error: historyError } = await supabase
      .from('credits_ledger')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (historyError) {
      console.error('Error fetching credit history:', historyError);
    }

    // Calculate stats
    const totalEarned = (history || [])
      .filter(h => h.type === 'credit')
      .reduce((sum, h) => sum + h.amount, 0);
    
    const totalSpent = (history || [])
      .filter(h => h.type === 'debit')
      .reduce((sum, h) => sum + Math.abs(h.amount), 0);

    // Check if credits expire (free tier only)
    const creditsExpire = profile.subscription_tier === 'free';
    let expirationDate = null;
    
    if (creditsExpire) {
      // Free tier credits expire at end of month
      const now = new Date();
      expirationDate = new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString();
    }

    return NextResponse.json({
      balance: profile.credits,
      tier: profile.subscription_tier,
      creditsExpire,
      expirationDate,
      stats: {
        totalEarned,
        totalSpent
      },
      history: history || []
    });

  } catch (error) {
    console.error('Credits API error:', error);
    return NextResponse.json({ error: 'Failed to fetch credits' }, { status: 500 });
  }
}

// POST: Add credits (internal use / admin)
export async function POST(req: NextRequest) {
  try {
    const { userId, amount, source, referenceId } = await req.json();

    // Verify admin access (in production, check admin role)
    const adminKey = req.headers.get('x-admin-key');
    if (adminKey !== process.env.ADMIN_API_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    if (!userId || !amount || amount <= 0) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    // Insert ledger entry
    const { error: ledgerError } = await supabase.from('credits_ledger').insert({
      user_id: userId,
      amount,
      type: 'credit',
      source: source || 'admin_grant',
      reference_id: referenceId || `admin_${Date.now()}`
    });

    if (ledgerError) {
      throw ledgerError;
    }

    // Update balance
    const { data: updatedProfile, error: updateError } = await supabase.rpc('add_user_credits', {
      p_user_id: userId,
      p_amount: amount
    });

    if (updateError) {
      throw updateError;
    }

    return NextResponse.json({
      success: true,
      message: `Added ${amount} credits to user`,
      newBalance: updatedProfile
    });

  } catch (error) {
    console.error('Add credits error:', error);
    return NextResponse.json({ error: 'Failed to add credits' }, { status: 500 });
  }
}
