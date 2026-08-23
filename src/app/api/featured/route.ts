// ─────────────────────────────────────────────────────────────
// GET /api/featured — Public leaderboard data
// ─────────────────────────────────────────────────────────────

import { getFeaturedProjects } from "@/lib/featured/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const projects = await getFeaturedProjects();
    return Response.json({ projects });
  } catch (error) {
    console.error("[API] Failed to fetch featured projects:", error);
    return Response.json(
      { error: "Failed to load featured projects." },
      { status: 500 }
    );
  }
}
