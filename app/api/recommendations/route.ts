/**
 * CR AudioViz AI - Central Cross-Selling & Recommendations API
 * Provides personalized app recommendations across the ecosystem
 * 
 * @author CR AudioViz AI, LLC
 * @created December 31, 2025
 */

import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// App catalog for recommendations
const APP_CATALOG = {
  collectors: [
    { id: 'javari-disney-vault', name: 'Disney Vault', category: 'collectors', url: 'https://disney.craudiovizai.com' },
    { id: 'javari-pokemon-portfolio', name: 'Pokemon Portfolio', category: 'collectors', url: 'https://pokemon.craudiovizai.com' },
    { id: 'javari-funko-files', name: 'Funko Files', category: 'collectors', url: 'https://funko.craudiovizai.com' },
    { id: 'crav-cardverse', name: 'CardVerse', category: 'collectors', url: 'https://cards.craudiovizai.com' },
  ],
  creators: [
    { id: 'javari-presentation-maker', name: 'Presentation Maker', category: 'creators', url: 'https://presentations.craudiovizai.com' },
    { id: 'javari-resume-builder', name: 'Resume Builder', category: 'creators', url: 'https://resume.craudiovizai.com' },
    { id: 'crav-ebook-studio', name: 'eBook Studio', category: 'creators', url: 'https://javaribooks.com' },
    { id: 'crav-scrapbook', name: 'Scrapbook Creator', category: 'creators', url: 'https://scrapbook.craudiovizai.com' },
  ],
  business: [
    { id: 'javari-insurance', name: 'Insurance Quotes', category: 'business', url: 'https://insurance.craudiovizai.com' },
    { id: 'javari-business-formation', name: 'Business Formation', category: 'business', url: 'https://business.craudiovizai.com' },
    { id: 'crav-invoice-generator', name: 'Invoice Generator', category: 'business', url: 'https://invoice.craudiovizai.com' },
    { id: 'cr-realtor-platform', name: 'Realtor Platform', category: 'business', url: 'https://cravkey.com' },
  ],
  lifestyle: [
    { id: 'cravbarrels', name: 'Javari Spirits', category: 'lifestyle', url: 'https://javari-spirits.com' },
    { id: 'crav-travel', name: 'Travel Deals', category: 'lifestyle', url: 'https://orlandotripdeal.com' },
    { id: 'javari-fitness', name: 'Fitness Hub', category: 'lifestyle', url: 'https://fitness.craudiovizai.com' },
  ],
  social_impact: [
    { id: 'javari-first-responders', name: 'First Responders', category: 'social_impact', url: 'https://responders.craudiovizai.com' },
    { id: 'javari-veterans-connect', name: 'Veterans Connect', category: 'social_impact', url: 'https://veterans.craudiovizai.com' },
    { id: 'javari-animal-rescue', name: 'Animal Rescue', category: 'social_impact', url: 'https://rescue.craudiovizai.com' },
  ]
};

// GET /api/recommendations - Get recommendations
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const user_id = searchParams.get('user_id');
    const app_id = searchParams.get('app_id');
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') || '4');

    let recommendations: any[] = [];

    if (user_id) {
      // Get personalized recommendations based on user history
      const { data: userApps } = await supabase
        .from('crm_customer_apps')
        .select('app_id')
        .eq('customer_id', user_id);

      const usedAppIds = userApps?.map(a => a.app_id) || [];
      
      // Recommend apps from same categories they use, but different apps
      const allApps = Object.values(APP_CATALOG).flat();
      recommendations = allApps
        .filter(app => !usedAppIds.includes(app.id))
        .sort(() => Math.random() - 0.5)
        .slice(0, limit);
    } else if (app_id) {
      // Get related apps (same category, different app)
      const allApps = Object.values(APP_CATALOG).flat();
      const currentApp = allApps.find(a => a.id === app_id);
      
      if (currentApp) {
        recommendations = allApps
          .filter(app => app.category === currentApp.category && app.id !== app_id)
          .slice(0, limit);
      }
      
      // Fill with other categories if needed
      if (recommendations.length < limit) {
        const otherApps = allApps
          .filter(app => app.id !== app_id && !recommendations.find(r => r.id === app.id))
          .sort(() => Math.random() - 0.5)
          .slice(0, limit - recommendations.length);
        recommendations = [...recommendations, ...otherApps];
      }
    } else if (category && APP_CATALOG[category as keyof typeof APP_CATALOG]) {
      recommendations = APP_CATALOG[category as keyof typeof APP_CATALOG].slice(0, limit);
    } else {
      // Random recommendations
      const allApps = Object.values(APP_CATALOG).flat();
      recommendations = allApps
        .sort(() => Math.random() - 0.5)
        .slice(0, limit);
    }

    return NextResponse.json({ 
      recommendations,
      count: recommendations.length 
    });
  } catch (error) {
    console.error('Recommendations GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/recommendations - Track recommendation click
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, source_app_id, recommended_app_id, action } = body;

    if (!source_app_id || !recommended_app_id) {
      return NextResponse.json(
        { error: 'source_app_id and recommended_app_id required' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('recommendation_clicks')
      .insert({
        user_id: user_id || null,
        source_app_id,
        recommended_app_id,
        action: action || 'click',
        created_at: new Date().toISOString()
      });

    if (error) {
      console.error('Recommendation track error:', error);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Recommendations POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
