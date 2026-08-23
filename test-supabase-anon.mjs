import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function checkId() {
  console.log("Checking anon key...");
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email: "test@example.com",
    password: "password123"
  });

  if (error) {
    console.error("Auth error:", error.message);
  } else {
    console.log("Success:", data);
  }
}

checkId().catch(console.error);
