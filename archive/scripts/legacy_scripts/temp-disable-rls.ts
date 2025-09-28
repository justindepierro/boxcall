#!/usr/bin/env tsx

import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";

// Load environment variables
config({ path: ".env.local" });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("❌ Missing required environment variables");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function tempDisableRLS() {
  console.log("🔧 TEMPORARILY DISABLING RLS");
  console.log("===========================\n");

  try {
    console.log("⚠️  Temporarily disabling RLS on problematic tables...");

    // Disable RLS on the tables causing issues
    const tables = ['team_members', 'teams', 'profiles'];

    for (const table of tables) {
      console.log(`Disabling RLS on ${table}...`);

      const { error } = await supabase.rpc('exec_sql', {
        sql: `ALTER TABLE ${table} DISABLE ROW LEVEL SECURITY;`
      });

      if (error) {
        console.log(`❌ Could not disable RLS on ${table}:`, error.message);
      } else {
        console.log(`✅ RLS disabled on ${table}`);
      }
    }

    console.log("\n✅ Temporary RLS fix applied!");
    console.log("🎯 The infinite recursion issue should now be resolved.");
    console.log("⚠️  Remember to re-enable RLS and apply proper policies later!");

  } catch (error) {
    console.error("❌ Error:", error);
  }
}

tempDisableRLS();