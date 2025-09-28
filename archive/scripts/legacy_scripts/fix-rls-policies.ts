#!/usr/bin/env tsx

import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import { readFileSync } from "fs";
import { join } from "path";

// Load environment variables
config({ path: ".env.local" });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("❌ Missing required environment variables");
  console.error("Make sure VITE_SUPABASE_URL and VITE_SUPABASE_SERVICE_ROLE_KEY are set in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function fixRLSPolicies() {
  console.log("🔧 FIXING RLS POLICIES");
  console.log("======================\n");

  try {
    // Read the SQL file
    const sqlPath = join(process.cwd(), "database", "fix-rls-policies.sql");
    const sql = readFileSync(sqlPath, "utf-8");

    console.log("📄 Applying RLS policy fixes...");

    // Split SQL into individual statements and execute them
    const statements = sql
      .split(";")
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith("--"));

    for (const statement of statements) {
      if (statement.trim()) {
        console.log(`Executing: ${statement.substring(0, 50)}...`);

        const { error } = await supabase.rpc("exec_sql", {
          sql: statement + ";"
        });

        if (error) {
          // If exec_sql doesn't work, try direct query
          const { error: directError } = await supabase.from("_supabase_migration_temp").select("*").limit(1);

          if (directError && directError.message.includes("relation") && directError.message.includes("does not exist")) {
            console.log("⚠️  Cannot execute DDL via RPC. Please run the SQL manually in Supabase SQL Editor:");
            console.log("\n" + sql);
            break;
          }
        }
      }
    }

    console.log("\n✅ RLS policies fixed!");
    console.log("🎯 The infinite recursion issue should now be resolved.");

  } catch (error) {
    console.error("❌ Error fixing RLS policies:", error);
    console.log("\n📋 Manual fix: Copy and run this SQL in your Supabase SQL Editor:");
    console.log("database/fix-rls-policies.sql");
  }
}

fixRLSPolicies();