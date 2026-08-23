import { createClient } from "@/lib/supabase/auth-server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = await createClient();
    
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return Response.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { data, error } = await supabase
      .from("user_analyses")
      .select("id, repository_url, project_name, description, framework, recommended_host, status, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(6);

    if (error) {
      console.error("[Recent Analyses] Database error:", error);
      return Response.json(
        { error: "Failed to fetch recent analyses." },
        { status: 500 }
      );
    }

    return Response.json({ projects: data });
  } catch (err) {
    console.error("[Recent Analyses] Unhandled error:", err);
    return Response.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
