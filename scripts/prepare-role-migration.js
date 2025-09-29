#!/usr/bin/env node

/**
 * Role System Migration - Phase 1: Data Analysis and Preparation
 *
 * Since we can't run DDL directly via Supabase client, this script will:
 * 1. Analyze current schema
 * 2. Generate SQL migration statements
 * 3. Update existing data where possible
 * 4. Provide clear next steps for manual schema updates
 */

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

async function analyzeDatabaseAndPrepareMigration() {
  console.log("🔍 ANALYZING DATABASE FOR ROLE SYSTEM MIGRATION\n");

  try {
    // STEP 1: Analyze current profiles structure
    console.log("📋 CURRENT PROFILES TABLE:");
    const { data: profileSample } = await supabase
      .from("profiles")
      .select("*")
      .limit(1)
      .single();

    const currentProfileFields = Object.keys(profileSample || {});
    console.log("Fields:", currentProfileFields.join(", "));

    // STEP 2: Analyze current team_memberships structure
    console.log("\n📋 CURRENT TEAM_MEMBERSHIPS TABLE:");
    const { data: membershipSample } = await supabase
      .from("team_memberships")
      .select("*")
      .limit(1)
      .single();

    const currentMembershipFields = Object.keys(membershipSample || {});
    console.log(
      "Fields:",
      currentMembershipFields.length > 0
        ? currentMembershipFields.join(", ")
        : "No data yet"
    );

    // STEP 3: Generate SQL migration statements
    console.log("\n📝 GENERATED SQL MIGRATION STATEMENTS:");
    console.log("=".repeat(60));

    const profileMigrationSQL = `
-- Add role system fields to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS app_role TEXT DEFAULT 'player' CHECK (app_role IN ('admin', 'head_coach', 'coach', 'free_coach', 'player', 'family')),
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE,

-- Add coaching fields  
ADD COLUMN IF NOT EXISTS years_coaching INTEGER,
ADD COLUMN IF NOT EXISTS coaching_experience TEXT,
ADD COLUMN IF NOT EXISTS education TEXT,
ADD COLUMN IF NOT EXISTS coaching_philosophy TEXT,
ADD COLUMN IF NOT EXISTS certifications TEXT[],
ADD COLUMN IF NOT EXISTS current_school TEXT,

-- Add subscription fields
ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'free',
ADD COLUMN IF NOT EXISTS subscription_expires_at TIMESTAMPTZ;
`;

    const teamMembershipMigrationSQL = `
-- Add team role fields to team_memberships table
ALTER TABLE team_memberships
ADD COLUMN IF NOT EXISTS team_role TEXT DEFAULT 'player' CHECK (team_role IN ('owner', 'head_coach', 'assistant_coach', 'coordinator', 'manager', 'family', 'alumni', 'player')),
ADD COLUMN IF NOT EXISTS invited_by UUID REFERENCES profiles(id);
`;

    console.log("PROFILES TABLE MIGRATION:");
    console.log(profileMigrationSQL);
    console.log("\nTEAM_MEMBERSHIPS TABLE MIGRATION:");
    console.log(teamMembershipMigrationSQL);
    console.log("=".repeat(60));

    // STEP 4: Check what we can migrate with current schema
    console.log("\n🔄 CHECKING WHAT WE CAN MIGRATE NOW:");

    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, email, role");

    console.log(`Found ${profiles?.length || 0} profiles to migrate:`);
    profiles?.forEach((p) => {
      console.log(`  - ${p.email}: role="${p.role}"`);
    });

    // STEP 5: Save migration files
    console.log("\n💾 SAVING MIGRATION FILES...");

    const fs = await import("fs");
    const path = await import("path");

    const migrationDir = path.resolve(process.cwd(), "database/migrations");

    // Ensure migrations directory exists
    if (!fs.existsSync(migrationDir)) {
      fs.mkdirSync(migrationDir, { recursive: true });
    }

    const timestamp = new Date()
      .toISOString()
      .replace(/[:.]/g, "-")
      .slice(0, 19);
    const migrationFile = path.join(
      migrationDir,
      `${timestamp}_role_system_migration.sql`
    );

    const fullMigrationSQL = `-- Role System Migration
-- Generated: ${new Date().toISOString()}
-- Purpose: Add app_role and team_role system to existing tables

${profileMigrationSQL}

${teamMembershipMigrationSQL}

-- Add constraint for app_role check (if it doesn't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.check_constraints 
        WHERE constraint_name = 'profiles_app_role_check'
    ) THEN
        ALTER TABLE profiles ADD CONSTRAINT profiles_app_role_check 
        CHECK (app_role IN ('admin', 'head_coach', 'coach', 'free_coach', 'player', 'family'));
    END IF;
END $$;

-- Add constraint for team_role check (if it doesn't exist)  
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.check_constraints 
        WHERE constraint_name = 'team_memberships_team_role_check'
    ) THEN
        ALTER TABLE team_memberships ADD CONSTRAINT team_memberships_team_role_check 
        CHECK (team_role IN ('owner', 'head_coach', 'assistant_coach', 'coordinator', 'manager', 'family', 'alumni', 'player'));
    END IF;
END $$;
`;

    fs.writeFileSync(migrationFile, fullMigrationSQL);
    console.log(`✅ Migration saved to: ${migrationFile}`);

    // STEP 6: Generate data migration script
    const dataMigrationFile = path.join(
      migrationDir,
      `${timestamp}_migrate_role_data.sql`
    );

    let dataMigrationSQL = `-- Data Migration for Role System
-- Generated: ${new Date().toISOString()}
-- Purpose: Migrate existing role data to new app_role system

`;

    profiles?.forEach((profile) => {
      let app_role = "player";
      let is_admin = false;

      switch (profile.role) {
        case "admin":
          app_role = "admin";
          is_admin = true;
          break;
        case "coach":
          app_role = "free_coach";
          break;
        case "player":
          app_role = "player";
          break;
      }

      dataMigrationSQL += `
-- Migrate ${profile.email}
UPDATE profiles 
SET 
  app_role = '${app_role}',
  is_admin = ${is_admin},
  subscription_tier = '${is_admin ? "premium" : "free"}'
WHERE id = '${profile.id}';
`;
    });

    fs.writeFileSync(dataMigrationFile, dataMigrationSQL);
    console.log(`✅ Data migration saved to: ${dataMigrationFile}`);

    console.log("\n🎯 NEXT STEPS:");
    console.log("1. Run the schema migration in Supabase SQL Editor:");
    console.log(`   ${migrationFile}`);
    console.log("2. Run the data migration in Supabase SQL Editor:");
    console.log(`   ${dataMigrationFile}`);
    console.log("3. Come back and run: node scripts/verify-migration.js");
    console.log("4. Update TypeScript types and components");
  } catch (error) {
    console.error("❌ Analysis failed:", error);
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
    console.log(
      "Please set VITE_SUPABASE_URL and VITE_SUPABASE_SERVICE_ROLE_KEY"
    );
    process.exit(1);
  }

  analyzeDatabaseAndPrepareMigration();
}

export { analyzeDatabaseAndPrepareMigration };
