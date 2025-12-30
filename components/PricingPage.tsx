// /components/PricingPage.tsx
// Subscription Pricing Page - CR AudioViz AI / Javari
// Clean, conversion-optimized pricing with Stripe integration

'use client';

import React, { useState } from 'react';

// =============================================================================
// PRICING TIERS
// =============================================================================

export interface PricingTier {
  id: string;
  name: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  credits: number;
  creditsBonus?: number; // Extra credits for yearly
  features: string[];
  highlighted?: boolean;
  ctaText: string;
  stripePriceIdMonthly?: string;
  stripePriceIdYearly?: string;
}

export const PRICING_TIERS: PricingTier[] = [
  {
    id: 'free',
    name: 'Free',
    description: 'Get started with Javari',
    monthlyPrice: 0,
    yearlyPrice: 0,
    credits: 50,
    features: [
      '50 credits/month',
      'Access to Javari AI',
      'Basic creative tools',
      'Community support',
      'Credits expire monthly'
    ],
    ctaText: 'Get Started Free'
  },
  {
    id: 'starter',
    name: 'Starter',
    description: 'For individuals and hobbyists',
    monthlyPrice: 9,
    yearlyPrice: 90, // 2 months free
    credits: 500,
    creditsBonus: 100,
    features: [
      '500 credits/month',
      'Everything in Free',
      'Priority AI responses',
      'All creative tools',
      'Email support',
      'Credits never expire'
    ],
    ctaText: 'Start Free Trial',
    stripePriceIdMonthly: 'price_starter_monthly',
    stripePriceIdYearly: 'price_starter_yearly'
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'For professionals and creators',
    monthlyPrice: 29,
    yearlyPrice: 290, // 2 months free
    credits: 2000,
    creditsBonus: 500,
    highlighted: true,
    features: [
      '2,000 credits/month',
      'Everything in Starter',
      'Advanced AI models',
      'API access',
      'Priority support',
      'Custom branding',
      'Analytics dashboard',
      'Credits never expire'
    ],
    ctaText: 'Start Free Trial',
    stripePriceIdMonthly: 'price_pro_monthly',
    stripePriceIdYearly: 'price_pro_yearly'
  },
  {
    id: 'business',
    name: 'Business',
    description: 'For teams and businesses',
    monthlyPrice: 99,
    yearlyPrice: 990, // 2 months free
    credits: 10000,
    creditsBonus: 2000,
    features: [
      '10,000 credits/month',
      'Everything in Pro',
      'Unlimited team members',
      'Admin dashboard',
      'SSO integration',
      'Dedicated support',
      'Custom integrations',
      'SLA guarantee',
      'Credits never expire'
    ],
    ctaText: 'Contact Sales',
    stripePriceIdMonthly: 'price_business_monthly',
    stripePriceIdYearly: 'price_business_yearly'
  }
];

// =============================================================================
// CREDIT PACKAGES (One-time purchases)
// =============================================================================

export interface CreditPackage {
  id: string;
  credits: number;
  price: number;
  bonus?: number;
  popular?: boolean;
}

export const CREDIT_PACKAGES: CreditPackage[] = [
  { id: 'credits_100', credits: 100, price: 5 },
  { id: 'credits_500', credits: 500, price: 20, bonus: 50 },
  { id: 'credits_1000', credits: 1000, price: 35, bonus: 150, popular: true },
  { id: 'credits_5000', credits: 5000, price: 150, bonus: 1000 },
  { id: 'credits_10000', credits: 10000, price: 250, bonus: 2500 }
];

// =============================================================================
// PRICING PAGE COMPONENT
// =============================================================================

interface PricingPageProps {
  userId?: string;
  currentPlan?: string;
  onSelectPlan?: (tierId: string, billingCycle: 'monthly' | 'yearly') => void;
  onBuyCredits?: (packageId: string) => void;
  showCreditsSection?: boolean;
}

export function PricingPage({
  userId,
  currentPlan,
  onSelectPlan,
  onBuyCredits,
  showCreditsSection = true
}: PricingPageProps) {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');
  const [loading, setLoading] = useState<string | null>(null);

  const handleSelectPlan = async (tier: PricingTier) => {
    if (tier.id === 'free') {
      // Free plan - just redirect to signup
      window.location.href = '/signup';
      return;
    }

    if (tier.id === 'business') {
      // Business - contact sales
      window.location.href = '/contact?plan=business';
      return;
    }

    setLoading(tier.id);
    
    try {
      if (onSelectPlan) {
        await onSelectPlan(tier.id, billingCycle);
      } else {
        // Default: redirect to checkout
        const priceId = billingCycle === 'yearly' 
          ? tier.stripePriceIdYearly 
          : tier.stripePriceIdMonthly;
        
        const response = await fetch('/api/payments/create-checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            priceId,
            userId,
            mode: 'subscription'
          })
        });
        
        const { url } = await response.json();
        if (url) window.location.href = url;
      }
    } catch (error) {
      console.error('Checkout error:', error);
    } finally {
      setLoading(null);
    }
  };

  const handleBuyCredits = async (pkg: CreditPackage) => {
    setLoading(pkg.id);
    
    try {
      if (onBuyCredits) {
        await onBuyCredits(pkg.id);
      } else {
        const response = await fetch('/api/payments/create-checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            productId: pkg.id,
            userId,
            mode: 'payment',
            credits: pkg.credits + (pkg.bonus || 0)
          })
        });
        
        const { url } = await response.json();
        if (url) window.location.href = url;
      }
    } catch (error) {
      console.error('Purchase error:', error);
    } finally {
      setLoading(null);
    }
  };

  const yearlySavings = (tier: PricingTier) => {
    if (tier.monthlyPrice === 0) return 0;
    return Math.round(((tier.monthlyPrice * 12 - tier.yearlyPrice) / (tier.monthlyPrice * 12)) * 100);
  };

  return (
    <div className="bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 py-16 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Start free, upgrade when you need more. Credits never expire on paid plans.
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="flex justify-center items-center gap-4 mb-12">
          <span className={`text-sm ${billingCycle === 'monthly' ? 'text-gray-900 dark:text-white font-medium' : 'text-gray-500'}`}>
            Monthly
          </span>
          <button
            onClick={() => setBillingCycle(b => b === 'monthly' ? 'yearly' : 'monthly')}
            className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600"
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                billingCycle === 'yearly' ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
          <span className={`text-sm ${billingCycle === 'yearly' ? 'text-gray-900 dark:text-white font-medium' : 'text-gray-500'}`}>
            Yearly
          </span>
          <span className="ml-2 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 text-xs font-medium px-2 py-1 rounded-full">
            Save up to 17%
          </span>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {PRICING_TIERS.map((tier) => (
            <div
              key={tier.id}
              className={`relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden ${
                tier.highlighted 
                  ? 'ring-2 ring-blue-600 scale-105' 
                  : 'border border-gray-200 dark:border-gray-700'
              }`}
            >
              {/* Popular Badge */}
              {tier.highlighted && (
                <div className="absolute top-0 right-0 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                  MOST POPULAR
                </div>
              )}

              <div className="p-6">
                {/* Tier Name */}
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                  {tier.name}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  {tier.description}
                </p>

                {/* Price */}
                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-gray-900 dark:text-white">
                      ${billingCycle === 'yearly' 
                        ? Math.round(tier.yearlyPrice / 12) 
                        : tier.monthlyPrice}
                    </span>
                    <span className="text-gray-500 dark:text-gray-400">/month</span>
                  </div>
                  {billingCycle === 'yearly' && tier.yearlyPrice > 0 && (
                    <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                      ${tier.yearlyPrice}/year (save {yearlySavings(tier)}%)
                    </p>
                  )}
                </div>

                {/* Credits */}
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 mb-6">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-300">Monthly Credits</span>
                    <span className="font-bold text-gray-900 dark:text-white">
                      {tier.credits.toLocaleString()}
                    </span>
                  </div>
                  {billingCycle === 'yearly' && tier.creditsBonus && (
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-sm text-green-600 dark:text-green-400">Yearly Bonus</span>
                      <span className="font-bold text-green-600 dark:text-green-400">
                        +{tier.creditsBonus.toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>

                {/* CTA Button */}
                <button
                  onClick={() => handleSelectPlan(tier)}
                  disabled={loading === tier.id || currentPlan === tier.id}
                  className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                    tier.highlighted
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : tier.id === 'free'
                      ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600'
                      : 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {loading === tier.id ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Processing...
                    </span>
                  ) : currentPlan === tier.id ? (
                    'Current Plan'
                  ) : (
                    tier.ctaText
                  )}
                </button>

                {/* Features */}
                <ul className="mt-6 space-y-3">
                  {tier.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <svg className="w-5 h-5 text-green-500 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-600 dark:text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* Credit Packages Section */}
        {showCreditsSection && (
          <div className="mt-20">
            <div className="text-center mb-10">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Need More Credits?
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Buy credit packs anytime. They never expire.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 max-w-4xl mx-auto">
              {CREDIT_PACKAGES.map((pkg) => (
                <div
                  key={pkg.id}
                  className={`relative bg-white dark:bg-gray-800 rounded-xl p-4 text-center ${
                    pkg.popular 
                      ? 'ring-2 ring-blue-600' 
                      : 'border border-gray-200 dark:border-gray-700'
                  }`}
                >
                  {pkg.popular && (
                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded">
                      BEST VALUE
                    </div>
                  )}
                  
                  <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                    {pkg.credits.toLocaleString()}
                  </div>
                  
                  {pkg.bonus && (
                    <div className="text-sm text-green-600 dark:text-green-400 font-medium mb-2">
                      +{pkg.bonus.toLocaleString()} bonus
                    </div>
                  )}
                  
                  <div className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                    ${pkg.price}
                  </div>
                  
                  <button
                    onClick={() => handleBuyCredits(pkg)}
                    disabled={loading === pkg.id}
                    className="w-full py-2 px-3 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
                  >
                    {loading === pkg.id ? 'Processing...' : 'Buy Now'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* FAQ Section */}
        <div className="mt-20 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-8">
            Frequently Asked Questions
          </h2>
          
          <div className="space-y-4">
            {[
              {
                q: 'What are credits used for?',
                a: 'Credits are used for AI interactions, creative tools, and premium features. Different actions cost different amounts of credits. Basic AI chats might cost 1 credit, while advanced image generation could cost 10-50 credits.'
              },
              {
                q: 'Do unused credits roll over?',
                a: 'On paid plans, your credits never expire! On the free plan, unused credits reset at the end of each month.'
              },
              {
                q: 'Can I upgrade or downgrade anytime?',
                a: "Yes! You can change your plan anytime. When upgrading, you'll get immediate access to new features. When downgrading, changes take effect at your next billing date."
              },
              {
                q: 'Is there a free trial?',
                a: 'Yes! Starter and Pro plans come with a 7-day free trial. No credit card required to start.'
              },
              {
                q: 'What payment methods do you accept?',
                a: 'We accept all major credit cards, debit cards, and PayPal. Enterprise customers can also pay via invoice.'
              },
              {
                q: 'Can I get a refund?',
                a: "We offer a 30-day money-back guarantee. If you're not satisfied, contact us for a full refund."
              }
            ].map((faq, idx) => (
              <details key={idx} className="group bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <summary className="flex items-center justify-between p-4 cursor-pointer list-none">
                  <span className="font-medium text-gray-900 dark:text-white">{faq.q}</span>
                  <svg className="w-5 h-5 text-gray-500 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="px-4 pb-4 text-gray-600 dark:text-gray-400">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>

        {/* Enterprise CTA */}
        <div className="mt-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 md:p-12 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Need a Custom Solution?
          </h2>
          <p className="text-blue-100 max-w-2xl mx-auto mb-6">
            For enterprise teams, white-label solutions, or custom integrations, 
            let's talk about how Javari can work for your organization.
          </p>
          <a
            href="/contact?plan=enterprise"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-blue-600 font-medium rounded-lg hover:bg-blue-50 transition-colors"
          >
            Contact Enterprise Sales
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// DEFAULT EXPORT
// =============================================================================

export default PricingPage;
