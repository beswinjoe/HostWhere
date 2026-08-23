import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function getAffiliateDashboardData() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll() {},
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // Get username
  const { data: profile } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", user.id)
    .single();
    
  if (!profile) return null;

  // Get stats
  // Note: For large scale we'd use RPC/aggregations, but this is fine for MVP
  const { count: totalClicks } = await supabase
    .from("affiliate_clicks")
    .select("*", { count: "exact", head: true })
    .eq("affiliate_user_id", user.id);

  const { count: totalReferrals } = await supabase
    .from("affiliate_referrals")
    .select("*", { count: "exact", head: true })
    .eq("affiliate_user_id", user.id);

  const { data: commissions } = await supabase
    .from("affiliate_commissions")
    .select("*")
    .eq("affiliate_user_id", user.id)
    .order("created_at", { ascending: false });

  const { data: payouts } = await supabase
    .from("affiliate_payouts")
    .select("*")
    .eq("affiliate_user_id", user.id)
    .order("created_at", { ascending: false });

  const totalConversions = commissions?.length || 0;
  
  let pendingCents = 0;
  let availableCents = 0;
  let paidCents = 0;
  let totalCents = 0;

  if (commissions) {
    for (const c of commissions) {
      if (c.status === "pending") pendingCents += c.commission_amount_cents;
      if (c.status === "available") availableCents += c.commission_amount_cents;
      if (c.status === "paid") paidCents += c.commission_amount_cents;
      
      // Total earned ignores cancelled/reversed
      if (c.status !== "cancelled" && c.status !== "reversed") {
        totalCents += c.commission_amount_cents;
      }
    }
  }

  // Deduct requested/paid payouts from available balance
  if (payouts) {
    for (const p of payouts) {
      if (p.status !== "rejected") {
        availableCents -= p.amount_cents;
      }
    }
  }

  // Ensure available doesn't go below 0 (just in case of manual adjustments)
  if (availableCents < 0) availableCents = 0;

  return {
    username: profile.username,
    stats: {
      totalClicks: totalClicks || 0,
      totalReferrals: totalReferrals || 0,
      totalConversions,
      pendingCents,
      availableCents,
      paidCents,
      totalCents,
    },
    recentCommissions: commissions?.slice(0, 10) || [],
    payoutHistory: payouts || [],
  };
}
