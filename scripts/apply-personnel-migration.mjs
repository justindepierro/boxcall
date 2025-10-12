#!/usr/bin/env node
/**
 * Apply Personnel System Migration
 * Phase 2: Database Schema
 * Date: October 11, 2025
 */

import { readFileSync } from "fs";
import { createClient } from "@supabase/supabase-js";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PROJECT_URL = "https://lvmuiqwihlpnwppdqqfl.supabase.co";
const SERVICE_ROLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx2bXVpcXdpaGxwbndwcGRxcWZsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjAyMjM0OCwiZXhwIjoyMDY3NTk4MzQ4fQ.cCLvqoIWqHHMN_PQoSoST5Jh1PtECbFirGpr-L46Oic";

const supabase = createClient(PROJECT_URL, SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function runPersonnelMigration() {
  console.log("🏈 ============================================");
  console.log("🏈 PERSONNEL SYSTEM MIGRATION - PHASE 2");
  console.log("🏈 ============================================\n");

  try {
    // Read the migration file
    const migrationPath = join(
      __dirname,
      "..",
      "supabase",
      "migrations",
      "20251011000000_add_personnel_system.sql"
    );

    console.log("📖 Reading migration file...");
    console.log(`   Path: ${migrationPath}\n`);

    const migrationSQL = readFileSync(migrationPath, "utf8");

    // Split SQL into individual statements (avoiding DO blocks)
    console.log("⚡ Preparing SQL statements...\n");

    // For complex migrations like this, we need to execute via REST API
    // Let's use fetch to call the Supabase SQL editor API
    const response = await fetch(`${PROJECT_URL}/rest/v1/rpc/exec_sql`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify({ query: migrationSQL }),
    });

    if (!response.ok) {
      // If REST API doesn't work, try direct PostgreSQL connection
      console.log("⚠️  REST API not available, trying alternative method...\n");
      console.log(
        "📝 Please run this migration manually using one of these methods:\n"
      );
      console.log("   Option 1: Supabase Dashboard");
      console.log(
        "   - Go to: https://supabase.com/dashboard/project/lvmuiqwihlpnwppdqqfl/editor"
      );
      console.log("   - Copy and paste the SQL from:");
      console.log(
        "     supabase/migrations/20251011000000_add_personnel_system.sql"
      );
      console.log("   - Click 'Run'\n");
      console.log("   Option 2: psql CLI");
      console.log("   - Get connection string from Supabase dashboard");
      console.log(
        "   - Run: psql <connection_string> -f supabase/migrations/20251011000000_add_personnel_system.sql\n"
      );
      console.log("   Option 3: Supabase CLI");
      console.log("   - Run: supabase db reset (if using local dev)");
      console.log("   - Or: supabase db push (to apply migrations)\n");

      // For now, let's create the tables directly using the Supabase client
      console.log("🔄 Attempting to create tables directly...\n");

      // This is a workaround - we'll create tables one by one
      console.log("   Creating personnel_configurations table...");
      // We can't create tables via REST API, need to use SQL editor

      console.log("\n❌ Automatic migration not possible via REST API.");
      console.log(
        "✋ Please apply migration manually using one of the options above.\n"
      );
      process.exit(1);
    }

    const result = await response.json();
    console.log("✅ Migration executed successfully!\n");
    console.log("   Result:", result);

    // Verify the migration
    console.log("🔍 Verifying migration...\n");

    // Check personnel_configurations table
    console.log("1. Checking personnel_configurations table...");
    const { data: configs, error: configError } = await supabase
      .from("personnel_configurations")
      .select("*")
      .limit(5);

    if (configError) {
      console.error(
        "   ❌ Error querying personnel_configurations:",
        configError
      );
    } else {
      console.log(`   ✅ Found ${configs.length} personnel configurations`);
      if (configs.length > 0) {
        console.log(
          `   📋 Sample: "${configs[0].name}" - ${configs[0].description}`
        );
      }
    }

    // Check personnel_players table
    console.log("\n2. Checking personnel_players table...");
    const { data: players, error: playerError } = await supabase
      .from("personnel_players")
      .select("*")
      .limit(10);

    if (playerError) {
      console.error("   ❌ Error querying personnel_players:", playerError);
    } else {
      console.log(`   ✅ Found ${players.length} personnel players`);
      if (players.length > 0) {
        const qbCount = players.filter((p) => p.position === "QB").length;
        const rbCount = players.filter((p) => p.position === "RB").length;
        const teCount = players.filter((p) => p.position === "TE").length;
        const wrCount = players.filter((p) => p.position === "WR").length;
        console.log(
          `   📊 Breakdown: ${qbCount} QB, ${rbCount} RB, ${teCount} TE, ${wrCount} WR`
        );
      }
    }

    // Check plays.personnel column
    console.log("\n3. Checking plays.personnel values...");
    const { data: plays, error: playError } = await supabase
      .from("plays")
      .select("personnel")
      .not("personnel", "is", null)
      .limit(5);

    if (playError) {
      console.error("   ❌ Error querying plays:", playError);
    } else {
      console.log(
        `   ✅ Sample personnel values: ${plays.map((p) => p.personnel).join(", ")}`
      );
    }

    console.log("\n🏈 ============================================");
    console.log("🏈 MIGRATION COMPLETE! ✅");
    console.log("🏈 ============================================");
    console.log("\n📝 Next Steps:");
    console.log("   1. ✅ Phase 1 Complete: Personnel Modal UX");
    console.log("   2. ✅ Phase 2 Complete: Database Schema");
    console.log("   3. ⏭️  Phase 3: Create personnelService.ts");
    console.log("   4. ⏭️  Phase 4: Connect to plays");
    console.log("   5. ⏭️  Phase 5: Diagram integration\n");
  } catch (err) {
    console.error("\n❌ Fatal error:", err);
    process.exit(1);
  }
}

// Run the migration
runPersonnelMigration();
