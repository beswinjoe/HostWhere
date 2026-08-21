import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function checkId() {
  const targetId = "github-beswinjoe-chillofi-6064322";
  
  console.log(`Checking database for ID: ${targetId}`);
  
  const { data, error } = await supabase
    .from("analysis_results")
    .select("id, expires_at")
    .eq("id", targetId)
    .single();

  if (error) {
    console.error("Error fetching:", error.message);
    
    // Also let's check how many rows are in the table total
    const { count, error: countError } = await supabase
      .from("analysis_results")
      .select("*", { count: 'exact', head: true });
      
    console.log(`Total rows in analysis_results table: ${count}`);
    return;
  }
  
  console.log("Found record!", data);
}

checkId().catch(console.error);
