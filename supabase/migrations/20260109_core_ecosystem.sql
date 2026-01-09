-- CR AudioViz AI Core Database Schema
-- Ecosystem Integration Tables

-- ============================================================================
-- MORTGAGE RATE MONITORING
-- ============================================================================

CREATE TABLE IF NOT EXISTS mortgage_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conventional_30 DECIMAL(5,3),
  conventional_15 DECIMAL(5,3),
  fha_30 DECIMAL(5,3),
  va_30 DECIMAL(5,3),
  jumbo_30 DECIMAL(5,3),
  sources JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS mortgage_rate_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rate_type VARCHAR(50) NOT NULL,
  rate DECIMAL(5,3) NOT NULL,
  date DATE NOT NULL,
  source VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS mortgage_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  rate_type VARCHAR(50) NOT NULL,
  target_rate DECIMAL(5,3) NOT NULL,
  direction VARCHAR(10) CHECK (direction IN ('above', 'below')),
  active BOOLEAN DEFAULT true,
  triggered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- COLLECTORS DATA
-- ============================================================================

CREATE TABLE IF NOT EXISTS collector_prices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category VARCHAR(50) NOT NULL,
  item_id VARCHAR(100) NOT NULL,
  item_name VARCHAR(255) NOT NULL,
  current_price DECIMAL(12,2),
  previous_price DECIMAL(12,2),
  condition VARCHAR(50),
  grade VARCHAR(20),
  image_url TEXT,
  source VARCHAR(100),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(category, item_id)
);

CREATE TABLE IF NOT EXISTS collector_auctions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category VARCHAR(50) NOT NULL,
  title VARCHAR(500) NOT NULL,
  current_bid DECIMAL(12,2),
  end_time TIMESTAMPTZ,
  platform VARCHAR(100),
  url TEXT,
  image_url TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- AFFILIATE SYSTEM
-- ============================================================================

CREATE TABLE IF NOT EXISTS affiliate_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_type VARCHAR(100) NOT NULL,
  product_id VARCHAR(100) NOT NULL,
  affiliate_program VARCHAR(100) NOT NULL,
  affiliate_url TEXT NOT NULL,
  commission_rate DECIMAL(5,2),
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS affiliate_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id UUID REFERENCES affiliate_links(id),
  app_id VARCHAR(100) NOT NULL,
  user_id UUID,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS affiliate_conversions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id UUID REFERENCES affiliate_links(id),
  app_id VARCHAR(100) NOT NULL,
  order_id VARCHAR(100),
  amount DECIMAL(12,2),
  commission DECIMAL(12,2),
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- SCRAPER MANAGEMENT
-- ============================================================================

CREATE TABLE IF NOT EXISTS scraper_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scraper_id VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  schedule VARCHAR(100),
  last_run TIMESTAMPTZ,
  status VARCHAR(50) DEFAULT 'idle',
  items_scraped INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS scraper_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scraper_id VARCHAR(100) NOT NULL,
  target TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  items_count INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS scraped_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scraper_id VARCHAR(100) NOT NULL,
  data_type VARCHAR(100) NOT NULL,
  data JSONB NOT NULL,
  url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- JAVARI KNOWLEDGE BASE
-- ============================================================================

CREATE TABLE IF NOT EXISTS javari_knowledge (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  data_type VARCHAR(100) NOT NULL,
  data JSONB NOT NULL,
  source VARCHAR(255),
  confidence DECIMAL(3,2),
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS javari_learning_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source VARCHAR(255) NOT NULL,
  priority INTEGER DEFAULT 5,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- ASSET REPOSITORY
-- ============================================================================

CREATE TABLE IF NOT EXISTS assets_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category VARCHAR(100) NOT NULL,
  name VARCHAR(255),
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  width INTEGER,
  height INTEGER,
  file_size INTEGER,
  tags JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS assets_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type VARCHAR(100) NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  content JSONB NOT NULL,
  preview_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS assets_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  craft VARCHAR(50) NOT NULL,
  category VARCHAR(100),
  name VARCHAR(255) NOT NULL,
  difficulty VARCHAR(20),
  pattern_data JSONB NOT NULL,
  image_url TEXT,
  source VARCHAR(255),
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- APP ACCESS CONTROL
-- ============================================================================

CREATE TABLE IF NOT EXISTS app_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  app_id VARCHAR(100) NOT NULL,
  tier VARCHAR(50) NOT NULL,
  granted_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  UNIQUE(user_id, app_id)
);

CREATE TABLE IF NOT EXISTS app_pricing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id VARCHAR(100) UNIQUE NOT NULL,
  free_tier JSONB,
  pro_tier JSONB,
  business_tier JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX idx_mortgage_alerts_user ON mortgage_alerts(user_id);
CREATE INDEX idx_collector_prices_category ON collector_prices(category);
CREATE INDEX idx_collector_auctions_active ON collector_auctions(active, end_time);
CREATE INDEX idx_affiliate_clicks_timestamp ON affiliate_clicks(timestamp);
CREATE INDEX idx_scraped_data_scraper ON scraped_data(scraper_id);
CREATE INDEX idx_javari_knowledge_type ON javari_knowledge(data_type);
CREATE INDEX idx_assets_images_category ON assets_images(category);
CREATE INDEX idx_assets_patterns_craft ON assets_patterns(craft);
CREATE INDEX idx_app_access_user ON app_access(user_id);
