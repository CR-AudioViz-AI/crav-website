// Javari Library Landing Page - Marketing & Conversion
// Timestamp: January 2, 2026 - 5:50 PM EST

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { 
  BookOpen, Headphones, Download, CheckCircle, Star, 
  ArrowRight, Zap, Shield, Users, Gift, Clock, Sparkles
} from 'lucide-react'

const FEATURES = [
  { icon: BookOpen, title: '200+ Professional eBooks', desc: 'Comprehensive guides across business, marketing, AI, legal, and more' },
  { icon: Headphones, title: 'AI Audiobook Conversion', desc: 'Convert any eBook to professional audiobook with one click' },
  { icon: Download, title: 'Unlimited Downloads', desc: 'Download and keep your eBooks forever - no DRM restrictions' },
  { icon: Zap, title: 'Monthly Credits', desc: 'Get fresh credits every month for new content and conversions' },
  { icon: Shield, title: 'Commercial License', desc: 'Use content in your business, courses, and client work' },
  { icon: Clock, title: 'Early Access', desc: 'Get new titles before anyone else - 50+ new eBooks monthly' }
]

const CATEGORIES = [
  { name: 'Business & Entrepreneurship', count: 25, color: 'from-purple-500 to-indigo-600' },
  { name: 'Marketing & Social Media', count: 20, color: 'from-pink-500 to-rose-600' },
  { name: 'AI & Technology', count: 18, color: 'from-cyan-500 to-blue-600' },
  { name: 'Technical & Programming', count: 15, color: 'from-green-500 to-emerald-600' },
  { name: 'Finance & Real Estate', count: 10, color: 'from-yellow-500 to-orange-600' },
  { name: 'Legal & Compliance', count: 8, color: 'from-red-500 to-pink-600' },
  { name: 'Wellness & Productivity', count: 8, color: 'from-teal-500 to-cyan-600' },
  { name: 'Social Impact', count: 8, color: 'from-violet-500 to-purple-600' }
]

const TESTIMONIALS = [
  { name: 'Sarah M.', role: 'Marketing Director', text: 'The AI marketing guides alone saved me thousands in consulting fees. Incredible value.' },
  { name: 'James K.', role: 'Startup Founder', text: 'I use these eBooks to train my entire team. The quality rivals $500 courses.' },
  { name: 'Michelle T.', role: 'Freelance Writer', text: 'The audiobook conversion is magic. I listen while commuting and absorb so much more.' }
]

export default function LibraryLandingPage() {
  const [billingPeriod, setBillingPeriod] = useState<'annual'>('annual')

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-gray-950 to-blue-900/20" />
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 py-24 sm:py-32">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/20 rounded-full text-purple-300 text-sm mb-6">
              <Sparkles className="w-4 h-4" />
              <span>200+ Professional eBooks • AI-Powered Audiobooks</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-purple-200 to-white bg-clip-text text-transparent">
              Javari Library
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto mb-8">
              The ultimate professional development library. 200+ comprehensive eBooks, 
              AI audiobook conversion, and new content added weekly.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/apps/javari-library/subscribe"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl text-lg font-semibold hover:from-purple-500 hover:to-indigo-500 transition-all shadow-lg shadow-purple-500/25"
              >
                Get Full Access <ArrowRight className="w-5 h-5" />
              </Link>
              <Link 
                href="/apps/javari-library"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gray-800 rounded-xl text-lg font-semibold hover:bg-gray-700 transition-all border border-gray-700"
              >
                Browse Library <BookOpen className="w-5 h-5" />
              </Link>
            </div>
            
            <p className="mt-6 text-gray-400">
              <span className="text-green-400">✓</span> 112 Free eBooks Available Now
            </p>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-gray-900/50 border-y border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-purple-400">200+</div>
              <div className="text-gray-400">Professional eBooks</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-400">88</div>
              <div className="text-gray-400">Premium Titles</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-400">112</div>
              <div className="text-gray-400">Free Lead Magnets</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-yellow-400">50+</div>
              <div className="text-gray-400">New Monthly</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Everything You Need to Level Up</h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              One subscription unlocks a complete professional development ecosystem
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((feature, i) => (
              <div key={i} className="bg-gray-900/50 rounded-2xl p-6 border border-gray-800 hover:border-purple-500/50 transition-colors">
                <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-purple-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-24 px-4 bg-gray-900/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Comprehensive Coverage</h2>
            <p className="text-xl text-gray-400">Expert-written guides across every professional domain</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {CATEGORIES.map((cat, i) => (
              <div key={i} className={`bg-gradient-to-br ${cat.color} rounded-xl p-6 text-white`}>
                <div className="text-3xl font-bold mb-1">{cat.count}</div>
                <div className="text-white/80">{cat.name}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h2>
            <p className="text-xl text-gray-400">Annual plans only - serious learners commit</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* Creator Plan */}
            <div className="bg-gray-900/50 rounded-2xl p-8 border border-gray-800">
              <div className="text-purple-400 font-semibold mb-2">CREATOR</div>
              <div className="text-4xl font-bold mb-1">$199<span className="text-lg text-gray-400">/year</span></div>
              <div className="text-gray-400 mb-6">Less than $17/month</div>
              
              <ul className="space-y-3 mb-8">
                {['Full library access (200+ eBooks)', '1,000 credits/month', 'Audiobook conversions', 'Unlimited downloads', 'New releases first', 'Email support'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              
              <Link
                href="/apps/javari-library/subscribe?plan=creator"
                className="block w-full py-3 bg-gray-700 rounded-xl text-center font-semibold hover:bg-gray-600 transition-colors"
              >
                Get Creator Access
              </Link>
            </div>
            
            {/* Pro Plan */}
            <div className="bg-gradient-to-br from-purple-900/50 to-indigo-900/50 rounded-2xl p-8 border border-purple-500/50 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full text-sm font-semibold">
                BEST VALUE
              </div>
              
              <div className="text-purple-300 font-semibold mb-2">PRO</div>
              <div className="text-4xl font-bold mb-1">$499<span className="text-lg text-gray-400">/year</span></div>
              <div className="text-gray-400 mb-6">Less than $42/month</div>
              
              <ul className="space-y-3 mb-8">
                {['Everything in Creator', '5,000 credits/month', 'Source files (DOCX)', 'Commercial license', 'White-label rights', 'Priority support', 'API access'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              
              <Link
                href="/apps/javari-library/subscribe?plan=pro"
                className="block w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl text-center font-semibold hover:from-purple-500 hover:to-indigo-500 transition-all"
              >
                Get Pro Access
              </Link>
            </div>
          </div>
          
          <div className="mt-8 text-center text-gray-400">
            <p>🔒 30-day money-back guarantee • Cancel anytime • Credits never expire on paid plans</p>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-4 bg-gray-900/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Trusted by Professionals</h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="bg-gray-900/50 rounded-2xl p-6 border border-gray-800">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-300 mb-4">"{t.text}"</p>
                <div>
                  <div className="font-semibold">{t.name}</div>
                  <div className="text-gray-400 text-sm">{t.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Start Learning Today
          </h2>
          <p className="text-xl text-gray-400 mb-8">
            Join thousands of professionals leveling up with Javari Library
          </p>
          <Link 
            href="/apps/javari-library/subscribe"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl text-lg font-semibold hover:from-purple-500 hover:to-indigo-500 transition-all shadow-lg shadow-purple-500/25"
          >
            Get Full Access Now <ArrowRight className="w-5 h-5" />
          </Link>
          <p className="mt-4 text-gray-400">
            Or <Link href="/apps/javari-library" className="text-purple-400 hover:underline">browse 112 free eBooks</Link> first
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-gray-800">
        <div className="max-w-7xl mx-auto text-center text-gray-400">
          <p>© 2026 CR AudioViz AI, LLC. All rights reserved.</p>
          <p className="mt-2">Your Story. Our Design.</p>
        </div>
      </footer>
    </div>
  )
}
