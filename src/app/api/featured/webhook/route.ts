// ─────────────────────────────────────────────────────────────
// POST /api/featured/webhook — Dodo Payments webhook handler
// ─────────────────────────────────────────────────────────────

import { NextRequest } from "next/server";
import { verifyAndParseWebhook } from "@/lib/featured/dodo";
import {
  getPaymentByWebhookEventId,
  getPaymentById,
  updatePaymentStatus,
  getBidByPaymentId,
  updateBidStatus,
  activateProjectPlan,
  getFeaturedProjectById,
  createActivityEvent,
} from "@/lib/featured/db";
import { FEATURED_PLANS, type PlanType } from "@/lib/featured/types";
import { createAffiliateCommission, updateCommissionStatus } from "@/lib/affiliate/db";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    // Read raw body for signature verification
    const rawBody = await request.text();

    // Extract webhook headers
    const webhookId = request.headers.get("webhook-id");
    const webhookSignature = request.headers.get("webhook-signature");
    const webhookTimestamp = request.headers.get("webhook-timestamp");

    if (!webhookId || !webhookSignature || !webhookTimestamp) {
      console.error("[Webhook] Missing required webhook headers");
      return Response.json(
        { error: "Missing webhook headers." },
        { status: 400 }
      );
    }

    // ── Idempotency Check ──────────────────────────────────
    // If we've already processed this webhook event, return 200 immediately
    const existingPayment = await getPaymentByWebhookEventId(webhookId);
    if (existingPayment) {
      console.log(`[Webhook] Duplicate event ${webhookId}, skipping.`);
      return Response.json({ received: true });
    }

    // ── Verify Signature & Parse ───────────────────────────
    let event;
    try {
      event = verifyAndParseWebhook(rawBody, {
        "webhook-id": webhookId,
        "webhook-signature": webhookSignature,
        "webhook-timestamp": webhookTimestamp,
      });
    } catch (err) {
      console.error("[Webhook] Signature verification failed:", err);
      return Response.json(
        { error: "Invalid webhook signature." },
        { status: 401 }
      );
    }

    console.log(`[Webhook] Received event: ${event.type}`);

    // ── Handle payment.succeeded ──────────────────────────
    if (event.type === "payment.succeeded") {
      const paymentId = event.data?.metadata?.payment_id;
      const bidId = event.data?.metadata?.bid_id;
      const featuredProjectId = event.data?.metadata?.featured_project_id;
      const providerPaymentId = event.data?.payment_id;

      if (!paymentId) {
        console.error("[Webhook] Missing payment_id in metadata");
        return Response.json({ received: true }); // Acknowledge but can't process
      }

      // Verify our payment record exists
      const payment = await getPaymentById(paymentId);
      if (!payment) {
        console.error(`[Webhook] Payment ${paymentId} not found in DB`);
        return Response.json({ received: true });
      }

      // Already succeeded — idempotent
      if (payment.status === "succeeded") {
        console.log(`[Webhook] Payment ${paymentId} already succeeded, skipping.`);
        return Response.json({ received: true });
      }

      // Update payment status
      await updatePaymentStatus(
        paymentId,
        "succeeded",
        webhookId,
        providerPaymentId || undefined
      );

      // Update bid status
      if (bidId) {
        await updateBidStatus(bidId, "completed");
      } else {
        // Try to find bid by payment ID
        const bid = await getBidByPaymentId(paymentId);
        if (bid) {
          await updateBidStatus(bid.id, "completed");
        }
      }

      // Update project plan
      if (featuredProjectId) {
        const planStr = event.data?.metadata?.plan as PlanType;
        const planConfig = FEATURED_PLANS[planStr] || FEATURED_PLANS.boost;

        // Get the project's state before update
        const projectBefore = await getFeaturedProjectById(featuredProjectId);
        if (projectBefore) {
          const isNewProject = !projectBefore.featured_active || (projectBefore.expires_at && new Date(projectBefore.expires_at) < new Date());
          const isUpgrade = projectBefore.featured_active && (projectBefore.priority || 0) < planConfig.priority;

          await activateProjectPlan(
            featuredProjectId,
            planConfig.id,
            planConfig.priceCents,
            planConfig.priority,
            planConfig.durationDays
          );

          // Create activity event
          if (isNewProject) {
            await createActivityEvent({
              type: "featured",
              featured_project_id: projectBefore.id,
              project_name: projectBefore.project_name,
              description: `${projectBefore.project_name} activated ${planConfig.name} for ${planConfig.durationDays} days`,
              metadata: { plan: planConfig.id },
            });
          } else if (isUpgrade) {
            await createActivityEvent({
              type: "bid_increased",
              featured_project_id: projectBefore.id,
              project_name: projectBefore.project_name,
              description: `${projectBefore.project_name} upgraded to ${planConfig.name}`,
              metadata: { plan: planConfig.id },
            });
          } else {
            await createActivityEvent({
              type: "bid_increased",
              featured_project_id: projectBefore.id,
              project_name: projectBefore.project_name,
              description: `${projectBefore.project_name} extended its ${planConfig.name} plan`,
              metadata: { plan: planConfig.id },
            });
          }
        }
      }

      // ── Affiliate Commission ──────────────────────────────
      const affiliateUserId = event.data?.metadata?.affiliate_user_id;
      if (affiliateUserId && affiliateUserId !== "") {
        const planStr = event.data?.metadata?.plan as PlanType;
        const planConfig = FEATURED_PLANS[planStr] || FEATURED_PLANS.boost;
        
        const commissionRate = 40; // 40%
        const commissionAmountCents = Math.floor(payment.amount_cents * (commissionRate / 100));

        await createAffiliateCommission(
          affiliateUserId,
          null, // we don't have referred_user_id cleanly here, could optionally pass it in metadata if logged in
          paymentId,
          planConfig.id,
          payment.amount_cents,
          commissionRate,
          commissionAmountCents
        );
      }

      console.log(`[Webhook] Successfully processed payment ${paymentId}`);
    }

    // ── Handle payment.failed ────────────────────────────
    if (event.type === "payment.failed" || event.type === "payment.cancelled") {
      const paymentId = event.data?.metadata?.payment_id;

      if (paymentId) {
        const payment = await getPaymentById(paymentId);
        if (payment && payment.status === "pending") {
          await updatePaymentStatus(paymentId, "failed", webhookId);

          const bid = await getBidByPaymentId(paymentId);
          if (bid) {
            await updateBidStatus(bid.id, "failed");
          }

          // Reverse any commission
          await updateCommissionStatus(paymentId, event.type === "payment.cancelled" ? "cancelled" : "reversed");
        }
      }
    }

    // Always return 200 to acknowledge receipt
    return Response.json({ received: true });
  } catch (error) {
    console.error("[Webhook] Unhandled error:", error);
    // Return 200 even on errors to prevent webhook retries for non-recoverable issues
    // Log the error for investigation
    return Response.json({ received: true });
  }
}
