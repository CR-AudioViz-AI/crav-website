import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID!;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET!;
const PAYPAL_WEBHOOK_ID = process.env.PAYPAL_WEBHOOK_ID!;
const PAYPAL_API_URL = process.env.PAYPAL_MODE === 'live' 
  ? 'https://api-m.paypal.com'
  : 'https://api-m.sandbox.paypal.com';

// Credit packages mapping (PayPal plan ID -> credits)
const CREDIT_PACKAGES: Record<string, { credits: number; bonus: number; name: string }> = {
  'CREDIT_STARTER': { credits: 100, bonus: 0, name: 'Starter' },
  'CREDIT_POPULAR': { credits: 500, bonus: 50, name: 'Popular' },
  'CREDIT_PRO': { credits: 1000, bonus: 150, name: 'Pro' },
  'CREDIT_ENTERPRISE': { credits: 5000, bonus: 1000, name: 'Enterprise' },
};

const SUBSCRIPTION_PLANS: Record<string, { plan: string; credits_per_month: number }> = {
  'PLAN_STARTER': { plan: 'starter', credits_per_month: 200 },
  'PLAN_PRO': { plan: 'pro', credits_per_month: 1000 },
  'PLAN_ENTERPRISE': { plan: 'enterprise', credits_per_month: 5000 },
};

async function getPayPalAccessToken(): Promise<string> {
  const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString('base64');
  
  const response = await fetch(`${PAYPAL_API_URL}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  const data = await response.json();
  return data.access_token;
}

async function verifyWebhookSignature(
  body: string,
  headers: Record<string, string>
): Promise<boolean> {
  try {
    const accessToken = await getPayPalAccessToken();
    
    const response = await fetch(`${PAYPAL_API_URL}/v1/notifications/verify-webhook-signature`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        auth_algo: headers['paypal-auth-algo'],
        cert_url: headers['paypal-cert-url'],
        transmission_id: headers['paypal-transmission-id'],
        transmission_sig: headers['paypal-transmission-sig'],
        transmission_time: headers['paypal-transmission-time'],
        webhook_id: PAYPAL_WEBHOOK_ID,
        webhook_event: JSON.parse(body),
      }),
    });

    const result = await response.json();
    return result.verification_status === 'SUCCESS';
  } catch (error) {
    console.error('PayPal webhook verification failed:', error);
    return false;
  }
}

async function addCreditsToUser(userId: string, credits: number, bonus: number, source: string, reference: string) {
  const { data: current } = await supabase
    .from('craiverse_credits')
    .select('*')
    .eq('user_id', userId)
    .single();

  const newBalance = (current?.balance || 0) + credits;
  const newBonus = (current?.bonus_balance || 0) + bonus;
  const lifetimeEarned = (current?.lifetime_earned || 0) + credits + bonus;

  await supabase.from('craiverse_credits').upsert({
    user_id: userId,
    balance: newBalance,
    bonus_balance: newBonus,
    lifetime_earned: lifetimeEarned,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'user_id' });

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

async function handlePaymentCompleted(event: any) {
  const orderId = event.resource.id;
  const customId = event.resource.purchase_units?.[0]?.custom_id;
  
  if (!customId) {
    console.error('No custom_id in PayPal order');
    return;
  }

  // custom_id format: "user_id:package_id"
  const [userId, packageId] = customId.split(':');
  const packageInfo = CREDIT_PACKAGES[packageId];

  if (!packageInfo) {
    console.error('Unknown package:', packageId);
    return;
  }

  await addCreditsToUser(userId, packageInfo.credits, packageInfo.bonus, 'paypal_checkout', orderId);
}

async function handleSubscriptionActivated(event: any) {
  const subscriptionId = event.resource.id;
  const customId = event.resource.custom_id;
  const planId = event.resource.plan_id;

  if (!customId) return;

  const userId = customId;
  const planInfo = SUBSCRIPTION_PLANS[planId];

  if (!planInfo) return;

  const startTime = new Date(event.resource.start_time);
  const nextBillingTime = new Date(event.resource.billing_info?.next_billing_time || startTime);

  await supabase.from('craiverse_subscriptions').upsert({
    user_id: userId,
    plan: planInfo.plan,
    status: 'active',
    billing_cycle: 'monthly',
    paypal_subscription_id: subscriptionId,
    current_period_start: startTime.toISOString(),
    current_period_end: nextBillingTime.toISOString(),
    credits_per_month: planInfo.credits_per_month,
    credits_used_this_month: 0,
    credits_reset_at: nextBillingTime.toISOString(),
    updated_at: new Date().toISOString(),
  }, { onConflict: 'user_id' });

  await addCreditsToUser(userId, planInfo.credits_per_month, 0, 'subscription_activation', subscriptionId);
}

async function handleSubscriptionCancelled(event: any) {
  const subscriptionId = event.resource.id;

  await supabase.from('craiverse_subscriptions').update({
    status: 'canceled',
    canceled_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }).eq('paypal_subscription_id', subscriptionId);

  const { data: sub } = await supabase
    .from('craiverse_subscriptions')
    .select('user_id')
    .eq('paypal_subscription_id', subscriptionId)
    .single();

  if (sub) {
    await supabase.from('craiverse_notifications').insert({
      user_id: sub.user_id,
      type: 'subscription_canceled',
      title: 'Subscription Canceled',
      message: 'Your PayPal subscription has been canceled.',
      source_app: 'craiverse',
    });
  }
}

async function handlePaymentSaleCompleted(event: any) {
  // Recurring payment received
  const subscriptionId = event.resource.billing_agreement_id;
  
  if (!subscriptionId) return;

  const { data: sub } = await supabase
    .from('craiverse_subscriptions')
    .select('user_id, credits_per_month')
    .eq('paypal_subscription_id', subscriptionId)
    .single();

  if (!sub) return;

  await addCreditsToUser(sub.user_id, sub.credits_per_month, 0, 'subscription_renewal', event.resource.id);

  await supabase.from('craiverse_subscriptions').update({
    credits_used_this_month: 0,
    credits_reset_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }).eq('paypal_subscription_id', subscriptionId);
}

async function handlePaymentFailed(event: any) {
  const subscriptionId = event.resource.billing_agreement_id;

  if (!subscriptionId) return;

  const { data: sub } = await supabase
    .from('craiverse_subscriptions')
    .select('user_id')
    .eq('paypal_subscription_id', subscriptionId)
    .single();

  if (!sub) return;

  await supabase.from('craiverse_subscriptions').update({
    status: 'past_due',
    updated_at: new Date().toISOString(),
  }).eq('paypal_subscription_id', subscriptionId);

  await supabase.from('craiverse_notifications').insert({
    user_id: sub.user_id,
    type: 'payment_failed',
    title: 'Payment Failed ⚠️',
    message: 'Your PayPal subscription payment failed. Please check your PayPal account.',
    action_url: '/settings/billing',
    action_label: 'View Billing',
    source_app: 'craiverse',
  });
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  
  const headers: Record<string, string> = {};
  request.headers.forEach((value, key) => {
    headers[key.toLowerCase()] = value;
  });

  // Verify webhook signature
  const isValid = await verifyWebhookSignature(body, headers);
  if (!isValid) {
    console.error('Invalid PayPal webhook signature');
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const event = JSON.parse(body);

  try {
    switch (event.event_type) {
      case 'CHECKOUT.ORDER.APPROVED':
      case 'PAYMENT.CAPTURE.COMPLETED':
        await handlePaymentCompleted(event);
        break;

      case 'BILLING.SUBSCRIPTION.ACTIVATED':
        await handleSubscriptionActivated(event);
        break;

      case 'BILLING.SUBSCRIPTION.CANCELLED':
      case 'BILLING.SUBSCRIPTION.SUSPENDED':
        await handleSubscriptionCancelled(event);
        break;

      case 'PAYMENT.SALE.COMPLETED':
        await handlePaymentSaleCompleted(event);
        break;

      case 'PAYMENT.SALE.DENIED':
      case 'BILLING.SUBSCRIPTION.PAYMENT.FAILED':
        await handlePaymentFailed(event);
        break;

      default:
        console.log(`Unhandled PayPal event: ${event.event_type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('PayPal webhook error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
