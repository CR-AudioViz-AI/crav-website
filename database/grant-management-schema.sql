-- CR AUDIOVIZ AI - GRANT MANAGEMENT SCHEMA
-- Timestamp: December 15, 2025

-- Drop existing tables if they exist (for clean install)
DROP TABLE IF EXISTS grant_ai_analysis CASCADE;
DROP TABLE IF EXISTS grant_learnings CASCADE;
DROP TABLE IF EXISTS grant_communications CASCADE;
DROP TABLE IF EXISTS grant_notes CASCADE;
DROP TABLE IF EXISTS grant_milestones CASCADE;
DROP TABLE IF EXISTS grant_documents CASCADE;
DROP TABLE IF EXISTS grant_contacts CASCADE;
DROP TABLE IF EXISTS grant_applications CASCADE;
DROP TABLE IF EXISTS grant_discoveries CASCADE;
DROP TABLE IF EXISTS grant_opportunities CASCADE;

-- 1. Grant Opportunities (Main Table)
CREATE TABLE grant_opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  funder_name TEXT NOT NULL,
  funder_type TEXT DEFAULT 'federal' CHECK (funder_type IN ('federal', 'state', 'private', 'corporate', 'foundation')),
  amount_min DECIMAL(15,2),
  amount_max DECIMAL(15,2),
  amount_requested DECIMAL(15,2),
  amount_awarded DECIMAL(15,2),
  status TEXT DEFAULT 'discovered' CHECK (status IN (
    'discovered', 'researching', 'preparing', 'writing', 
    'reviewing', 'submitted', 'pending', 'awarded', 
    'rejected', 'withdrawn', 'archived'
  )),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('critical', 'high', 'medium', 'low')),
  deadline DATE,
  submission_date TIMESTAMPTZ,
  award_date DATE,
  project_start_date DATE,
  project_end_date DATE,
  description TEXT,
  eligibility TEXT,
  requirements JSONB DEFAULT '[]'::jsonb,
  target_modules TEXT[] DEFAULT '{}',
  match_score INTEGER DEFAULT 0,
  win_probability INTEGER DEFAULT 0,
  external_id TEXT,
  source TEXT,
  url TEXT,
  cfda_number TEXT,
  program_officer TEXT,
  program_officer_email TEXT,
  program_officer_phone TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID
);

-- 2. Grant Applications
CREATE TABLE grant_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  grant_id UUID REFERENCES grant_opportunities(id) ON DELETE CASCADE,
  version INTEGER DEFAULT 1,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'in_review', 'final', 'submitted')),
  project_title TEXT,
  project_summary TEXT,
  narrative TEXT,
  budget_total DECIMAL(15,2),
  budget_breakdown JSONB DEFAULT '{}'::jsonb,
  documents JSONB DEFAULT '[]'::jsonb,
  submitted_at TIMESTAMPTZ,
  submitted_by UUID,
  confirmation_number TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Grant Contacts
CREATE TABLE grant_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  grant_id UUID REFERENCES grant_opportunities(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  title TEXT,
  organization TEXT,
  email TEXT,
  phone TEXT,
  contact_type TEXT DEFAULT 'primary',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Grant Documents
CREATE TABLE grant_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  grant_id UUID REFERENCES grant_opportunities(id) ON DELETE CASCADE,
  application_id UUID REFERENCES grant_applications(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  document_type TEXT DEFAULT 'other',
  file_path TEXT,
  file_url TEXT,
  file_size INTEGER,
  mime_type TEXT,
  version INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  uploaded_by UUID
);

-- 5. Grant Milestones
CREATE TABLE grant_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  grant_id UUID REFERENCES grant_opportunities(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  due_date DATE,
  completed_date DATE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'overdue', 'skipped')),
  assigned_to UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Grant Notes
CREATE TABLE grant_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  grant_id UUID REFERENCES grant_opportunities(id) ON DELETE CASCADE,
  note_type TEXT DEFAULT 'general',
  content TEXT NOT NULL,
  is_pinned BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID
);

-- 7. Grant Discoveries
CREATE TABLE grant_discoveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  funder_name TEXT,
  amount_max DECIMAL(15,2),
  deadline DATE,
  description TEXT,
  url TEXT,
  source TEXT NOT NULL,
  external_id TEXT,
  raw_data JSONB,
  match_score INTEGER DEFAULT 0,
  matched_modules TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'reviewing', 'imported', 'dismissed')),
  dismissed_reason TEXT,
  imported_grant_id UUID REFERENCES grant_opportunities(id),
  discovered_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID
);

-- 8. Grant AI Analysis
CREATE TABLE grant_ai_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  grant_id UUID REFERENCES grant_opportunities(id) ON DELETE CASCADE,
  ai_provider TEXT NOT NULL,
  analysis_type TEXT DEFAULT 'fit_assessment',
  prompt TEXT,
  response TEXT,
  recommendations JSONB,
  confidence_score INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_grants_status ON grant_opportunities(status);
CREATE INDEX idx_grants_priority ON grant_opportunities(priority);
CREATE INDEX idx_grants_deadline ON grant_opportunities(deadline);
CREATE INDEX idx_grants_funder ON grant_opportunities(funder_name);
CREATE INDEX idx_grants_modules ON grant_opportunities USING GIN(target_modules);
CREATE INDEX idx_discoveries_status ON grant_discoveries(status);
CREATE INDEX idx_milestones_due ON grant_milestones(due_date);
CREATE INDEX idx_milestones_status ON grant_milestones(status);

-- Enable RLS
ALTER TABLE grant_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE grant_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE grant_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE grant_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE grant_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE grant_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE grant_discoveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE grant_ai_analysis ENABLE ROW LEVEL SECURITY;

-- Create policies for service role
CREATE POLICY "Allow all for service role" ON grant_opportunities FOR ALL USING (true);
CREATE POLICY "Allow all for service role" ON grant_applications FOR ALL USING (true);
CREATE POLICY "Allow all for service role" ON grant_contacts FOR ALL USING (true);
CREATE POLICY "Allow all for service role" ON grant_documents FOR ALL USING (true);
CREATE POLICY "Allow all for service role" ON grant_milestones FOR ALL USING (true);
CREATE POLICY "Allow all for service role" ON grant_notes FOR ALL USING (true);
CREATE POLICY "Allow all for service role" ON grant_discoveries FOR ALL USING (true);
CREATE POLICY "Allow all for service role" ON grant_ai_analysis FOR ALL USING (true);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers
CREATE TRIGGER update_grants_updated_at BEFORE UPDATE ON grant_opportunities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_applications_updated_at BEFORE UPDATE ON grant_applications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_milestones_updated_at BEFORE UPDATE ON grant_milestones
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- SEED DATA: Initial Grant Opportunities
INSERT INTO grant_opportunities (
  title, funder_name, funder_type, amount_min, amount_max, amount_requested,
  status, priority, deadline, description, target_modules, match_score, win_probability,
  url, notes
) VALUES 
(
  'Veterans Transition Hub',
  'Bob Woodruff Foundation',
  'foundation',
  50000, 500000, 150000,
  'preparing',
  'critical',
  '2026-01-06',
  'AI-powered digital platform providing comprehensive transition support for veterans, service members, and their families. Features include AI skills translation, career pathway mapping, mental health resources, and family support tools.',
  ARRAY['veterans-transition'],
  95, 75,
  'https://bobwoodrufffoundation.org/apply',
  'Application drafted. Ready for submission. Jan 6 deadline for first wave review.'
),
(
  'First Responders Haven - FR-CARA',
  'SAMHSA',
  'federal',
  300000, 500000, 400000,
  'researching',
  'critical',
  NULL,
  'Comprehensive digital mental health platform for first responders including law enforcement, fire, EMS, and 911 dispatchers. Features 24/7 AI support, peer communities, resilience training, and clinical integration.',
  ARRAY['first-responders'],
  92, 60,
  'https://grants.gov',
  'Application drafted. Waiting for FY2026 NOFO release (typically Feb-March). Requires SAM.gov registration.'
),
(
  'Youth Mental Health Navigator',
  'The Kresge Foundation',
  'foundation',
  100000, 500000, 250000,
  'preparing',
  'high',
  NULL,
  'AI-powered early intervention platform for youth ages 12-24. Anonymous screening, peer support communities, and resource connection engine targeting underserved communities.',
  ARRAY['mental-health-youth'],
  80, 40,
  'https://kresge.org/grants',
  'LOI drafted. Health equity focus aligns well with Kresge priorities.'
),
(
  'Rural Health Navigator',
  'Blue Cross Blue Shield of Florida Foundation',
  'foundation',
  25000, 150000, 75000,
  'preparing',
  'high',
  NULL,
  'AI-powered telehealth access platform for rural Florida communities. Connects patients to providers, offers health education, and chronic disease management tools.',
  ARRAY['rural-health'],
  78, 50,
  'https://bcbsfl.com/foundation',
  'Application drafted. Check Florida-specific deadlines.'
),
(
  'Veterans Employment Initiative',
  'Department of Labor',
  'federal',
  500000, 2000000, 750000,
  'researching',
  'high',
  NULL,
  'Comprehensive employment support for transitioning veterans including skills translation, job matching, employer partnerships, and retention support.',
  ARRAY['veterans-transition'],
  90, 55,
  'https://grants.gov',
  'Monitor Grants.gov for FY2026 NOFO. CFDA 17.807 or 17.802.'
),
(
  'BRIC - Building Resilient Infrastructure',
  'FEMA',
  'federal',
  50000, 1000000, 500000,
  'researching',
  'medium',
  NULL,
  'Technology platform for disaster resilience and community preparedness. Integration with emergency management systems.',
  ARRAY['disaster-relief'],
  75, 50,
  'https://fema.gov/grants',
  'Annual program, typically opens in January. Partner with Lee County Emergency Management.'
),
(
  'Craig Newmark Philanthropies - Veterans',
  'Craig Newmark Philanthropies',
  'foundation',
  50000, 200000, 100000,
  'researching',
  'high',
  NULL,
  'Technology solutions for veteran transition and support. Focus on innovation and scalability.',
  ARRAY['veterans-transition'],
  85, 70,
  'https://craignewmarkphilanthropies.org',
  'Strong tech focus aligns with our platform. Rolling applications.'
),
(
  'NEA Our Town - Creative Placemaking',
  'National Endowment for the Arts',
  'federal',
  25000, 150000, 100000,
  'discovered',
  'medium',
  NULL,
  'Arts-based community development. Potential for CRAIverse creative tools integration.',
  ARRAY['community-arts'],
  65, 45,
  'https://arts.gov/grants',
  'Creative economy angle. Partner with local arts organizations.'
);

-- Insert initial milestones for BWF application
INSERT INTO grant_milestones (grant_id, title, description, due_date, status)
SELECT 
  id,
  unnest(ARRAY['Register on BWF Portal', 'Gather Financial Documents', 'Obtain Letters of Support', 'Final Review', 'Submit Application']),
  unnest(ARRAY[
    'Create account at bobwoodrufffoundation.org',
    'Collect Articles of Incorporation, EIN letter, financial statements',
    'Request 3-5 letters from partners and community leaders',
    'Have Cindy review complete application package',
    'Submit via online portal before January 6 deadline'
  ]),
  unnest(ARRAY['2025-12-16'::date, '2025-12-18'::date, '2025-12-20'::date, '2025-12-22'::date, '2025-12-24'::date]),
  'pending'
FROM grant_opportunities
WHERE title = 'Veterans Transition Hub';

-- Insert milestones for SAMHSA
INSERT INTO grant_milestones (grant_id, title, description, due_date, status)
SELECT 
  id,
  unnest(ARRAY['Complete SAM.gov Registration', 'Register on Grants.gov', 'Register eRA Commons', 'Identify Evaluation Partner', 'Watch for NOFO Release']),
  unnest(ARRAY[
    'Get UEI, complete full entity registration',
    'Create organization account, authorize AOR',
    'Create SO and PI accounts for SAMHSA submissions',
    'Contact USF College of Public Health for evaluation partnership',
    'Monitor Grants.gov weekly for FY2026 FR-CARA announcement'
  ]),
  unnest(ARRAY['2025-12-20'::date, '2025-12-27'::date, '2026-01-10'::date, '2026-01-15'::date, '2026-03-01'::date]),
  'pending'
FROM grant_opportunities
WHERE title = 'First Responders Haven - FR-CARA';

-- Verification query
SELECT 'Schema created successfully!' as status, 
       (SELECT COUNT(*) FROM grant_opportunities) as grants_count,
       (SELECT COUNT(*) FROM grant_milestones) as milestones_count;
