// /api/marketplace/payouts/route.ts
// Marketplace Vendor Payouts API - CR AudioViz AI
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://kteobfyferrukqeolofj.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// GET: List payouts for vendor or get payout details
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const payoutId = searchParams.get('id');
    const vendorId = searchParams.get('vendorId');
    const status = searchParams.get('status');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');

    if (!SUPABASE_SERVICE_KEY) {
      return NextResponse.json({ error: 'Server not configured' }, { status: 500 });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // Get single payout
    if (payoutId) {
      const { data, error } = await supabase
        .from('marketplace_payouts')
        .select('*')
        .eq('id', payoutId)
        .single();

      if (error) {
        return NextResponse.json({ error: 'Payout not found' }, { status: 404 });
      }

      return NextResponse.json({ payout: data });
    }

    // List payouts
    if (!vendorId) {
      return NextResponse.json({ error: 'vendorId required' }, { status: 400 });
    }

    let query = supabase
      .from('marketplace_payouts')
      .select('*', { count: 'exact' })
      .eq('vendor_id', vendorId);

    if (status) {
      query = query.eq('status', status);
    }

    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Also get pending balance
    const { data: pendingOrders } = await supabase
      .from('marketplace_order_items')
      .select('vendor_payout_cents')
      .eq('vendor_id', vendorId)
      .in('order_id', (
        await supabase
          .from('marketplace_orders')
          .select('id')
          .eq('payment_status', 'paid')
          .eq('fulfillment_status', 'delivered')
      ).data?.map(o => o.id) || []);

    const pendingBalance = pendingOrders?.reduce((sum, item) => sum + item.vendor_payout_cents, 0) || 0;

    return NextResponse.json({
      payouts: data || [],
      total: count || 0,
      pendingBalance,
      limit,
      offset
    });

  } catch (error) {
    console.error('Payouts API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST: Request payout (vendor initiates)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { vendorId } = body;

    if (!vendorId) {
      return NextResponse.json({ error: 'vendorId required' }, { status: 400 });
    }

    if (!SUPABASE_SERVICE_KEY) {
      return NextResponse.json({ error: 'Server not configured' }, { status: 500 });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // Get vendor info
    const { data: vendor, error: vendorError } = await supabase
      .from('marketplace_vendors')
      .select('*')
      .eq('id', vendorId)
      .single();

    if (vendorError || !vendor) {
      return NextResponse.json({ error: 'Vendor not found' }, { status: 404 });
    }

    if (vendor.verification_status !== 'verified') {
      return NextResponse.json(
        { error: 'Vendor must be verified to request payouts' },
        { status: 403 }
      );
    }

    // Get unpaid completed orders
    const { data: orders, error: ordersError } = await supabase
      .from('marketplace_orders')
      .select(`
        id,
        items:marketplace_order_items(vendor_payout_cents)
      `)
      .eq('payment_status', 'paid')
      .eq('fulfillment_status', 'delivered');

    if (ordersError) {
      return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
    }

    // Filter orders that have items for this vendor and haven't been paid out
    const eligibleOrderIds: string[] = [];
    let totalPayout = 0;

    for (const order of orders || []) {
      const vendorItems = (order.items as any[])?.filter(
        (item: any) => item.vendor_id === vendorId
      );
      if (vendorItems && vendorItems.length > 0) {
        const orderPayout = vendorItems.reduce(
          (sum: number, item: any) => sum + item.vendor_payout_cents, 0
        );
        totalPayout += orderPayout;
        eligibleOrderIds.push(order.id);
      }
    }

    // Check minimum threshold
    if (totalPayout < vendor.payout_threshold_cents) {
      return NextResponse.json({
        error: `Minimum payout threshold not met. Need $${(vendor.payout_threshold_cents / 100).toFixed(2)}, have $${(totalPayout / 100).toFixed(2)}`
      }, { status: 400 });
    }

    // Create payout request
    const now = new Date();
    const { data: payout, error: payoutError } = await supabase
      .from('marketplace_payouts')
      .insert({
        vendor_id: vendorId,
        amount_cents: totalPayout,
        status: 'pending',
        payout_method: vendor.payout_method,
        period_start: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        period_end: now.toISOString(),
        order_count: eligibleOrderIds.length,
        order_ids: eligibleOrderIds
      })
      .select()
      .single();

    if (payoutError) {
      console.error('Payout creation error:', payoutError);
      return NextResponse.json({ error: payoutError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      payout,
      message: `Payout of $${(totalPayout / 100).toFixed(2)} requested. Processing within 3-5 business days.`
    });

  } catch (error) {
    console.error('Payouts API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH: Process payout (admin only)
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      payoutId,
      status,
      stripeTransferId,
      paypalPayoutId,
      notes,
      failureReason
    } = body;

    if (!payoutId || !status) {
      return NextResponse.json({ error: 'payoutId and status required' }, { status: 400 });
    }

    if (!SUPABASE_SERVICE_KEY) {
      return NextResponse.json({ error: 'Server not configured' }, { status: 500 });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    const updates: Record<string, any> = {
      status
    };

    if (status === 'processing') {
      updates.processed_at = new Date().toISOString();
    }

    if (status === 'completed') {
      updates.completed_at = new Date().toISOString();
    }

    if (stripeTransferId) updates.stripe_transfer_id = stripeTransferId;
    if (paypalPayoutId) updates.paypal_payout_id = paypalPayoutId;
    if (notes) updates.notes = notes;
    if (failureReason) updates.failure_reason = failureReason;

    const { data, error } = await supabase
      .from('marketplace_payouts')
      .update(updates)
      .eq('id', payoutId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, payout: data });

  } catch (error) {
    console.error('Payouts API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
