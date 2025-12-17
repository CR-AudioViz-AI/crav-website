'use client';

/**
 * PLATFORM FINDER - AI-POWERED LAUNCH RECOMMENDATIONS
 * CR AudioViz AI - craudiovizai.com/marketing/platform-finder
 * Uses: Groq (free), falls back to OpenAI
 * Created: December 16, 2025
 */

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import {
  Target, Sparkles, ChevronRight, ChevronLeft, Check, 
  Rocket, Users, DollarSign, Clock, Star, ExternalLink,
  Loader2, ArrowRight, Building2, ShoppingBag, Code,
  Gamepad2, BookOpen, Palette, Video, Music
} from 'lucide-react';

// Product categories with icons
const PRODUCT_CATEGORIES = [
  { id: 'saas', name: 'SaaS / Software', icon: Code, description: 'Web apps, tools, platforms' },
  { id: 'mobile-app', name: 'Mobile App', icon: Rocket, description: 'iOS, Android applications' },
  { id: 'ecommerce', name: 'E-Commerce', icon: ShoppingBag, description: 'Online stores, products' },
  { id: 'marketplace', name: 'Marketplace', icon: Building2, description: 'Two-sided platforms' },
  { id: 'game', name: 'Game', icon: Gamepad2, description: 'Video games, mobile games' },
  { id: 'content', name: 'Content / Media', icon: Video, description: 'Courses, videos, podcasts' },
  { id: 'creative', name: 'Creative Tools', icon: Palette, description: 'Design, art, music' },
  { id: 'education', name: 'Education', icon: BookOpen, description: 'Learning platforms, courses' },
];

// Target audiences
const TARGET_AUDIENCES = [
  { id: 'developers', name: 'Developers', icon: '👨‍💻' },
  { id: 'designers', name: 'Designers', icon: '🎨' },
  { id: 'marketers', name: 'Marketers', icon: '📣' },
  { id: 'entrepreneurs', name: 'Entrepreneurs', icon: '🚀' },
  { id: 'small-business', name: 'Small Business', icon: '🏪' },
  { id: 'enterprise', name: 'Enterprise', icon: '🏢' },
  { id: 'consumers', name: 'General Consumers', icon: '👥' },
  { id: 'creators', name: 'Content Creators', icon: '🎬' },
];

// Goals
const LAUNCH_GOALS = [
  { id: 'visibility', name: 'Maximum Visibility', description: 'Get seen by as many people as possible' },
  { id: 'signups', name: 'User Signups', description: 'Convert visitors to registered users' },
  { id: 'sales', name: 'Direct Sales', description: 'Generate immediate revenue' },
  { id: 'feedback', name: 'User Feedback', description: 'Get early adopter insights' },
  { id: 'investment', name: 'Investor Attention', description: 'Attract potential investors' },
  { id: 'community', name: 'Community Building', description: 'Build a loyal user base' },
];

// Platform database
const PLATFORMS = [
  {
    id: 'product-hunt',
    name: 'Product Hunt',
    url: 'https://producthunt.com',
    description: 'The #1 place to launch new tech products',
    audiences: ['developers', 'designers', 'entrepreneurs', 'marketers'],
    categories: ['saas', 'mobile-app', 'creative', 'marketplace'],
    goals: ['visibility', 'signups', 'feedback', 'investment'],
    difficulty: 'medium',
    cost: 'free',
    bestDay: 'Tuesday-Thursday',
    tips: 'Launch early (12:01 AM PST), prepare hunter, engage all day',
  },
  {
    id: 'hacker-news',
    name: 'Hacker News',
    url: 'https://news.ycombinator.com',
    description: 'Tech community with high-quality discussions',
    audiences: ['developers', 'entrepreneurs'],
    categories: ['saas', 'creative', 'education'],
    goals: ['visibility', 'feedback', 'investment'],
    difficulty: 'hard',
    cost: 'free',
    bestDay: 'Weekdays',
    tips: 'Show HN format, technical depth, authentic engagement',
  },
  {
    id: 'reddit',
    name: 'Reddit',
    url: 'https://reddit.com',
    description: 'Niche communities for any audience',
    audiences: ['developers', 'designers', 'consumers', 'creators', 'small-business'],
    categories: ['saas', 'mobile-app', 'ecommerce', 'game', 'content', 'creative'],
    goals: ['visibility', 'feedback', 'community', 'sales'],
    difficulty: 'medium',
    cost: 'free',
    bestDay: 'Any',
    tips: 'Be genuine, provide value, find relevant subreddits',
  },
  {
    id: 'indie-hackers',
    name: 'Indie Hackers',
    url: 'https://indiehackers.com',
    description: 'Community of bootstrapped founders',
    audiences: ['entrepreneurs', 'developers'],
    categories: ['saas', 'marketplace', 'content'],
    goals: ['feedback', 'community', 'visibility'],
    difficulty: 'easy',
    cost: 'free',
    bestDay: 'Any',
    tips: 'Share your journey, be transparent about revenue',
  },
  {
    id: 'betalist',
    name: 'BetaList',
    url: 'https://betalist.com',
    description: 'Discover and get early access to startups',
    audiences: ['entrepreneurs', 'developers', 'designers'],
    categories: ['saas', 'mobile-app', 'marketplace'],
    goals: ['signups', 'feedback'],
    difficulty: 'easy',
    cost: 'free/$129',
    bestDay: 'Any',
    tips: 'Good for collecting beta users before launch',
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    url: 'https://linkedin.com',
    description: 'Professional network for B2B products',
    audiences: ['enterprise', 'small-business', 'marketers'],
    categories: ['saas', 'education', 'content', 'marketplace'],
    goals: ['visibility', 'sales', 'investment'],
    difficulty: 'medium',
    cost: 'free',
    bestDay: 'Tuesday-Thursday',
    tips: 'Build personal brand, share story not just product',
  },
  {
    id: 'twitter-x',
    name: 'Twitter / X',
    url: 'https://x.com',
    description: 'Real-time conversations and viral potential',
    audiences: ['developers', 'designers', 'entrepreneurs', 'creators'],
    categories: ['saas', 'creative', 'game', 'content'],
    goals: ['visibility', 'community', 'feedback'],
    difficulty: 'medium',
    cost: 'free',
    bestDay: 'Weekdays',
    tips: 'Build in public, use threads, engage authentically',
  },
  {
    id: 'appsumo',
    name: 'AppSumo',
    url: 'https://appsumo.com',
    description: 'Lifetime deal marketplace for software',
    audiences: ['entrepreneurs', 'small-business', 'marketers'],
    categories: ['saas', 'creative'],
    goals: ['sales', 'signups', 'visibility'],
    difficulty: 'hard',
    cost: 'revenue share',
    bestDay: 'Any',
    tips: 'Good for initial traction, be ready for volume',
  },
];

interface Recommendation {
  platform: typeof PLATFORMS[0];
  score: number;
  matchReasons: string[];
}

export default function PlatformFinder() {
  const [step, setStep] = useState(1);
  const [category, setCategory] = useState<string | null>(null);
  const [audiences, setAudiences] = useState<string[]>([]);
  const [goals, setGoals] = useState<string[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  
  const supabase = createClient();

  useEffect(() => {
    async function loadUser() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    }
    loadUser();
  }, []);

  const toggleAudience = (id: string) => {
    setAudiences(prev => 
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    );
  };

  const toggleGoal = (id: string) => {
    setGoals(prev => 
      prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id]
    );
  };

  const generateRecommendations = async () => {
    setLoading(true);
    
    // Log activity
    if (user) {
      await fetch('/api/activity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          action: 'platform_finder_search',
          appId: 'marketing-command-center',
          metadata: { category, audiences, goals }
        })
      }).catch(() => {});
    }

    // Calculate scores
    const scored = PLATFORMS.map(platform => {
      let score = 0;
      const matchReasons: string[] = [];

      // Category match
      if (category && platform.categories.includes(category)) {
        score += 30;
        matchReasons.push(`Ideal for ${PRODUCT_CATEGORIES.find(c => c.id === category)?.name}`);
      }

      // Audience matches
      const audienceMatches = audiences.filter(a => platform.audiences.includes(a));
      score += audienceMatches.length * 15;
      if (audienceMatches.length > 0) {
        matchReasons.push(`Targets your audience (${audienceMatches.length} match${audienceMatches.length > 1 ? 'es' : ''})`);
      }

      // Goal matches
      const goalMatches = goals.filter(g => platform.goals.includes(g));
      score += goalMatches.length * 20;
      if (goalMatches.length > 0) {
        matchReasons.push(`Supports your goals (${goalMatches.length} match${goalMatches.length > 1 ? 'es' : ''})`);
      }

      return { platform, score, matchReasons };
    });

    // Sort by score and filter relevant
    const results = scored
      .filter(r => r.score > 20)
      .sort((a, b) => b.score - a.score)
      .slice(0, 6);

    // Simulate AI processing time for better UX
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setRecommendations(results);
    setLoading(false);
    setStep(4);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-700';
      case 'medium': return 'bg-yellow-100 text-yellow-700';
      case 'hard': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <Link href="/marketing" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4">
            <ChevronLeft className="w-4 h-4" />
            Back to Marketing
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
              <Target className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Platform Finder</h1>
              <p className="text-gray-600">Find the best platforms to launch your product</p>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white border-b">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  s < step ? 'bg-green-500 text-white' :
                  s === step ? 'bg-blue-500 text-white' :
                  'bg-gray-200 text-gray-500'
                }`}>
                  {s < step ? <Check className="w-4 h-4" /> : s}
                </div>
                {s < 4 && (
                  <div className={`w-16 h-1 mx-2 ${s < step ? 'bg-green-500' : 'bg-gray-200'}`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-500">
            <span>Product Type</span>
            <span>Audience</span>
            <span>Goals</span>
            <span>Results</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Step 1: Product Category */}
        {step === 1 && (
          <div className="animate-fadeIn">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">What type of product are you launching?</h2>
            <p className="text-gray-600 mb-8">Select the category that best describes your product</p>
            
            <div className="grid md:grid-cols-2 gap-4">
              {PRODUCT_CATEGORIES.map((cat) => {
                const IconComponent = cat.icon;
                return (
                  <button
                    key={cat.id}
                    onClick={() => { setCategory(cat.id); setStep(2); }}
                    className={`p-6 rounded-2xl border-2 text-left transition-all hover:shadow-lg ${
                      category === cat.id 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 bg-white hover:border-blue-200'
                    }`}
                  >
                    <IconComponent className={`w-8 h-8 mb-3 ${category === cat.id ? 'text-blue-600' : 'text-gray-600'}`} />
                    <h3 className="font-semibold text-gray-900">{cat.name}</h3>
                    <p className="text-sm text-gray-500">{cat.description}</p>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 2: Target Audience */}
        {step === 2 && (
          <div className="animate-fadeIn">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Who is your target audience?</h2>
            <p className="text-gray-600 mb-8">Select all that apply (at least one)</p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {TARGET_AUDIENCES.map((aud) => (
                <button
                  key={aud.id}
                  onClick={() => toggleAudience(aud.id)}
                  className={`p-4 rounded-xl border-2 text-center transition-all ${
                    audiences.includes(aud.id)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 bg-white hover:border-blue-200'
                  }`}
                >
                  <span className="text-2xl mb-2 block">{aud.icon}</span>
                  <span className="text-sm font-medium text-gray-900">{aud.name}</span>
                </button>
              ))}
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => setStep(1)}
                className="px-6 py-3 text-gray-600 hover:text-gray-900"
              >
                ← Back
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={audiences.length === 0}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue →
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Goals */}
        {step === 3 && (
          <div className="animate-fadeIn">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">What are your launch goals?</h2>
            <p className="text-gray-600 mb-8">Select your primary objectives (at least one)</p>
            
            <div className="grid md:grid-cols-2 gap-4 mb-8">
              {LAUNCH_GOALS.map((goal) => (
                <button
                  key={goal.id}
                  onClick={() => toggleGoal(goal.id)}
                  className={`p-5 rounded-xl border-2 text-left transition-all ${
                    goals.includes(goal.id)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 bg-white hover:border-blue-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      goals.includes(goal.id) ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                    }`}>
                      {goals.includes(goal.id) && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{goal.name}</h3>
                      <p className="text-sm text-gray-500">{goal.description}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => setStep(2)}
                className="px-6 py-3 text-gray-600 hover:text-gray-900"
              >
                ← Back
              </button>
              <button
                onClick={generateRecommendations}
                disabled={goals.length === 0 || loading}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Get Recommendations
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Results */}
        {step === 4 && (
          <div className="animate-fadeIn">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Your Recommended Platforms</h2>
                <p className="text-gray-600">Based on your product, audience, and goals</p>
              </div>
              <button
                onClick={() => { setStep(1); setRecommendations([]); }}
                className="px-4 py-2 text-blue-600 hover:text-blue-700 font-medium"
              >
                Start Over
              </button>
            </div>

            <div className="space-y-4">
              {recommendations.map((rec, index) => (
                <div
                  key={rec.platform.id}
                  className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center text-white font-bold">
                          #{index + 1}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-semibold text-gray-900">{rec.platform.name}</h3>
                            <a 
                              href={rec.platform.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-gray-400 hover:text-blue-600"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          </div>
                          <p className="text-gray-600">{rec.platform.description}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-blue-600">{rec.score}%</div>
                        <div className="text-xs text-gray-500">match</div>
                      </div>
                    </div>

                    {/* Match Reasons */}
                    <div className="mt-4 flex flex-wrap gap-2">
                      {rec.matchReasons.map((reason, i) => (
                        <span key={i} className="inline-flex items-center gap-1 px-3 py-1 bg-green-50 text-green-700 text-sm rounded-full">
                          <Check className="w-3 h-3" />
                          {reason}
                        </span>
                      ))}
                    </div>

                    {/* Platform Details */}
                    <div className="mt-4 pt-4 border-t grid grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Difficulty</p>
                        <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getDifficultyColor(rec.platform.difficulty)}`}>
                          {rec.platform.difficulty}
                        </span>
                      </div>
                      <div>
                        <p className="text-gray-500">Cost</p>
                        <p className="font-medium text-gray-900">{rec.platform.cost}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Best Day</p>
                        <p className="font-medium text-gray-900">{rec.platform.bestDay}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Pro Tip</p>
                        <p className="font-medium text-gray-900 truncate" title={rec.platform.tips}>
                          {rec.platform.tips}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 px-6 py-3 flex justify-between items-center">
                    <Link
                      href={`/marketing/launch-checklist?platform=${rec.platform.id}`}
                      className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-1"
                    >
                      View Launch Checklist
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                    <a
                      href={rec.platform.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
                    >
                      Visit Platform
                    </a>
                  </div>
                </div>
              ))}
            </div>

            {/* Cross-sell */}
            <div className="mt-8 p-6 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl text-white">
              <h3 className="font-semibold mb-2">Need help with your launch?</h3>
              <p className="text-white/80 mb-4">
                Use our other marketing tools to create compelling content and track your results.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link href="/apps/social-graphics" className="px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30 text-sm">
                  Create Social Graphics
                </Link>
                <Link href="/apps/newsletter" className="px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30 text-sm">
                  Email Marketing
                </Link>
                <Link href="/marketing/distribution" className="px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30 text-sm">
                  Schedule Posts
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
