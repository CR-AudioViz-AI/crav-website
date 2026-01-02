// Javari Library Subscription Checkout
// Timestamp: January 1, 2026 - 2:50 PM EST
// CR AudioViz AI - Annual Subscription Plans

'use client'

import { useState } from 'react'
import { 
  Crown, Check, X, Shield, BookOpen, Headphones, 
  Zap, Users, Download, ArrowRight, Lock, Star,
  CreditCard, AlertCircle
} from 'lucide-react'

interface Plan {
  id: string
  name: string
  price: number
  period: 'year'
  stripePriceId: string
  features: string[]
  limitations: string[]
  popular?: boolean
  credits: number
}

const PLANS: Plan[] = [
  {
    id: 'creator',
    name: 'Creator Annual',
    price: 199,
    period: 'year',
    stripePriceId: 'price_creator_annual',
    credits: 1000,
    features: [
      'FULL library access (150+ eBooks)',
      'All audiobook streaming',
      'All new releases included',
      '1,000 platform credits/month',
      '50% off eBook/Audiobook conversions',
      'Priority email support',
      'Download for offline reading',
      'Sync across all devices'
    ],
    limitations: [],
    popular: true
  },
  {
    id: 'pro',
    name: 'Pro Annual',
    price: 499,
    period: 'year',
    stripePriceId: 'price_pro_annual',
    credits: 5000,
    features: [
      'Everything in Creator',
      'Source files (DOCX, editable)',
      'Commercial use license',
      '5,000 platform credits/month',
      '75% off conversions',
      'Priority phone support',
      'API access for integrations',
      'White-label rights for content',
      'Early access to new content',
      'Exclusive Pro-only guides'
    ],
    limitations: []
  }
]

export default function SubscriptionCheckoutPage() {
  const [selectedPlan, setSelectedPlan] = useState<string>('creator')
  const [isProcessing, setIsProcessing] = useState(false)
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleCheckout = async () => {
    if (!agreedToTerms) {
      setError('Please agree to the subscription terms to continue')
      return
    }

    setIsProcessing(true)
    setError(null)

    try {
      const plan = PLANS.find(p => p.id === selectedPlan)
      if (!plan) throw new Error('Invalid plan selected')

      // Create Stripe checkout session
      const response = await fetch('/api/subscriptions/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: plan.id,
          priceId: plan.stripePriceId
        })
      })

      const data = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      // Redirect to Stripe
      if (data.url) {
        window.location.href = data.url
      }
    } catch (err: any) {
      setError(err.message || 'Failed to start checkout')
    } finally {
      setIsProcessing(false)
    }
  }

  const selectedPlanData = PLANS.find(p => p.id === selectedPlan)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 py-12">
      <div className="max-w-5xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/20 rounded-full mb-4">
            <Crown className="w-5 h-5 text-yellow-500" />
            <span className="text-purple-300 font-medium">Annual Subscription</span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">
            Unlock the Complete Javari Library
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Get instant access to 150+ professional eBooks and audiobooks with a single annual subscription
          </p>
        </div>

        {/* Important Notice */}
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-8">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-yellow-500 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-yellow-400 mb-1">Annual Subscription Policy</h3>
              <p className="text-yellow-300/80 text-sm">
                To protect our content library, subscriptions are <strong>billed annually</strong>. 
                You can cancel anytime, but your access continues until the end of your paid term. 
                No partial refunds are provided for early cancellation.
              </p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Plan Selection */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-2xl font-bold text-white mb-4">Choose Your Plan</h2>
            
            {PLANS.map(plan => (
              <div 
                key={plan.id}
                onClick={() => setSelectedPlan(plan.id)}
                className={`relative p-6 rounded-2xl border-2 cursor-pointer transition-all ${
                  selectedPlan === plan.id 
                    ? 'border-purple-500 bg-purple-500/10' 
                    : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
                }`}
              >
                {plan.popular && (
                  <span className="absolute -top-3 left-6 px-3 py-1 bg-purple-500 text-white text-xs font-bold rounded-full">
                    MOST POPULAR
                  </span>
                )}
                
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        selectedPlan === plan.id 
                          ? 'border-purple-500 bg-purple-500' 
                          : 'border-gray-500'
                      }`}>
                        {selectedPlan === plan.id && (
                          <Check className="w-3 h-3 text-white" />
                        )}
                      </div>
                      <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                    </div>
                    
                    <div className="ml-8">
                      <div className="flex items-baseline gap-1 mb-4">
                        <span className="text-4xl font-bold text-white">${plan.price}</span>
                        <span className="text-gray-400">/year</span>
                        <span className="ml-2 text-sm text-green-400">
                          (${(plan.price / 12).toFixed(0)}/mo)
                        </span>
                      </div>
                      
                      <ul className="space-y-2">
                        {plan.features.slice(0, 5).map((feature, i) => (
                          <li key={i} className="flex items-center gap-2 text-sm">
                            <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                            <span className="text-gray-300">{feature}</span>
                          </li>
                        ))}
                        {plan.features.length > 5 && (
                          <li className="text-sm text-purple-400 ml-6">
                            + {plan.features.length - 5} more benefits
                          </li>
                        )}
                      </ul>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-yellow-500 mb-1">
                      <Zap className="w-4 h-4" />
                      <span className="font-semibold">{plan.credits.toLocaleString()}</span>
                    </div>
                    <span className="text-xs text-gray-400">credits/mo</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 bg-gray-800/50 rounded-2xl border border-purple-500/20 p-6">
              <h3 className="text-lg font-bold text-white mb-4">Order Summary</h3>
              
              {selectedPlanData && (
                <>
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-gray-300">
                      <span>{selectedPlanData.name}</span>
                      <span>${selectedPlanData.price}</span>
                    </div>
                    <div className="flex justify-between text-gray-400 text-sm">
                      <span>Billing Period</span>
                      <span>Annual (12 months)</span>
                    </div>
                    <div className="border-t border-gray-700 pt-3">
                      <div className="flex justify-between text-white font-bold text-lg">
                        <span>Total Today</span>
                        <span>${selectedPlanData.price}</span>
                      </div>
                    </div>
                  </div>

                  {/* What's Included */}
                  <div className="bg-gray-900/50 rounded-xl p-4 mb-6">
                    <h4 className="font-semibold text-white mb-3">What You Get:</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2 text-gray-300">
                        <BookOpen className="w-4 h-4 text-purple-400" />
                        150+ Professional eBooks
                      </li>
                      <li className="flex items-center gap-2 text-gray-300">
                        <Headphones className="w-4 h-4 text-purple-400" />
                        Audiobook Streaming
                      </li>
                      <li className="flex items-center gap-2 text-gray-300">
                        <Download className="w-4 h-4 text-purple-400" />
                        Offline Downloads
                      </li>
                      <li className="flex items-center gap-2 text-gray-300">
                        <Zap className="w-4 h-4 text-purple-400" />
                        {selectedPlanData.credits.toLocaleString()} Credits/Month
                      </li>
                    </ul>
                  </div>

                  {/* Terms Checkbox */}
                  <label className="flex items-start gap-3 mb-6 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={agreedToTerms}
                      onChange={(e) => setAgreedToTerms(e.target.checked)}
                      className="mt-1 w-4 h-4 rounded border-gray-600 bg-gray-700 text-purple-500 focus:ring-purple-500"
                    />
                    <span className="text-sm text-gray-400">
                      I understand this is an <strong className="text-white">annual subscription</strong>. 
                      I can cancel anytime, but access continues until my term ends. 
                      No partial refunds for early cancellation.
                    </span>
                  </label>

                  {error && (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-4">
                      <p className="text-red-400 text-sm">{error}</p>
                    </div>
                  )}

                  {/* Checkout Button */}
                  <button
                    onClick={handleCheckout}
                    disabled={isProcessing || !agreedToTerms}
                    className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition ${
                      isProcessing || !agreedToTerms
                        ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:opacity-90'
                    }`}
                  >
                    {isProcessing ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-5 h-5" />
                        Subscribe for ${selectedPlanData.price}/year
                      </>
                    )}
                  </button>

                  {/* Security Badge */}
                  <div className="flex items-center justify-center gap-2 mt-4 text-gray-400 text-xs">
                    <Lock className="w-4 h-4" />
                    <span>Secure checkout powered by Stripe</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-white mb-8 text-center">
            Frequently Asked Questions
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <div className="bg-gray-800/50 rounded-xl p-6">
              <h3 className="font-semibold text-white mb-2">Why annual-only?</h3>
              <p className="text-gray-400 text-sm">
                To protect our content library. Annual subscriptions ensure subscribers are 
                committed to the platform, not just downloading everything and canceling.
              </p>
            </div>
            
            <div className="bg-gray-800/50 rounded-xl p-6">
              <h3 className="font-semibold text-white mb-2">Can I cancel anytime?</h3>
              <p className="text-gray-400 text-sm">
                Yes! Cancel anytime from your account settings. Your access continues until 
                your annual term ends—no immediate cutoff.
              </p>
            </div>
            
            <div className="bg-gray-800/50 rounded-xl p-6">
              <h3 className="font-semibold text-white mb-2">What about new content?</h3>
              <p className="text-gray-400 text-sm">
                All new eBooks and audiobooks released during your subscription are included 
                at no extra cost. We add new content monthly.
              </p>
            </div>
            
            <div className="bg-gray-800/50 rounded-xl p-6">
              <h3 className="font-semibold text-white mb-2">Can I download content?</h3>
              <p className="text-gray-400 text-sm">
                Yes! Download eBooks for offline reading. Audiobooks stream with offline 
                caching in our mobile apps.
              </p>
            </div>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-gray-400">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-green-500" />
            <span className="text-sm">Money-back guarantee*</span>
          </div>
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500" />
            <span className="text-sm">4.9/5 Customer Rating</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-500" />
            <span className="text-sm">10,000+ Subscribers</span>
          </div>
        </div>
        
        <p className="text-center text-xs text-gray-500 mt-4">
          *30-day money-back guarantee for first-time subscribers if you haven't downloaded more than 5 items
        </p>
      </div>
    </div>
  )
}
