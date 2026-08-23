// ─────────────────────────────────────────────────────────────
// Featured Projects — Type Definitions
// ─────────────────────────────────────────────────────────────

// ── Database Row Types ───────────────────────────────────────

export interface FeaturedProject {
  id: string;
  repository_url: string;
  project_name: string;
  description: string;
  framework: string;
  recommended_host: string;
  total_bid_cents: number; // deprecated
  total_clicks: number;
  first_reached_bid_at: string; // deprecated
  featured_active: boolean;
  analysis_result_id: string | null;
  created_at: string;
  updated_at: string;
  plan?: string;
  price_cents?: number;
  priority?: number;
  featured_at?: string;
  expires_at?: string;
  website_url?: string;
  demo_url?: string;
  project_type?: string;
  use_case_description?: string;
  owner_name?: string;
  company_name?: string;
  short_description?: string;
  category?: string;
  social_links?: Record<string, unknown>; // JSONB
}

export type PlanType = "boost" | "featured" | "spotlight";

export interface PlanConfig {
  id: PlanType;
  name: string;
  priceCents: number;
  durationDays: number;
  priority: number;
  description: string;
}

export const FEATURED_PLANS: Record<PlanType, PlanConfig> = {
  boost: {
    id: "boost",
    name: "Boost",
    priceCents: 200,
    durationDays: 7,
    priority: 1,
    description: "Get your project featured on HostWhere for 7 days.",
  },
  featured: {
    id: "featured",
    name: "Featured",
    priceCents: 500,
    durationDays: 14,
    priority: 2,
    description: "Get higher visibility on HostWhere for 14 days.",
  },
  spotlight: {
    id: "spotlight",
    name: "Spotlight",
    priceCents: 1000,
    durationDays: 30,
    priority: 3,
    description: "Premium visibility and top placement on HostWhere for 30 days.",
  }
};

export interface Bid {
  id: string;
  featured_project_id: string;
  amount_cents: number;
  currency: string;
  payment_id: string | null;
  status: "pending" | "completed" | "failed";
  created_at: string;
}

export interface Payment {
  id: string;
  provider: string;
  provider_payment_id: string | null;
  amount_cents: number;
  currency: string;
  status: "pending" | "succeeded" | "failed";
  webhook_event_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface ActivityEvent {
  id: string;
  type: "featured" | "bid_increased" | "click" | "rank_changed";
  featured_project_id: string;
  project_name: string;
  description: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface ClickRecord {
  id: string;
  featured_project_id: string;
  visitor_hash: string;
  created_at: string;
}

// ── API Request/Response Types ───────────────────────────────

export interface CheckoutRequest {
  repository_url: string;
  project_name: string;
  description: string;
  framework: string;
  recommended_host: string;
  plan: PlanType;
  analysis_result_id?: string;
}

export interface CheckoutResponse {
  checkout_url: string;
  estimated_rank: number;
  payment_id: string;
  bid_id: string;
}

export interface LeaderboardResponse {
  projects: FeaturedProjectWithRank[];
}

export interface FeaturedProjectWithRank extends FeaturedProject {
  rank: number;
}

export interface ActivityResponse {
  events: ActivityEvent[];
}

// ── Helpers ──────────────────────────────────────────────────

/** Format cents as USD string, e.g. 150 → "$1.50" */
export function formatCentsToUSD(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

/** Parse a USD dollar string to integer cents, e.g. "1.50" → 150. Returns null if invalid. */
export function parseDollarsToCents(dollars: string): number | null {
  const cleaned = dollars.replace(/[^0-9.]/g, "");
  const num = parseFloat(cleaned);
  if (isNaN(num) || num < 0) return null;
  // Round to nearest cent to avoid float issues
  return Math.round(num * 100);
}
