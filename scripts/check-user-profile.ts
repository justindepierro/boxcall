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

async function checkUserProfile() {
  console.log("🔍 Checking current user and profile...");

  // Get current user
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError) {
    console.log(`❌ Auth error: ${userError.message}`);
    return;
  }

  if (!userData.user) {
    console.log("❌ No authenticated user");
    return;
  }

  console.log(
    `✅ User authenticated: ${userData.user.id} (${userData.user.email})`
  );

  // Try to get profile
  const { data: profileData, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userData.user.id)
    .single();

  if (profileError) {
    console.log(
      `❌ Profile query error: ${profileError.message} (Code: ${profileError.code})`
    );
  } else {
    console.log(`✅ Profile found:`, profileData);
  }
}

checkUserProfile();
