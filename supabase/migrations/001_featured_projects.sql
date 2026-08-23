-- ═══════════════════════════════════════════════════════════════
-- HostWhere: Featured Projects — Database Migration
-- Run this against your Supabase project via SQL Editor
-- ═══════════════════════════════════════════════════════════════

-- ─── Featured Projects (Leaderboard entries) ─────────────────
CREATE TABLE IF NOT EXISTS featured_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  repository_url TEXT UNIQUE NOT NULL,
  project_name TEXT NOT NULL,
  description TEXT DEFAULT '',
  framework TEXT DEFAULT 'unknown',
  recommended_host TEXT DEFAULT 'unknown',
  total_bid_cents INTEGER NOT NULL DEFAULT 0,
  total_clicks INTEGER NOT NULL DEFAULT 0,
  first_reached_bid_at TIMESTAMPTZ DEFAULT now(),
  featured_active BOOLEAN NOT NULL DEFAULT true,
  analysis_result_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Composite index for efficient leaderboard ranking queries
CREATE INDEX IF NOT EXISTS idx_featured_projects_ranking
  ON featured_projects (total_bid_cents DESC, first_reached_bid_at ASC)
  WHERE featured_active = true;

-- ─── Payments (Dodo payment records for idempotency) ─────────
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider TEXT NOT NULL DEFAULT 'dodo',
  provider_payment_id TEXT UNIQUE,
  amount_cents INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  status TEXT NOT NULL DEFAULT 'pending',
  webhook_event_id TEXT UNIQUE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_payments_provider_id
  ON payments (provider_payment_id);

CREATE INDEX IF NOT EXISTS idx_payments_webhook_event
  ON payments (webhook_event_id);

-- ─── Bids (Individual bid records) ───────────────────────────
CREATE TABLE IF NOT EXISTS bids (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  featured_project_id UUID NOT NULL REFERENCES featured_projects(id) ON DELETE CASCADE,
  amount_cents INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  payment_id UUID REFERENCES payments(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_bids_project
  ON bids (featured_project_id);

CREATE INDEX IF NOT EXISTS idx_bids_payment
  ON bids (payment_id);

-- ─── Activity Events (Real event log for live feed) ──────────
CREATE TABLE IF NOT EXISTS activity_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL,
  featured_project_id UUID REFERENCES featured_projects(id) ON DELETE CASCADE,
  project_name TEXT NOT NULL,
  description TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_activity_events_created
  ON activity_events (created_at DESC);

-- ─── Click tracking rate limit helper table ──────────────────
CREATE TABLE IF NOT EXISTS click_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  featured_project_id UUID NOT NULL REFERENCES featured_projects(id) ON DELETE CASCADE,
  visitor_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_click_tracking_dedup
  ON click_tracking (featured_project_id, visitor_hash, created_at DESC);
