'use client';

/**
 * FREE TOOLS DIRECTORY - CURATED MARKETING RESOURCES
 * CR AudioViz AI - craudiovizai.com/marketing/free-tools
 * 100% Free - Value-first approach with CRAV alternatives
 * Created: December 16, 2025
 */

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import {
  Gift, Search, Filter, ExternalLink, Star, ChevronLeft,
  Mail, Palette, Share2, BarChart3, Search as SearchIcon,
  FileText, Zap, ChevronRight, Sparkles, Check
} from 'lucide-react';

// Tool Categories
const CATEGORIES = [
  { id: 'all', name: 'All Tools', icon: Gift, count: 0 },
  { id: 'email', name: 'Email Marketing', icon: Mail, count: 0 },
  { id: 'design', name: 'Design & Graphics', icon: Palette, count: 0 },
  { id: 'social', name: 'Social Media', icon: Share2, count: 0 },
  { id: 'seo', name: 'SEO & Analytics', icon: SearchIcon, count: 0 },
  { id: 'analytics', name: 'Website Analytics', icon: BarChart3, count: 0 },
  { id: 'content', name: 'Content Creation', icon: FileText, count: 0 },
  { id: 'automation', name: 'Automation', icon: Zap, count: 0 },
];

// Free Tools Database
const FREE_TOOLS = [
  // Email Marketing
  {
    id: 'mailchimp',
    name: 'Mailchimp',
    category: 'email',
    description: 'All-in-one email marketing platform with automation',
    freeTier: '500 contacts, 1,000 emails/month',
    rating: 4.5,
    url: 'https://mailchimp.com',
    cravAlternative: { name: 'Newsletter Pro', href: '/apps/newsletter', benefit: 'Unlimited contacts on Pro plan' },
  },
  {
    id: 'sender',
    name: 'Sender',
    category: 'email',
    description: 'Simple email marketing with high deliverability',
    freeTier: '2,500 subscribers, 15,000 emails/month',
    rating: 4.3,
    url: 'https://sender.net',
    cravAlternative: { name: 'Newsletter Pro', href: '/apps/newsletter', benefit: 'AI-powered subject lines' },
  },
  {
    id: 'mailerlite',
    name: 'MailerLite',
    category: 'email',
    description: 'Modern email marketing with landing pages',
    freeTier: '1,000 subscribers, 12,000 emails/month',
    rating: 4.6,
    url: 'https://mailerlite.com',
    cravAlternative: null,
  },
  {
    id: 'buttondown',
    name: 'Buttondown',
    category: 'email',
    description: 'Newsletter platform for indie writers',
    freeTier: '100 subscribers',
    rating: 4.4,
    url: 'https://buttondown.email',
    cravAlternative: { name: 'Newsletter Pro', href: '/apps/newsletter', benefit: 'Monetization built-in' },
  },

  // Design & Graphics
  {
    id: 'canva',
    name: 'Canva',
    category: 'design',
    description: 'Drag-and-drop design tool for non-designers',
    freeTier: '250,000+ templates, basic features',
    rating: 4.8,
    url: 'https://canva.com',
    cravAlternative: { name: 'Social Graphics', href: '/apps/social-graphics', benefit: 'AI-generated designs' },
  },
  {
    id: 'figma',
    name: 'Figma',
    category: 'design',
    description: 'Professional UI/UX design and prototyping',
    freeTier: '3 projects, unlimited viewers',
    rating: 4.9,
    url: 'https://figma.com',
    cravAlternative: null,
  },
  {
    id: 'photopea',
    name: 'Photopea',
    category: 'design',
    description: 'Free Photoshop alternative in the browser',
    freeTier: 'Fully free with ads',
    rating: 4.5,
    url: 'https://photopea.com',
    cravAlternative: null,
  },
  {
    id: 'remove-bg',
    name: 'Remove.bg',
    category: 'design',
    description: 'AI-powered background removal',
    freeTier: '1 free image/month (low res)',
    rating: 4.6,
    url: 'https://remove.bg',
    cravAlternative: { name: 'Logo Studio', href: '/apps/logo-studio', benefit: 'Unlimited background removal' },
  },
  {
    id: 'unsplash',
    name: 'Unsplash',
    category: 'design',
    description: 'Free high-quality stock photos',
    freeTier: 'Unlimited downloads',
    rating: 4.9,
    url: 'https://unsplash.com',
    cravAlternative: null,
  },

  // Social Media
  {
    id: 'buffer',
    name: 'Buffer',
    category: 'social',
    description: 'Social media scheduling and analytics',
    freeTier: '3 channels, 10 posts/channel',
    rating: 4.4,
    url: 'https://buffer.com',
    cravAlternative: { name: 'Marketing Hub', href: '/marketing/distribution', benefit: 'Unlimited scheduling' },
  },
  {
    id: 'later',
    name: 'Later',
    category: 'social',
    description: 'Visual social media planner',
    freeTier: '1 social profile, 10 posts/month',
    rating: 4.3,
    url: 'https://later.com',
    cravAlternative: { name: 'Marketing Hub', href: '/marketing/distribution', benefit: 'Multi-platform posting' },
  },
  {
    id: 'hootsuite',
    name: 'Hootsuite',
    category: 'social',
    description: 'Enterprise social media management',
    freeTier: '2 social accounts, 5 scheduled posts',
    rating: 4.2,
    url: 'https://hootsuite.com',
    cravAlternative: null,
  },
  {
    id: 'tweetdeck',
    name: 'TweetDeck',
    category: 'social',
    description: 'Twitter/X management dashboard',
    freeTier: 'Fully free',
    rating: 4.0,
    url: 'https://tweetdeck.twitter.com',
    cravAlternative: null,
  },

  // SEO & Analytics
  {
    id: 'google-search-console',
    name: 'Google Search Console',
    category: 'seo',
    description: 'Monitor your site in Google search results',
    freeTier: 'Fully free',
    rating: 4.8,
    url: 'https://search.google.com/search-console',
    cravAlternative: null,
  },
  {
    id: 'ubersuggest',
    name: 'Ubersuggest',
    category: 'seo',
    description: 'Keyword research and SEO analysis',
    freeTier: '3 searches/day',
    rating: 4.3,
    url: 'https://neilpatel.com/ubersuggest',
    cravAlternative: null,
  },
  {
    id: 'ahrefs-webmaster',
    name: 'Ahrefs Webmaster Tools',
    category: 'seo',
    description: 'SEO audit and backlink analysis',
    freeTier: 'Site audit for verified sites',
    rating: 4.7,
    url: 'https://ahrefs.com/webmaster-tools',
    cravAlternative: null,
  },
  {
    id: 'screaming-frog',
    name: 'Screaming Frog',
    category: 'seo',
    description: 'SEO spider and website crawler',
    freeTier: '500 URLs/crawl',
    rating: 4.6,
    url: 'https://screamingfrog.co.uk',
    cravAlternative: null,
  },

  // Website Analytics
  {
    id: 'google-analytics',
    name: 'Google Analytics 4',
    category: 'analytics',
    description: 'Comprehensive web analytics',
    freeTier: 'Fully free',
    rating: 4.5,
    url: 'https://analytics.google.com',
    cravAlternative: null,
  },
  {
    id: 'plausible',
    name: 'Plausible',
    category: 'analytics',
    description: 'Privacy-focused web analytics',
    freeTier: '30-day trial',
    rating: 4.7,
    url: 'https://plausible.io',
    cravAlternative: null,
  },
  {
    id: 'hotjar',
    name: 'Hotjar',
    category: 'analytics',
    description: 'Heatmaps and session recordings',
    freeTier: '35 daily sessions',
    rating: 4.4,
    url: 'https://hotjar.com',
    cravAlternative: null,
  },
  {
    id: 'clarity',
    name: 'Microsoft Clarity',
    category: 'analytics',
    description: 'Free heatmaps and session recordings',
    freeTier: 'Fully free, unlimited',
    rating: 4.6,
    url: 'https://clarity.microsoft.com',
    cravAlternative: null,
  },

  // Content Creation
  {
    id: 'grammarly',
    name: 'Grammarly',
    category: 'content',
    description: 'AI writing assistant and grammar checker',
    freeTier: 'Basic grammar and spelling',
    rating: 4.6,
    url: 'https://grammarly.com',
    cravAlternative: null,
  },
  {
    id: 'hemingway',
    name: 'Hemingway Editor',
    category: 'content',
    description: 'Make your writing clear and bold',
    freeTier: 'Free web version',
    rating: 4.4,
    url: 'https://hemingwayapp.com',
    cravAlternative: null,
  },
  {
    id: 'headline-analyzer',
    name: 'CoSchedule Headline Analyzer',
    category: 'content',
    description: 'Score and improve your headlines',
    freeTier: '3 analyses/day',
    rating: 4.2,
    url: 'https://coschedule.com/headline-analyzer',
    cravAlternative: null,
  },
  {
    id: 'notion',
    name: 'Notion',
    category: 'content',
    description: 'All-in-one workspace for notes and docs',
    freeTier: 'Unlimited pages, 5MB uploads',
    rating: 4.8,
    url: 'https://notion.so',
    cravAlternative: null,
  },

  // Automation
  {
    id: 'zapier',
    name: 'Zapier',
    category: 'automation',
    description: 'Connect apps and automate workflows',
    freeTier: '100 tasks/month, 5 zaps',
    rating: 4.5,
    url: 'https://zapier.com',
    cravAlternative: null,
  },
  {
    id: 'make',
    name: 'Make (Integromat)',
    category: 'automation',
    description: 'Visual automation platform',
    freeTier: '1,000 ops/month',
    rating: 4.6,
    url: 'https://make.com',
    cravAlternative: null,
  },
  {
    id: 'ifttt',
    name: 'IFTTT',
    category: 'automation',
    description: 'Simple automation for consumers',
    freeTier: '2 applets',
    rating: 4.1,
    url: 'https://ifttt.com',
    cravAlternative: null,
  },
  {
    id: 'n8n',
    name: 'n8n',
    category: 'automation',
    description: 'Open-source workflow automation',
    freeTier: 'Self-hosted free',
    rating: 4.7,
    url: 'https://n8n.io',
    cravAlternative: null,
  },
];

export default function FreeToolsDirectory() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [user, setUser] = useState<any>(null);
  const supabase = createClient();

  useEffect(() => {
    async function loadUser() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      
      // Log activity
      if (user) {
        await fetch('/api/activity', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.id,
            action: 'page_view',
            appId: 'marketing-command-center',
            metadata: { page: 'free-tools' }
          })
        }).catch(() => {});
      }
    }
    loadUser();
  }, []);

  // Filter tools
  const filteredTools = FREE_TOOLS.filter(tool => {
    const matchesCategory = selectedCategory === 'all' || tool.category === selectedCategory;
    const matchesSearch = searchQuery === '' || 
      tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Count tools per category
  const categoriesWithCounts = CATEGORIES.map(cat => ({
    ...cat,
    count: cat.id === 'all' ? FREE_TOOLS.length : FREE_TOOLS.filter(t => t.category === cat.id).length
  }));

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map(star => (
          <Star
            key={star}
            className={`w-4 h-4 ${star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
          />
        ))}
        <span className="ml-1 text-sm text-gray-600">{rating}</span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <Link href="/marketing" className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-4">
            <ChevronLeft className="w-4 h-4" />
            Back to Marketing
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
              <Gift className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Free Marketing Tools</h1>
              <p className="text-white/80">100+ curated tools to grow your business without spending a dime</p>
            </div>
          </div>

          {/* Search */}
          <div className="mt-6 max-w-xl">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search tools..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/50"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar - Categories */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-2xl shadow-sm p-4 sticky top-4">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Categories
              </h3>
              <div className="space-y-1">
                {categoriesWithCounts.map(cat => {
                  const IconComponent = cat.icon;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors ${
                        selectedCategory === cat.id
                          ? 'bg-purple-100 text-purple-700'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <IconComponent className="w-4 h-4" />
                        <span className="text-sm">{cat.name}</span>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        selectedCategory === cat.id ? 'bg-purple-200' : 'bg-gray-200'
                      }`}>
                        {cat.count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Main Content - Tool Grid */}
          <div className="flex-1">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-gray-600">
                Showing {filteredTools.length} tool{filteredTools.length !== 1 ? 's' : ''}
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {filteredTools.map(tool => (
                <div
                  key={tool.id}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all"
                >
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-900">{tool.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">{tool.description}</p>
                      </div>
                      <a
                        href={tool.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-purple-600"
                      >
                        <ExternalLink className="w-5 h-5" />
                      </a>
                    </div>

                    {/* Free Tier Info */}
                    <div className="bg-green-50 border border-green-100 rounded-lg px-3 py-2 mb-3">
                      <div className="flex items-center gap-2 text-green-700 text-sm">
                        <Check className="w-4 h-4" />
                        <span className="font-medium">Free tier:</span>
                        <span>{tool.freeTier}</span>
                      </div>
                    </div>

                    {/* Rating */}
                    {renderStars(tool.rating)}

                    {/* CRAV Alternative */}
                    {tool.cravAlternative && (
                      <div className="mt-4 pt-4 border-t">
                        <div className="flex items-center gap-2 text-xs text-purple-600 font-medium mb-2">
                          <Sparkles className="w-3 h-3" />
                          CR AUDIOVIZ ALTERNATIVE
                        </div>
                        <Link
                          href={tool.cravAlternative.href}
                          className="flex items-center justify-between p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors group"
                        >
                          <div>
                            <p className="font-medium text-purple-900">{tool.cravAlternative.name}</p>
                            <p className="text-xs text-purple-600">{tool.cravAlternative.benefit}</p>
                          </div>
                          <ChevronRight className="w-5 h-5 text-purple-400 group-hover:translate-x-1 transition-transform" />
                        </Link>
                      </div>
                    )}
                  </div>

                  <div className="bg-gray-50 px-5 py-3">
                    <a
                      href={tool.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1"
                    >
                      Visit {tool.name}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              ))}
            </div>

            {filteredTools.length === 0 && (
              <div className="text-center py-12">
                <Gift className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No tools found</h3>
                <p className="text-gray-600">Try adjusting your search or category filter</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CTA Banner */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-12 mt-8">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-4">Need More Power?</h2>
          <p className="text-gray-400 mb-6">
            Our 60+ CRAV tools offer premium features, AI capabilities, and seamless integration - 
            all working together in one ecosystem.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/apps"
              className="px-6 py-3 bg-purple-600 rounded-xl font-medium hover:bg-purple-700 transition-colors"
            >
              Explore All CRAV Tools
            </Link>
            <Link
              href="/pricing"
              className="px-6 py-3 bg-white/10 rounded-xl font-medium hover:bg-white/20 transition-colors"
            >
              View Pricing
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
