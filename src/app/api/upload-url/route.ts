import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase/server";
import { rateLimiter } from "@/lib/rate-limit";

function getIp(request: NextRequest): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0] || 
         request.headers.get("x-real-ip") || 
         "unknown-ip";
}

export async function POST(request: NextRequest) {
  try {
    const { filePath } = await request.json();

    const ip = getIp(request);
    const rateLimit = await rateLimiter.check(ip);
    
    if (!rateLimit.success) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { 
          status: 429,
          headers: {
            "X-RateLimit-Limit": rateLimit.limit.toString(),
            "X-RateLimit-Remaining": rateLimit.remaining.toString(),
            "X-RateLimit-Reset": rateLimit.reset.toString(),
          }
        }
      );
    }

    if (!filePath || typeof filePath !== "string") {
      return NextResponse.json({ error: "filePath is required." }, { status: 400 });
    }

    // Ensure the path is inside the uploads/ directory to prevent bucket abuse
    if (!filePath.startsWith("uploads/")) {
      return NextResponse.json({ error: "Invalid upload path." }, { status: 400 });
    }

    const supabase = getSupabaseAdminClient();
    
    // Diagnostic logging
    console.log("[UPLOAD-URL] Request received");
    console.log(`[UPLOAD-URL] Supabase URL configured: ${!!process.env.NEXT_PUBLIC_SUPABASE_URL}`);
    console.log(`[UPLOAD-URL] Service role configured: ${!!process.env.SUPABASE_SERVICE_ROLE_KEY}`);
    console.log("[UPLOAD-URL] Bucket: hostwhere-uploads");
    console.log(`[UPLOAD-URL] Storage path generated: ${filePath}`);
    console.log("[UPLOAD-URL] Creating signed upload URL");

    const { data, error } = await supabase.storage
      .from("hostwhere-uploads")
      .createSignedUploadUrl(filePath);

    if (error || !data) {
      console.log(`[UPLOAD-URL] Supabase error message: ${error?.message}`);
      return NextResponse.json({ 
        error: "Upload initialization failed",
        details: error?.message || "Unknown Supabase Error"
      }, { status: 500 });
    }

    console.log("[UPLOAD-URL] Supabase response status: Success");

    return NextResponse.json({
      signedUrl: data.signedUrl,
      token: data.token,
      path: data.path,
    });
  } catch (error: unknown) {
    console.error("[Upload URL Error]", error);
    return NextResponse.json(
      { error: "Internal server error generating upload token." },
      { status: 500 }
    );
  }
}
