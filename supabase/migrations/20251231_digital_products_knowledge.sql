-- =====================================================
-- CR AUDIOVIZ AI - DIGITAL PRODUCTS & KNOWLEDGE SYSTEM
-- Version: 1.0.0
-- Date: December 31, 2025
-- Henderson Standard: Fortune 50 Quality
-- =====================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "vector"; -- For embeddings

-- =====================================================
-- PART 1: DIGITAL PRODUCTS CATALOG
-- =====================================================

-- Product Categories
CREATE TABLE IF NOT EXISTS digital_product_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT, -- Lucide icon name
  parent_id UUID REFERENCES digital_product_categories(id),
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default categories
INSERT INTO digital_product_categories (slug, name, description, icon, sort_order) VALUES
  ('ebooks', 'eBooks', 'Digital books in PDF, EPUB, and DOCX formats', 'book-open', 1),
  ('courses', 'Courses', 'Video courses and certifications', 'graduation-cap', 2),
  ('templates', 'Templates', 'Document and design templates', 'layout-template', 3),
  ('audio', 'Audio', 'Podcasts, audiobooks, and sound files', 'headphones', 4),
  ('software', 'Software & Tools', 'Applications and digital tools', 'code', 5),
  ('graphics', 'Graphics & Design', 'Images, logos, and design assets', 'image', 6)
ON CONFLICT (slug) DO NOTHING;

-- Digital Products Master Table
CREATE TABLE IF NOT EXISTS digital_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Basic Info
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  subtitle TEXT,
  description TEXT,
  long_description TEXT,
  
  -- Categorization
  category_id UUID REFERENCES digital_product_categories(id),
  tags TEXT[] DEFAULT '{}',
  
  -- Pricing (in cents)
  price_cents INTEGER NOT NULL DEFAULT 0,
  compare_at_price_cents INTEGER, -- For showing discounts
  currency TEXT DEFAULT 'USD',
  
  -- Files
  file_path TEXT NOT NULL, -- Path in Supabase storage
  file_type TEXT NOT NULL, -- pdf, epub, docx, mp4, zip, etc.
  file_size_bytes BIGINT,
  preview_path TEXT, -- Optional preview/sample file
  cover_image_path TEXT,
  
  -- Metadata
  author TEXT DEFAULT 'CR AudioViz AI',
  publisher TEXT DEFAULT 'CR AudioViz AI, LLC',
  isbn TEXT,
  page_count INTEGER,
  duration_minutes INTEGER, -- For audio/video
  language TEXT DEFAULT 'en',
  
  -- Sales & Analytics
  total_sales INTEGER DEFAULT 0,
  total_revenue_cents BIGINT DEFAULT 0,
  average_rating DECIMAL(3,2),
  review_count INTEGER DEFAULT 0,
  
  -- Access Control
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  requires_subscription BOOLEAN DEFAULT false,
  minimum_subscription_tier TEXT, -- free, starter, pro, business
  
  -- SEO
  meta_title TEXT,
  meta_description TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ
);

CREATE INDEX idx_digital_products_category ON digital_products(category_id);
CREATE INDEX idx_digital_products_slug ON digital_products(slug);
CREATE INDEX idx_digital_products_active ON digital_products(is_active, is_featured);
CREATE INDEX idx_digital_products_tags ON digital_products USING GIN(tags);

-- Product Bundles
CREATE TABLE IF NOT EXISTS digital_product_bundles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  
  -- Pricing
  price_cents INTEGER NOT NULL,
  savings_percent INTEGER, -- Calculated savings vs individual
  
  -- Contents
  product_ids UUID[] NOT NULL,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- PART 2: PURCHASE & DELIVERY SYSTEM
-- =====================================================

-- Purchase Records
CREATE TABLE IF NOT EXISTS digital_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Customer
  user_id UUID NOT NULL, -- References profiles table
  email TEXT NOT NULL,
  
  -- Product
  product_id UUID REFERENCES digital_products(id),
  bundle_id UUID REFERENCES digital_product_bundles(id),
  
  -- Payment
  amount_cents INTEGER NOT NULL,
  currency TEXT DEFAULT 'USD',
  payment_provider TEXT NOT NULL, -- stripe, paypal, credits
  payment_id TEXT, -- Stripe payment intent or PayPal order ID
  payment_status TEXT DEFAULT 'pending', -- pending, completed, failed, refunded
  
  -- Delivery
  delivery_status TEXT DEFAULT 'pending', -- pending, delivered, failed
  download_url TEXT, -- Signed URL
  download_url_expires_at TIMESTAMPTZ,
  download_count INTEGER DEFAULT 0,
  max_downloads INTEGER DEFAULT 5,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  delivered_at TIMESTAMPTZ,
  
  CONSTRAINT purchase_has_product CHECK (product_id IS NOT NULL OR bundle_id IS NOT NULL)
);

CREATE INDEX idx_purchases_user ON digital_purchases(user_id);
CREATE INDEX idx_purchases_product ON digital_purchases(product_id);
CREATE INDEX idx_purchases_status ON digital_purchases(payment_status, delivery_status);

-- Download Tracking
CREATE TABLE IF NOT EXISTS digital_download_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_id UUID REFERENCES digital_purchases(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  product_id UUID REFERENCES digital_products(id),
  
  -- Download Info
  ip_address INET,
  user_agent TEXT,
  country_code TEXT,
  
  -- Status
  success BOOLEAN DEFAULT true,
  error_message TEXT,
  
  downloaded_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_download_logs_purchase ON digital_download_logs(purchase_id);
CREATE INDEX idx_download_logs_user ON digital_download_logs(user_id);

-- =====================================================
-- PART 3: JAVARI AI KNOWLEDGE SYSTEM
-- =====================================================

-- Knowledge Sources (documents, ebooks, etc.)
CREATE TABLE IF NOT EXISTS javari_knowledge_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Source Info
  source_type TEXT NOT NULL, -- ebook, document, webpage, api, manual
  source_name TEXT NOT NULL,
  source_path TEXT, -- File path or URL
  
  -- Linked Product (if applicable)
  product_id UUID REFERENCES digital_products(id),
  
  -- Processing Status
  status TEXT DEFAULT 'pending', -- pending, processing, completed, failed
  error_message TEXT,
  
  -- Metadata
  title TEXT,
  author TEXT,
  description TEXT,
  language TEXT DEFAULT 'en',
  
  -- Content Stats
  total_chunks INTEGER DEFAULT 0,
  total_tokens INTEGER DEFAULT 0,
  total_characters INTEGER DEFAULT 0,
  
  -- Version Control
  content_hash TEXT, -- MD5 hash to detect changes
  version INTEGER DEFAULT 1,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  last_verified_at TIMESTAMPTZ
);

CREATE INDEX idx_knowledge_sources_status ON javari_knowledge_sources(status);
CREATE INDEX idx_knowledge_sources_type ON javari_knowledge_sources(source_type);
CREATE INDEX idx_knowledge_sources_product ON javari_knowledge_sources(product_id);

-- Knowledge Chunks (text segments for retrieval)
CREATE TABLE IF NOT EXISTS javari_knowledge_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id UUID REFERENCES javari_knowledge_sources(id) ON DELETE CASCADE,
  
  -- Chunk Content
  content TEXT NOT NULL,
  chunk_index INTEGER NOT NULL, -- Order within source
  
  -- Metadata
  section_title TEXT,
  page_number INTEGER,
  
  -- Token Stats
  token_count INTEGER,
  character_count INTEGER,
  
  -- Embedding (using pgvector)
  embedding vector(1536), -- OpenAI ada-002 dimensions
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_knowledge_chunks_source ON javari_knowledge_chunks(source_id);
CREATE INDEX idx_knowledge_chunks_embedding ON javari_knowledge_chunks 
  USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Knowledge Processing Queue
CREATE TABLE IF NOT EXISTS javari_knowledge_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id UUID REFERENCES javari_knowledge_sources(id) ON DELETE CASCADE,
  
  -- Task Info
  task_type TEXT NOT NULL, -- extract, chunk, embed, index
  priority INTEGER DEFAULT 5, -- 1=highest, 10=lowest
  
  -- Status
  status TEXT DEFAULT 'pending', -- pending, processing, completed, failed
  attempts INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 3,
  error_message TEXT,
  
  -- Scheduling
  scheduled_for TIMESTAMPTZ DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_knowledge_queue_status ON javari_knowledge_queue(status, scheduled_for);
CREATE INDEX idx_knowledge_queue_source ON javari_knowledge_queue(source_id);

-- Knowledge Change Log (for alerting)
CREATE TABLE IF NOT EXISTS javari_knowledge_changelog (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id UUID REFERENCES javari_knowledge_sources(id) ON DELETE CASCADE,
  
  -- Change Info
  change_type TEXT NOT NULL, -- created, updated, deleted, reprocessed
  change_description TEXT,
  
  -- Who/What triggered
  triggered_by TEXT, -- user_id, system, webhook, cron
  
  -- Alert Status
  alert_sent BOOLEAN DEFAULT false,
  alert_sent_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_knowledge_changelog_source ON javari_knowledge_changelog(source_id);
CREATE INDEX idx_knowledge_changelog_alert ON javari_knowledge_changelog(alert_sent, created_at);

-- =====================================================
-- PART 4: STORAGE BUCKET NOTIFICATIONS
-- =====================================================

-- File Upload Events (populated by storage trigger)
CREATE TABLE IF NOT EXISTS storage_file_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- File Info
  bucket_id TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size BIGINT,
  mime_type TEXT,
  
  -- Event Info
  event_type TEXT NOT NULL, -- INSERT, UPDATE, DELETE
  
  -- Processing Status
  processed BOOLEAN DEFAULT false,
  processed_at TIMESTAMPTZ,
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_file_events_processed ON storage_file_events(processed, created_at);
CREATE INDEX idx_file_events_bucket ON storage_file_events(bucket_id, file_path);

-- =====================================================
-- PART 5: FUNCTIONS & TRIGGERS
-- =====================================================

-- Function: Auto-queue new knowledge sources for processing
CREATE OR REPLACE FUNCTION queue_knowledge_processing()
RETURNS TRIGGER AS $$
BEGIN
  -- Queue extraction task
  INSERT INTO javari_knowledge_queue (source_id, task_type, priority)
  VALUES (NEW.id, 'extract', 3);
  
  -- Log the change
  INSERT INTO javari_knowledge_changelog (source_id, change_type, change_description, triggered_by)
  VALUES (NEW.id, 'created', 'New knowledge source added: ' || NEW.source_name, 'system');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_queue_knowledge_processing
  AFTER INSERT ON javari_knowledge_sources
  FOR EACH ROW
  EXECUTE FUNCTION queue_knowledge_processing();

-- Function: Update product stats after purchase
CREATE OR REPLACE FUNCTION update_product_stats_after_purchase()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.payment_status = 'completed' AND OLD.payment_status != 'completed' THEN
    UPDATE digital_products
    SET 
      total_sales = total_sales + 1,
      total_revenue_cents = total_revenue_cents + NEW.amount_cents,
      updated_at = NOW()
    WHERE id = NEW.product_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_product_stats
  AFTER UPDATE ON digital_purchases
  FOR EACH ROW
  EXECUTE FUNCTION update_product_stats_after_purchase();

-- Function: Process file upload events
CREATE OR REPLACE FUNCTION process_file_upload()
RETURNS TRIGGER AS $$
DECLARE
  category_slug TEXT;
BEGIN
  -- Only process digital-products bucket
  IF NEW.bucket_id = 'digital-products' THEN
    -- Extract category from path (e.g., ebooks/my-book.pdf -> ebooks)
    category_slug := split_part(NEW.file_path, '/', 1);
    
    -- Auto-create knowledge source for ebooks
    IF category_slug = 'ebooks' AND (
      NEW.mime_type LIKE '%pdf%' OR 
      NEW.mime_type LIKE '%epub%' OR
      NEW.file_name LIKE '%.pdf' OR
      NEW.file_name LIKE '%.epub'
    ) THEN
      INSERT INTO javari_knowledge_sources (
        source_type, 
        source_name, 
        source_path,
        title,
        status
      ) VALUES (
        'ebook',
        NEW.file_name,
        NEW.bucket_id || '/' || NEW.file_path,
        regexp_replace(NEW.file_name, '\.[^.]+$', ''), -- Remove extension
        'pending'
      );
      
      -- Mark as processed
      NEW.processed := true;
      NEW.processed_at := NOW();
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_process_file_upload
  BEFORE INSERT ON storage_file_events
  FOR EACH ROW
  EXECUTE FUNCTION process_file_upload();

-- Function: Similarity search for Javari AI
CREATE OR REPLACE FUNCTION search_knowledge(
  query_embedding vector(1536),
  match_threshold FLOAT DEFAULT 0.7,
  match_count INT DEFAULT 10
)
RETURNS TABLE (
  chunk_id UUID,
  source_id UUID,
  source_name TEXT,
  content TEXT,
  section_title TEXT,
  similarity FLOAT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id AS chunk_id,
    c.source_id,
    s.source_name,
    c.content,
    c.section_title,
    1 - (c.embedding <=> query_embedding) AS similarity
  FROM javari_knowledge_chunks c
  JOIN javari_knowledge_sources s ON c.source_id = s.id
  WHERE s.status = 'completed'
    AND 1 - (c.embedding <=> query_embedding) > match_threshold
  ORDER BY c.embedding <=> query_embedding
  LIMIT match_count;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- PART 6: ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE digital_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE digital_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE digital_download_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE javari_knowledge_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE javari_knowledge_chunks ENABLE ROW LEVEL SECURITY;

-- Products: Public read, admin write
CREATE POLICY "Products viewable by everyone" ON digital_products
  FOR SELECT USING (is_active = true);

CREATE POLICY "Products manageable by admins" ON digital_products
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- Purchases: Users see their own
CREATE POLICY "Users view own purchases" ON digital_purchases
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Purchases manageable by admins" ON digital_purchases
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- Download logs: Users see their own
CREATE POLICY "Users view own downloads" ON digital_download_logs
  FOR SELECT USING (user_id = auth.uid());

-- Knowledge: Admin only
CREATE POLICY "Knowledge sources admin only" ON javari_knowledge_sources
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Knowledge chunks admin only" ON javari_knowledge_chunks
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- =====================================================
-- PART 7: VIEWS FOR EASY QUERYING
-- =====================================================

-- Products with category info
CREATE OR REPLACE VIEW v_digital_products AS
SELECT 
  p.*,
  c.name AS category_name,
  c.slug AS category_slug,
  c.icon AS category_icon
FROM digital_products p
LEFT JOIN digital_product_categories c ON p.category_id = c.id;

-- Knowledge processing status
CREATE OR REPLACE VIEW v_knowledge_status AS
SELECT 
  s.id,
  s.source_name,
  s.source_type,
  s.status,
  s.total_chunks,
  s.total_tokens,
  s.processed_at,
  COUNT(q.id) FILTER (WHERE q.status = 'pending') AS pending_tasks,
  COUNT(q.id) FILTER (WHERE q.status = 'failed') AS failed_tasks
FROM javari_knowledge_sources s
LEFT JOIN javari_knowledge_queue q ON s.id = q.source_id
GROUP BY s.id;

-- Recent file uploads needing attention
CREATE OR REPLACE VIEW v_pending_file_events AS
SELECT *
FROM storage_file_events
WHERE processed = false
ORDER BY created_at DESC;

-- =====================================================
-- COMPLETE
-- =====================================================