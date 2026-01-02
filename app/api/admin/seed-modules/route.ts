/**
 * CR AudioViz AI - Module Factory Seeder
 * Seeds the 55 modules from Master Roadmap v2.0 into the Module Factory
 * 
 * @version 1.0.0
 * @date January 1, 2026
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// ============================================================================
// MODULE FAMILIES PER MASTER ROADMAP v2.0
// ============================================================================

const MODULE_FAMILIES = {
  revenue: [
    { slug: 'javari-ai', name: 'Javari AI', description: 'Flagship AI assistant - chat, create, automate', icon: '🤖', revenueModel: 'subscription' },
    { slug: 'javari-key', name: 'Javari Key', description: 'AI-powered authentication hub', icon: '🔐', revenueModel: 'subscription' },
    { slug: 'javari-cards', name: 'Javari Cards', description: 'Digital & physical card creator', icon: '🎴', revenueModel: 'credits' },
    { slug: 'javari-spirits', name: 'Javari Spirits', description: 'Alcohol enthusiast platform', icon: '🥃', revenueModel: 'affiliate' },
    { slug: 'javari-vinyl', name: 'Javari Vinyl', description: 'Vinyl record collection tracker', icon: '📀', revenueModel: 'affiliate' },
    { slug: 'javari-tcg', name: 'Javari TCG', description: 'Trading card game collection hub', icon: '🃏', revenueModel: 'marketplace' },
    { slug: 'javari-comics', name: 'Javari Comics', description: 'Comic book collection manager', icon: '📚', revenueModel: 'marketplace' },
  ],
  creator: [
    { slug: 'javari-studio', name: 'Javari Studio', description: 'AI creative studio - images, video, audio', icon: '🎨', revenueModel: 'credits' },
    { slug: 'javari-music', name: 'Javari Music', description: 'AI music composition & production', icon: '🎵', revenueModel: 'credits' },
    { slug: 'javari-video', name: 'Javari Video', description: 'AI video editing & generation', icon: '🎬', revenueModel: 'credits' },
    { slug: 'javari-voice', name: 'Javari Voice', description: 'Voice cloning & text-to-speech', icon: '🎙️', revenueModel: 'credits' },
    { slug: 'javari-design', name: 'Javari Design', description: 'Graphic design automation', icon: '✏️', revenueModel: 'credits' },
  ],
  professional: [
    { slug: 'javari-docs', name: 'Javari Docs', description: 'Document creation & management', icon: '📄', revenueModel: 'subscription' },
    { slug: 'javari-legal', name: 'Javari Legal', description: 'Legal document automation', icon: '⚖️', revenueModel: 'subscription' },
    { slug: 'javari-finance', name: 'Javari Finance', description: 'Financial analysis & reporting', icon: '💰', revenueModel: 'subscription' },
    { slug: 'javari-marketing', name: 'Javari Marketing', description: 'Marketing content & campaigns', icon: '📢', revenueModel: 'subscription' },
    { slug: 'javari-sales', name: 'Javari Sales', description: 'Sales automation & CRM', icon: '🤝', revenueModel: 'subscription' },
  ],
  social_impact: [
    { slug: 'javari-heroes', name: 'Javari Heroes', description: 'First responder support platform', icon: '🚒', revenueModel: 'free' },
    { slug: 'javari-veterans', name: 'Javari Veterans', description: 'Veteran transition support', icon: '🎖️', revenueModel: 'free' },
    { slug: 'javari-faith', name: 'Javari Faith', description: 'Faith-based community tools', icon: '⛪', revenueModel: 'free' },
    { slug: 'javari-rescue', name: 'Javari Rescue', description: 'Animal rescue coordination', icon: '🐾', revenueModel: 'free' },
    { slug: 'javari-youth', name: 'Javari Youth', description: 'Youth development programs', icon: '👶', revenueModel: 'free' },
    { slug: 'javari-seniors', name: 'Javari Seniors', description: 'Senior citizen support', icon: '👴', revenueModel: 'free' },
    { slug: 'javari-disability', name: 'Javari Access', description: 'Accessibility & disability support', icon: '♿', revenueModel: 'free' },
    { slug: 'javari-education', name: 'Javari Learn', description: 'Educational tools & resources', icon: '📚', revenueModel: 'free' },
    { slug: 'javari-nonprofit', name: 'Javari Giving', description: 'Nonprofit management tools', icon: '❤️', revenueModel: 'free' },
  ],
  lifestyle: [
    { slug: 'javari-fitness', name: 'Javari Fitness', description: 'Fitness tracking & coaching', icon: '💪', revenueModel: 'subscription' },
    { slug: 'javari-recipes', name: 'Javari Recipes', description: 'AI recipe generation', icon: '🍳', revenueModel: 'credits' },
    { slug: 'javari-travel', name: 'Javari Travel', description: 'Travel planning & booking', icon: '✈️', revenueModel: 'affiliate' },
    { slug: 'javari-home', name: 'Javari Home', description: 'Smart home integration', icon: '🏠', revenueModel: 'subscription' },
    { slug: 'javari-pets', name: 'Javari Pets', description: 'Pet care & management', icon: '🐕', revenueModel: 'subscription' },
  ],
  infrastructure: [
    { slug: 'javari-hub', name: 'Javari Hub', description: 'Central platform dashboard', icon: '🏢', revenueModel: 'subscription' },
    { slug: 'javari-api', name: 'Javari API', description: 'Developer API access', icon: '🔌', revenueModel: 'subscription' },
    { slug: 'javari-admin', name: 'Javari Admin', description: 'Platform administration', icon: '⚙️', revenueModel: 'subscription' },
    { slug: 'javari-analytics', name: 'Javari Analytics', description: 'Business intelligence', icon: '📊', revenueModel: 'subscription' },
    { slug: 'javari-marketplace', name: 'Javari Market', description: 'Creator marketplace', icon: '🛒', revenueModel: 'marketplace' },
  ]
}

// GET endpoint - Seed all modules
export async function GET() {
  const results = {
    success: true,
    seeded: [] as string[],
    errors: [] as string[],
    timestamp: new Date().toISOString()
  }
  
  for (const [family, modules] of Object.entries(MODULE_FAMILIES)) {
    for (const mod of modules) {
      try {
        // Check if module already exists
        const { data: existing } = await supabase
          .from('module_registry')
          .select('id')
          .eq('module_slug', mod.slug)
          .single()
        
        if (existing) {
          results.seeded.push(`${mod.slug} (exists)`)
          continue
        }
        
        // Insert new module
        const { error } = await supabase
          .from('module_registry')
          .insert({
            module_slug: mod.slug,
            module_name: mod.name,
            definition: {
              ...mod,
              family,
              category: family,
              tags: [family, mod.revenueModel],
              features: [],
              settings: {
                requiresAuth: true,
                requiresSubscription: mod.revenueModel === 'subscription',
                hasMarketplace: mod.revenueModel === 'marketplace',
                hasSearch: true,
                hasAnalytics: true,
                hasModeration: false,
                hasCredits: mod.revenueModel === 'credits'
              }
            },
            status: 'draft',
            version: '1.0.0',
            routes: [
              { path: `/${mod.slug}`, type: 'page', handler: 'default' },
              { path: `/api/${mod.slug}`, type: 'api', handler: 'api' }
            ]
          })
        
        if (error) throw error
        results.seeded.push(mod.slug)
      } catch (error: any) {
        results.errors.push(`${mod.slug}: ${error.message}`)
      }
    }
  }
  
  return NextResponse.json(results)
}
