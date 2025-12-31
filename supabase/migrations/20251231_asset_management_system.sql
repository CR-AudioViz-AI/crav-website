-- =====================================================
-- JAVARI AI ASSET MANAGEMENT SYSTEM
-- CR AudioViz AI | Henderson Standard
-- Created: December 31, 2025
-- =====================================================
-- 
-- OVERVIEW:
-- This system provides intelligent asset management with:
-- - Auto-detection of file types
-- - AI-powered classification
-- - Organized folder structure
-- - Universal asset registry for all apps
-- - Landing zone for uploads with auto-filing
-- =====================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- ASSET CATEGORIES (Master list of asset types)
-- =====================================================
CREATE TABLE IF NOT EXISTS asset_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT,                          -- Lucide icon name
    storage_folder TEXT NOT NULL,       -- Folder path in storage bucket
    allowed_extensions TEXT[] NOT NULL, -- e.g., ['pdf', 'epub', 'docx']
    allowed_mime_types TEXT[],          -- MIME types
    max_file_size_mb INTEGER DEFAULT 100,
    auto_detect_keywords TEXT[],        -- Keywords for AI detection
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert comprehensive asset categories
INSERT INTO asset_categories (slug, name, description, icon, storage_folder, allowed_extensions, allowed_mime_types, auto_detect_keywords, display_order) VALUES
-- Documents
('ebooks', 'eBooks', 'Digital books, guides, and publications', 'book-open', 'ebooks', 
 ARRAY['pdf', 'epub', 'mobi', 'azw3'], 
 ARRAY['application/pdf', 'application/epub+zip'], 
 ARRAY['ebook', 'book', 'guide', 'manual', 'publication', 'chapter'], 1),

('documents', 'Documents', 'General documents and files', 'file-text', 'documents',
 ARRAY['pdf', 'docx', 'doc', 'txt', 'md', 'rtf', 'odt'],
 ARRAY['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain', 'text/markdown'],
 ARRAY['document', 'report', 'article', 'paper', 'doc'], 2),

('templates', 'Templates', 'Design and document templates', 'layout', 'templates',
 ARRAY['psd', 'ai', 'fig', 'sketch', 'xd', 'docx', 'pptx', 'xlsx'],
 ARRAY['application/octet-stream'],
 ARRAY['template', 'layout', 'mockup', 'wireframe'], 3),

-- Graphics & Design
('graphics', 'Graphics', 'Images, illustrations, and designs', 'image', 'graphics',
 ARRAY['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'bmp', 'tiff'],
 ARRAY['image/png', 'image/jpeg', 'image/gif', 'image/webp', 'image/svg+xml'],
 ARRAY['graphic', 'image', 'illustration', 'design', 'artwork', 'picture'], 4),

('logos', 'Logos', 'Brand logos and identity assets', 'award', 'logos',
 ARRAY['svg', 'png', 'ai', 'eps', 'pdf'],
 ARRAY['image/svg+xml', 'image/png', 'application/pdf'],
 ARRAY['logo', 'brand', 'identity', 'mark', 'icon', 'emblem'], 5),

('icons', 'Icons', 'Icon sets and UI icons', 'grid-3x3', 'icons',
 ARRAY['svg', 'png', 'ico', 'icns'],
 ARRAY['image/svg+xml', 'image/png', 'image/x-icon'],
 ARRAY['icon', 'iconset', 'ui', 'symbol'], 6),

('backgrounds', 'Backgrounds', 'Background images and patterns', 'maximize', 'backgrounds',
 ARRAY['jpg', 'jpeg', 'png', 'webp', 'svg'],
 ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'],
 ARRAY['background', 'wallpaper', 'pattern', 'texture', 'backdrop'], 7),

-- Fonts
('fonts', 'Fonts', 'Typography and font files', 'type', 'fonts',
 ARRAY['ttf', 'otf', 'woff', 'woff2', 'eot'],
 ARRAY['font/ttf', 'font/otf', 'font/woff', 'font/woff2'],
 ARRAY['font', 'typeface', 'typography', 'ttf', 'otf', 'woff'], 8),

-- Audio
('music', 'Music', 'Music tracks and songs', 'music', 'audio/music',
 ARRAY['mp3', 'wav', 'flac', 'aac', 'm4a', 'ogg'],
 ARRAY['audio/mpeg', 'audio/wav', 'audio/flac', 'audio/aac'],
 ARRAY['music', 'song', 'track', 'album', 'soundtrack'], 9),

('sound-effects', 'Sound Effects', 'Sound effects and audio clips', 'volume-2', 'audio/sfx',
 ARRAY['mp3', 'wav', 'ogg', 'aiff'],
 ARRAY['audio/mpeg', 'audio/wav', 'audio/ogg'],
 ARRAY['sfx', 'sound effect', 'audio clip', 'foley', 'ambience'], 10),

('voiceovers', 'Voiceovers', 'Voice recordings and narration', 'mic', 'audio/voiceovers',
 ARRAY['mp3', 'wav', 'aiff', 'm4a'],
 ARRAY['audio/mpeg', 'audio/wav'],
 ARRAY['voiceover', 'narration', 'voice', 'speech', 'recording'], 11),

-- Video
('videos', 'Videos', 'Video files and clips', 'video', 'videos',
 ARRAY['mp4', 'mov', 'avi', 'mkv', 'webm'],
 ARRAY['video/mp4', 'video/quicktime', 'video/webm'],
 ARRAY['video', 'movie', 'clip', 'footage', 'film'], 12),

('animations', 'Animations', 'Animated content and motion graphics', 'play-circle', 'animations',
 ARRAY['gif', 'mp4', 'webm', 'json', 'lottie'],
 ARRAY['image/gif', 'video/mp4', 'application/json'],
 ARRAY['animation', 'animated', 'motion', 'lottie', 'gif'], 13),

-- Code & Development
('code', 'Code', 'Source code and scripts', 'code', 'code',
 ARRAY['js', 'ts', 'jsx', 'tsx', 'py', 'json', 'css', 'html'],
 ARRAY['text/javascript', 'application/json', 'text/css', 'text/html'],
 ARRAY['code', 'script', 'source', 'component', 'module'], 14),

('software', 'Software', 'Applications and executables', 'package', 'software',
 ARRAY['zip', 'dmg', 'exe', 'msi', 'deb', 'rpm', 'appimage'],
 ARRAY['application/zip', 'application/octet-stream'],
 ARRAY['software', 'app', 'application', 'installer', 'package'], 15),

-- Craft Patterns
('crochet-patterns', 'Crochet Patterns', 'Crochet patterns and instructions', 'scissors', 'crafts/crochet',
 ARRAY['pdf', 'docx', 'jpg', 'png'],
 ARRAY['application/pdf', 'image/jpeg', 'image/png'],
 ARRAY['crochet', 'pattern', 'amigurumi', 'yarn', 'hook', 'stitch'], 16),

('knitting-patterns', 'Knitting Patterns', 'Knitting patterns and instructions', 'grip-vertical', 'crafts/knitting',
 ARRAY['pdf', 'docx', 'jpg', 'png'],
 ARRAY['application/pdf', 'image/jpeg', 'image/png'],
 ARRAY['knitting', 'knit', 'pattern', 'yarn', 'needle', 'sweater'], 17),

('sewing-patterns', 'Sewing Patterns', 'Sewing and quilting patterns', 'ruler', 'crafts/sewing',
 ARRAY['pdf', 'svg', 'dxf'],
 ARRAY['application/pdf', 'image/svg+xml'],
 ARRAY['sewing', 'quilt', 'pattern', 'fabric', 'dress', 'garment'], 18),

-- 3D & CAD
('3d-models', '3D Models', '3D models and assets', 'box', '3d/models',
 ARRAY['obj', 'fbx', 'glb', 'gltf', 'stl', 'blend'],
 ARRAY['model/obj', 'model/gltf-binary', 'application/octet-stream'],
 ARRAY['3d', 'model', 'mesh', 'blender', 'unity', 'cad'], 19),

('printables', '3D Printables', '3D printable files', 'printer', '3d/printables',
 ARRAY['stl', 'obj', 'gcode', '3mf'],
 ARRAY['application/sla', 'application/octet-stream'],
 ARRAY['print', 'stl', '3d print', 'maker', 'filament'], 20),

-- Data
('spreadsheets', 'Spreadsheets', 'Data files and spreadsheets', 'table', 'data/spreadsheets',
 ARRAY['xlsx', 'xls', 'csv', 'ods'],
 ARRAY['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/csv'],
 ARRAY['spreadsheet', 'excel', 'csv', 'data', 'table'], 21),

('datasets', 'Datasets', 'Data files and databases', 'database', 'data/datasets',
 ARRAY['json', 'csv', 'xml', 'sql', 'db'],
 ARRAY['application/json', 'text/csv', 'application/xml'],
 ARRAY['dataset', 'data', 'database', 'json', 'records'], 22),

-- Presentations
('presentations', 'Presentations', 'Slideshows and presentations', 'presentation', 'presentations',
 ARRAY['pptx', 'ppt', 'key', 'odp', 'pdf'],
 ARRAY['application/vnd.openxmlformats-officedocument.presentationml.presentation', 'application/pdf'],
 ARRAY['presentation', 'slides', 'powerpoint', 'keynote', 'deck'], 23),

-- Archives
('archives', 'Archives', 'Compressed files and bundles', 'archive', 'archives',
 ARRAY['zip', 'rar', '7z', 'tar', 'gz'],
 ARRAY['application/zip', 'application/x-rar-compressed', 'application/x-7z-compressed'],
 ARRAY['archive', 'zip', 'compressed', 'bundle', 'package'], 24),

-- Misc
('other', 'Other', 'Uncategorized files', 'file', 'other',
 ARRAY['*'],
 ARRAY['application/octet-stream'],
 ARRAY[], 99)

ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    storage_folder = EXCLUDED.storage_folder,
    allowed_extensions = EXCLUDED.allowed_extensions,
    auto_detect_keywords = EXCLUDED.auto_detect_keywords,
    updated_at = NOW();

-- =====================================================
-- LANDING ZONE (Upload staging area)
-- =====================================================
CREATE TABLE IF NOT EXISTS asset_landing_zone (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    original_filename TEXT NOT NULL,
    file_size_bytes BIGINT NOT NULL,
    mime_type TEXT,
    file_extension TEXT,
    temp_storage_path TEXT NOT NULL,     -- Path in landing-zone bucket
    
    -- AI Classification
    detected_category_id UUID REFERENCES asset_categories(id),
    detection_confidence DECIMAL(3,2),   -- 0.00 to 1.00
    detection_method TEXT,               -- 'extension', 'mime', 'ai', 'manual'
    ai_analysis JSONB DEFAULT '{}',      -- Full AI analysis results
    
    -- User Input (if needed)
    user_selected_category_id UUID REFERENCES asset_categories(id),
    user_notes TEXT,
    
    -- Processing Status
    status TEXT DEFAULT 'pending' CHECK (status IN (
        'pending',           -- Just uploaded, awaiting classification
        'classified',        -- AI has classified, awaiting confirmation
        'needs_input',       -- AI unsure, needs user input
        'processing',        -- Being moved to final location
        'completed',         -- Successfully filed
        'failed',            -- Error during processing
        'rejected'           -- User rejected/deleted
    )),
    
    -- Metadata
    uploaded_by UUID,
    uploaded_at TIMESTAMPTZ DEFAULT NOW(),
    processed_at TIMESTAMPTZ,
    final_asset_id UUID,                 -- Reference to assets table after filing
    error_message TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- ASSETS (Master asset registry)
-- =====================================================
CREATE TABLE IF NOT EXISTS assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Basic Info
    name TEXT NOT NULL,
    slug TEXT UNIQUE,
    description TEXT,
    category_id UUID NOT NULL REFERENCES asset_categories(id),
    
    -- File Info
    original_filename TEXT NOT NULL,
    storage_path TEXT NOT NULL,          -- Full path in storage bucket
    file_size_bytes BIGINT NOT NULL,
    mime_type TEXT,
    file_extension TEXT,
    file_hash TEXT,                       -- MD5/SHA for deduplication
    
    -- Media-specific metadata
    width INTEGER,                        -- For images/videos
    height INTEGER,
    duration_seconds DECIMAL(10,2),       -- For audio/video
    page_count INTEGER,                   -- For documents
    
    -- Organization
    tags TEXT[] DEFAULT '{}',
    collections TEXT[] DEFAULT '{}',      -- User-defined collections
    
    -- Access Control
    is_public BOOLEAN DEFAULT false,
    is_free BOOLEAN DEFAULT true,
    price_cents INTEGER DEFAULT 0,
    
    -- Usage Stats
    download_count INTEGER DEFAULT 0,
    view_count INTEGER DEFAULT 0,
    last_accessed_at TIMESTAMPTZ,
    
    -- AI-generated metadata
    ai_description TEXT,
    ai_tags TEXT[] DEFAULT '{}',
    ai_analysis JSONB DEFAULT '{}',
    
    -- Ownership
    uploaded_by UUID,
    owned_by UUID,
    
    -- Status
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived', 'deleted')),
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    archived_at TIMESTAMPTZ
);

-- =====================================================
-- ASSET LINKS (Connect assets to apps/modules)
-- =====================================================
CREATE TABLE IF NOT EXISTS asset_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
    
    -- What this asset is linked to
    link_type TEXT NOT NULL,             -- 'module', 'product', 'content', 'user'
    linked_entity_type TEXT NOT NULL,    -- 'crochet_pattern', 'ebook', 'spirit', etc.
    linked_entity_id UUID NOT NULL,
    
    -- Link metadata
    usage_type TEXT,                     -- 'thumbnail', 'download', 'preview', etc.
    display_order INTEGER DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- STORAGE FOLDER REGISTRY (Quick lookup for all apps)
-- =====================================================
CREATE OR REPLACE VIEW v_asset_folders AS
SELECT 
    ac.slug as category_slug,
    ac.name as category_name,
    ac.storage_folder,
    ac.icon,
    ac.allowed_extensions,
    COUNT(a.id) as asset_count,
    COALESCE(SUM(a.file_size_bytes), 0) as total_size_bytes,
    MAX(a.created_at) as last_upload_at
FROM asset_categories ac
LEFT JOIN assets a ON a.category_id = ac.id AND a.status = 'active'
WHERE ac.is_active = true
GROUP BY ac.id
ORDER BY ac.display_order;

-- =====================================================
-- LANDING ZONE DASHBOARD VIEW
-- =====================================================
CREATE OR REPLACE VIEW v_landing_zone_dashboard AS
SELECT 
    lz.id,
    lz.original_filename,
    lz.file_size_bytes,
    lz.file_extension,
    lz.status,
    lz.detection_confidence,
    lz.detection_method,
    lz.uploaded_at,
    
    -- Detected category
    dc.slug as detected_category_slug,
    dc.name as detected_category_name,
    dc.icon as detected_category_icon,
    dc.storage_folder as detected_folder,
    
    -- User-selected category (if different)
    uc.slug as user_category_slug,
    uc.name as user_category_name,
    
    -- Final category to use
    COALESCE(uc.slug, dc.slug) as final_category_slug,
    COALESCE(uc.name, dc.name) as final_category_name,
    COALESCE(uc.storage_folder, dc.storage_folder) as final_folder
    
FROM asset_landing_zone lz
LEFT JOIN asset_categories dc ON lz.detected_category_id = dc.id
LEFT JOIN asset_categories uc ON lz.user_selected_category_id = uc.id
WHERE lz.status NOT IN ('completed', 'rejected')
ORDER BY lz.uploaded_at DESC;

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Function: Detect asset category from file info
CREATE OR REPLACE FUNCTION detect_asset_category(
    p_filename TEXT,
    p_mime_type TEXT DEFAULT NULL,
    p_keywords TEXT[] DEFAULT '{}'
)
RETURNS TABLE (
    category_id UUID,
    category_slug TEXT,
    confidence DECIMAL(3,2),
    method TEXT
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_extension TEXT;
    v_category RECORD;
BEGIN
    -- Extract extension
    v_extension := lower(split_part(p_filename, '.', -1));
    
    -- Method 1: Check by extension (highest confidence)
    FOR v_category IN 
        SELECT ac.id, ac.slug 
        FROM asset_categories ac 
        WHERE v_extension = ANY(ac.allowed_extensions) 
        AND ac.slug != 'other'
        ORDER BY ac.display_order
        LIMIT 1
    LOOP
        RETURN QUERY SELECT v_category.id, v_category.slug, 0.90::DECIMAL(3,2), 'extension'::TEXT;
        RETURN;
    END LOOP;
    
    -- Method 2: Check by MIME type
    IF p_mime_type IS NOT NULL THEN
        FOR v_category IN 
            SELECT ac.id, ac.slug 
            FROM asset_categories ac 
            WHERE p_mime_type = ANY(ac.allowed_mime_types)
            AND ac.slug != 'other'
            ORDER BY ac.display_order
            LIMIT 1
        LOOP
            RETURN QUERY SELECT v_category.id, v_category.slug, 0.85::DECIMAL(3,2), 'mime'::TEXT;
            RETURN;
        END LOOP;
    END IF;
    
    -- Method 3: Check by keywords in filename
    FOR v_category IN 
        SELECT ac.id, ac.slug, ac.auto_detect_keywords
        FROM asset_categories ac 
        WHERE ac.auto_detect_keywords IS NOT NULL
        AND array_length(ac.auto_detect_keywords, 1) > 0
        AND ac.slug != 'other'
        ORDER BY ac.display_order
    LOOP
        IF EXISTS (
            SELECT 1 FROM unnest(v_category.auto_detect_keywords) kw
            WHERE lower(p_filename) LIKE '%' || lower(kw) || '%'
        ) THEN
            RETURN QUERY SELECT v_category.id, v_category.slug, 0.70::DECIMAL(3,2), 'keyword'::TEXT;
            RETURN;
        END IF;
    END LOOP;
    
    -- Default: Other category with low confidence
    SELECT ac.id, ac.slug INTO v_category
    FROM asset_categories ac WHERE ac.slug = 'other';
    
    RETURN QUERY SELECT v_category.id, v_category.slug, 0.30::DECIMAL(3,2), 'default'::TEXT;
END;
$$;

-- Function: Process landing zone item
CREATE OR REPLACE FUNCTION process_landing_zone_item(
    p_landing_id UUID,
    p_category_slug TEXT DEFAULT NULL  -- Optional override
)
RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
    v_landing RECORD;
    v_category RECORD;
    v_new_path TEXT;
    v_asset_id UUID;
BEGIN
    -- Get landing zone item
    SELECT * INTO v_landing FROM asset_landing_zone WHERE id = p_landing_id;
    
    IF v_landing IS NULL THEN
        RAISE EXCEPTION 'Landing zone item not found';
    END IF;
    
    -- Get category
    IF p_category_slug IS NOT NULL THEN
        SELECT * INTO v_category FROM asset_categories WHERE slug = p_category_slug;
    ELSIF v_landing.user_selected_category_id IS NOT NULL THEN
        SELECT * INTO v_category FROM asset_categories WHERE id = v_landing.user_selected_category_id;
    ELSIF v_landing.detected_category_id IS NOT NULL THEN
        SELECT * INTO v_category FROM asset_categories WHERE id = v_landing.detected_category_id;
    ELSE
        SELECT * INTO v_category FROM asset_categories WHERE slug = 'other';
    END IF;
    
    -- Generate new path
    v_new_path := v_category.storage_folder || '/' || v_landing.original_filename;
    
    -- Create asset record
    INSERT INTO assets (
        name,
        slug,
        category_id,
        original_filename,
        storage_path,
        file_size_bytes,
        mime_type,
        file_extension,
        uploaded_by,
        ai_analysis
    ) VALUES (
        split_part(v_landing.original_filename, '.', 1),
        lower(regexp_replace(split_part(v_landing.original_filename, '.', 1), '[^a-zA-Z0-9]+', '-', 'g')),
        v_category.id,
        v_landing.original_filename,
        v_new_path,
        v_landing.file_size_bytes,
        v_landing.mime_type,
        v_landing.file_extension,
        v_landing.uploaded_by,
        v_landing.ai_analysis
    )
    RETURNING id INTO v_asset_id;
    
    -- Update landing zone
    UPDATE asset_landing_zone SET
        status = 'completed',
        processed_at = NOW(),
        final_asset_id = v_asset_id,
        updated_at = NOW()
    WHERE id = p_landing_id;
    
    RETURN v_asset_id;
END;
$$;

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Auto-classify on insert to landing zone
CREATE OR REPLACE FUNCTION trigger_auto_classify_landing()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_detection RECORD;
BEGIN
    -- Run detection
    SELECT * INTO v_detection FROM detect_asset_category(
        NEW.original_filename,
        NEW.mime_type
    );
    
    -- Update with detection results
    NEW.detected_category_id := v_detection.category_id;
    NEW.detection_confidence := v_detection.confidence;
    NEW.detection_method := v_detection.method;
    
    -- Set status based on confidence
    IF v_detection.confidence >= 0.80 THEN
        NEW.status := 'classified';
    ELSE
        NEW.status := 'needs_input';
    END IF;
    
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_auto_classify_landing ON asset_landing_zone;
CREATE TRIGGER trg_auto_classify_landing
    BEFORE INSERT ON asset_landing_zone
    FOR EACH ROW
    EXECUTE FUNCTION trigger_auto_classify_landing();

-- =====================================================
-- INDEXES
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_assets_category ON assets(category_id);
CREATE INDEX IF NOT EXISTS idx_assets_status ON assets(status) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_assets_tags ON assets USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_landing_status ON asset_landing_zone(status) WHERE status NOT IN ('completed', 'rejected');
CREATE INDEX IF NOT EXISTS idx_asset_links_asset ON asset_links(asset_id);
CREATE INDEX IF NOT EXISTS idx_asset_links_entity ON asset_links(linked_entity_type, linked_entity_id);

-- =====================================================
-- RLS POLICIES
-- =====================================================
ALTER TABLE asset_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_landing_zone ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_links ENABLE ROW LEVEL SECURITY;

-- Categories: Public read
CREATE POLICY categories_public_read ON asset_categories FOR SELECT USING (is_active = true);

-- Landing zone: Service role full access
CREATE POLICY landing_service_all ON asset_landing_zone FOR ALL USING (true) WITH CHECK (true);

-- Assets: Public read for active
CREATE POLICY assets_public_read ON assets FOR SELECT USING (status = 'active');
CREATE POLICY assets_service_all ON assets FOR ALL USING (true) WITH CHECK (true);

-- Links: Public read
CREATE POLICY links_public_read ON asset_links FOR SELECT USING (true);
CREATE POLICY links_service_all ON asset_links FOR ALL USING (true) WITH CHECK (true);

-- =====================================================
-- GRANTS
-- =====================================================
GRANT SELECT ON asset_categories TO anon, authenticated;
GRANT ALL ON asset_landing_zone TO service_role;
GRANT SELECT ON assets TO anon, authenticated;
GRANT ALL ON assets TO service_role;
GRANT SELECT ON asset_links TO anon, authenticated;
GRANT ALL ON asset_links TO service_role;
GRANT SELECT ON v_asset_folders TO anon, authenticated, service_role;
GRANT SELECT ON v_landing_zone_dashboard TO service_role;

-- =====================================================
-- DONE
-- =====================================================
