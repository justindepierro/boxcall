#!/usr/bin/env node

/**
 * Verify Migration Results
 *
 * This script checks if the migration was successful and tests the new role system
 */

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

async function verifyMigration() {
  console.log("🔍 VERIFYING ROLE SYSTEM MIGRATION\n");

  try {
    // Check if new columns exist by trying to select them
    console.log("📋 CHECKING NEW COLUMNS...");

    const { data: profile, error } = await supabase
      .from("profiles")
      .select(
        "id, email, role, app_role, is_admin, years_coaching, coaching_experience, subscription_tier"
      )
      .single();

    if (error) {
      console.log("❌ New columns not found:", error.message);
      console.log("\n🎯 ACTION REQUIRED:");
      console.log("1. Go to Supabase Dashboard > SQL Editor");
      console.log("2. Copy and paste the contents of:");
      console.log(
        "   database/migrations/2025-09-29T01-01-28_role_system_migration.sql"
      );
      console.log("3. Run the SQL");
      console.log("4. Come back and run this script again");
      return;
    }

    console.log("✅ New columns detected!");
    console.log("Profile structure:", Object.keys(profile));

    // Check if data was migrated
    console.log("\n📊 CHECKING MIGRATED DATA...");
    console.log(`Email: ${profile.email}`);
    console.log(`Old role: ${profile.role}`);
    console.log(`New app_role: ${profile.app_role || "NOT SET"}`);
    console.log(`Is admin: ${profile.is_admin || "NOT SET"}`);
    console.log(`Subscription: ${profile.subscription_tier || "NOT SET"}`);

    // If data not migrated, do it now
    if (!profile.app_role) {
      console.log("\n🔄 MIGRATING DATA NOW...");

      const { data, error: updateError } = await supabase
        .from("profiles")
        .update({
          app_role: "admin",
          is_admin: true,
          subscription_tier: "premium",
        })
        .eq("id", profile.id)
        .select()
        .single();

      if (updateError) {
        console.log("❌ Data migration failed:", updateError.message);
      } else {
        console.log("✅ Data migrated successfully!");
        console.log("Updated profile:", data);
      }
    }

    // Check team_members table
    console.log("\n📋 CHECKING TEAM_MEMBERS TABLE...");

    const { data: membership, error: membershipError } = await supabase
      .from("team_members")
      .select("*")
      .limit(1);

    if (membershipError) {
      console.log(
        "⚠️  Team memberships check failed:",
        membershipError.message
      );
    } else {
      console.log("✅ Team members table accessible");
      if (membership && membership.length > 0) {
        console.log("Sample membership structure:", Object.keys(membership[0]));
      } else {
        console.log("No team members exist yet (this is normal)");
      }
    }

    console.log("\n🎉 MIGRATION VERIFICATION COMPLETE!");
    console.log("\n📝 NEXT STEPS:");
    console.log("1. Update TypeScript types to include new fields");
    console.log("2. Update components to use app_role instead of role");
    console.log("3. Test the application");
  } catch (error) {
    console.error("❌ Verification failed:", error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  if (
    !process.env.VITE_SUPABASE_URL ||
    !process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
  ) {
    console.error("❌ Missing required environment variables");
    process.exit(1);
  }

  verifyMigration();
}

export { verifyMigration };
