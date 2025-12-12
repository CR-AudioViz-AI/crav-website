// app/api/credits/route.ts
// Centralized Credit System API - Universal credit management
// Timestamp: Dec 11, 2025 10:37 PM EST

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET - Check credit balance
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 });
    }

    const { data: credits, error } = await supabase
      .from('user_credits')
      .select('balance, lifetime_earned, lifetime_spent')
      .eq('user_id', userId)
      .single();

    if (error) {
      // Create credit record if doesn't exist
      if (error.code === 'PGRST116') {
        const { data: newCredits } = await supabase
          .from('user_credits')
          .insert({ user_id: userId, balance: 0, lifetime_earned: 0, lifetime_spent: 0 })
          .select()
          .single();
        return NextResponse.json({ success: true, credits: newCredits });
      }
      throw error;
    }

    return NextResponse.json({ success: true, credits });

  } catch (error) {
    console.error('Credit check error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to check credits' },
      { status: 500 }
    );
  }
}

// POST - Credit operations (check, deduct, add, refund)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, userId, amount, appId, operationId, reason } = body;

    if (!userId || !action) {
      return NextResponse.json({ error: 'userId and action required' }, { status: 400 });
    }

    // ============================================
    // CHECK - Verify user has enough credits
    // ============================================
    if (action === 'check') {
      const { data: credits } = await supabase
        .from('user_credits')
        .select('balance')
        .eq('user_id', userId)
        .single();

      const hasEnough = (credits?.balance || 0) >= (amount || 0);
      
      return NextResponse.json({
        success: true,
        hasEnough,
        balance: credits?.balance || 0,
        required: amount || 0,
      });
    }

    // ============================================
    // DEDUCT - Use credits for an operation
    // ============================================
    if (action === 'deduct') {
      if (!amount || amount <= 0) {
        return NextResponse.json({ error: 'Valid amount required' }, { status: 400 });
      }

      // Get current balance
      const { data: credits, error: balanceError } = await supabase
        .from('user_credits')
        .select('balance')
        .eq('user_id', userId)
        .single();

      if (balanceError || !credits) {
        return NextResponse.json({ error: 'User credits not found' }, { status: 404 });
      }

      if (credits.balance < amount) {
        return NextResponse.json({
          success: false,
          error: 'Insufficient credits',
          balance: credits.balance,
          required: amount,
        }, { status: 402 });
      }

      // Deduct credits atomically
      const { data: updated, error: deductError } = await supabase.rpc('deduct_credits', {
        p_user_id: userId,
        p_amount: amount,
      });

      if (deductError) {
        throw deductError;
      }

      // Log transaction
      await supabase.from('credit_transactions').insert({
        user_id: userId,
        type: 'deduction',
        credits: -amount,
        app_id: appId,
        operation_id: operationId,
        reason: reason || `Used ${amount} credits`,
      });

      return NextResponse.json({
        success: true,
        previousBalance: credits.balance,
        newBalance: credits.balance - amount,
        deducted: amount,
      });
    }

    // ============================================
    // ADD - Add credits to user account
    // ============================================
    if (action === 'add') {
      if (!amount || amount <= 0) {
        return NextResponse.json({ error: 'Valid amount required' }, { status: 400 });
      }

      const { data: updated, error } = await supabase.rpc('add_user_credits', {
        p_user_id: userId,
        p_credits: amount,
        p_source: reason || 'manual_add',
        p_reference_id: operationId,
      });

      if (error) throw error;

      // Get new balance
      const { data: credits } = await supabase
        .from('user_credits')
        .select('balance')
        .eq('user_id', userId)
        .single();

      return NextResponse.json({
        success: true,
        newBalance: credits?.balance || 0,
        added: amount,
      });
    }

    // ============================================
    // REFUND - Return credits for failed operation
    // ============================================
    if (action === 'refund') {
      if (!amount || amount <= 0 || !operationId) {
        return NextResponse.json({ error: 'amount and operationId required' }, { status: 400 });
      }

      // Check if already refunded
      const { data: existing } = await supabase
        .from('credit_transactions')
        .select('id')
        .eq('operation_id', operationId)
        .eq('type', 'refund')
        .single();

      if (existing) {
        return NextResponse.json({ 
          success: false, 
          error: 'Already refunded',
          message: 'This operation was already refunded' 
        }, { status: 409 });
      }

      // Add credits back
      await supabase.rpc('add_user_credits', {
        p_user_id: userId,
        p_credits: amount,
        p_source: 'refund',
        p_reference_id: operationId,
      });

      // Log refund
      await supabase.from('credit_transactions').insert({
        user_id: userId,
        type: 'refund',
        credits: amount,
        app_id: appId,
        operation_id: operationId,
        reason: reason || `Refund for operation ${operationId}`,
      });

      const { data: credits } = await supabase
        .from('user_credits')
        .select('balance')
        .eq('user_id', userId)
        .single();

      return NextResponse.json({
        success: true,
        refunded: amount,
        newBalance: credits?.balance || 0,
        message: 'Credits refunded successfully',
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    console.error('Credit operation error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Credit operation failed' },
      { status: 500 }
    );
  }
}
