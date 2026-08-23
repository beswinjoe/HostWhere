import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { createPayoutRequest } from "@/lib/affiliate/db";
import { getAffiliateDashboardData } from "@/lib/affiliate/queries";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll(); },
          setAll() {},
        },
      }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { amountCents, payoutMethod, payoutDetails } = body;

    if (!amountCents || !payoutMethod || !payoutDetails) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (amountCents < 5000) {
      return NextResponse.json({ error: "Minimum payout is $50.00" }, { status: 400 });
    }

    // Verify user actually has enough available balance
    const dashboardData = await getAffiliateDashboardData();
    if (!dashboardData) {
      return NextResponse.json({ error: "Could not retrieve balance" }, { status: 500 });
    }

    if (dashboardData.stats.availableCents < amountCents) {
      return NextResponse.json({ error: "Insufficient available balance" }, { status: 400 });
    }

    const payoutRequest = await createPayoutRequest(
      user.id,
      amountCents,
      payoutMethod,
      payoutDetails
    );

    if (!payoutRequest) {
      return NextResponse.json({ error: "Failed to create payout request" }, { status: 500 });
    }

    return NextResponse.json({ success: true, payoutRequest });
  } catch (error) {
    console.error("[Payout API] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
