/**
 * CR AudioViz AI - Collector Tables Setup API
 * ===========================================
 * 
 * Creates all required tables for collector apps:
 * - collector_sets (Pokemon/MTG/etc sets)
 * - collector_cards (individual cards)
 * - collector_vinyl (vinyl records)
 * - collector_comics (comic books)
 * - user_collections (user's owned items)
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

// SQL for creating tables
const CREATE_TABLES_SQL = `
-- Collector Sets (Pokemon TCG, MTG, etc)
CREATE TABLE IF NOT EXISTS collector_sets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  external_id VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  series VARCHAR(255),
  release_date DATE,
  total_cards INTEGER,
  image_url TEXT,
  symbol_url TEXT,
  source VARCHAR(50) NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Collector Cards (individual trading cards)
CREATE TABLE IF NOT EXISTS collector_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  external_id VARCHAR(100) UNIQUE NOT NULL,
  set_id VARCHAR(100) REFERENCES collector_sets(external_id),
  name VARCHAR(255) NOT NULL,
  number VARCHAR(50),
  rarity VARCHAR(100),
  type VARCHAR(100),
  image_url TEXT,
  image_url_large TEXT,
  market_price DECIMAL(10,2),
  source VARCHAR(50) NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Vinyl Records
CREATE TABLE IF NOT EXISTS collector_vinyl (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  external_id VARCHAR(100) UNIQUE NOT NULL,
  title VARCHAR(500) NOT NULL,
  artist VARCHAR(500),
  label VARCHAR(255),
  year INTEGER,
  format VARCHAR(100),
  genre VARCHAR(255),
  style VARCHAR(255),
  country VARCHAR(100),
  image_url TEXT,
  thumb_url TEXT,
  lowest_price DECIMAL(10,2),
  num_for_sale INTEGER,
  source VARCHAR(50) DEFAULT 'discogs',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Comics
CREATE TABLE IF NOT EXISTS collector_comics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  external_id VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(500) NOT NULL,
  issue_number VARCHAR(50),
  volume VARCHAR(100),
  publisher VARCHAR(255),
  cover_date DATE,
  description TEXT,
  image_url TEXT,
  thumb_url TEXT,
  source VARCHAR(50) DEFAULT 'comicvine',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Collections
CREATE TABLE IF NOT EXISTS user_collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  item_type VARCHAR(50) NOT NULL,
  item_id UUID NOT NULL,
  quantity INTEGER DEFAULT 1,
  condition VARCHAR(50),
  purchase_price DECIMAL(10,2),
  purchase_date DATE,
  notes TEXT,
  for_sale BOOLEAN DEFAULT false,
  asking_price DECIMAL(10,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, item_type, item_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_collector_sets_source ON collector_sets(source);
CREATE INDEX IF NOT EXISTS idx_collector_cards_set_id ON collector_cards(set_id);
CREATE INDEX IF NOT EXISTS idx_collector_cards_source ON collector_cards(source);
CREATE INDEX IF NOT EXISTS idx_collector_vinyl_artist ON collector_vinyl(artist);
CREATE INDEX IF NOT EXISTS idx_collector_comics_publisher ON collector_comics(publisher);
CREATE INDEX IF NOT EXISTS idx_user_collections_user ON user_collections(user_id);
CREATE INDEX IF NOT EXISTS idx_user_collections_item ON user_collections(item_type, item_id);
`;

export async function GET() {
  try {
    // Check which tables exist
    const tables = ['collector_sets', 'collector_cards', 'collector_vinyl', 'collector_comics', 'user_collections']
    const tableStatus: Record<string, any> = {}
    
    for (const table of tables) {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true })
      
      tableStatus[table] = error 
        ? { exists: false, error: error.message }
        : { exists: true, count: count || 0 }
    }
    
    return NextResponse.json({
      success: true,
      tables: tableStatus,
      timestamp: new Date().toISOString()
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Create tables using raw SQL via edge function or manual execution
    // Since we can't run raw SQL directly, we'll create tables one by one
    
    const results: Record<string, any> = {}
    
    // Test if tables exist by trying to select from them
    const tables = [
      { name: 'collector_sets', create: createCollectorSets },
      { name: 'collector_cards', create: createCollectorCards },
      { name: 'collector_vinyl', create: createCollectorVinyl },
      { name: 'collector_comics', create: createCollectorComics },
    ]
    
    for (const table of tables) {
      const { error: checkError } = await supabase
        .from(table.name)
        .select('id')
        .limit(1)
      
      if (checkError && checkError.code === '42P01') {
        // Table doesn't exist - need to create via dashboard
        results[table.name] = { 
          status: 'needs_creation',
          message: 'Table needs to be created via Supabase Dashboard'
        }
      } else if (checkError) {
        results[table.name] = { 
          status: 'error',
          message: checkError.message
        }
      } else {
        // Table exists - get count
        const { count } = await supabase
          .from(table.name)
          .select('*', { count: 'exact', head: true })
        
        results[table.name] = { 
          status: 'exists',
          count: count || 0
        }
      }
    }
    
    // Check if any tables need creation
    const needsCreation = Object.values(results).some(r => r.status === 'needs_creation')
    
    return NextResponse.json({
      success: !needsCreation,
      message: needsCreation 
        ? 'Some tables need to be created via Supabase Dashboard'
        : 'All collector tables exist',
      tables: results,
      sql: needsCreation ? CREATE_TABLES_SQL : undefined,
      instructions: needsCreation ? [
        '1. Go to Supabase Dashboard → SQL Editor',
        '2. Paste the SQL from the "sql" field above',
        '3. Run the query',
        '4. Call this API again to verify'
      ] : undefined,
      timestamp: new Date().toISOString()
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

// Placeholder functions for table creation logic
async function createCollectorSets() {}
async function createCollectorCards() {}
async function createCollectorVinyl() {}
async function createCollectorComics() {}
