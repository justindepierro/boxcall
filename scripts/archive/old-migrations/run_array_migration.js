#!/usr/bin/env node
/**
 * Run the play metadata arrays migration
 * This migration adds tags, key_positions, key_players, and flags columns
 */

import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Missing Supabase credentials");
  console.error("   Need: VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

console.log("🚀 Running Play Metadata Arrays Migration");
console.log("=".repeat(60));

async function runMigration() {
  try {
    // Step 1: Add columns
    console.log("\n📝 Step 1: Adding array columns...");
    const { error: alterError } = await supabase.rpc("exec_sql", {
      sql: `
        ALTER TABLE plays 
          ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT ARRAY[]::TEXT[],
          ADD COLUMN IF NOT EXISTS key_positions TEXT[] DEFAULT ARRAY[]::TEXT[],
          ADD COLUMN IF NOT EXISTS key_players UUID[] DEFAULT ARRAY[]::UUID[],
          ADD COLUMN IF NOT EXISTS flags TEXT[] DEFAULT ARRAY[]::TEXT[],
          ADD COLUMN IF NOT EXISTS metadata_migrated_at TIMESTAMPTZ;
      `,
    });

    if (alterError) {
      // Try direct approach if exec_sql doesn't exist
      console.log("   Using direct Supabase API approach...");

      // Read the migration file
      const migrationSQL = fs.readFileSync(
        "database/migrations/20251017_add_play_metadata_arrays.sql",
        "utf8"
      );

      console.log("\n📋 Migration Preview:");
      console.log("   - Adding tags TEXT[] column (unlimited play variations)");
      console.log("   - Adding key_positions TEXT[] column");
      console.log("   - Adding key_players UUID[] column");
      console.log("   - Adding flags TEXT[] column");
      console.log("   - Migrating p_tag1, p_tag2 → tags array");
      console.log("   - Creating GIN indexes for fast array searching");
      console.log("   - Adding validation triggers");
      console.log("\n⚠️  Migration must be run in Supabase SQL Editor");
      console.log("\n📖 Instructions:");
      console.log(
        "   1. Go to: https://supabase.com/dashboard/project/[your-project]/sql"
      );
      console.log(
        "   2. Copy content from: database/migrations/20251017_add_play_metadata_arrays.sql"
      );
      console.log("   3. Paste into SQL Editor");
      console.log("   4. Click 'Run'");
      console.log("   5. Verify results in the output panel");
      console.log("\n✨ Or use Supabase CLI:");
      console.log("   npx supabase db push");

      return;
    }

    console.log("   ✅ Columns added successfully");

    // Step 2: Migrate existing tags
    console.log("\n📝 Step 2: Migrating existing p_tag1, p_tag2 data...");
    const { error: migrateError } = await supabase.rpc("exec_sql", {
      sql: `
        UPDATE plays 
        SET 
          tags = ARRAY_REMOVE(ARRAY[p_tag1, p_tag2], NULL),
          metadata_migrated_at = NOW()
        WHERE p_tag1 IS NOT NULL OR p_tag2 IS NOT NULL;
      `,
    });

    if (migrateError) throw migrateError;
    console.log("   ✅ Data migrated successfully");

    // Step 3: Create indexes
    console.log("\n📝 Step 3: Creating GIN indexes...");
    const indexes = [
      "CREATE INDEX IF NOT EXISTS idx_plays_tags ON plays USING GIN(tags) WHERE array_length(tags, 1) > 0",
      "CREATE INDEX IF NOT EXISTS idx_plays_key_positions ON plays USING GIN(key_positions) WHERE array_length(key_positions, 1) > 0",
      "CREATE INDEX IF NOT EXISTS idx_plays_key_players ON plays USING GIN(key_players) WHERE array_length(key_players, 1) > 0",
      "CREATE INDEX IF NOT EXISTS idx_plays_flags ON plays USING GIN(flags) WHERE array_length(flags, 1) > 0",
    ];

    for (const indexSQL of indexes) {
      const { error } = await supabase.rpc("exec_sql", { sql: indexSQL });
      if (error) throw error;
    }
    console.log("   ✅ Indexes created successfully");

    // Verify migration
    console.log("\n📊 Verifying migration...");
    const { data: plays, error: queryError } = await supabase
      .from("plays")
      .select(
        "id, play_name, tags, key_positions, key_players, flags, metadata_migrated_at"
      )
      .limit(5);

    if (queryError) throw queryError;

    console.log(`   ✅ Found ${plays.length} plays`);
    if (plays.length > 0) {
      const withTags = plays.filter((p) => p.tags && p.tags.length > 0).length;
      console.log(`   📌 ${withTags} plays with tags migrated`);
    }

    console.log("\n✅ Migration completed successfully!");
    console.log("=".repeat(60));
  } catch (error) {
    console.error("\n❌ Migration failed:");
    console.error(error);
    process.exit(1);
  }
}

runMigration();
