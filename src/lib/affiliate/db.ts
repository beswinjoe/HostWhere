import { createClient } from "@supabase/supabase-js";

// We use the service role key to bypass RLS for server-side commission creation
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function getProfileByUsername(username: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .ilike("username", username) // Case insensitive
    .single();

  if (error || !data) return null;
  return data;
}

export async function recordAffiliateClick(affiliateUserId: string, referralCode: string) {
  const { error } = await supabase
    .from("affiliate_clicks")
    .insert([{ affiliate_user_id: affiliateUserId, referral_code: referralCode }]);
  
  if (error) console.error("Error recording affiliate click:", error);
}

export async function linkAffiliateReferral(affiliateUserId: string, referredUserId: string, referralCode: string) {
  // 30 days from now
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);

  const { error } = await supabase
    .from("affiliate_referrals")
    .upsert(
      {
        affiliate_user_id: affiliateUserId,
        referred_user_id: referredUserId,
        referral_code: referralCode,
        expires_at: expiresAt.toISOString(),
      },
      { onConflict: "affiliate_user_id,referred_user_id" }
    );
  
  if (error) console.error("Error linking affiliate referral:", error);
}

export async function getValidReferralForUser(referredUserId: string) {
  const { data, error } = await supabase
    .from("affiliate_referrals")
    .select("*")
    .eq("referred_user_id", referredUserId)
    .gt("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (error || !data) return null;
  return data;
}

export async function createAffiliateCommission(
  affiliateUserId: string,
  referredUserId: string | null,
  paymentId: string,
  plan: string,
  paymentAmountCents: number,
  commissionRate: number,
  commissionAmountCents: number
) {
  // Available in 30 days
  const availableAt = new Date();
  availableAt.setDate(availableAt.getDate() + 30);

  const { data, error } = await supabase
    .from("affiliate_commissions")
    .insert([
      {
        affiliate_user_id: affiliateUserId,
        referred_user_id: referredUserId,
        payment_id: paymentId,
        plan,
        payment_amount_cents: paymentAmountCents,
        commission_rate: commissionRate,
        commission_amount_cents: commissionAmountCents,
        status: "pending",
        available_at: availableAt.toISOString(),
      }
    ])
    .select()
    .single();

  if (error) {
    console.error("Error creating affiliate commission:", error);
    return null;
  }
  
  return data;
}

export async function updateCommissionStatus(paymentId: string, status: "available" | "paid" | "reversed" | "cancelled") {
  const { error } = await supabase
    .from("affiliate_commissions")
    .update({ status })
    .eq("payment_id", paymentId);
    
  if (error) console.error("Error updating commission status:", error);
}
