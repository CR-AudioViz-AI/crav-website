import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

// Credit packages mapping (Stripe price ID -> credits)
const CREDIT_PACKAGES: Record<string, { credits: number; bonus: number; name: string }> = {
  'price_starter': { credits: 100, bonus: 0, name: 'Starter' },
  'price_popular': { credits: 500, bonus: 50, name: 'Popular' },
  'price_pro': { credits: 1000, bonus: 150, name: 'Pro' },
  'price_enterprise': { credits: 5000, bonus: 1000, name: 'Enterprise' },
};

// Subscription plans mapping
const SUBSCRIPTION_PLANS: Record<string, { plan: string; credits_per_month: number }> = {
  'price_free': { plan: 'free', credits_per_month: 50 },
  'price_starter_monthly': { plan: 'starter', credits_per_month: 200 },
  'price_pro_monthly': { plan: 'pro', credits_per_month: 1000 },
  'price_enterprise_monthly': { plan: 'enterprise', credits_per_month: 5000 },
};

async function addCreditsToUser(userId: string, credits: number, bonus: number, source: string, reference: string) {
  // Get current credits
  const { data: current } = await supabase
    .from('craiverse_credits')
    .select('*')
    .eq('user_id', userId)
    .single();

  const newBalance = (current?.balance || 0) + credits;
  const newBonus = (current?.bonus_balance || 0) + bonus;
  const lifetimeEarned = (current?.lifetime_earned || 0) + credits + bonus;

  // Update credits
  await supabase.from('craiverse_credits').upsert({
    user_id: userId,
    balance: newBalance,
    bonus_balance: newBonus,
    lifetime_earned: lifetimeEarned,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'user_id' });

  // Log transaction
  await supabase.from('craiverse_credit_transactions').insert({
    user_id: userId,
    amount: credits + bonus,
    balance_after: newBalance + newBonus,
    type: 'purchase',
    source_app: 'craiverse',
    source_action: source,
    source_reference_id: reference,
    description: `Purchased ${credits} credits` + (bonus > 0 ? ` + ${bonus} bonus` : ''),
  });

  // Send notification
  await supabase.from('craiverse_notifications').insert({
    user_id: userId,
    type: 'credits_added',
    title: 'Credits Added! 🎉',
    message: `${credits + bonus} credits have been added to your account.`,
    source_app: 'craiverse',
    source_type: 'payment',
    source_id: reference,
  });

  return { newBalance, newBonus };
}

async function handleCheckoutComplete(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.user_id;
  if (!userId) {
    console.error('No user_id in session metadata');
    return;
  }

  // Handle one-time credit purchase
  if (session.mode === 'payment') {
    const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
    
    for (const item of lineItems.data) {
      const priceId = item.price?.id;
      const packageInfo = priceId ? CREDIT_PACKAGES[priceId] : null;
      
      if (packageInfo) {
        await addCreditsToUser(
          userId,
          packageInfo.credits,
          packageInfo.bonus,
          'stripe_checkout',
          session.id
        );
      }
    }
  }

  // Handle subscription
  if (session.mode === 'subscription' && session.subscription) {
    const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
    const priceId = subscription.items.data[0]?.price.id;
    const planInfo = priceId ? SUBSCRIPTION_PLANS[priceId] : null;

    if (planInfo) {
      await supabase.from('craiverse_subscriptions').upsert({
        user_id: userId,
        plan: planInfo.plan,
        status: 'active',
        billing_cycle: subscription.items.data[0]?.price.recurring?.interval === 'year' ? 'yearly' : 'monthly',
        stripe_subscription_id: subscription.id,
        stripe_customer_id: session.customer as string,
        current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        credits_per_month: planInfo.credits_per_month,
        credits_used_this_month: 0,
        credits_reset_at: new Date(subscription.current_period_end * 1000).toISOString(),
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });

      // Add monthly credits
      await addCreditsToUser(
        userId,
        planInfo.credits_per_month,
        0,
        'subscription_renewal',
        subscription.id
      );
    }
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const { data: sub } = await supabase
    .from('craiverse_subscriptions')
    .select('user_id')
    .eq('stripe_subscription_id', subscription.id)
    .single();

  if (!sub) return;

  const status = subscription.status === 'active' ? 'active' 
    : subscription.status === 'past_due' ? 'past_due'
    : subscription.status === 'canceled' ? 'canceled'
    : subscription.status === 'trialing' ? 'trialing'
    : 'paused';

  await supabase.from('craiverse_subscriptions').update({
    status,
    current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
    current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
    canceled_at: subscription.canceled_at ? new Date(subscription.canceled_at * 1000).toISOString() : null,
    updated_at: new Date().toISOString(),
  }).eq('stripe_subscription_id', subscription.id);

  // Notify user of status change
  if (status === 'canceled') {
    await supabase.from('craiverse_notifications').insert({
      user_id: sub.user_id,
      type: 'subscription_canceled',
      title: 'Subscription Canceled',
      message: 'Your subscription has been canceled. You can still use remaining credits.',
      source_app: 'craiverse',
    });
  }
}

async function handleInvoicePaid(invoice: Stripe.Invoice) {
  if (!invoice.subscription) return;

  const { data: sub } = await supabase
    .from('craiverse_subscriptions')
    .select('user_id, credits_per_month')
    .eq('stripe_subscription_id', invoice.subscription)
    .single();

  if (!sub) return;

  // Add monthly credits on renewal
  await addCreditsToUser(
    sub.user_id,
    sub.credits_per_month,
    0,
    'subscription_renewal',
    invoice.id
  );

  // Reset monthly usage
  await supabase.from('craiverse_subscriptions').update({
    credits_used_this_month: 0,
    credits_reset_at: new Date().toISOString(),
  }).eq('stripe_subscription_id', invoice.subscription);
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  if (!invoice.subscription) return;

  const { data: sub } = await supabase
    .from('craiverse_subscriptions')
    .select('user_id')
    .eq('stripe_subscription_id', invoice.subscription)
    .single();

  if (!sub) return;

  await supabase.from('craiverse_notifications').insert({
    user_id: sub.user_id,
    type: 'payment_failed',
    title: 'Payment Failed ⚠️',
    message: 'We couldn\'t process your subscription payment. Please update your payment method.',
    action_url: '/settings/billing',
    action_label: 'Update Payment',
    source_app: 'craiverse',
  });
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutComplete(event.data.object as Stripe.Checkout.Session);
        break;

      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;

      case 'invoice.paid':
        await handleInvoicePaid(event.data.object as Stripe.Invoice);
        break;

      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error('Webhook handler error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
