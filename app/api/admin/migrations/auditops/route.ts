import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST() {
  try {
    // Create audit_domains
    await supabase.rpc('exec_sql', { sql: `
      CREATE TABLE IF NOT EXISTS audit_domains (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        domain TEXT UNIQUE NOT NULL,
        tier TEXT NOT NULL DEFAULT 'apps',
        enabled BOOLEAN NOT NULL DEFAULT TRUE,
        crawl_budget_pages INT NOT NULL DEFAULT 500,
        crawl_budget_depth INT NOT NULL DEFAULT 6,
        max_runtime_minutes INT NOT NULL DEFAULT 8,
        requests_per_second NUMERIC NOT NULL DEFAULT 2,
        concurrency INT NOT NULL DEFAULT 4,
        follow_robots_txt BOOLEAN NOT NULL DEFAULT TRUE,
        discovery_source TEXT[] NOT NULL DEFAULT '{}'::TEXT[],
        last_audited_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `});

    // Create audit_runs
    await supabase.rpc('exec_sql', { sql: `
      CREATE TABLE IF NOT EXISTS audit_runs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        run_id TEXT UNIQUE NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        started_at TIMESTAMPTZ,
        completed_at TIMESTAMPTZ,
        env TEXT NOT NULL DEFAULT 'prod',
        scope TEXT NOT NULL DEFAULT 'full',
        status TEXT NOT NULL DEFAULT 'running',
        triggered_by TEXT NOT NULL DEFAULT 'manual',
        runner_version TEXT,
        git_sha TEXT,
        config_json JSONB NOT NULL DEFAULT '{}'::JSONB,
        total_domains INT NOT NULL DEFAULT 0,
        total_pages INT NOT NULL DEFAULT 0,
        duration_ms BIGINT,
        summary JSONB DEFAULT '{}'::JSONB,
        go_no_go TEXT,
        error TEXT
      );
    `});

    // Create audit_issues
    await supabase.rpc('exec_sql', { sql: `
      CREATE TABLE IF NOT EXISTS audit_issues (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        run_id TEXT NOT NULL,
        domain_id UUID NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        category TEXT NOT NULL,
        severity TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        route_or_endpoint TEXT,
        rule_id TEXT,
        signature TEXT,
        evidence_urls TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
        screenshot_path TEXT,
        har_path TEXT,
        recommended_fix TEXT,
        auto_fixable BOOLEAN DEFAULT FALSE,
        fixed_by TEXT,
        fixed_at TIMESTAMPTZ,
        fix_pr_url TEXT,
        verified_at TIMESTAMPTZ,
        fingerprint TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'open',
        first_seen_run_id TEXT,
        last_seen_run_id TEXT,
        occurrence_count INT DEFAULT 1
      );
    `});

    // Create audit_suppressions
    await supabase.rpc('exec_sql', { sql: `
      CREATE TABLE IF NOT EXISTS audit_suppressions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        fingerprint TEXT UNIQUE NOT NULL,
        reason TEXT NOT NULL,
        created_by TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        expires_at TIMESTAMPTZ,
        is_active BOOLEAN NOT NULL DEFAULT TRUE
      );
    `});

    // Create audit_trends
    await supabase.rpc('exec_sql', { sql: `
      CREATE TABLE IF NOT EXISTS audit_trends (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        domain TEXT NOT NULL,
        module TEXT NOT NULL,
        date DATE NOT NULL,
        score_avg DECIMAL(5,2),
        lighthouse_perf DECIMAL(5,2),
        lighthouse_a11y DECIMAL(5,2),
        lighthouse_seo DECIMAL(5,2),
        lighthouse_bp DECIMAL(5,2),
        issues_blocker INT DEFAULT 0,
        issues_high INT DEFAULT 0,
        issues_medium INT DEFAULT 0,
        issues_low INT DEFAULT 0,
        issues_total INT DEFAULT 0,
        pages_crawled INT DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(domain, module, date)
      );
    `});

    // Create audit_fix_packets
    await supabase.rpc('exec_sql', { sql: `
      CREATE TABLE IF NOT EXISTS audit_fix_packets (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        run_id TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        target_ai TEXT NOT NULL DEFAULT 'javari',
        packet_json JSONB NOT NULL,
        packet_markdown TEXT NOT NULL,
        issues_count INT DEFAULT 0,
        status TEXT DEFAULT 'pending',
        processed_at TIMESTAMPTZ,
        processed_by TEXT
      );
    `});

    // Seed domains using direct insert
    const domains = [
      { domain: 'craudiovizai.com', tier: 'primary', crawl_budget_pages: 1200 },
      { domain: 'www.craudiovizai.com', tier: 'primary', crawl_budget_pages: 1200 },
      { domain: 'javariverse.com', tier: 'primary', crawl_budget_pages: 1200 },
      { domain: 'javaribooks.com', tier: 'product', crawl_budget_pages: 800 },
      { domain: 'javaricards.com', tier: 'product', crawl_budget_pages: 800 },
      { domain: 'javariinvoice.com', tier: 'product', crawl_budget_pages: 800 },
    ];

    for (const d of domains) {
      await supabase.from('audit_domains').upsert({
        domain: d.domain,
        tier: d.tier,
        enabled: true,
        crawl_budget_pages: d.crawl_budget_pages,
        crawl_budget_depth: d.tier === 'primary' ? 8 : 6,
        discovery_source: ['seed'],
      }, { onConflict: 'domain' });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'AuditOps tables created and domains seeded',
      tables: 6,
      domains: domains.length
    });

  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: String(error) 
    }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
