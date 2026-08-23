import { NextRequest, NextResponse } from "next/server";
import { getProfileByUsername, recordAffiliateClick } from "@/lib/affiliate/db";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  const { username } = await params;
  
  if (!username) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Look up the affiliate by username
  const profile = await getProfileByUsername(username);

  if (!profile) {
    // Affiliate not found, redirect to home without setting cookie
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Record a click
  await recordAffiliateClick(profile.id, username);

  // Set referral cookie
  const response = NextResponse.redirect(new URL("/", request.url));
  
  // Expiration: 30 days
  const expires = new Date();
  expires.setDate(expires.getDate() + 30);
  
  response.cookies.set({
    name: "hw_referral",
    value: profile.id, // Store their user UUID
    expires: expires,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });

  return response;
}
