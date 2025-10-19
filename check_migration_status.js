#!/usr/bin/env node
/**
 * Quick migration runner - runs migration in chunks via direct queries
 */

import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY,
  {
    auth: { autoRefreshToken: false, persistSession: false },
  }
);

console.log("🚀 Quick Play Metadata Migration\n");

async function quickMigration() {
  try {
    // Check current schema first
    console.log("📊 Checking current plays table schema...");
    const { data: existingPlays, error: checkError } = await supabase
      .from("plays")
      .select("*")
      .limit(1);

    if (checkError) {
      console.error("❌ Cannot access plays table:", checkError.message);
      process.exit(1);
    }

    const samplePlay = existingPlays?.[0] || {};
    const hasTagsColumn = "tags" in samplePlay;
    const hasKeyPositionsColumn = "key_positions" in samplePlay;
    const hasKeyPlayersColumn = "key_players" in samplePlay;
    const hasFlagsColumn = "flags" in samplePlay;

    console.log("\nCurrent schema:");
    console.log(
      `   tags column:          ${hasTagsColumn ? "✅ EXISTS" : "❌ MISSING"}`
    );
    console.log(
      `   key_positions column: ${hasKeyPositionsColumn ? "✅ EXISTS" : "❌ MISSING"}`
    );
    console.log(
      `   key_players column:   ${hasKeyPlayersColumn ? "✅ EXISTS" : "❌ MISSING"}`
    );
    console.log(
      `   flags column:         ${hasFlagsColumn ? "✅ EXISTS" : "❌ MISSING"}`
    );

    if (
      !hasTagsColumn ||
      !hasKeyPositionsColumn ||
      !hasKeyPlayersColumn ||
      !hasFlagsColumn
    ) {
      console.log("\n⚠️  MIGRATION REQUIRED");
      console.log("\n📋 To run the migration:");
      console.log("\n1️⃣  OPTION 1 - Supabase SQL Editor (RECOMMENDED):");
      console.log("   • Open: https://supabase.com/dashboard");
      console.log("   • Go to: SQL Editor");
      console.log("   • Click: New Query");
      console.log(
        "   • Copy/paste: database/migrations/20251017_add_play_metadata_arrays.sql"
      );
      console.log("   • Click: Run");
      console.log("\n2️⃣  OPTION 2 - Supabase CLI:");
      console.log("   • Install CLI: npm install -g supabase");
      console.log("   • Link project: supabase link");
      console.log("   • Run migration: supabase db push");
      console.log("\n3️⃣  OPTION 3 - Manual SQL (if you have psql access):");
      console.log("   • psql [connection-string]");
      console.log(
        "   • \\i database/migrations/20251017_add_play_metadata_arrays.sql"
      );

      console.log("\n📄 Migration file location:");
      console.log(
        "   database/migrations/20251017_add_play_metadata_arrays.sql"
      );

      return;
    }

    console.log("\n✅ All columns exist! Schema is up to date.");

    // Check if data has been migrated
    console.log("\n📊 Checking data migration status...");
    const { data: playsWithOldTags, error: oldTagsError } = await supabase
      .from("plays")
      .select("id, play_name, p_tag1, p_tag2, tags, metadata_migrated_at")
      .or("p_tag1.not.is.null,p_tag2.not.is.null")
      .limit(10);

    if (oldTagsError) {
      console.error("❌ Error checking tags:", oldTagsError.message);
      return;
    }

    if (!playsWithOldTags || playsWithOldTags.length === 0) {
      console.log("   ℹ️  No plays with old p_tag1/p_tag2 format found");
    } else {
      const needsMigration = playsWithOldTags.filter(
        (p) => (!p.tags || p.tags.length === 0) && (p.p_tag1 || p.p_tag2)
      );

      if (needsMigration.length > 0) {
        console.log(
          `   ⚠️  Found ${needsMigration.length} plays that need tag migration`
        );
        console.log("\n   Sample plays needing migration:");
        needsMigration.slice(0, 3).forEach((play) => {
          console.log(
            `   • ${play.play_name}: "${play.p_tag1 || ""}", "${play.p_tag2 || ""}"`
          );
        });
        console.log("\n   Run the full migration SQL to migrate this data.");
      } else {
        console.log("   ✅ All existing tags have been migrated");
      }
    }

    // Show summary
    console.log("\n📊 Current statistics:");
    const { count: totalPlays } = await supabase
      .from("plays")
      .select("*", { count: "exact", head: true });

    const { count: playsWithTags } = await supabase
      .from("plays")
      .select("*", { count: "exact", head: true })
      .not("tags", "is", null);

    console.log(`   Total plays:      ${totalPlays || 0}`);
    console.log(`   Plays with tags:  ${playsWithTags || 0}`);

    console.log("\n✅ Schema check complete!");
  } catch (error) {
    console.error("\n❌ Error:", error.message);
    console.error(error);
  }
}

quickMigration();
