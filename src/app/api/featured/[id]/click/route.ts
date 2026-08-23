// ─────────────────────────────────────────────────────────────
// POST /api/featured/[id]/click — Record a click
// ─────────────────────────────────────────────────────────────

import { NextRequest } from "next/server";
import {
  getFeaturedProjectById,
  incrementClicks,
  checkRecentClick,
  recordClick,
  createActivityEvent,
} from "@/lib/featured/db";
import { createHash } from "crypto";

export const dynamic = "force-dynamic";

function hashVisitor(ip: string, userAgent: string): string {
  return createHash("sha256")
    .update(`${ip}:${userAgent}`)
    .digest("hex")
    .substring(0, 16);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Validate project exists
    const project = await getFeaturedProjectById(id);
    if (!project) {
      return Response.json(
        { error: "Project not found." },
        { status: 404 }
      );
    }

    // Create visitor hash for rate limiting
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0] ||
      request.headers.get("x-real-ip") ||
      "unknown";
    const userAgent = request.headers.get("user-agent") || "unknown";
    const visitorHash = hashVisitor(ip, userAgent);

    // Check for recent click (1 per minute per visitor per project)
    const recentlyClicked = await checkRecentClick(id, visitorHash);
    if (recentlyClicked) {
      return Response.json({
        success: true,
        message: "Click already recorded.",
        total_clicks: project.total_clicks,
      });
    }

    // Record the click
    await recordClick(id, visitorHash);
    await incrementClicks(id);

    // Create activity event (only for every 5th click to reduce noise)
    const newClickCount = project.total_clicks + 1;
    if (newClickCount % 5 === 0) {
      await createActivityEvent({
        type: "click",
        featured_project_id: id,
        project_name: project.project_name,
        description: `${project.project_name} reached ${newClickCount} clicks`,
        metadata: { total_clicks: newClickCount },
      });
    }

    return Response.json({
      success: true,
      total_clicks: newClickCount,
    });
  } catch (error) {
    console.error("[API] Click tracking error:", error);
    return Response.json(
      { error: "Failed to record click." },
      { status: 500 }
    );
  }
}
