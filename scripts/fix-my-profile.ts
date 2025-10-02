#!/usr/bin/env tsx
/**
 * Quick Profile Fix Script
 * Creates a profile for the currently logged-in user
 */

import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("❌ Missing environment variables");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function fixProfile() {
  console.log("🔧 Profile Fix Script\n");

  // Get current session
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError || !session) {
    console.error("❌ Not logged in. Please sign in first.");
    console.log(
      "\n💡 Sign in at: http://localhost:5174 (or your dev server URL)"
    );
    process.exit(1);
  }

  const userId = session.user.id;
  const userEmail = session.user.email;

  console.log(`👤 Current User:`);
  console.log(`   ID: ${userId}`);
  console.log(`   Email: ${userEmail}\n`);

  // Check if profile exists
  const { data: existingProfile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (existingProfile) {
    console.log("✅ Profile already exists!");
    console.log("   Full Name:", existingProfile.full_name || "(not set)");
    console.log("   Role:", existingProfile.role || "(not set)");
    console.log("\n💡 Update your profile at: http://localhost:5174/profile");
    return;
  }

  // Create profile
  console.log("📝 Creating profile...");

  const { data: newProfile, error: profileError } = await supabase
    .from("profiles")
    .insert({
      id: userId,
      email: userEmail,
      full_name: "Coach", // Default name
      role: "coach", // Default role
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (profileError) {
    console.error("❌ Error creating profile:", profileError);
    console.log(
      "\n💡 This might be a permissions issue. Check your RLS policies."
    );
    process.exit(1);
  }

  console.log("✅ Profile created successfully!");
  console.log("   Full Name:", newProfile.full_name);
  console.log("   Role:", newProfile.role);
  console.log("\n💡 Refresh your browser to see changes");
  console.log("   Update your profile at: http://localhost:5174/profile");
}

fixProfile().catch((error) => {
  console.error("❌ Script error:", error);
  process.exit(1);
});
