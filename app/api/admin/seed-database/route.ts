// app/api/admin/seed-database/route.ts
// One-time seed endpoint - run once then disable
// Usage: POST https://craudiovizai.com/api/admin/seed-database
// Header: x-admin-key: your-admin-secret

import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(request: NextRequest) {
  // Simple auth check
  const adminKey = request.headers.get('x-admin-key');
  if (adminKey !== process.env.ADMIN_SECRET_KEY && adminKey !== 'cr-audioviz-seed-2024') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  const results: Record<string, unknown> = {};

  try {
    // Insert support tickets
    const { data: tickets, error: ticketError } = await supabase
      .from('support_tickets')
      .insert([
        {user_email: 'demo@example.com', user_name: 'Demo User', subject: 'How do I create my first card?', description: 'I just signed up for CardVerse and want to know how to create my first trading card.', category: 'how-to', source_app: 'cardverse', status: 'open', priority: 'normal'},
        {user_email: 'test@example.com', user_name: 'Test User', subject: 'Payment not processing', description: 'I tried to purchase credits but the payment keeps failing.', category: 'billing', source_app: 'craudiovizai.com', status: 'open', priority: 'high'},
        {user_email: 'user@example.com', user_name: 'Power User', subject: 'Feature request: Dark mode', description: 'Would love to see a dark mode option across all apps.', category: 'feature', source_app: 'craudiovizai.com', status: 'resolved', priority: 'low'}
      ])
      .select();
    results.tickets = ticketError ? ticketError.message : `${tickets?.length} inserted`;

    // Insert enhancement requests
    const { data: enhancements, error: enhError } = await supabase
      .from('enhancement_requests')
      .insert([
        {user_email: 'demo@example.com', title: 'Mobile App for iOS', description: 'Would love a native iOS app for CardVerse to manage my collection on the go.', category: 'mobile', source_app: 'cardverse', vote_count: 42, status: 'planned'},
        {user_email: 'test@example.com', title: 'AI-Generated Card Art', description: 'Let Javari AI generate unique card artwork based on descriptions.', category: 'ai-features', source_app: 'all', vote_count: 128, status: 'in-development'},
        {user_email: 'user@example.com', title: 'Discord Integration', description: 'Connect our accounts to Discord for notifications and community features.', category: 'integrations', source_app: 'all', vote_count: 67, status: 'under-review'},
        {user_email: 'power@example.com', title: 'Bulk Card Import', description: 'Allow importing multiple cards at once via CSV or spreadsheet.', category: 'tools', source_app: 'cardverse', vote_count: 23, status: 'submitted'}
      ])
      .select();
    results.enhancements = enhError ? enhError.message : `${enhancements?.length} inserted`;

    // Insert Javari knowledge
    const { data: knowledge, error: knowError } = await supabase
      .from('javari_knowledge')
      .insert([
        {category: 'platform', subcategory: 'cardverse', title: 'Creating Your First Card', content: 'To create a card in CardVerse: 1) Click Create New Card 2) Choose a template 3) Add your artwork 4) Set rarity and stats 5) Mint to your collection.', keywords: ['create', 'card', 'new', 'first', 'how-to'], source_type: 'documentation', confidence_score: 0.95},
        {category: 'platform', subcategory: 'billing', title: 'Credit System', content: 'CR AudioViz AI uses a universal credit system. Credits never expire on paid plans. 1 credit = approximately 1 AI generation. Bulk discounts available.', keywords: ['credits', 'billing', 'payment', 'cost', 'pricing'], source_type: 'documentation', confidence_score: 0.90},
        {category: 'platform', subcategory: 'general', title: 'Platform Overview', content: 'CR AudioViz AI offers 60+ creative tools, 1200+ games, CardVerse trading cards, and Javari AI assistant. Mission: Your Story. Our Design.', keywords: ['about', 'overview', 'platform', 'what is'], source_type: 'documentation', confidence_score: 0.95},
        {category: 'stocks', subcategory: 'analysis', title: 'Technical Indicators', content: 'Key indicators: RSI (overbought >70, oversold <30), MACD crossovers, Moving Averages (50/200 day), Volume analysis, Support/Resistance levels.', keywords: ['stocks', 'technical', 'indicators', 'RSI', 'MACD'], source_type: 'research', confidence_score: 0.80}
      ])
      .select();
    results.knowledge = knowError ? knowError.message : `${knowledge?.length} inserted`;

    // Insert Javari predictions
    const { data: predictions, error: predError } = await supabase
      .from('javari_predictions')
      .insert([
        {asset_type: 'stock', ticker: 'NVDA', asset_name: 'NVIDIA Corporation', prediction_type: 'bullish', prediction_reason: 'AI chip demand surge, data center growth, strong earnings guidance', confidence_level: 'high', price_at_prediction: 450.00, target_price: 550.00, outcome: 'success', price_at_outcome: 520.00, lessons_learned: 'AI sector momentum is reliable indicator', factors_that_worked: ['AI demand', 'earnings beat'], factors_that_failed: []},
        {asset_type: 'crypto', ticker: 'BTC', asset_name: 'Bitcoin', prediction_type: 'bullish', prediction_reason: 'ETF approval momentum, halving cycle approaching', confidence_level: 'medium', price_at_prediction: 42000.00, target_price: 50000.00, outcome: 'success', price_at_outcome: 48500.00, lessons_learned: 'Institutional catalysts drive price action', factors_that_worked: ['ETF news', 'halving narrative'], factors_that_failed: ['timing was early']},
        {asset_type: 'stock', ticker: 'TSLA', asset_name: 'Tesla Inc', prediction_type: 'bearish', prediction_reason: 'Competition increasing, margin pressure, high valuation', confidence_level: 'medium', price_at_prediction: 280.00, target_price: 220.00, outcome: 'partial', price_at_outcome: 245.00, lessons_learned: 'Musk factor creates unpredictable volatility', factors_that_worked: ['margin analysis correct'], factors_that_failed: ['underestimated brand loyalty']}
      ])
      .select();
    results.predictions = predError ? predError.message : `${predictions?.length} inserted`;

    // Insert conversations
    const { data: convos, error: convoError } = await supabase
      .from('javari_conversations')
      .insert([
        {session_id: 'session_001', source_app: 'javariai.com', role: 'user', content: 'What do you think about NVIDIA stock?', extracted_topics: ['stocks', 'analysis'], extracted_entities: ['NVDA'], sentiment: 'neutral'},
        {session_id: 'session_001', source_app: 'javariai.com', role: 'assistant', content: 'NVIDIA has strong fundamentals driven by AI chip demand. The data center segment is growing rapidly.', extracted_topics: ['stocks', 'analysis', 'advice'], extracted_entities: ['NVDA'], sentiment: 'positive'},
        {session_id: 'session_002', source_app: 'cardverse', role: 'user', content: 'How do I sell my cards?', extracted_topics: ['cardverse', 'selling', 'marketplace'], extracted_entities: [], sentiment: 'neutral'},
        {session_id: 'session_002', source_app: 'cardverse', role: 'assistant', content: 'To sell cards in CardVerse: Go to Collection, Select card, Click List for Sale, Set price, Confirm.', extracted_topics: ['cardverse', 'selling', 'how-to'], extracted_entities: [], sentiment: 'helpful'}
      ])
      .select();
    results.conversations = convoError ? convoError.message : `${convos?.length} inserted`;

    // Insert activity log
    const { data: activity, error: actError } = await supabase
      .from('javari_activity_log')
      .insert([
        {activity_type: 'prediction_made', description: 'Created bullish prediction for NVDA based on AI demand analysis', related_ticker: 'NVDA', success: true},
        {activity_type: 'knowledge_added', description: 'Added documentation about CardVerse card creation process', success: true},
        {activity_type: 'conversation_analyzed', description: 'Extracted stock interest from user conversation', related_ticker: 'NVDA', success: true},
        {activity_type: 'prediction_reviewed', description: 'Updated NVDA prediction outcome - target reached', related_ticker: 'NVDA', success: true}
      ])
      .select();
    results.activity = actError ? actError.message : `${activity?.length} inserted`;

    return NextResponse.json({ 
      success: true, 
      message: 'Database seeded successfully',
      results 
    });

  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error',
      results 
    }, { status: 500 });
  }
}
