// =============================================================================
// CR AUDIOVIZ AI - UNIFIED CHECKOUT API
// =============================================================================
// app/api/checkout/route.ts
// Handles both Stripe and PayPal checkouts
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { paymentService, PRODUCTS } from '@/lib/payments/unified-payment-service';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      productId,
      billingCycle,
      paymentMethod,
      couponCode,
      referralCode,
    } = body;

    // Get user from session/auth
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify token and get user
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    // Validate product
    const product = PRODUCTS[productId];
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 400 }
      );
    }

    // Create checkout
    const result = await paymentService.createCheckout({
      productId,
      billingCycle: billingCycle || 'monthly',
      paymentMethod: paymentMethod || 'stripe',
      userId: user.id,
      userEmail: user.email!,
      successUrl: `${process.env.NEXT_PUBLIC_URL}/dashboard?purchase=success`,
      cancelUrl: `${process.env.NEXT_PUBLIC_URL}/pricing?cancelled=true`,
      couponCode,
      referralCode,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      checkoutUrl: result.checkoutUrl,
      sessionId: result.sessionId,
    });

  } catch (error: any) {
    console.error('Checkout API error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}

// Get available products
export async function GET() {
  const products = Object.values(PRODUCTS).map(product => ({
    id: product.id,
    name: product.name,
    description: product.description,
    category: product.category,
    priceMonthly: product.priceMonthly,
    priceAnnual: product.priceAnnual,
    priceOneTime: product.priceOneTime,
    credits: product.credits,
    bonusCredits: product.bonusCredits,
    features: product.features,
    recommended: product.recommended,
    badge: product.badge,
  }));

  return NextResponse.json({ products });
}
