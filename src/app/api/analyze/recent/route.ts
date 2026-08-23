import { getSupabaseServerClient } from "@/lib/supabase/auth-server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = await getSupabaseServerClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError) {
      console.error("[Recent Analyses] Auth error:", authError.message);
      return Response.json(
        { error: "Authentication failed.", code: "AUTH_ERROR" },
        { status: 401 }
      );
    }

    if (!user) {
      return Response.json(
        { error: "Unauthorized", code: "NOT_AUTHENTICATED" },
        { status: 401 }
      );
    }

    // Query only columns that actually exist on the user_analyses table
    const { data, error } = await supabase
      .from("user_analyses")
      .select("id, analysis_id, project_name, source_type, github_url, framework, compatibility_summary, is_public, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(6);

    if (error) {
      console.error("[Recent Analyses] Database error:", {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      });
      return Response.json(
        { error: "Failed to fetch recent analyses.", code: "DB_ERROR" },
        { status: 500 }
      );
    }

    return Response.json({ projects: data || [] });
  } catch (err) {
    console.error("[Recent Analyses] Unhandled error:", err instanceof Error ? err.message : err);
    return Response.json(
      { error: "Internal server error.", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}
