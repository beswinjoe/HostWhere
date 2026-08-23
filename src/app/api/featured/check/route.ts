import { NextRequest } from "next/server";
import { getFeaturedProjectByRepo } from "@/lib/featured/db";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const resultId = searchParams.get("resultId");
    
    if (!resultId || !resultId.startsWith("github-")) {
      return Response.json({ featured: false });
    }

    // Construct the repo URL from the resultId (format: github-owner-repo-sha)
    const parts = resultId.replace("github-", "").split("-");
    if (parts.length < 2) {
      return Response.json({ featured: false });
    }
    
    const owner = parts[0];
    const repo = parts[1];
    const repositoryUrl = `https://github.com/${owner}/${repo}`;

    const project = await getFeaturedProjectByRepo(repositoryUrl);

    if (project && project.featured_active) {
      return Response.json({
        featured: true,
        project: {
          id: project.id,
          total_bid_cents: project.total_bid_cents,
        }
      });
    }

    return Response.json({ featured: false });
  } catch (err) {
    console.error("[Featured Check] Error:", err);
    return Response.json({ featured: false }, { status: 500 });
  }
}
