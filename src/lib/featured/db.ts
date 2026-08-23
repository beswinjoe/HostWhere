// ─────────────────────────────────────────────────────────────
// Featured Projects — Database Operations
// ─────────────────────────────────────────────────────────────

import { getSupabaseServerClient } from "@/lib/supabase/server";
import type {
  FeaturedProject,
  FeaturedProjectWithRank,
  Bid,
  Payment,
  ActivityEvent,
} from "./types";

// ── Featured Projects ────────────────────────────────────────

export async function getFeaturedProjects(): Promise<FeaturedProjectWithRank[]> {
  const supabase = getSupabaseServerClient();

  const { data, error } = await supabase
    .from("featured_projects")
    .select("*")
    .eq("featured_active", true)
    .gt("expires_at", new Date().toISOString()) // filter out expired
    .order("priority", { ascending: false })
    .order("featured_at", { ascending: false });

  if (error) {
    console.error("[Featured DB] Failed to fetch projects:", error);
    throw new Error("Failed to fetch featured projects.");
  }

  // Add rank numbers
  return (data || []).map((project: FeaturedProject, index: number) => ({
    ...project,
    rank: index + 1,
  }));
}

export async function getFeaturedProjectByRepo(
  repositoryUrl: string
): Promise<FeaturedProject | null> {
  const supabase = getSupabaseServerClient();

  const { data, error } = await supabase
    .from("featured_projects")
    .select("*")
    .eq("repository_url", repositoryUrl)
    .single();

  if (error && error.code !== "PGRST116") {
    // PGRST116 = no rows returned
    console.error("[Featured DB] Failed to find project:", error);
    throw new Error("Failed to look up project.");
  }

  return data || null;
}

export async function getFeaturedProjectById(
  id: string
): Promise<FeaturedProject | null> {
  const supabase = getSupabaseServerClient();

  const { data, error } = await supabase
    .from("featured_projects")
    .select("*")
    .eq("id", id)
    .single();

  if (error && error.code !== "PGRST116") {
    console.error("[Featured DB] Failed to find project by ID:", error);
    throw new Error("Failed to look up project.");
  }

  return data || null;
}

export async function createFeaturedProject(project: {
  repository_url: string;
  project_name: string;
  description: string;
  framework: string;
  recommended_host: string;
  analysis_result_id?: string;
  owner_id?: string;
}): Promise<FeaturedProject> {
  const supabase = getSupabaseServerClient();

  const { data, error } = await supabase
    .from("featured_projects")
    .insert({
      repository_url: project.repository_url,
      project_name: project.project_name,
      description: project.description || "",
      framework: project.framework || "unknown",
      recommended_host: project.recommended_host || "unknown",
      analysis_result_id: project.analysis_result_id || null,
      owner_id: project.owner_id || null,
      total_bid_cents: 0,
      total_clicks: 0,
      featured_active: false, // Will be activated after successful payment
    })
    .select()
    .single();

  if (error) {
    console.error("[Featured DB] Failed to create project:", error);
    throw new Error("Failed to create featured project.");
  }

  return data;
}

export async function activateProjectPlan(
  id: string,
  plan: string,
  priceCents: number,
  priority: number,
  durationDays: number
): Promise<FeaturedProject> {
  const supabase = getSupabaseServerClient();
  const current = await getFeaturedProjectById(id);
  if (!current) throw new Error("Project not found.");

  const now = new Date();
  
  // Parse existing expires_at or default to now if expired/missing
  const currentExpiresAt = current.expires_at ? new Date(current.expires_at) : now;
  const isCurrentlyActive = current.featured_active && currentExpiresAt > now;

  let newFeaturedAt = current.featured_at ? new Date(current.featured_at) : now;
  let newExpiresAt = now;

  const currentPriority = current.priority || 0;

  if (isCurrentlyActive) {
    if (priority > currentPriority) {
      // Upgrade: Take effect immediately, new featured_at so it sorts at the top of the new priority tier
      newFeaturedAt = now;
      newExpiresAt = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000);
    } else {
      // Extend same tier (or technically lower, but that's prevented in UI)
      // Keep existing featured_at to maintain rank, just extend the expiration
      newFeaturedAt = new Date(current.featured_at!); // Keep existing
      newExpiresAt = new Date(currentExpiresAt.getTime() + durationDays * 24 * 60 * 60 * 1000);
    }
  } else {
    // Brand new or expired reactivation
    newFeaturedAt = now;
    newExpiresAt = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000);
  }

  const { data, error } = await supabase
    .from("featured_projects")
    .update({
      plan,
      price_cents: priceCents,
      priority,
      featured_at: newFeaturedAt.toISOString(),
      expires_at: newExpiresAt.toISOString(),
      featured_active: true,
      updated_at: now.toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("[Featured DB] Failed to activate plan:", error);
    throw new Error("Failed to activate project plan.");
  }

  return data;
}

export async function incrementClicks(id: string): Promise<void> {
  const supabase = getSupabaseServerClient();

  // Use RPC or manual increment
  const { error } = await supabase.rpc("increment_clicks", {
    project_id: id,
  });

  // Fallback: if RPC doesn't exist, use manual update
  if (error) {
    const project = await getFeaturedProjectById(id);
    if (!project) return;

    await supabase
      .from("featured_projects")
      .update({
        total_clicks: project.total_clicks + 1,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);
  }
}

// ── Activity Events ──────────────────────────────────────────

export async function getActivityEvents(
  limit: number = 20
): Promise<ActivityEvent[]> {
  const supabase = getSupabaseServerClient();

  const { data, error } = await supabase
    .from("activity_events")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("[Featured DB] Failed to fetch activity:", error);
    return [];
  }

  return data || [];
}

export async function createActivityEvent(event: {
  type: string;
  featured_project_id: string;
  project_name: string;
  description: string;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  const supabase = getSupabaseServerClient();

  const { error } = await supabase.from("activity_events").insert({
    type: event.type,
    featured_project_id: event.featured_project_id,
    project_name: event.project_name,
    description: event.description,
    metadata: event.metadata || {},
  });

  if (error) {
    console.error("[Featured DB] Failed to create activity event:", error);
    // Don't throw — activity logging is non-critical
  }
}

// ── Payments ─────────────────────────────────────────────────

export async function createPayment(payment: {
  amount_cents: number;
  currency?: string;
  metadata?: Record<string, unknown>;
}): Promise<Payment> {
  const supabase = getSupabaseServerClient();

  const { data, error } = await supabase
    .from("payments")
    .insert({
      provider: "dodo",
      amount_cents: payment.amount_cents,
      currency: payment.currency || "USD",
      status: "pending",
      metadata: payment.metadata || {},
    })
    .select()
    .single();

  if (error) {
    console.error("[Featured DB] Failed to create payment:", error);
    throw new Error("Failed to create payment record.");
  }

  return data;
}

export async function updatePaymentStatus(
  id: string,
  status: "succeeded" | "failed",
  webhookEventId: string,
  providerPaymentId?: string
): Promise<Payment> {
  const supabase = getSupabaseServerClient();

  const updateData: Record<string, unknown> = {
    status,
    webhook_event_id: webhookEventId,
    updated_at: new Date().toISOString(),
  };

  if (providerPaymentId) {
    updateData.provider_payment_id = providerPaymentId;
  }

  const { data, error } = await supabase
    .from("payments")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("[Featured DB] Failed to update payment:", error);
    throw new Error("Failed to update payment status.");
  }

  return data;
}

export async function getPaymentByWebhookEventId(
  eventId: string
): Promise<Payment | null> {
  const supabase = getSupabaseServerClient();

  const { data, error } = await supabase
    .from("payments")
    .select("*")
    .eq("webhook_event_id", eventId)
    .single();

  if (error && error.code !== "PGRST116") {
    console.error("[Featured DB] Failed to find payment by webhook:", error);
  }

  return data || null;
}

export async function getPaymentById(id: string): Promise<Payment | null> {
  const supabase = getSupabaseServerClient();

  const { data, error } = await supabase
    .from("payments")
    .select("*")
    .eq("id", id)
    .single();

  if (error && error.code !== "PGRST116") {
    console.error("[Featured DB] Failed to find payment:", error);
  }

  return data || null;
}

// ── Bids ─────────────────────────────────────────────────────

export async function createBid(bid: {
  featured_project_id: string;
  amount_cents: number;
  payment_id: string;
  currency?: string;
}): Promise<Bid> {
  const supabase = getSupabaseServerClient();

  const { data, error } = await supabase
    .from("bids")
    .insert({
      featured_project_id: bid.featured_project_id,
      amount_cents: bid.amount_cents,
      currency: bid.currency || "USD",
      payment_id: bid.payment_id,
      status: "pending",
    })
    .select()
    .single();

  if (error) {
    console.error("[Featured DB] Failed to create bid:", error);
    throw new Error("Failed to create bid record.");
  }

  return data;
}

export async function updateBidStatus(
  id: string,
  status: "completed" | "failed"
): Promise<void> {
  const supabase = getSupabaseServerClient();

  const { error } = await supabase
    .from("bids")
    .update({ status })
    .eq("id", id);

  if (error) {
    console.error("[Featured DB] Failed to update bid status:", error);
  }
}

export async function getBidByPaymentId(
  paymentId: string
): Promise<Bid | null> {
  const supabase = getSupabaseServerClient();

  const { data, error } = await supabase
    .from("bids")
    .select("*")
    .eq("payment_id", paymentId)
    .single();

  if (error && error.code !== "PGRST116") {
    console.error("[Featured DB] Failed to find bid by payment:", error);
  }

  return data || null;
}

// ── Click Tracking ───────────────────────────────────────────

export async function checkRecentClick(
  projectId: string,
  visitorHash: string
): Promise<boolean> {
  const supabase = getSupabaseServerClient();
  const oneMinuteAgo = new Date(Date.now() - 60_000).toISOString();

  const { data, error } = await supabase
    .from("click_tracking")
    .select("id")
    .eq("featured_project_id", projectId)
    .eq("visitor_hash", visitorHash)
    .gte("created_at", oneMinuteAgo)
    .limit(1);

  if (error) {
    console.error("[Featured DB] Failed to check click:", error);
    return false; // Allow the click on error
  }

  return (data?.length || 0) > 0;
}

export async function recordClick(
  projectId: string,
  visitorHash: string
): Promise<void> {
  const supabase = getSupabaseServerClient();

  const { error } = await supabase.from("click_tracking").insert({
    featured_project_id: projectId,
    visitor_hash: visitorHash,
  });

  if (error) {
    console.error("[Featured DB] Failed to record click:", error);
  }
}

// ── Rank Calculation ─────────────────────────────────────────

// Removed calculateEstimatedRank as we use fixed plans now.
