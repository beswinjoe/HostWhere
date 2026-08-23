// ─────────────────────────────────────────────────────────────
// GET /api/featured/activity — Activity feed
// ─────────────────────────────────────────────────────────────

import { NextRequest } from "next/server";
import { getActivityEvents } from "@/lib/featured/db";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const limitParam = url.searchParams.get("limit");
    const limit = Math.min(Math.max(parseInt(limitParam || "20", 10), 1), 50);

    const events = await getActivityEvents(limit);
    return Response.json({ events });
  } catch (error) {
    console.error("[API] Failed to fetch activity:", error);
    return Response.json({ events: [] });
  }
}
