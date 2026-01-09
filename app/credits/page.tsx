// /app/credits/page.tsx
// Buy Credits Page - CR AudioViz AI
// One-time credit package purchases

'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface CreditPackage {
  id: string;
  name: string;
  credits: number;
  bonus: number;
  price: number;
  popular?: boolean;
  bestValue?: boolean;
}

const CREDIT_PACKAGES: CreditPackage[] = [
  { id: 'basic', name: 'Basic', credits: 100, bonus: 0, price: 5 },
  { id: 'plus', name: 'Plus', credits: 500, bonus: 50, price: 20, popular: true },
  { id: 'pro', name: 'Pro', credits: 1000, bonus: 150, price: 35, bestValue: true },
  { id: 'business', name: 'Business', credits: 5000, bonus: 1000, price: 150 },
  { id: 'enterprise', name: 'Enterprise', credits: 10000, bonus: 2500, price: 250 }
];

export default function CreditsPage() {
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'paypal'>('stripe');
  const [loading, setLoading] = useState(false);

  const handlePurchase = async () => {
    if (!selectedPackage) return;
    setLoading(true);

    try {
      if (paymentMethod === 'stripe') {
        const response = await fetch('/api/payments/stripe/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            mode: 'payment',
            packageId: selectedPackage,
            userId: 'demo-user' // Replace with actual user ID
          })
        });
        const { url } = await response.json();
        if (url) window.location.href = url;
      } else {
        const response = await fetch('/api/payments/paypal/create-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'credits',
            packageId: selectedPackage,
            userId: 'demo-user'
          })
        });
        const { approvalUrl } = await response.json();
        if (approvalUrl) window.location.href = approvalUrl;
      }
    } catch (error) {
      console.error('Purchase error:', error);
      alert('Failed to process purchase. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const pkg = selectedPackage ? CREDIT_PACKAGES.find(p => p.id === selectedPackage) : null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/dashboard" className="text-gray-500 hover:text-gray-700">
              ← Back to Dashboard
            </Link>
            <h1 className="font-bold text-gray-900 dark:text-white">Buy Credits</h1>
            <Link href="/pricing" className="text-blue-600 hover:underline text-sm">
              View Plans
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Top Up Your Credits
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            One-time purchases. Credits never expire. Use them whenever you want.
          </p>
        </div>

        {/* Packages Grid */}
        <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-4 mb-12">
          {CREDIT_PACKAGES.map((pack) => (
            <motion.button
              key={pack.id}
              onClick={() => setSelectedPackage(pack.id)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`relative p-6 rounded-2xl border-2 text-left transition-all ${
                selectedPackage === pack.id
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300'
              }`}
            >
              {pack.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-blue-500 text-white text-xs font-bold rounded-full">
                  Popular
                </span>
              )}
              {pack.bestValue && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-cyan-500 text-white text-xs font-bold rounded-full">
                  Best Value
                </span>
              )}

              <div className="text-center">
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">{pack.name}</h3>
                <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                  {(pack.credits + pack.bonus).toLocaleString()}
                </div>
                <div className="text-sm text-gray-500 mb-4">credits</div>
                {pack.bonus > 0 && (
                  <div className="text-cyan-500 text-sm font-medium mb-2">
                    +{pack.bonus.toLocaleString()} bonus!
                  </div>
                )}
                <div className="text-2xl font-bold text-blue-600">
                  ${pack.price}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  ${(pack.price / (pack.credits + pack.bonus) * 100).toFixed(1)}¢ per credit
                </div>
              </div>

              {selectedPackage === pack.id && (
                <div className="absolute top-2 right-2">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
              )}
            </motion.button>
          ))}
        </div>

        {/* Purchase Section */}
        {selectedPackage && pkg && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8"
          >
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              Complete Your Purchase
            </h3>

            {/* Order Summary */}
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 mb-6">
              <div className="flex justify-between mb-2">
                <span className="text-gray-600 dark:text-gray-400">Package</span>
                <span className="font-medium text-gray-900 dark:text-white">{pkg.name}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600 dark:text-gray-400">Base Credits</span>
                <span className="text-gray-900 dark:text-white">{pkg.credits.toLocaleString()}</span>
              </div>
              {pkg.bonus > 0 && (
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600 dark:text-gray-400">Bonus Credits</span>
                  <span className="text-cyan-500">+{pkg.bonus.toLocaleString()}</span>
                </div>
              )}
              <div className="border-t border-gray-200 dark:border-gray-600 my-3" />
              <div className="flex justify-between">
                <span className="font-bold text-gray-900 dark:text-white">Total Credits</span>
                <span className="font-bold text-blue-600">{(pkg.credits + pkg.bonus).toLocaleString()}</span>
              </div>
              <div className="flex justify-between mt-2">
                <span className="font-bold text-gray-900 dark:text-white">Amount</span>
                <span className="font-bold text-gray-900 dark:text-white">${pkg.price}</span>
              </div>
            </div>

            {/* Payment Method */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Payment Method
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setPaymentMethod('stripe')}
                  className={`p-4 border-2 rounded-xl flex items-center justify-center gap-3 transition-all ${
                    paymentMethod === 'stripe'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="text-2xl">💳</span>
                  <div className="text-left">
                    <div className="font-medium text-gray-900 dark:text-white">Card</div>
                    <div className="text-xs text-gray-500">Visa, MC, Amex</div>
                  </div>
                </button>
                <button
                  onClick={() => setPaymentMethod('paypal')}
                  className={`p-4 border-2 rounded-xl flex items-center justify-center gap-3 transition-all ${
                    paymentMethod === 'paypal'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="text-2xl">🅿️</span>
                  <div className="text-left">
                    <div className="font-medium text-gray-900 dark:text-white">PayPal</div>
                    <div className="text-xs text-gray-500">Fast & secure</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Purchase Button */}
            <button
              onClick={handlePurchase}
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-xl font-bold text-lg hover:from-blue-700 hover:to-cyan-500 disabled:opacity-50 transition-all"
            >
              {loading ? 'Processing...' : `Pay $${pkg.price} with ${paymentMethod === 'stripe' ? 'Card' : 'PayPal'}`}
            </button>

            {/* Fine Print */}
            <p className="text-center text-sm text-gray-500 mt-4">
              Credits are added instantly after payment. Never expire.
            </p>
          </motion.div>
        )}

        {/* Benefits */}
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          <div className="text-center p-6">
            <div className="text-4xl mb-3">⚡</div>
            <h4 className="font-bold text-gray-900 dark:text-white mb-2">Instant Delivery</h4>
            <p className="text-gray-600 dark:text-gray-400 text-sm">Credits added immediately after purchase</p>
          </div>
          <div className="text-center p-6">
            <div className="text-4xl mb-3">♾️</div>
            <h4 className="font-bold text-gray-900 dark:text-white mb-2">Never Expire</h4>
            <p className="text-gray-600 dark:text-gray-400 text-sm">Use your credits whenever you want</p>
          </div>
          <div className="text-center p-6">
            <div className="text-4xl mb-3">🔒</div>
            <h4 className="font-bold text-gray-900 dark:text-white mb-2">Secure Payment</h4>
            <p className="text-gray-600 dark:text-gray-400 text-sm">Protected by Stripe & PayPal</p>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-12 bg-white dark:bg-gray-800 rounded-xl p-8">
          <h3 className="font-bold text-gray-900 dark:text-white mb-6">Frequently Asked Questions</h3>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">How do credits work?</h4>
              <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                Credits are used for AI features. Different tools cost different amounts (1-5 credits typically).
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">Do credits expire?</h4>
              <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                No! Purchased credits and credits from paid plans never expire. Use them at your own pace.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">Can I get a refund?</h4>
              <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                Yes, we offer refunds within 7 days if you haven't used the credits. Contact support.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
