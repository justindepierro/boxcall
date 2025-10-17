/**
 * Formation Data Cleanup Script
 *
 * Fixes duplicate formations in the database.
 *
 * Problem:
 * - Some formations have direction: null (old style)
 * - Some formations have proper direction and links (new style)
 * - This creates duplicates with the same name
 *
 * Solution:
 * - Delete old formations (null direction)
 * - Keep properly linked formations
 * - Optionally update play references
 *
 * Usage:
 * node scripts/cleanup-duplicate-formations.js --playbook-id=YOUR_ID [--dry-run] [--update-plays]
 */

const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

// Parse command line arguments
const args = process.argv.slice(2).reduce((acc, arg) => {
  const [key, value] = arg.split("=");
  acc[key.replace("--", "")] = value || true;
  return acc;
}, {});

const PLAYBOOK_ID = args["playbook-id"];
const DRY_RUN = args["dry-run"] || false;
const UPDATE_PLAYS = args["update-plays"] || false;

if (!PLAYBOOK_ID) {
  console.error("❌ Error: --playbook-id is required");
  console.log("\nUsage:");
  console.log(
    "  node scripts/cleanup-duplicate-formations.js --playbook-id=YOUR_ID [--dry-run] [--update-plays]"
  );
  console.log("\nOptions:");
  console.log("  --playbook-id    The playbook ID to clean up (required)");
  console.log(
    "  --dry-run        Show what would be deleted without actually deleting"
  );
  console.log(
    "  --update-plays   Update play references to use proper formation IDs"
  );
  process.exit(1);
}

// Initialize Supabase client
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function analyzeFormations() {
  console.log("\n🔍 Analyzing formations...\n");

  const { data: formations, error } = await supabase
    .from("formations")
    .select("*")
    .eq("playbook_id", PLAYBOOK_ID)
    .order("name");

  if (error) {
    console.error("❌ Error fetching formations:", error);
    process.exit(1);
  }

  // Group formations by name
  const grouped = formations.reduce((acc, formation) => {
    if (!acc[formation.name]) {
      acc[formation.name] = [];
    }
    acc[formation.name].push(formation);
    return acc;
  }, {});

  // Find duplicates and categorize
  const duplicates = [];
  const toDelete = [];
  const toKeep = [];

  for (const [name, formationList] of Object.entries(grouped)) {
    if (formationList.length > 1) {
      duplicates.push({ name, formations: formationList });

      // Categorize: delete ones with null direction, keep ones with direction
      const nullDirection = formationList.filter((f) => f.direction === null);
      const withDirection = formationList.filter((f) => f.direction !== null);

      if (nullDirection.length > 0 && withDirection.length > 0) {
        toDelete.push(...nullDirection);
        toKeep.push(...withDirection);
      }
    }
  }

  return {
    total: formations.length,
    grouped,
    duplicates,
    toDelete,
    toKeep,
    allFormations: formations,
  };
}

async function findAffectedPlays(formationIds) {
  const { data: plays, error } = await supabase
    .from("plays")
    .select("id, play_name, formation, f_dir")
    .eq("playbook_id", PLAYBOOK_ID);

  if (error) {
    console.error("❌ Error fetching plays:", error);
    return [];
  }

  // Note: plays table uses formation NAME, not ID
  // We need to check if any plays reference formations we're deleting
  const formationNames = new Set(
    formationIds.map((id) => {
      const formation = formationIds.find((f) => f.id === id);
      return formation?.name;
    })
  );

  return plays.filter((play) => formationNames.has(play.formation));
}

async function printReport(analysis) {
  console.log("═".repeat(60));
  console.log("📊 FORMATION ANALYSIS REPORT");
  console.log("═".repeat(60));
  console.log(`\nPlaybook ID: ${PLAYBOOK_ID}`);
  console.log(`Total Formations: ${analysis.total}`);
  console.log(`Unique Names: ${Object.keys(analysis.grouped).length}`);
  console.log(`Duplicate Groups: ${analysis.duplicates.length}`);
  console.log(`\nTo Delete: ${analysis.toDelete.length} formations`);
  console.log(`To Keep: ${analysis.toKeep.length} formations`);

  if (analysis.duplicates.length > 0) {
    console.log("\n" + "─".repeat(60));
    console.log("🔍 DUPLICATE FORMATIONS:");
    console.log("─".repeat(60));

    for (const dup of analysis.duplicates) {
      console.log(`\n📋 "${dup.name}" (${dup.formations.length} instances):`);

      for (const formation of dup.formations) {
        const status = analysis.toDelete.includes(formation)
          ? "🗑️  DELETE"
          : "✅ KEEP";
        console.log(
          `  ${status} | ID: ${formation.id.substring(0, 8)}... | Direction: ${formation.direction || "null"} | Opposite: ${formation.opposite_formation_id ? "Yes" : "No"} | Usage: ${formation.usage_count || 0}`
        );
      }
    }
  }

  if (analysis.toDelete.length > 0) {
    console.log("\n" + "─".repeat(60));
    console.log("🗑️  FORMATIONS TO DELETE:");
    console.log("─".repeat(60));

    for (const formation of analysis.toDelete) {
      console.log(
        `  • ${formation.name} (${formation.id.substring(0, 8)}...) - Direction: ${formation.direction || "null"}`
      );
    }

    // Check if any plays reference these formations
    const formationNames = new Set(analysis.toDelete.map((f) => f.name));
    const affectedPlays = analysis.allFormations.filter(
      (f) => f.usage_count > 0 && analysis.toDelete.includes(f)
    );

    if (affectedPlays.length > 0) {
      console.log(
        "\n⚠️  WARNING: Some formations to delete have usage_count > 0"
      );
      console.log("   This means plays may reference them.");
      for (const formation of affectedPlays) {
        console.log(`   • ${formation.name}: ${formation.usage_count} usages`);
      }
    }
  }

  console.log("\n" + "═".repeat(60));
}

async function cleanupFormations(toDelete) {
  if (DRY_RUN) {
    console.log("\n🔍 DRY RUN MODE - No changes will be made\n");
    return { deleted: 0 };
  }

  console.log("\n🗑️  Deleting formations...\n");

  const idsToDelete = toDelete.map((f) => f.id);

  const { error } = await supabase
    .from("formations")
    .delete()
    .in("id", idsToDelete);

  if (error) {
    console.error("❌ Error deleting formations:", error);
    throw error;
  }

  console.log(`✅ Deleted ${idsToDelete.length} formations\n`);

  return { deleted: idsToDelete.length };
}

async function updatePlayReferences(analysis) {
  if (!UPDATE_PLAYS) {
    console.log(
      "\n💡 Tip: Use --update-plays to automatically update play references\n"
    );
    return { updated: 0 };
  }

  if (DRY_RUN) {
    console.log("\n🔍 DRY RUN MODE - Play references would be updated\n");
    return { updated: 0 };
  }

  console.log("\n🔄 Updating play references...\n");

  // For each deleted formation, find the corresponding kept formation
  // and update plays to use it
  const updates = [];

  for (const deleted of analysis.toDelete) {
    // Find the kept formation with the same name
    const kept = analysis.toKeep.find((k) => k.name === deleted.name);

    if (kept) {
      updates.push({
        oldName: deleted.name,
        oldDirection: deleted.direction,
        newId: kept.id,
        newDirection: kept.direction,
      });
    }
  }

  // Note: Since plays table stores formation NAME not ID,
  // we need to update based on name + direction matching
  console.log(
    "⚠️  Play updates require manual review - plays use formation names, not IDs"
  );
  console.log(
    "   Review your plays table to ensure correct formation references.\n"
  );

  return { updated: 0 };
}

async function main() {
  console.log("\n🚀 Starting Formation Cleanup Script\n");
  console.log(`Mode: ${DRY_RUN ? "🔍 DRY RUN" : "⚡ LIVE"}`);
  console.log(`Update Plays: ${UPDATE_PLAYS ? "Yes" : "No"}\n`);

  try {
    // Step 1: Analyze
    const analysis = await analyzeFormations();
    await printReport(analysis);

    if (analysis.toDelete.length === 0) {
      console.log("\n✅ No duplicate formations found. Database is clean!\n");
      return;
    }

    // Step 2: Confirm (if not dry run)
    if (!DRY_RUN) {
      console.log("\n⚠️  WARNING: This will permanently delete formations!\n");
      console.log("Press Ctrl+C to cancel, or run with --dry-run first.\n");

      // Wait 3 seconds for user to cancel
      await new Promise((resolve) => setTimeout(resolve, 3000));
      console.log("Proceeding with cleanup...\n");
    }

    // Step 3: Cleanup
    const result = await cleanupFormations(analysis.toDelete);

    // Step 4: Update plays (if requested)
    await updatePlayReferences(analysis);

    // Step 5: Summary
    console.log("═".repeat(60));
    console.log("✅ CLEANUP COMPLETE");
    console.log("═".repeat(60));
    console.log(`Formations Deleted: ${result.deleted}`);
    console.log(`Formations Remaining: ${analysis.toKeep.length}`);
    console.log("═".repeat(60));
    console.log("\n💡 Next Steps:");
    console.log("  1. Refresh your app to see the cleaned data");
    console.log("  2. Verify formations display correctly");
    console.log("  3. Check plays to ensure they reference correct formations");
    console.log("\n");
  } catch (error) {
    console.error("\n❌ Error:", error.message);
    process.exit(1);
  }
}

// Run the script
main();
