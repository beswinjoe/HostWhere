// ─────────────────────────────────────────────────────────────
// POST /api/featured/checkout — Create Dodo checkout session
// ─────────────────────────────────────────────────────────────

import { NextRequest } from "next/server";
import {
  getFeaturedProjectByRepo,
  createFeaturedProject,
  createPayment,
  createBid,
} from "@/lib/featured/db";
import { linkAffiliateReferral, getValidReferralForUser } from "@/lib/affiliate/db";
import { createCheckoutSession } from "@/lib/featured/dodo";
import { FEATURED_PLANS } from "@/lib/featured/types";
import type { CheckoutRequest } from "@/lib/featured/types";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

const GITHUB_URL_REGEX = /^https?:\/\/github\.com\/[^/]+\/[^/]+\/?$/;
const MIN_BID_CENTS = 100; // $1.00

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as CheckoutRequest;

    // ── Validation ─────────────────────────────────────────
    if (!body.repository_url || !GITHUB_URL_REGEX.test(body.repository_url)) {
      return Response.json(
        { error: "Invalid GitHub repository URL." },
        { status: 400 }
      );
    }

    if (!body.project_name || body.project_name.trim().length === 0) {
      return Response.json(
        { error: "Project name is required." },
        { status: 400 }
      );
    }

    const planConfig = FEATURED_PLANS[body.plan];
    if (!planConfig) {
      return Response.json(
        { error: "Invalid plan selected." },
        { status: 400 }
      );
    }
    
    const amountCents = planConfig.priceCents;

    // Get current user if logged in
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll(); },
          setAll() {}, // API route doesn't need to set auth cookies here
        },
      }
    );
    const { data: { user } } = await supabase.auth.getUser();

    // ── Find or create the featured project ────────────────
    let project = await getFeaturedProjectByRepo(body.repository_url);

    if (!project) {
      project = await createFeaturedProject({
        repository_url: body.repository_url,
        project_name: body.project_name,
        description: body.description || "",
        framework: body.framework || "unknown",
        recommended_host: body.recommended_host || "unknown",
        analysis_result_id: body.analysis_result_id,
        owner_id: user?.id,
      });
    }

    // ── Create pending payment & bid records ───────────────
    const payment = await createPayment({
      amount_cents: amountCents,
      currency: "USD",
      metadata: {
        featured_project_id: project.id,
        repository_url: body.repository_url,
      },
    });

    const bid = await createBid({
      featured_project_id: project.id,
      amount_cents: amountCents,
      payment_id: payment.id,
    });

    // ── Affiliate Attribution ──────────────────────────────
    let affiliateUserId: string | undefined = undefined;

    // 1. Check for active cookie
    const hwReferralCookie = request.cookies.get("hw_referral")?.value;
    
    if (hwReferralCookie) {
      // Validate not self-referral
      if (!user || user.id !== hwReferralCookie) {
        affiliateUserId = hwReferralCookie;
        
        // If they are logged in, persist the attribution
        if (user) {
          await linkAffiliateReferral(hwReferralCookie, user.id, "cookie");
        }
      }
    } else if (user) {
      // 2. Check for persisted referral if no cookie
      const existingReferral = await getValidReferralForUser(user.id);
      if (existingReferral) {
        affiliateUserId = existingReferral.affiliate_user_id;
      }
    }

    // ── Create Dodo checkout session ───────────────────────
    const origin = request.headers.get("origin") || request.headers.get("host") || "";
    const baseUrl = origin.startsWith("http") ? origin : `https://${origin}`;

    let planProductId: string | undefined = undefined;
    if (body.plan === "boost") planProductId = process.env.DODO_PAYMENTS_BOOST_PRODUCT_ID;
    if (body.plan === "featured") planProductId = process.env.DODO_PAYMENTS_FEATURED_PRODUCT_ID;
    if (body.plan === "spotlight") planProductId = process.env.DODO_PAYMENTS_SPOTLIGHT_PRODUCT_ID;

    if (!planProductId) {
      console.error(`[Checkout] Missing product ID for plan '${body.plan}'`);
      return Response.json(
        { error: `Payment system is missing the product configuration for the ${body.plan} plan.` },
        { status: 500 }
      );
    }
    const checkoutResult = await createCheckoutSession({
      amountCents: amountCents,
      metadata: {
        payment_id: payment.id,
        bid_id: bid.id,
        featured_project_id: project.id,
        repository_url: body.repository_url,
        project_name: body.project_name,
        plan: body.plan,
        affiliate_user_id: affiliateUserId || "",
        referred_user_id: user?.id || "",
      },
      returnUrl: `${baseUrl}/featured/success?payment_id=${payment.id}&project_id=${project.id}`,
    }, planProductId);

    return Response.json({
      checkout_url: checkoutResult.checkout_url,
      payment_id: payment.id,
      bid_id: bid.id,
    });
  } catch (error) {
    console.error("[API] Checkout error:", error);

    const message =
      error instanceof Error ? error.message : "Failed to create checkout.";

    // Don't expose internal error details
    const safeMessage = message.includes("DODO_PAYMENTS")
      ? "Payment system is not configured. Please contact the site administrator."
      : message;

    return Response.json({ error: safeMessage }, { status: 500 });
  }
}
