-- Supabase Migration: 003_fixed_plans.sql

-- 1. Add new columns to featured_projects
ALTER TABLE public.featured_projects
ADD COLUMN plan TEXT,
ADD COLUMN price_cents INTEGER,
ADD COLUMN priority INTEGER,
ADD COLUMN featured_at TIMESTAMPTZ,
ADD COLUMN expires_at TIMESTAMPTZ;

-- 2. Backfill existing active projects to 'boost' plan for backward compatibility
UPDATE public.featured_projects
SET 
  plan = 'boost',
  price_cents = 200,
  priority = 1,
  featured_at = first_reached_bid_at,
  expires_at = now() + interval '7 days'
WHERE featured_active = true;

-- 3. Create a new index for the new sorting logic
-- Sort by featured_active = true, then priority DESC, then featured_at DESC
CREATE INDEX IF NOT EXISTS idx_featured_projects_plan_ranking
ON public.featured_projects (priority DESC, featured_at DESC)
WHERE featured_active = true;

-- (Optional) Drop the old composite index since we are no longer using total_bid_cents for ranking
DROP INDEX IF EXISTS idx_featured_projects_ranking;
