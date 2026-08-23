-- Supabase Migration: 006_rich_project_details_and_payouts.sql

-- 1. Add missing optional project detail columns to featured_projects
ALTER TABLE public.featured_projects
ADD COLUMN IF NOT EXISTS owner_name TEXT,
ADD COLUMN IF NOT EXISTS company_name TEXT,
ADD COLUMN IF NOT EXISTS short_description TEXT,
ADD COLUMN IF NOT EXISTS category TEXT,
ADD COLUMN IF NOT EXISTS social_links JSONB;

-- 2. Create affiliate_payouts table for payout requests
CREATE TABLE public.affiliate_payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount_cents INTEGER NOT NULL,
  payout_method TEXT NOT NULL,
  payout_details TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, processing, paid, rejected
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Enable RLS on affiliate_payouts
ALTER TABLE public.affiliate_payouts ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies for affiliate_payouts
CREATE POLICY "Users can view their own payout requests"
ON public.affiliate_payouts FOR SELECT USING (auth.uid() = affiliate_user_id);

CREATE POLICY "Users can insert their own payout requests"
ON public.affiliate_payouts FOR INSERT WITH CHECK (auth.uid() = affiliate_user_id);

-- Backend can update payouts (for admin processing later)
CREATE POLICY "Service role can update payout requests"
ON public.affiliate_payouts FOR UPDATE USING (true);

-- 5. Indexes
CREATE INDEX IF NOT EXISTS idx_affiliate_payouts_user_id ON public.affiliate_payouts(affiliate_user_id);
