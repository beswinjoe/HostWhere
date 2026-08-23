import { getSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = getSupabaseServerClient();
    
    const { data, error } = await supabase
      .from("user_analyses")
      .select("*, profiles(username)")
      .eq("is_public", true)
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
