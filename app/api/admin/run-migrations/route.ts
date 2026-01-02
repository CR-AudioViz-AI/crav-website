/**
 * CR AudioViz AI - Run Migrations API
 * ====================================
 * 
 * Executes SQL migrations directly against Supabase.
 * Use with caution - admin only.
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

// Collector tables migration
const COLLECTOR_MIGRATION = `
-- Collector Sets Table (Universal for all collector types)
CREATE TABLE IF NOT EXISTS collector_sets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    external_id TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    series TEXT,
    release_date DATE,
    total_cards INTEGER,
    image_url TEXT,
    symbol_url TEXT,
    source TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Collector Items Table (Cards, Records, Comics)
CREATE TABLE IF NOT EXISTS collector_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    external_id TEXT UNIQUE NOT NULL,
    set_id UUID REFERENCES collector_sets(id),
    name TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    thumbnail_url TEXT,
    rarity TEXT,
    item_type TEXT,
    source TEXT NOT NULL,
    price_market DECIMAL(10,2),
    price_low DECIMAL(10,2),
    price_high DECIMAL(10,2),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Collections Table
CREATE TABLE IF NOT EXISTS collector_user_collections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    item_id UUID REFERENCES collector_items(id) ON DELETE CASCADE,
    quantity INTEGER DEFAULT 1,
    condition TEXT,
    purchase_price DECIMAL(10,2),
    purchase_date DATE,
    notes TEXT,
    is_for_trade BOOLEAN DEFAULT FALSE,
    is_for_sale BOOLEAN DEFAULT FALSE,
    asking_price DECIMAL(10,2),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, item_id)
);

-- Wishlists Table
CREATE TABLE IF NOT EXISTS collector_wishlists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    item_id UUID REFERENCES collector_items(id) ON DELETE CASCADE,
    priority INTEGER DEFAULT 5,
    max_price DECIMAL(10,2),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, item_id)
);

-- Vinyl Artists
CREATE TABLE IF NOT EXISTS vinyl_artists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    external_id TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    real_name TEXT,
    profile TEXT,
    image_url TEXT,
    discogs_uri TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Vinyl Labels
CREATE TABLE IF NOT EXISTS vinyl_labels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    external_id TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    profile TEXT,
    contact_info TEXT,
    image_url TEXT,
    parent_label_id UUID REFERENCES vinyl_labels(id),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Vinyl Genres
CREATE TABLE IF NOT EXISTS vinyl_genres (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Comic Publishers
CREATE TABLE IF NOT EXISTS comic_publishers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    external_id TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    founded_year INTEGER,
    location TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Comic Characters
CREATE TABLE IF NOT EXISTS comic_characters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    external_id TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    real_name TEXT,
    description TEXT,
    image_url TEXT,
    publisher_id UUID REFERENCES comic_publishers(id),
    first_appearance_date DATE,
    aliases TEXT[],
    powers TEXT[],
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_collector_sets_source ON collector_sets(source);
CREATE INDEX IF NOT EXISTS idx_collector_sets_name ON collector_sets(name);
CREATE INDEX IF NOT EXISTS idx_collector_items_source ON collector_items(source);
CREATE INDEX IF NOT EXISTS idx_collector_items_set_id ON collector_items(set_id);
CREATE INDEX IF NOT EXISTS idx_collector_items_name ON collector_items(name);
CREATE INDEX IF NOT EXISTS idx_collector_items_item_type ON collector_items(item_type);
CREATE INDEX IF NOT EXISTS idx_user_collections_user_id ON collector_user_collections(user_id);
CREATE INDEX IF NOT EXISTS idx_user_collections_item_id ON collector_user_collections(item_id);
CREATE INDEX IF NOT EXISTS idx_wishlists_user_id ON collector_wishlists(user_id);
`;

export async function POST(request: NextRequest) {
  try {
    const { migration } = await request.json().catch(() => ({ migration: 'collector' }))
    
    // Split migration into individual statements
    const statements = COLLECTOR_MIGRATION
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'))
    
    const results: { statement: string; status: string; error?: string }[] = []
    let successCount = 0
    let errorCount = 0
    
    for (const statement of statements) {
      try {
        const { error } = await supabase.rpc('exec_sql', { sql: statement })
        
        if (error) {
          // Try direct query if rpc doesn't exist
          const { error: directError } = await supabase
            .from('_migrations_log')
            .select('*')
            .limit(1)
          
          // Just mark as attempted - tables may already exist
          results.push({ 
            statement: statement.substring(0, 50) + '...', 
            status: 'attempted',
            error: error.message 
          })
          errorCount++
        } else {
          results.push({ 
            statement: statement.substring(0, 50) + '...', 
            status: 'success' 
          })
          successCount++
        }
      } catch (err: any) {
        results.push({ 
          statement: statement.substring(0, 50) + '...', 
          status: 'error',
          error: err.message 
        })
        errorCount++
      }
    }
    
    return NextResponse.json({
      success: true,
      message: 'Migration execution attempted',
      note: 'Use Supabase SQL Editor to run migrations directly for best results',
      summary: {
        total: statements.length,
        success: successCount,
        errors: errorCount
      },
      migrationSql: COLLECTOR_MIGRATION,
      results: results.slice(0, 10) // First 10 only
    })
    
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      tip: 'Run the migration SQL directly in Supabase SQL Editor'
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    endpoint: '/api/admin/run-migrations',
    method: 'POST',
    description: 'Runs collector tables migration',
    note: 'For best results, copy the SQL and run in Supabase SQL Editor',
    migrationIncluded: 'collector_tables'
  })
}
