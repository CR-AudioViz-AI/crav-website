-- AI Operations & Evaluation Framework Database Schema
-- CR AudioViz AI - Phase 0 Layer 0.6
-- Javari AI Evaluation, Safety, and Optimization
-- Run in Supabase SQL Editor

-- ============================================================================
-- PROMPT LIBRARY (Versioned Prompts)
-- ============================================================================

CREATE TABLE IF NOT EXISTS ai_prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Identity
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  category TEXT NOT NULL, -- 'system', 'task', 'safety', 'persona', 'tool'
  
  -- Content
  prompt_text TEXT NOT NULL,
  variables JSONB DEFAULT '[]', -- Variables that can be injected: [{name, type, required, default}]
  
  -- Versioning
  version INTEGER NOT NULL DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  is_default BOOLEAN DEFAULT false,
  
  -- Metadata
  model_target TEXT, -- Intended model (null = any)
  max_tokens INTEGER,
  temperature DECIMAL(3,2),
  
  -- Performance
  avg_quality_score DECIMAL(4,2),
  usage_count INTEGER DEFAULT 0,
  
  -- Audit
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Prompt version history
CREATE TABLE IF NOT EXISTS ai_prompt_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_id UUID NOT NULL REFERENCES ai_prompts(id) ON DELETE CASCADE,
  
  version INTEGER NOT NULL,
  prompt_text TEXT NOT NULL,
  variables JSONB,
  
  -- Change tracking
  change_reason TEXT,
  changed_by UUID REFERENCES auth.users(id),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(prompt_id, version)
);

-- ============================================================================
-- AI EVALUATION FRAMEWORK
-- ============================================================================

-- Evaluation test suites
CREATE TABLE IF NOT EXISTS ai_eval_suites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL, -- 'quality', 'safety', 'accuracy', 'speed', 'cost'
  
  -- Configuration
  is_active BOOLEAN DEFAULT true,
  run_frequency TEXT, -- 'hourly', 'daily', 'weekly', 'on_deploy', 'manual'
  
  -- Thresholds
  pass_threshold DECIMAL(4,2), -- Minimum score to pass (0-100)
  critical_threshold DECIMAL(4,2), -- Score below which alerts fire
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Individual test cases
CREATE TABLE IF NOT EXISTS ai_eval_tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  suite_id UUID NOT NULL REFERENCES ai_eval_suites(id) ON DELETE CASCADE,
  
  name TEXT NOT NULL,
  description TEXT,
  
  -- Test Input
  input_prompt TEXT NOT NULL,
  input_context JSONB, -- Additional context/variables
  
  -- Expected Output
  expected_output TEXT, -- For exact match tests
  expected_contains TEXT[], -- Must contain these strings
  expected_not_contains TEXT[], -- Must NOT contain these
  expected_sentiment TEXT, -- 'positive', 'negative', 'neutral'
  expected_format TEXT, -- 'json', 'markdown', 'code', 'text'
  
  -- Scoring
  scoring_method TEXT NOT NULL DEFAULT 'auto', -- 'auto', 'llm_judge', 'human', 'exact_match', 'semantic'
  scoring_rubric JSONB, -- Custom rubric for LLM judge
  weight DECIMAL(3,2) DEFAULT 1.0, -- Weight in suite score
  
  -- Execution
  timeout_seconds INTEGER DEFAULT 30,
  retry_count INTEGER DEFAULT 2,
  
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Evaluation run results
CREATE TABLE IF NOT EXISTS ai_eval_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  suite_id UUID NOT NULL REFERENCES ai_eval_suites(id),
  
  -- Execution Context
  triggered_by TEXT NOT NULL, -- 'schedule', 'deploy', 'manual', 'api'
  model_tested TEXT NOT NULL, -- Model being evaluated
  prompt_version TEXT, -- Prompt version tested
  
  -- Timing
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  
  -- Results
  status TEXT NOT NULL DEFAULT 'running' CHECK (status IN ('running', 'passed', 'failed', 'error')),
  total_tests INTEGER DEFAULT 0,
  passed_tests INTEGER DEFAULT 0,
  failed_tests INTEGER DEFAULT 0,
  
  -- Scores
  overall_score DECIMAL(5,2), -- 0-100
  quality_score DECIMAL(5,2),
  safety_score DECIMAL(5,2),
  speed_score DECIMAL(5,2),
  cost_score DECIMAL(5,2),
  
  -- Metadata
  avg_latency_ms INTEGER,
  total_tokens INTEGER,
  total_cost DECIMAL(10,6),
  
  error_message TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Individual test results
CREATE TABLE IF NOT EXISTS ai_eval_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id UUID NOT NULL REFERENCES ai_eval_runs(id) ON DELETE CASCADE,
  test_id UUID NOT NULL REFERENCES ai_eval_tests(id),
  
  -- Execution
  started_at TIMESTAMPTZ NOT NULL,
  completed_at TIMESTAMPTZ,
  latency_ms INTEGER,
  
  -- Input/Output
  actual_input TEXT,
  actual_output TEXT,
  
  -- Scoring
  passed BOOLEAN,
  score DECIMAL(5,2), -- 0-100
  score_breakdown JSONB, -- Detailed scoring
  
  -- Diagnostics
  failure_reason TEXT,
  model_used TEXT,
  tokens_used INTEGER,
  cost DECIMAL(10,6),
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- SAFETY TESTING
-- ============================================================================

-- Safety test categories
CREATE TABLE IF NOT EXISTS ai_safety_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  severity TEXT NOT NULL CHECK (severity IN ('critical', 'high', 'medium', 'low')),
  
  -- Examples
  example_triggers TEXT[], -- Example inputs that should trigger
  example_safe_responses TEXT[], -- How to respond safely
  
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Safety violations log
CREATE TABLE IF NOT EXISTS ai_safety_violations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Context
  session_id TEXT,
  user_id UUID REFERENCES auth.users(id),
  conversation_id UUID,
  
  -- Violation Details
  category_id UUID REFERENCES ai_safety_categories(id),
  severity TEXT NOT NULL,
  
  -- Content
  user_input TEXT NOT NULL,
  ai_output TEXT,
  
  -- Detection
  detected_by TEXT NOT NULL, -- 'pre_filter', 'post_filter', 'llm_judge', 'user_report', 'admin'
  detection_confidence DECIMAL(4,3), -- 0-1
  
  -- Resolution
  action_taken TEXT, -- 'blocked', 'filtered', 'warned', 'logged', 'escalated'
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  review_notes TEXT,
  false_positive BOOLEAN,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Red team test results
CREATE TABLE IF NOT EXISTS ai_red_team_tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Test Details
  name TEXT NOT NULL,
  attack_category TEXT NOT NULL, -- 'jailbreak', 'injection', 'extraction', 'manipulation', 'bias'
  attack_vector TEXT NOT NULL,
  
  -- Test Input
  test_input TEXT NOT NULL,
  
  -- Results
  test_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  model_tested TEXT NOT NULL,
  
  was_blocked BOOLEAN NOT NULL,
  ai_response TEXT,
  vulnerability_found BOOLEAN DEFAULT false,
  
  -- Analysis
  severity TEXT,
  notes TEXT,
  remediation TEXT,
  
  tested_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- MODEL DRIFT MONITORING
-- ============================================================================

-- Daily performance snapshots
CREATE TABLE IF NOT EXISTS ai_performance_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  snapshot_date DATE NOT NULL,
  model TEXT NOT NULL,
  
  -- Volume
  total_requests INTEGER DEFAULT 0,
  total_tokens INTEGER DEFAULT 0,
  total_cost DECIMAL(12,6) DEFAULT 0,
  
  -- Latency
  avg_latency_ms INTEGER,
  p50_latency_ms INTEGER,
  p95_latency_ms INTEGER,
  p99_latency_ms INTEGER,
  
  -- Quality (from evaluations)
  avg_quality_score DECIMAL(5,2),
  avg_safety_score DECIMAL(5,2),
  
  -- Errors
  error_count INTEGER DEFAULT 0,
  error_rate DECIMAL(5,4),
  
  -- User Feedback
  thumbs_up INTEGER DEFAULT 0,
  thumbs_down INTEGER DEFAULT 0,
  feedback_score DECIMAL(4,2), -- Calculated satisfaction
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(snapshot_date, model)
);

-- Drift alerts
CREATE TABLE IF NOT EXISTS ai_drift_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Alert Details
  alert_type TEXT NOT NULL, -- 'quality_drop', 'latency_spike', 'cost_increase', 'error_rate', 'safety_concern'
  severity TEXT NOT NULL CHECK (severity IN ('critical', 'high', 'medium', 'low')),
  
  model TEXT NOT NULL,
  metric TEXT NOT NULL, -- Specific metric that triggered
  
  -- Values
  baseline_value DECIMAL(12,4),
  current_value DECIMAL(12,4),
  deviation_percent DECIMAL(6,2),
  
  -- Status
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'acknowledged', 'investigating', 'resolved', 'ignored')),
  
  -- Resolution
  assigned_to UUID REFERENCES auth.users(id),
  resolved_at TIMESTAMPTZ,
  resolution_notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- A/B TESTING FOR AI
-- ============================================================================

-- A/B experiments
CREATE TABLE IF NOT EXISTS ai_experiments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  name TEXT NOT NULL,
  description TEXT,
  hypothesis TEXT,
  
  -- Variants
  control_config JSONB NOT NULL, -- Control variant config
  treatment_config JSONB NOT NULL, -- Treatment variant config
  
  -- Targeting
  traffic_percent INTEGER NOT NULL DEFAULT 50, -- % to treatment
  user_segments TEXT[], -- Optional segment targeting
  
  -- Metrics
  primary_metric TEXT NOT NULL, -- Main success metric
  secondary_metrics TEXT[], -- Additional metrics to track
  
  -- Status
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'running', 'paused', 'completed', 'cancelled')),
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  
  -- Results
  winner TEXT, -- 'control', 'treatment', 'inconclusive'
  statistical_significance DECIMAL(5,4),
  lift_percent DECIMAL(6,2),
  
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Experiment assignments (which users see which variant)
CREATE TABLE IF NOT EXISTS ai_experiment_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  experiment_id UUID NOT NULL REFERENCES ai_experiments(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  session_id TEXT,
  
  variant TEXT NOT NULL CHECK (variant IN ('control', 'treatment')),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(experiment_id, user_id),
  UNIQUE(experiment_id, session_id)
);

-- Experiment metrics
CREATE TABLE IF NOT EXISTS ai_experiment_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  experiment_id UUID NOT NULL REFERENCES ai_experiments(id) ON DELETE CASCADE,
  variant TEXT NOT NULL,
  
  -- Aggregate Metrics
  sample_size INTEGER DEFAULT 0,
  
  -- Quality
  avg_quality_score DECIMAL(5,2),
  
  -- Engagement
  avg_turns_per_session DECIMAL(6,2),
  completion_rate DECIMAL(5,4),
  
  -- Satisfaction
  thumbs_up_rate DECIMAL(5,4),
  
  -- Performance
  avg_latency_ms INTEGER,
  avg_cost DECIMAL(10,6),
  
  -- Calculated
  conversion_rate DECIMAL(5,4),
  
  last_updated TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- COST OPTIMIZATION
-- ============================================================================

-- Model cost tracking
CREATE TABLE IF NOT EXISTS ai_model_costs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  model TEXT NOT NULL,
  provider TEXT NOT NULL, -- 'openai', 'anthropic', 'google', 'groq', 'openrouter'
  
  -- Pricing (per 1M tokens)
  input_cost_per_million DECIMAL(10,6) NOT NULL,
  output_cost_per_million DECIMAL(10,6) NOT NULL,
  
  -- Capabilities
  max_context INTEGER,
  supports_vision BOOLEAN DEFAULT false,
  supports_tools BOOLEAN DEFAULT false,
  
  -- Performance
  avg_latency_ms INTEGER,
  reliability_score DECIMAL(4,2), -- 0-100
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  is_free_tier BOOLEAN DEFAULT false,
  free_tier_limit TEXT, -- e.g., "1000 req/day"
  
  effective_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(model, effective_date)
);

-- Daily cost summary
CREATE TABLE IF NOT EXISTS ai_cost_daily (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  date DATE NOT NULL,
  
  -- By Model
  model TEXT NOT NULL,
  provider TEXT NOT NULL,
  
  -- Usage
  request_count INTEGER DEFAULT 0,
  input_tokens INTEGER DEFAULT 0,
  output_tokens INTEGER DEFAULT 0,
  total_tokens INTEGER DEFAULT 0,
  
  -- Cost
  input_cost DECIMAL(12,6) DEFAULT 0,
  output_cost DECIMAL(12,6) DEFAULT 0,
  total_cost DECIMAL(12,6) DEFAULT 0,
  
  -- Savings (from using free tiers)
  free_tier_savings DECIMAL(12,6) DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(date, model)
);

-- ============================================================================
-- USER FEEDBACK
-- ============================================================================

-- Conversation feedback
CREATE TABLE IF NOT EXISTS ai_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Context
  user_id UUID REFERENCES auth.users(id),
  session_id TEXT,
  conversation_id UUID,
  message_id UUID,
  
  -- Feedback
  rating TEXT CHECK (rating IN ('thumbs_up', 'thumbs_down', 'star_1', 'star_2', 'star_3', 'star_4', 'star_5')),
  feedback_text TEXT,
  feedback_category TEXT, -- 'accuracy', 'helpfulness', 'safety', 'speed', 'other'
  
  -- Context
  model_used TEXT,
  prompt_version TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_ai_prompts_category ON ai_prompts(category);
CREATE INDEX IF NOT EXISTS idx_ai_prompts_active ON ai_prompts(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_ai_eval_runs_suite ON ai_eval_runs(suite_id);
CREATE INDEX IF NOT EXISTS idx_ai_eval_runs_status ON ai_eval_runs(status);
CREATE INDEX IF NOT EXISTS idx_ai_safety_violations_user ON ai_safety_violations(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_safety_violations_category ON ai_safety_violations(category_id);
CREATE INDEX IF NOT EXISTS idx_ai_performance_date ON ai_performance_snapshots(snapshot_date);
CREATE INDEX IF NOT EXISTS idx_ai_drift_alerts_status ON ai_drift_alerts(status) WHERE status = 'open';
CREATE INDEX IF NOT EXISTS idx_ai_experiments_status ON ai_experiments(status);
CREATE INDEX IF NOT EXISTS idx_ai_feedback_user ON ai_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_cost_daily_date ON ai_cost_daily(date);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE ai_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_safety_violations ENABLE ROW LEVEL SECURITY;

-- Users can see their own feedback
CREATE POLICY "Users view own feedback" ON ai_feedback
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users insert own feedback" ON ai_feedback
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Service role has full access
CREATE POLICY "Service full access feedback" ON ai_feedback
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service full access violations" ON ai_safety_violations
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- ============================================================================
-- DEFAULT DATA
-- ============================================================================

-- Default safety categories
INSERT INTO ai_safety_categories (name, description, severity, example_triggers) VALUES
  ('harmful_content', 'Content that could cause harm to users or others', 'critical', ARRAY['how to make weapons', 'how to hurt someone']),
  ('illegal_activity', 'Content promoting or facilitating illegal activities', 'critical', ARRAY['how to hack', 'how to steal']),
  ('adult_content', 'Sexually explicit or adult-only content', 'high', ARRAY['explicit stories', 'adult images']),
  ('hate_speech', 'Discriminatory or hateful content', 'critical', ARRAY['slurs', 'discrimination']),
  ('self_harm', 'Content related to self-harm or suicide', 'critical', ARRAY['how to hurt myself', 'suicide methods']),
  ('misinformation', 'Verifiably false or misleading claims', 'high', ARRAY['fake medical advice', 'conspiracy theories']),
  ('privacy_violation', 'Requests for personal/private information', 'high', ARRAY['SSN requests', 'password requests']),
  ('jailbreak_attempt', 'Attempts to bypass safety measures', 'medium', ARRAY['ignore previous instructions', 'pretend you have no rules'])
ON CONFLICT (name) DO NOTHING;

-- Default model costs (December 2025 pricing)
INSERT INTO ai_model_costs (model, provider, input_cost_per_million, output_cost_per_million, max_context, is_free_tier) VALUES
  ('gpt-4o', 'openai', 2.50, 10.00, 128000, false),
  ('gpt-4o-mini', 'openai', 0.15, 0.60, 128000, false),
  ('claude-3-5-sonnet', 'anthropic', 3.00, 15.00, 200000, false),
  ('claude-3-haiku', 'anthropic', 0.25, 1.25, 200000, false),
  ('gemini-1.5-pro', 'google', 1.25, 5.00, 2000000, false),
  ('gemini-1.5-flash', 'google', 0.075, 0.30, 1000000, false),
  ('llama-3.1-70b', 'groq', 0.00, 0.00, 131072, true),
  ('llama-3.1-8b', 'groq', 0.00, 0.00, 131072, true),
  ('mixtral-8x7b', 'groq', 0.00, 0.00, 32768, true),
  ('command-r', 'cohere', 0.00, 0.00, 128000, true),
  ('deepseek-chat', 'openrouter', 0.00, 0.00, 64000, true)
ON CONFLICT DO NOTHING;

-- Default evaluation suite
INSERT INTO ai_eval_suites (name, description, category, run_frequency, pass_threshold, critical_threshold) VALUES
  ('Core Quality', 'Basic quality checks for all responses', 'quality', 'hourly', 80, 60),
  ('Safety Checks', 'Safety and harm prevention tests', 'safety', 'hourly', 95, 85),
  ('Response Accuracy', 'Factual accuracy verification', 'accuracy', 'daily', 85, 70),
  ('Performance', 'Speed and latency benchmarks', 'speed', 'hourly', 90, 75),
  ('Cost Efficiency', 'Token usage and cost optimization', 'cost', 'daily', 80, 60)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- DONE
-- ============================================================================

COMMENT ON TABLE ai_prompts IS 'Versioned prompt library for Javari AI';
COMMENT ON TABLE ai_eval_suites IS 'Evaluation test suites for AI quality assurance';
COMMENT ON TABLE ai_safety_violations IS 'Log of detected safety violations';
COMMENT ON TABLE ai_performance_snapshots IS 'Daily performance metrics for drift detection';
COMMENT ON TABLE ai_experiments IS 'A/B testing configuration for AI improvements';
COMMENT ON TABLE ai_model_costs IS 'Model pricing for cost optimization routing';
