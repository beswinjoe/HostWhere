import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase/server";
import { getSupabaseServerClient } from "@/lib/supabase/auth-server";

const supabaseAdmin = getSupabaseAdminClient();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { data: project, error } = await supabaseAdmin
      .from("featured_projects")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !project) {
      console.error("[API] GET /api/featured/[id] not found:", error?.message);
      return NextResponse.json({ error: "Project not found", code: "NOT_FOUND" }, { status: 404 });
    }

    return NextResponse.json({ project });
  } catch (err) {
    console.error("[API] GET /api/featured/[id] error:", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "Internal Server Error", code: "INTERNAL_ERROR" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const supabase = await getSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized. Please log in.", code: "UNAUTHORIZED" }, { status: 401 });
    }

    const { data: project, error: fetchError } = await supabaseAdmin
      .from("featured_projects")
      .select("owner_id, plan")
      .eq("id", id)
      .single();

    if (fetchError || !project) {
      return NextResponse.json({ error: "Project not found.", code: "NOT_FOUND" }, { status: 404 });
    }

    if (project.owner_id !== user.id) {
      return NextResponse.json({ error: "Forbidden: You do not own this project.", code: "NOT_OWNER" }, { status: 403 });
    }

    if (project.plan === "boost") {
      return NextResponse.json({ error: "Boost plan does not include profile editing. Upgrade to Featured or Spotlight.", code: "PLAN_INELIGIBLE" }, { status: 403 });
    }

    const body = await request.json();
    const { 
      website_url, 
      demo_url, 
      project_type, 
      use_case_description,
      owner_name,
      company_name,
      short_description,
      category,
      social_links
    } = body;

    // Server-side length validation
    if (short_description && short_description.length > 200) {
      return NextResponse.json({ error: "Short description too long (max 200 chars).", code: "VALIDATION_ERROR" }, { status: 400 });
    }
    if (use_case_description && use_case_description.length > 1000) {
      return NextResponse.json({ error: "Use case description too long (max 1000 chars).", code: "VALIDATION_ERROR" }, { status: 400 });
    }

    const { error: updateError } = await supabaseAdmin
      .from("featured_projects")
      .update({
        website_url: website_url || null,
        demo_url: demo_url || null,
        project_type: project_type || null,
        use_case_description: use_case_description || null,
        owner_name: owner_name || null,
        company_name: company_name || null,
        short_description: short_description || null,
        category: category || null,
        social_links: social_links || null,
        updated_at: new Date().toISOString()
      })
      .eq("id", id);

    if (updateError) {
      console.error("[API] PATCH /api/featured/[id] update error:", {
        message: updateError.message,
        code: updateError.code,
      });
      return NextResponse.json({ error: "Failed to update project.", code: "DB_ERROR" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[API] PATCH /api/featured/[id] error:", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "Internal Server Error", code: "INTERNAL_ERROR" }, { status: 500 });
  }
}
