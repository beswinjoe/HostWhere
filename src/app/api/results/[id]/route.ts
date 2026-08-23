import { NextRequest } from "next/server";
import { resultsStore } from "@/lib/analyzer/results-store";
import { getSupabaseAdminClient } from "@/lib/supabase/server";
import { getSupabaseServerClient } from "@/lib/supabase/auth-server";

export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const result = await resultsStore.getResult(id);

  if (!result) {
    return Response.json(
      { error: "Result not found or expired. Please re-analyze your project." },
      { status: 404 }
    );
  }

  // Public GitHub analyses bypass auth checks
  if (id.startsWith("github-")) {
    return Response.json({ result });
  }

  // Check if this analysis is linked to a specific user
  const supabaseAdmin = getSupabaseAdminClient();
  const { data: userAnalysis } = await supabaseAdmin
    .from("user_analyses")
    .select("user_id")
    .eq("analysis_id", id)
    .single();

  if (userAnalysis) {
    // Requires authorization
    const authSupabase = await getSupabaseServerClient();
    const { data: { user } } = await authSupabase.auth.getUser();

    if (!user || user.id !== userAnalysis.user_id) {
      return Response.json(
        { error: "Forbidden: You do not have permission to view this analysis." },
        { status: 403 }
      );
    }
  }

  // If no userAnalysis record exists, it was an anonymous analysis and is accessible by ID
  return Response.json({ result });
}
