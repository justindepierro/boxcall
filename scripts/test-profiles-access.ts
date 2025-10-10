#!/usr/bin/env tsx

import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";

// Load environment variables
config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const anonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !anonKey) {
  console.error("❌ Missing environment variables");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, anonKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function testProfilesAccess() {
  console.log("🔍 Testing profiles table access...");

  try {
    // Try to select from profiles
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .limit(1);

    if (error) {
      console.log(
        `❌ Profiles access error: ${error.message} (Code: ${error.code})`
      );
      console.log("This suggests RLS policies are blocking access");
    } else {
      console.log(
        `✅ Profiles access successful: ${data?.length || 0} records`
      );
    }
  } catch (err: any) {
    console.log(`❌ Unexpected error: ${err.message}`);
  }
}

testProfilesAccess();
