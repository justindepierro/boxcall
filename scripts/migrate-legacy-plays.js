#!/usr/bin/env node
/**
 * Legacy Play Migration Script
 *
 * Backfills existing plays with formation_id links by:
 * 1. Reading all plays without formation_id
 * 2. Auto-creating formations from their formation text
 * 3. Updating plays with the new formation_id
 *
 * Run: node scripts/migrate-legacy-plays.js
 *
 * IMPORTANT: This script requires authentication to access your plays.
 * You'll need to either:
 * - Run this with service role key (admin access)
 * - Or run it from within the app context (with user auth)
 */

import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import * as readline from "readline";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, "../.env") });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Optional: for admin access

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("❌ Missing Supabase credentials");
  process.exit(1);
}

// Use service role key if available (bypasses RLS), otherwise use anon key
const supabaseKey = supabaseServiceKey || supabaseAnonKey;
const supabase = createClient(supabaseUrl, supabaseKey);

// Track statistics
const stats = {
  playsFound: 0,
  playsWithoutFormationId: 0,
  formationsCreated: 0,
  formationsReused: 0,
  playsMigrated: 0,
  errors: 0,
};

/**
 * Normalize direction to match FormationService standards ("R" or "L")
 */
function normalizeDirection(direction) {
  if (!direction || direction.trim() === "") return null;

  const normalized = direction.trim().toLowerCase();

  // Right variants
  if (normalized === "right" || normalized === "r" || normalized === "rt") {
    return "R";
  }

  // Left variants
  if (normalized === "left" || normalized === "l" || normalized === "lt") {
    return "L";
  }

  // Unknown format - return null
  return null;
}

/**
 * Get formation by name (case-insensitive)
 */
async function getFormationByName(name, playbookId) {
  const normalized = name.toLowerCase().trim().replace(/\s+/g, "");

  const { data: formations, error } = await supabase
    .from("formations")
    .select("*")
    .eq("playbook_id", playbookId);

  if (error) throw error;
  if (!formations || formations.length === 0) return null;

  return (
    formations.find(
      (f) => f.name.toLowerCase().trim().replace(/\s+/g, "") === normalized
    ) || null
  );
}

/**
 * Create formation from play data
 */
async function createFormation(
  formationName,
  playbookId,
  personnelName,
  formationDirection
) {
  const { data, error } = await supabase
    .from("formations")
    .insert([
      {
        playbook_id: playbookId,
        name: formationName,
        personnel_name: personnelName || null,
        direction: formationDirection || null,
        player_positions: [],
        creation_source: "migration",
        creation_context: {
          triggeredBy: "legacy-play-migration",
          timestamp: new Date().toISOString(),
        },
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Get or create formation
 */
async function getOrCreateFormation(
  formationName,
  playbookId,
  personnelName,
  formationDirection
) {
  // Check if exists
  const existing = await getFormationByName(formationName, playbookId);
  if (existing) {
    console.log(`   ✓ Reusing existing formation: ${formationName}`);
    stats.formationsReused++;
    return existing;
  }

  // Create new
  console.log(`   + Creating formation: ${formationName}`);
  const newFormation = await createFormation(
    formationName,
    playbookId,
    personnelName,
    formationDirection
  );
  stats.formationsCreated++;
  return newFormation;
}

/**
 * Update play with formation_id
 */
async function updatePlayFormationId(playId, formationId) {
  const { error } = await supabase
    .from("plays")
    .update({ formation_id: formationId })
    .eq("id", playId);

  if (error) throw error;
}

/**
 * Confirm migration with user
 */
async function confirmMigration(plays) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    console.log("\n📋 MIGRATION PREVIEW");
    console.log("=".repeat(80));
    console.log(`\nFound ${plays.length} plays without formation_id:\n`);

    plays.forEach((play, idx) => {
      console.log(`${idx + 1}. ${play.play_name}`);
      console.log(`   Formation: "${play.formation}"`);
      console.log(`   Type: ${play.p_type || "unknown"}`);
      console.log(`   Playbook: ${play.playbook_id.substring(0, 8)}...`);
      console.log("");
    });

    console.log("=".repeat(80));
    console.log("This script will:");
    console.log("  1. Create formations for each unique formation name");
    console.log("  2. Link each play to its formation via formation_id");
    console.log('  3. Mark formations as created by "migration"');
    console.log(
      "\nYour plays will NOT be modified except for adding formation_id."
    );
    console.log("=".repeat(80));

    rl.question("\n⚠️  Proceed with migration? (yes/no): ", (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === "yes" || answer.toLowerCase() === "y");
    });
  });
}

/**
 * Main migration function
 */
async function migrateLegacyPlays(dryRun = false) {
  console.log("\n🔄 Legacy Play Migration Script");
  console.log("=".repeat(80));
  console.log(
    `Mode: ${dryRun ? "DRY RUN (no changes)" : "LIVE (will update database)"}`
  );
  console.log("=".repeat(80));

  try {
    // ===================================================================
    // STEP 1: Get all playbooks
    // ===================================================================
    console.log("\n📚 Step 1: Finding playbooks...");

    const { data: playbooks, error: playbooksError } = await supabase
      .from("playbooks")
      .select("id, name");

    if (playbooksError) throw playbooksError;

    if (!playbooks || playbooks.length === 0) {
      console.log("   ⚠️  No playbooks found. Check authentication.");
      console.log(
        "\n💡 TIP: You may need to use SUPABASE_SERVICE_ROLE_KEY in .env"
      );
      return;
    }

    console.log(`   ✓ Found ${playbooks.length} playbooks`);

    // ===================================================================
    // STEP 2: Get all plays without formation_id
    // ===================================================================
    console.log("\n🏈 Step 2: Finding legacy plays...");

    const allLegacyPlays = [];

    for (const playbook of playbooks) {
      const { data: plays, error: playsError } = await supabase
        .from("plays")
        .select(
          "id, play_name, formation, formation_id, p_type, personnel, playbook_id, f_dir"
        )
        .eq("playbook_id", playbook.id)
        .is("formation_id", null); // Only plays without formation_id

      if (playsError) throw playsError;

      if (plays && plays.length > 0) {
        console.log(`   📖 ${playbook.name}: ${plays.length} legacy plays`);
        allLegacyPlays.push(...plays);
      }
    }

    stats.playsFound = allLegacyPlays.length;
    stats.playsWithoutFormationId = allLegacyPlays.length;

    if (allLegacyPlays.length === 0) {
      console.log(
        "\n✅ No legacy plays found! All plays already have formation_id."
      );
      return;
    }

    console.log(
      `\n   ✓ Total legacy plays to migrate: ${allLegacyPlays.length}`
    );

    // ===================================================================
    // STEP 3: Confirm with user
    // ===================================================================
    if (!dryRun) {
      const confirmed = await confirmMigration(allLegacyPlays);
      if (!confirmed) {
        console.log("\n❌ Migration cancelled by user.");
        return;
      }
    }

    // ===================================================================
    // STEP 4: Migrate each play
    // ===================================================================
    console.log("\n🔄 Step 3: Migrating plays...");
    console.log("=".repeat(80));

    for (const play of allLegacyPlays) {
      try {
        console.log(`\n📝 Migrating: ${play.play_name}`);
        console.log(`   Formation: "${play.formation}"`);
        if (play.f_dir) {
          const normalizedDirection = normalizeDirection(play.f_dir);
          console.log(
            `   Direction: ${play.f_dir} → ${normalizedDirection || "none"}`
          );
        }

        if (!play.formation || play.formation.trim() === "") {
          console.log("   ⚠️  Skipping: No formation name");
          stats.errors++;
          continue;
        }

        // Get or create formation (with normalized direction)
        const normalizedDirection = normalizeDirection(play.f_dir);
        const formation = await getOrCreateFormation(
          play.formation.trim(),
          play.playbook_id,
          play.personnel,
          normalizedDirection
        );

        if (dryRun) {
          console.log(`   [DRY RUN] Would link to formation: ${formation.id}`);
        } else {
          // Update play with formation_id
          await updatePlayFormationId(play.id, formation.id);
          console.log(
            `   ✓ Linked to formation: ${formation.name} (${formation.id.substring(0, 8)}...)`
          );
          stats.playsMigrated++;
        }
      } catch (error) {
        console.error(
          `   ❌ Error migrating play ${play.play_name}:`,
          error.message
        );
        stats.errors++;
      }
    }

    // ===================================================================
    // STEP 5: Summary
    // ===================================================================
    console.log("\n" + "=".repeat(80));
    console.log("📊 MIGRATION SUMMARY");
    console.log("=".repeat(80));
    console.log(`\n✅ Success:`);
    console.log(`   • Legacy plays found: ${stats.playsFound}`);
    console.log(`   • Plays migrated: ${stats.playsMigrated}`);
    console.log(`   • Formations created: ${stats.formationsCreated}`);
    console.log(`   • Formations reused: ${stats.formationsReused}`);

    if (stats.errors > 0) {
      console.log(`\n⚠️  Errors:`);
      console.log(`   • Failed migrations: ${stats.errors}`);
    }

    if (dryRun) {
      console.log(`\n💡 This was a DRY RUN. No changes were made.`);
      console.log(`   Run without --dry-run flag to perform actual migration.`);
    } else {
      console.log(`\n🎉 Migration complete!`);
      console.log(`\n✅ Next steps:`);
      console.log(`   1. Verify: Open your playbook and check the plays`);
      console.log(
        `   2. Test: Create a new play to verify auto-creation still works`
      );
      console.log(
        `   3. Analytics: Your migrated plays now feed into formation analytics!`
      );
    }

    console.log("\n" + "=".repeat(80) + "\n");
  } catch (error) {
    console.error("\n❌ Migration failed:", error);
    console.error("\nStack trace:", error.stack);
    process.exit(1);
  }
}

// Check for dry-run flag
const isDryRun = process.argv.includes("--dry-run");

// Run migration
migrateLegacyPlays(isDryRun);
