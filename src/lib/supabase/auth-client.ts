"use client";

import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY");
    throw new Error("Missing Supabase configuration");
  }

  // Robust runtime validation for the API Key
  if (supabaseAnonKey.includes("sb_secret_")) {
    console.error("CRITICAL: Service role key used as anon key in the browser!");
    throw new Error("Invalid API key configuration");
  }
  
  // Basic sanity check that it's a JWT or similar expected format
  if (supabaseAnonKey.length < 20 || supabaseAnonKey.includes(" ")) {
    console.error("CRITICAL: NEXT_PUBLIC_SUPABASE_ANON_KEY appears malformed. Did you copy the correct key?");
    throw new Error("Invalid API key configuration");
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
