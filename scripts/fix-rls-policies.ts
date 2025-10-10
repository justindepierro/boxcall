#!/usr/bin/env tsx

import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";

// Load environment variables
config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("❌ Missing environment variables");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function applyProperRLSPolicies() {
  console.log("🔧 Applying proper RLS policies...");

  // Drop existing policies
  const dropPolicies = [
    `DROP POLICY IF EXISTS "Users can view profiles of team members" ON profiles;`,
    `DROP POLICY IF EXISTS "Users can update their own profiles" ON profiles;`,
    `DROP POLICY IF EXISTS "Users can insert their own profiles" ON profiles;`,
  ];

  // Create proper policies
  const createPolicies = [
    `CREATE POLICY "Users can view profiles of team members" ON profiles
      FOR SELECT USING (
        id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM team_members tm
          WHERE tm.user_id = profiles.id
          AND EXISTS (
            SELECT 1 FROM team_members tm2
            WHERE tm2.team_id = tm.team_id
            AND tm2.user_id = auth.uid()
            AND tm2.status = 'active'
          )
        )
      );`,
    `CREATE POLICY "Users can update their own profiles" ON profiles
      FOR UPDATE USING (id = auth.uid());`,
    `CREATE POLICY "Users can insert their own profiles" ON profiles
      FOR INSERT WITH CHECK (id = auth.uid());`,
  ];

  try {
    // Execute policy changes
    for (const sql of [...dropPolicies, ...createPolicies]) {
      const { error } = await supabase.rpc("exec_sql", { sql });
      if (error) {
        console.log(`❌ Error executing: ${sql.substring(0, 50)}...`);
        console.log(`   ${error.message}`);
      } else {
        console.log(`✅ Executed: ${sql.substring(0, 50)}...`);
      }
    }

    console.log("🔧 RLS policies updated");
  } catch (error: any) {
    console.log(`❌ Unexpected error: ${error.message}`);
  }
}

applyProperRLSPolicies();
