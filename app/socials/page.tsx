// /app/socials/page.tsx
// All Social Media Platforms - CR AudioViz AI / Javari
// Follow us everywhere!

'use client';

import React from 'react';
import Link from 'next/link';
import { SocialLinks, SuggestPlatform, SOCIAL_PLATFORMS } from '@/components/SocialLinks';

export default function SocialsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Navigation */}
      <nav className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg" />
            <span className="text-xl font-bold text-gray-900 dark:text-white">Javari</span>
          </Link>
          <Link href="/signup" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Get Started Free
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="py-16 px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
          Follow Us Everywhere! 🌍
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Join our community across all your favorite platforms. Get updates, tips, 
          tutorials, behind-the-scenes content, and exclusive announcements.
        </p>
      </section>

      {/* Main Social Grid */}
      <section className="py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <SocialLinks variant="grid" />
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 px-4 bg-gray-100 dark:bg-gray-800/50">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-4xl font-bold text-blue-600 dark:text-blue-400">14+</div>
              <div className="text-gray-600 dark:text-gray-400">Platforms</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-purple-600 dark:text-purple-400">Daily</div>
              <div className="text-gray-600 dark:text-gray-400">Content</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-pink-600 dark:text-pink-400">24/7</div>
              <div className="text-gray-600 dark:text-gray-400">Community</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-600 dark:text-green-400">Free</div>
              <div className="text-gray-600 dark:text-gray-400">To Join</div>
            </div>
          </div>
        </div>
      </section>

      {/* What You'll Get */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-12">
            What You'll Get By Following
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
              <span className="text-3xl mb-3 block">📢</span>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">First Access to Updates</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Be the first to know about new features, tools, and platform updates before anyone else.
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
              <span className="text-3xl mb-3 block">🎓</span>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Tips & Tutorials</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Learn how to get the most out of Javari with quick tips, how-tos, and video tutorials.
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
              <span className="text-3xl mb-3 block">🎁</span>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Exclusive Giveaways</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Enter to win free credits, premium subscriptions, and limited edition merchandise.
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
              <span className="text-3xl mb-3 block">💬</span>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Direct Connection</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Talk directly with our team. Your feedback shapes what we build next.
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
              <span className="text-3xl mb-3 block">🎮</span>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Behind the Scenes</h3>
              <p className="text-gray-600 dark:text-gray-400">
                See how we build Javari, our team culture, and sneak peeks at upcoming features.
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
              <span className="text-3xl mb-3 block">🤝</span>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Community Events</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Live streams, AMAs, community challenges, and virtual meetups.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Platform-Specific Content */}
      <section className="py-16 px-4 bg-gray-100 dark:bg-gray-800/50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-12">
            What We Post Where
          </h2>
          
          <div className="space-y-4">
            <PlatformContent 
              platform="Twitter / X" 
              icon="𝕏" 
              color="bg-black"
              content="Quick updates, AI tips, industry news, and real-time conversations"
            />
            <PlatformContent 
              platform="YouTube" 
              icon="▶️" 
              color="bg-red-600"
              content="Full tutorials, feature deep-dives, livestreams, and product demos"
            />
            <PlatformContent 
              platform="TikTok" 
              icon="♪" 
              color="bg-black"
              content="Quick tips, fun AI experiments, trending challenges, and behind-the-scenes"
            />
            <PlatformContent 
              platform="Instagram" 
              icon="📷" 
              color="bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500"
              content="Visual content, stories, reels, team photos, and user showcases"
            />
            <PlatformContent 
              platform="LinkedIn" 
              icon="in" 
              color="bg-blue-700"
              content="Industry insights, company updates, job postings, and B2B content"
            />
            <PlatformContent 
              platform="Discord" 
              icon="💬" 
              color="bg-indigo-600"
              content="Community chat, support, feature requests, and exclusive beta access"
            />
            <PlatformContent 
              platform="Reddit" 
              icon="🤖" 
              color="bg-orange-600"
              content="In-depth discussions, AMAs, community feedback, and user stories"
            />
            <PlatformContent 
              platform="Twitch" 
              icon="📺" 
              color="bg-purple-600"
              content="Live coding sessions, building in public, Q&A streams"
            />
          </div>
        </div>
      </section>

      {/* Suggest Platform */}
      <section className="py-16 px-4">
        <div className="max-w-xl mx-auto">
          <SuggestPlatform />
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Ready to Join the Community?
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Pick your platforms above, or get started with Javari right now!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/signup"
              className="px-8 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium"
            >
              Get Started Free
            </Link>
            <Link 
              href="/"
              className="px-8 py-4 border-2 border-gray-300 dark:border-gray-600 rounded-xl hover:border-blue-500 font-medium"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <p className="mb-4">© 2025 CR AudioViz AI, LLC. All rights reserved.</p>
          <p className="text-sm">Your Story. Our Design.</p>
        </div>
      </footer>
    </div>
  );
}

// Platform Content Row Component
function PlatformContent({ platform, icon, color, content }: {
  platform: string;
  icon: string;
  color: string;
  content: string;
}) {
  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg flex items-center gap-4">
      <div className={`w-12 h-12 ${color} rounded-lg flex items-center justify-center text-white font-bold`}>
        {icon}
      </div>
      <div className="flex-1">
        <h3 className="font-bold text-gray-900 dark:text-white">{platform}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">{content}</p>
      </div>
    </div>
  );
}
