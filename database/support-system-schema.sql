-- Support Ticket System Database Schema
-- Pulse → Javari → Roy Escalation Flow
-- Timestamp: Dec 11, 2025 10:46 PM EST

-- ============================================
-- SUPPORT TICKETS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject VARCHAR(255) NOT NULL,
  category VARCHAR(50) DEFAULT 'general',
  priority VARCHAR(20) DEFAULT 'medium', -- low, medium, high, urgent
  status VARCHAR(50) DEFAULT 'open', -- open, in_progress, waiting, resolved, closed
  escalation_tier VARCHAR(20) DEFAULT 'pulse', -- pulse, javari, human
  escalation_history JSONB DEFAULT '[]',
  assigned_to UUID REFERENCES auth.users(id),
  resolution TEXT,
  satisfaction_rating INTEGER, -- 1-5
  satisfaction_feedback TEXT,
  first_response_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TICKET MESSAGES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS ticket_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  sender_type VARCHAR(20) NOT NULL, -- user, agent, ai, system
  sender_name VARCHAR(100),
  message TEXT NOT NULL,
  attachments JSONB DEFAULT '[]',
  is_internal BOOLEAN DEFAULT FALSE, -- Internal notes not visible to user
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- CANNED RESPONSES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS canned_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category VARCHAR(50),
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  keywords TEXT[], -- For AI matching
  tier VARCHAR(20) DEFAULT 'pulse', -- Which tier can use this
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- SUPPORT KNOWLEDGE BASE
-- ============================================
CREATE TABLE IF NOT EXISTS support_knowledge (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category VARCHAR(50),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  keywords TEXT[],
  helpful_count INTEGER DEFAULT 0,
  not_helpful_count INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_support_tickets_user_id ON support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_support_tickets_tier ON support_tickets(escalation_tier);
CREATE INDEX IF NOT EXISTS idx_support_tickets_priority ON support_tickets(priority);
CREATE INDEX IF NOT EXISTS idx_support_tickets_created_at ON support_tickets(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_ticket_messages_ticket_id ON ticket_messages(ticket_id);
CREATE INDEX IF NOT EXISTS idx_ticket_messages_created_at ON ticket_messages(created_at);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE canned_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_knowledge ENABLE ROW LEVEL SECURITY;

-- Users can view their own tickets
CREATE POLICY "Users can view own tickets"
  ON support_tickets FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create their own tickets
CREATE POLICY "Users can create tickets"
  ON support_tickets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can view messages for their tickets
CREATE POLICY "Users can view ticket messages"
  ON ticket_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM support_tickets
      WHERE support_tickets.id = ticket_messages.ticket_id
      AND support_tickets.user_id = auth.uid()
    )
    AND is_internal = FALSE
  );

-- Users can add messages to their tickets
CREATE POLICY "Users can add messages"
  ON ticket_messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM support_tickets
      WHERE support_tickets.id = ticket_messages.ticket_id
      AND support_tickets.user_id = auth.uid()
    )
  );

-- Public read access to knowledge base
CREATE POLICY "Public can read knowledge base"
  ON support_knowledge FOR SELECT
  USING (is_published = TRUE);

-- Service role full access
CREATE POLICY "Service role tickets" ON support_tickets FOR ALL USING (auth.jwt()->>'role' = 'service_role');
CREATE POLICY "Service role messages" ON ticket_messages FOR ALL USING (auth.jwt()->>'role' = 'service_role');
CREATE POLICY "Service role canned" ON canned_responses FOR ALL USING (auth.jwt()->>'role' = 'service_role');
CREATE POLICY "Service role knowledge" ON support_knowledge FOR ALL USING (auth.jwt()->>'role' = 'service_role');

-- ============================================
-- INITIAL CANNED RESPONSES
-- ============================================
INSERT INTO canned_responses (category, title, content, keywords, tier) VALUES
('general', 'Welcome', 'Thank you for reaching out to CR AudioViz AI support! I''m here to help you. Let me review your request.', ARRAY['hello', 'hi', 'help'], 'pulse'),
('billing', 'Credit Balance', 'I''d be happy to help you check your credit balance. You can view your current credits in your Dashboard under the Credits section. Remember, credits never expire on paid plans!', ARRAY['credits', 'balance', 'how many'], 'pulse'),
('billing', 'Refund Request', 'I understand you''re requesting a refund. Let me review your account and recent transactions. Our policy allows refunds within 30 days of purchase for unused credits.', ARRAY['refund', 'money back', 'cancel purchase'], 'pulse'),
('technical', 'App Not Loading', 'I''m sorry you''re experiencing issues with the app loading. Let''s troubleshoot: 1) Clear your browser cache, 2) Try a different browser, 3) Check your internet connection. If the issue persists, I''ll escalate to our technical team.', ARRAY['not loading', 'error', 'broken', 'not working'], 'pulse'),
('account', 'Password Reset', 'I can help you reset your password. Click the "Forgot Password" link on the login page, and we''ll send a reset link to your registered email. The link expires in 24 hours.', ARRAY['password', 'forgot', 'reset', 'login'], 'pulse')
ON CONFLICT DO NOTHING;
