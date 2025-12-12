// app/api/paypal/orders/route.ts
// PayPal Orders API - Create and Capture
// Timestamp: Dec 11, 2025 9:52 PM EST

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { paypalClient } from '@/lib/paypal/client';
import { CREDIT_PACKS } from '@/lib/paypal/config';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, packId, userId, orderId } = body;

    // CAPTURE existing order
    if (type === 'capture' && orderId) {
      const captured = await paypalClient.captureOrder(orderId);
      
      if (captured.status === 'COMPLETED') {
        // Get the credit pack info from custom_id
        const customId = captured.purchase_units[0]?.custom_id;
        const [, creditPackId, dbUserId] = customId?.split('_') || [];
        
        const pack = CREDIT_PACKS[creditPackId as keyof typeof CREDIT_PACKS];
        
        if (pack && dbUserId) {
          // Add credits to user
          const { error: creditError } = await supabase.rpc('add_user_credits', {
            p_user_id: dbUserId,
            p_credits: pack.credits,
            p_source: 'paypal_purchase',
            p_reference_id: captured.id,
          });

          if (creditError) {
            console.error('Credit add error:', creditError);
          }

          // Record transaction
          await supabase.from('transactions').insert({
            user_id: dbUserId,
            type: 'credit_purchase',
            amount: parseFloat(captured.purchase_units[0].amount.value),
            credits: pack.credits,
            provider: 'paypal',
            provider_id: captured.id,
            status: 'completed',
            metadata: { pack_id: creditPackId, payer: captured.payer },
          });
        }
      }

      return NextResponse.json({
        success: true,
        order: captured,
      });
    }

    // CREATE new order
    const pack = CREDIT_PACKS[packId as keyof typeof CREDIT_PACKS];
    
    if (!pack) {
      return NextResponse.json(
        { error: 'Invalid credit pack' },
        { status: 400 }
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://craudiovizai.com';
    
    const order = await paypalClient.createOrder({
      amount: pack.price,
      description: `${pack.credits} Credits - CR AudioViz AI`,
      customId: `credits_${packId}_${userId}`,
      returnUrl: `${baseUrl}/dashboard/credits?success=true`,
      cancelUrl: `${baseUrl}/dashboard/credits?canceled=true`,
    });

    // Record pending transaction
    await supabase.from('transactions').insert({
      user_id: userId,
      type: 'credit_purchase',
      amount: pack.price,
      credits: pack.credits,
      provider: 'paypal',
      provider_id: order.id,
      status: 'pending',
      metadata: { pack_id: packId },
    });

    return NextResponse.json({
      success: true,
      orderId: order.id,
      approvalUrl: (order as any).links?.find((l: any) => l.rel === 'approve')?.href,
    });

  } catch (error) {
    console.error('PayPal order error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'PayPal order failed' },
      { status: 500 }
    );
  }
}
