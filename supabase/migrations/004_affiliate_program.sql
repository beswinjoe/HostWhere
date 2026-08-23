-- Supabase Migration: 004_affiliate_program.sql

-- 1. Create affiliate_clicks table
CREATE TABLE public.affiliate_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  referral_code TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Create affiliate_referrals table
CREATE TABLE public.affiliate_referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  referred_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  referral_code TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (affiliate_user_id, referred_user_id)
);

-- 3. Create affiliate_commissions table
CREATE TABLE public.affiliate_commissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  referred_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  payment_id TEXT NOT NULL UNIQUE,
  plan TEXT NOT NULL,
  payment_amount_cents INTEGER NOT NULL,
  commission_rate INTEGER NOT NULL DEFAULT 40,
  commission_amount_cents INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, available, paid, reversed, cancelled
  available_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Enable RLS
ALTER TABLE public.affiliate_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_commissions ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies

-- affiliate_clicks: users can read their own clicks
CREATE POLICY "Users can view their own affiliate clicks"
ON public.affiliate_clicks FOR SELECT USING (auth.uid() = affiliate_user_id);

-- affiliate_clicks: Service role / backend can insert
CREATE POLICY "Service role can insert affiliate clicks"
ON public.affiliate_clicks FOR INSERT WITH CHECK (true);

-- affiliate_referrals: users can read their own referrals
CREATE POLICY "Users can view their own affiliate referrals"
ON public.affiliate_referrals FOR SELECT USING (auth.uid() = affiliate_user_id);

-- affiliate_referrals: backend can insert
CREATE POLICY "Service role can insert affiliate referrals"
ON public.affiliate_referrals FOR INSERT WITH CHECK (true);
CREATE POLICY "Service role can update affiliate referrals"
ON public.affiliate_referrals FOR UPDATE USING (true);

-- affiliate_commissions: users can read their own commissions
CREATE POLICY "Users can view their own affiliate commissions"
ON public.affiliate_commissions FOR SELECT USING (auth.uid() = affiliate_user_id);

-- affiliate_commissions: backend can insert/update
CREATE POLICY "Service role can insert affiliate commissions"
ON public.affiliate_commissions FOR INSERT WITH CHECK (true);
CREATE POLICY "Service role can update affiliate commissions"
ON public.affiliate_commissions FOR UPDATE USING (true);

-- 6. Indexes for performance
CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_user_id ON public.affiliate_clicks(affiliate_user_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_referrals_user_id ON public.affiliate_referrals(affiliate_user_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_referrals_referred_user_id ON public.affiliate_referrals(referred_user_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_commissions_user_id ON public.affiliate_commissions(affiliate_user_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_commissions_payment_id ON public.affiliate_commissions(payment_id);
