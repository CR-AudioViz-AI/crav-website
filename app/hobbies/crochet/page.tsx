/**
 * CrochetAI - AI-Powered Crochet Pattern Generator
 * 
 * Integrated with CR AudioViz AI centralized:
 * - Supabase Auth (SSO)
 * - Credits System
 * - AI Generations Logging
 * - Cross-sell to other Hobbies apps
 * 
 * @author CR AudioViz AI
 * @version 2.0.0 - Centralized Integration
 * @updated December 15, 2025
 */

import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import CrochetGenerator from '@/components/crochet/CrochetGenerator';
import CrochetHeader from '@/components/crochet/CrochetHeader';
import CrossSellBanner from '@/components/crochet/CrossSellBanner';

export const metadata: Metadata = {
  title: 'CrochetAI - AI Pattern Generator | CR AudioViz AI',
  description: 'Generate mathematically perfect crochet patterns with AI. Create amigurumi, blankets, scarves and more in seconds.',
  keywords: ['crochet', 'pattern generator', 'amigurumi', 'AI', 'crafts', 'knitting'],
  openGraph: {
    title: 'CrochetAI - AI Pattern Generator',
    description: 'Generate mathematically perfect crochet patterns with AI',
    images: ['/images/crochet-og.png'],
  },
};

// Credit costs per pattern type
export const PATTERN_CREDITS = {
  simple: 2,      // ball, coaster
  basic: 4,       // whale, basic shapes
  standard: 5,    // manatee, octopus
  complex: 7,     // teddy bear, cat, dog
  custom: 10,     // custom requests
} as const;

export default async function CrochetPage() {
  const supabase = createClient();
  
  // Check authentication
  const { data: { user } } = await supabase.auth.getUser();
  
  // Get user's credit balance if logged in
  let creditBalance = 0;
  let userProfile = null;
  
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, full_name, credits_balance, avatar_url')
      .eq('id', user.id)
      .single();
    
    if (profile) {
      userProfile = profile;
      creditBalance = profile.credits_balance || 0;
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-pink-50 to-white">
      {/* Header with auth status */}
      <CrochetHeader 
        user={userProfile} 
        creditBalance={creditBalance} 
      />
      
      {/* Hero Section */}
      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <span>🧶</span>
            <span>Part of CR AudioViz AI Hobbies</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            CrochetAI
          </h1>
          <p className="text-xl text-gray-600 mb-2">
            AI-Powered Pattern Generator
          </p>
          <p className="text-lg text-purple-600 font-medium">
            Mathematically Perfect Patterns in Seconds
          </p>
          
          {/* Value Props */}
          <div className="flex flex-wrap justify-center gap-4 mt-8">
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-sm">
              <span className="text-green-500">✓</span>
              <span className="text-sm">Verified Stitch Counts</span>
            </div>
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-sm">
              <span className="text-green-500">✓</span>
              <span className="text-sm">Working Patterns</span>
            </div>
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-sm">
              <span className="text-green-500">✓</span>
              <span className="text-sm">Instant Generation</span>
            </div>
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-sm">
              <span className="text-green-500">✓</span>
              <span className="text-sm">90% Cheaper than Etsy</span>
            </div>
          </div>
        </div>
      </section>
      
      {/* Main Generator */}
      <section className="py-8 px-4">
        <CrochetGenerator 
          user={userProfile}
          creditBalance={creditBalance}
          isAuthenticated={!!user}
        />
      </section>
      
      {/* Cross-sell Banner */}
      <CrossSellBanner />
      
      {/* Pricing Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">Simple Credit Pricing</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { name: 'Simple', credits: 2, examples: 'Ball, Coaster', icon: '⚽' },
              { name: 'Basic', credits: 4, examples: 'Whale, Bunny', icon: '🐋' },
              { name: 'Standard', credits: 5, examples: 'Manatee, Octopus', icon: '🦭' },
              { name: 'Complex', credits: 7, examples: 'Teddy Bear, Cat', icon: '🧸' },
            ].map((tier) => (
              <div key={tier.name} className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-2xl text-center">
                <div className="text-4xl mb-3">{tier.icon}</div>
                <h3 className="font-bold text-lg">{tier.name}</h3>
                <div className="text-3xl font-bold text-purple-600 my-2">{tier.credits}</div>
                <div className="text-sm text-gray-500">credits</div>
                <div className="text-xs text-gray-400 mt-2">{tier.examples}</div>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-8">
            <p className="text-gray-600 mb-4">
              1 credit ≈ $0.10 • Patterns on Etsy cost $5-$8 each
            </p>
            <a 
              href="/pricing" 
              className="inline-flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-purple-700 transition-colors"
            >
              Get Credits
              <span>→</span>
            </a>
          </div>
        </div>
      </section>
      
      {/* Features */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Why CrochetAI?</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-2xl shadow-sm">
              <div className="text-4xl mb-4">🔬</div>
              <h3 className="text-xl font-bold mb-2">Mathematically Verified</h3>
              <p className="text-gray-600">
                Every pattern uses proper formulas - flat circles use 2πr, spheres use sin(θ). 
                No more cupping or ruffling.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-2xl shadow-sm">
              <div className="text-4xl mb-4">✅</div>
              <h3 className="text-xl font-bold mb-2">Actually Works</h3>
              <p className="text-gray-600">
                Unlike ChatGPT patterns that have wrong stitch counts, our patterns are validated 
                and produce real, usable results.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-2xl shadow-sm">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-xl font-bold mb-2">Instant & Affordable</h3>
              <p className="text-gray-600">
                Generate patterns in seconds for a fraction of Etsy prices. 
                More patterns, more projects, more creativity.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Supported Patterns */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-8">What Can You Create?</h2>
          
          <div className="flex flex-wrap justify-center gap-3">
            {[
              '🦭 Manatee', '🐋 Whale', '🐙 Octopus', '🧸 Teddy Bear',
              '🐰 Bunny', '🐱 Cat', '🐕 Dog', '⚽ Ball', '☕ Coaster',
              '🧺 Basket', '🐸 Frog', '🦊 Fox', '🐼 Panda', '🦁 Lion',
            ].map((item) => (
              <span 
                key={item} 
                className="bg-white px-4 py-2 rounded-full shadow-sm text-sm"
              >
                {item}
              </span>
            ))}
            <span className="bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-medium">
              + More coming soon!
            </span>
          </div>
        </div>
      </section>
      
      {/* Footer CTA */}
      <section className="py-16 px-4 bg-gradient-to-r from-purple-600 to-pink-500 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Create?</h2>
          <p className="text-xl text-purple-100 mb-8">
            Start generating patterns now. Your first simple pattern is free!
          </p>
          
          {!user ? (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="/login?redirect=/hobbies/crochet"
                className="bg-white text-purple-600 px-8 py-4 rounded-xl font-bold hover:bg-purple-50 transition-colors"
              >
                Sign In to Start
              </a>
              <a 
                href="/pricing"
                className="bg-purple-700 text-white px-8 py-4 rounded-xl font-bold hover:bg-purple-800 transition-colors border border-purple-400"
              >
                View Pricing
              </a>
            </div>
          ) : (
            <a 
              href="#generator"
              className="bg-white text-purple-600 px-8 py-4 rounded-xl font-bold hover:bg-purple-50 transition-colors inline-block"
            >
              Start Generating ↑
            </a>
          )}
        </div>
      </section>
    </div>
  );
}
