"use client";

import { createClient } from "@supabase/supabase-js";

export function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY");
    throw new Error(
      "Missing Supabase configuration. Please configure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY."
    );
  }

  if (supabaseAnonKey.includes("sb_secret_")) {
    console.error("CRITICAL: Service role key used as anon key in the browser!");
    throw new Error("Invalid API key configuration");
  }

  return createClient(supabaseUrl, supabaseAnonKey);
}
