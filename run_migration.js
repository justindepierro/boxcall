#!/usr/bin/env node
/**
 * Execute SQL migration using Supabase client
 * This uses your existing Supabase setup
 */

import { readFileSync } from "fs";
import { createClient } from "@supabase/supabase-js";

const PROJECT_URL = "https://lvmuiqwihlpnwppdqqfl.supabase.co";
const SERVICE_ROLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx2bXVpcXdpaGxwbndwcGRxcWZsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjAyMjM0OCwiZXhwIjoyMDY3NTk4MzQ4fQ.cCLvqoIWqHHMN_PQoSoST5Jh1PtECbFirGpr-L46Oic";

const supabase = createClient(PROJECT_URL, SERVICE_ROLE_KEY);

async function runMigration() {
  console.log("🚀 Running activities table migration...\n");

  try {
    // Part 1: Create indexes
    console.log("📝 Creating indexes...");
    const { error: indexError } = await supabase.rpc("exec_sql", {
      sql: `
        CREATE INDEX IF NOT EXISTS idx_activities_user_id ON public.activities(user_id);
        CREATE INDEX IF NOT EXISTS idx_activities_team_id ON public.activities(team_id);
        CREATE INDEX IF NOT EXISTS idx_activities_play_id ON public.activities(play_id);
        CREATE INDEX IF NOT EXISTS idx_activities_created_at ON public.activities(created_at DESC);
        CREATE INDEX IF NOT EXISTS idx_activities_user_team ON public.activities(user_id, team_id);
      `,
    });
    if (indexError) throw indexError;
    console.log("✅ Indexes created\n");

    // Part 2: Enable RLS
    console.log("🔒 Enabling Row Level Security...");
    const { error: rlsError } = await supabase.rpc("exec_sql", {
      sql: "ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;",
    });
    if (rlsError) throw rlsError;
    console.log("✅ RLS enabled\n");

    // Part 3: Drop old policies
    console.log("🗑️  Dropping old policies...");
    const { error: dropError } = await supabase.rpc("exec_sql", {
      sql: `
        DROP POLICY IF EXISTS "activities_insert_policy" ON public.activities;
        DROP POLICY IF EXISTS "activities_select_own" ON public.activities;
        DROP POLICY IF EXISTS "activities_select_team" ON public.activities;
        DROP POLICY IF EXISTS "activities_delete_own" ON public.activities;
      `,
    });
    if (dropError) throw dropError;
    console.log("✅ Old policies dropped\n");

    // Part 4: Create new policies
    console.log("📋 Creating RLS policies...");
    const { error: policyError } = await supabase.rpc("exec_sql", {
      sql: `
        CREATE POLICY "activities_insert_policy" ON public.activities FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
        CREATE POLICY "activities_select_own" ON public.activities FOR SELECT TO authenticated USING (auth.uid() = user_id);
        CREATE POLICY "activities_select_team" ON public.activities FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.team_memberships WHERE team_memberships.team_id = activities.team_id AND team_memberships.user_id = auth.uid()));
        CREATE POLICY "activities_delete_own" ON public.activities FOR DELETE TO authenticated USING (auth.uid() = user_id);
      `,
    });
    if (policyError) throw policyError;
    console.log("✅ Policies created\n");

    // Part 5: Grant permissions
    console.log("🔑 Granting permissions...");
    const { error: grantError } = await supabase.rpc("exec_sql", {
      sql: "GRANT SELECT, INSERT, DELETE ON public.activities TO authenticated;",
    });
    if (grantError) throw grantError;
    console.log("✅ Permissions granted\n");

    console.log("🎉 Migration completed successfully!");
    console.log("\nThe activities table is now fully configured with:");
    console.log("  ✅ 5 performance indexes");
    console.log("  ✅ Row Level Security enabled");
    console.log("  ✅ 4 security policies");
    console.log("  ✅ Proper permissions");
    console.log("\nYour ActivityService is ready to use!");
  } catch (error) {
    console.error("❌ Migration failed:", error.message);
    console.error("\nFull error:", error);
    process.exit(1);
  }
}

runMigration();
