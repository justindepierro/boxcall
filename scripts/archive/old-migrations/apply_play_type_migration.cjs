#!/usr/bin/env node

/**
 * Apply Play Type Expansion Migration
 *
 * Removes CHECK constraint on plays.p_type to allow custom play types
 * Adds validation trigger to maintain data integrity
 */

const fs = require("fs");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");

require("dotenv").config({ path: path.join(__dirname, ".env.local") });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function applyMigration() {
  console.log("🔧 Applying Play Type Expansion Migration...\n");

  try {
    // Read migration file
    const migrationPath = path.join(
      __dirname,
      "database",
      "migrations",
      "20251017_expand_play_types.sql"
    );
    const migrationSQL = fs.readFileSync(migrationPath, "utf8");

    console.log("📄 Migration file loaded:", migrationPath);
    console.log("📊 SQL length:", migrationSQL.length, "characters\n");

    // Execute migration
    console.log("⚡ Executing migration...");
    const { error } = await supabase.rpc("exec_sql", { sql: migrationSQL });

    if (error) {
      console.error("❌ Migration failed:", error);
      process.exit(1);
    }

    console.log("✅ Migration applied successfully!\n");

    // Verify changes
    console.log("🔍 Verifying changes...");

    // Check current play types
    const { data: playTypes, error: queryError } = await supabase
      .from("plays")
      .select("p_type")
      .not("p_type", "is", null);

    if (queryError) {
      console.warn("⚠️  Could not query play types:", queryError.message);
    } else {
      const typeCount = playTypes.reduce((acc, play) => {
        acc[play.p_type] = (acc[play.p_type] || 0) + 1;
        return acc;
      }, {});

      console.log("\n📊 Current play types in database:");
      Object.entries(typeCount)
        .sort((a, b) => b[1] - a[1])
        .forEach(([type, count]) => {
          console.log(`   ${type}: ${count} plays`);
        });
    }

    console.log("\n✨ Migration complete!");
    console.log("📝 Coaches can now create custom play types like:");
    console.log("   • Screen");
    console.log("   • Bootleg");
    console.log("   • QB Sneak");
    console.log("   • Trick");
    console.log("   • Draw");
    console.log(
      "   • Any custom type (1-50 chars, letters/numbers/spaces/hyphens)"
    );
  } catch (error) {
    console.error("❌ Unexpected error:", error);
    process.exit(1);
  }
}

applyMigration();
