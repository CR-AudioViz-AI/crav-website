import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
});

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET /api/customer/billing - Get billing info
export async function GET(req: NextRequest) {
  try {
    const supabase = createServerComponentClient({ cookies });
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("craiverse_profiles")
      .select("id, stripe_customer_id")
      .eq("auth_user_id", user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Get payment history
    const { data: payments } = await supabaseAdmin
      .from("craiverse_payments")
      .select("*")
      .eq("user_id", profile.id)
      .order("created_at", { ascending: false })
      .limit(20);

    // Get credit transactions
    const { data: creditTransactions } = await supabaseAdmin
      .from("craiverse_credit_transactions")
      .select("*")
      .eq("user_id", profile.id)
      .order("created_at", { ascending: false })
      .limit(20);

    // Get subscription
    const { data: subscription } = await supabaseAdmin
      .from("craiverse_subscriptions")
      .select(`
        *,
        craiverse_subscription_plans (*)
      `)
      .eq("user_id", profile.id)
      .eq("status", "active")
      .single();

    // Get Stripe payment methods if customer exists
    let paymentMethods: any[] = [];
    if (profile.stripe_customer_id) {
      try {
        const methods = await stripe.paymentMethods.list({
          customer: profile.stripe_customer_id,
          type: "card",
        });
        paymentMethods = methods.data.map(pm => ({
          id: pm.id,
          brand: pm.card?.brand,
          last4: pm.card?.last4,
          exp_month: pm.card?.exp_month,
          exp_year: pm.card?.exp_year,
          is_default: pm.id === subscription?.stripe_payment_method_id
        }));
      } catch (e) {
        console.error("Failed to fetch payment methods:", e);
      }
    }

    return NextResponse.json({
      payments: payments || [],
      credit_transactions: creditTransactions || [],
      subscription,
      payment_methods: paymentMethods
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/customer/billing - Create checkout session
export async function POST(req: NextRequest) {
  try {
    const supabase = createServerComponentClient({ cookies });
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { action, plan_id, credit_pack_id } = body;

    const { data: profile } = await supabase
      .from("craiverse_profiles")
      .select("id, email, stripe_customer_id")
      .eq("auth_user_id", user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Create or get Stripe customer
    let customerId = profile.stripe_customer_id;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: profile.email,
        metadata: { craiverse_user_id: profile.id }
      });
      customerId = customer.id;
      
      await supabaseAdmin
        .from("craiverse_profiles")
        .update({ stripe_customer_id: customerId })
        .eq("id", profile.id);
    }

    if (action === "subscribe" && plan_id) {
      // Get plan
      const { data: plan } = await supabaseAdmin
        .from("craiverse_subscription_plans")
        .select("*")
        .eq("id", plan_id)
        .single();

      if (!plan || !plan.stripe_price_id) {
        return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
      }

      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        mode: "subscription",
        line_items: [{ price: plan.stripe_price_id, quantity: 1 }],
        success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing?success=true`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?canceled=true`,
        metadata: { user_id: profile.id, plan_id: plan.id }
      });

      return NextResponse.json({ checkout_url: session.url });
    }

    if (action === "buy_credits" && credit_pack_id) {
      // Get credit pack
      const { data: pack } = await supabaseAdmin
        .from("craiverse_credit_packs")
        .select("*")
        .eq("id", credit_pack_id)
        .single();

      if (!pack) {
        return NextResponse.json({ error: "Invalid credit pack" }, { status: 400 });
      }

      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        mode: "payment",
        line_items: [{
          price_data: {
            currency: "usd",
            product_data: { name: `${pack.credits} Credits` },
            unit_amount: pack.price_cents
          },
          quantity: 1
        }],
        success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/credits?success=true`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/credits?canceled=true`,
        metadata: { 
          user_id: profile.id, 
          credit_pack_id: pack.id,
          credits: pack.credits,
          type: "credit_purchase"
        }
      });

      return NextResponse.json({ checkout_url: session.url });
    }

    if (action === "manage_billing") {
      const session = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing`
      });

      return NextResponse.json({ portal_url: session.url });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";
