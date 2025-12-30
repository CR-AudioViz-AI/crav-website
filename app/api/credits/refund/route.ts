// /api/credits/refund/route.ts
// Credit Refund API - CR AudioViz AI
// Automatic refunds for AI errors (customer-first policy)
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://kteobfyferrukqeolofj.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, amount, reason, appId, originalTransactionId } = body;

    if (!userId || !amount || !reason || !appId) {
      return NextResponse.json(
        { error: 'userId, amount, reason, and appId required' }, 
        { status: 400 }
      );
    }

    if (amount <= 0) {
      return NextResponse.json(
        { error: 'Refund amount must be positive' }, 
        { status: 400 }
      );
    }

    if (!SUPABASE_SERVICE_KEY) {
      return NextResponse.json({ error: 'Server not configured' }, { status: 500 });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // Get current balance
    const { data: credits, error: fetchError } = await supabase
      .from('user_credits')
      .select('balance, lifetime_spent')
      .eq('user_id', userId)
      .single();

    if (fetchError) {
      console.error('Failed to fetch balance:', fetchError);
      return NextResponse.json({ 
        success: false, 
        error: 'User not found' 
      }, { status: 404 });
    }

    // Add refund to balance
    const newBalance = credits.balance + amount;
    
    // Optionally reduce lifetime_spent (for accurate metrics)
    const newLifetimeSpent = Math.max(0, (credits.lifetime_spent || 0) - amount);

    const { error: updateError } = await supabase
      .from('user_credits')
      .update({ 
        balance: newBalance, 
        lifetime_spent: newLifetimeSpent,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);

    if (updateError) {
      console.error('Failed to refund:', updateError);
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to process refund' 
      }, { status: 500 });
    }

    // Log refund transaction
    await supabase.from('credit_transactions').insert({
      user_id: userId,
      amount: amount, // Positive for refund
      transaction_type: 'refund',
      app_id: appId,
      operation: 'refund',
      description: `Refund: ${reason}`,
      metadata: { 
        reason,
        original_transaction_id: originalTransactionId 
      }
    });

    return NextResponse.json({
      success: true,
      refunded: amount,
      newBalance: newBalance,
      reason: reason
    });

  } catch (error) {
    console.error('Refund API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
