#!/usr/bin/env node

/**
 * Apply Bulletproof Integration Enhancements Migration
 *
 * This script applies the comprehensive data integrity improvements:
 * - Auto-populate formation_id and personnel_id from TEXT fields
 * - Cascade updates for renames
 * - Soft deletes
 * - Formation direction auto-inference
 * - Formation-personnel compatibility validation
 * - Audit views and batch linking utilities
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("❌ Missing required environment variables:");
  console.error("   VITE_SUPABASE_URL");
  console.error("   SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function applyMigration() {
  console.log("\n🚀 Applying Bulletproof Integration Enhancements Migration");
  console.log("=".repeat(60));

  try {
    // Read migration file
    const migrationPath = join(
      __dirname,
      "../supabase/migrations/20251020000000_bulletproof_integrations.sql"
    );
    const migrationSQL = readFileSync(migrationPath, "utf8");

    console.log("\n📄 Migration file loaded successfully");
    console.log(`   Size: ${(migrationSQL.length / 1024).toFixed(2)} KB`);

    // Execute migration
    console.log("\n⚙️  Executing migration...");

    const { error } = await supabase.rpc("exec_sql", { sql: migrationSQL });

    if (error) {
      console.error("\n❌ Migration failed:", error.message);
      process.exit(1);
    }

    console.log("\n✅ Migration applied successfully!");
    console.log("\n📋 Features Enabled:");
    console.log("   ✅ Auto-populate formation_id from formation TEXT");
    console.log("   ✅ Auto-populate personnel_id from personnel TEXT");
    console.log("   ✅ Cascade updates for formation/personnel renames");
    console.log("   ✅ Soft deletes for formations & personnel");
    console.log("   ✅ Formation direction auto-inference");
    console.log("   ✅ Formation-personnel compatibility validation");
    console.log("   ✅ Formation variant consistency checks");
    console.log("   ✅ Data linking audit views");
    console.log("   ✅ Batch linking utilities");

    console.log("\n🔍 Available Audit Queries:");
    console.log("   • SELECT * FROM plays_missing_formation_link;");
    console.log("   • SELECT * FROM plays_missing_personnel_link;");
    console.log("   • SELECT * FROM formations_missing_personnel;");
    console.log("   • SELECT * FROM orphaned_personnel_configs;");
    console.log("   • SELECT * FROM check_formation_variant_consistency();");

    console.log("\n🔧 Batch Linking Commands:");
    console.log(
      "   • Preview: SELECT * FROM batch_link_plays_to_formations(NULL, true);"
    );
    console.log(
      "   • Apply: SELECT * FROM batch_link_plays_to_formations(NULL, false);"
    );

    console.log("\n" + "=".repeat(60));
    console.log("✅ Bulletproof Integration Enhancements Complete!\n");
  } catch (error) {
    console.error("\n❌ Unexpected error:", error);
    process.exit(1);
  }
}

// Run migration
applyMigration();
