#!/usr/bin/env node

/**
 * Interactive Formation Cleanup Tool
 *
 * Simple, guided cleanup for duplicate formations.
 */

const { createClient } = require("@supabase/supabase-js");
const readline = require("readline");
require("dotenv").config();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(query) {
  return new Promise((resolve) => rl.question(query, resolve));
}

// Initialize Supabase client
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function main() {
  console.clear();
  console.log("═".repeat(60));
  console.log("🧹 Formation Cleanup Tool");
  console.log("═".repeat(60));
  console.log("\nThis tool will help you clean up duplicate formations.\n");

  // Get playbook ID
  const playbookId = await question("Enter your Playbook ID: ");

  if (!playbookId) {
    console.log("\n❌ Playbook ID is required. Exiting.\n");
    rl.close();
    return;
  }

  console.log("\n🔍 Analyzing formations...\n");

  // Fetch formations
  const { data: formations, error } = await supabase
    .from("formations")
    .select("*")
    .eq("playbook_id", playbookId)
    .order("name");

  if (error) {
    console.error("❌ Error:", error.message);
    rl.close();
    return;
  }

  if (formations.length === 0) {
    console.log("❌ No formations found for this playbook.\n");
    rl.close();
    return;
  }

  console.log(`✅ Found ${formations.length} formations\n`);

  // Categorize formations
  const withNull = formations.filter((f) => f.direction === null);
  const withDirection = formations.filter((f) => f.direction !== null);

  console.log("📊 Formation Breakdown:");
  console.log(
    `   • ${withDirection.length} with proper direction (left/right)`
  );
  console.log(`   • ${withNull.length} with no direction (null)\n`);

  if (withNull.length === 0) {
    console.log(
      "✅ All formations have proper directions. No cleanup needed!\n"
    );
    rl.close();
    return;
  }

  // Show formations to delete
  console.log("─".repeat(60));
  console.log("🗑️  Formations with null direction (recommended to delete):");
  console.log("─".repeat(60));

  for (const formation of withNull) {
    const hasProperVersion = withDirection.some(
      (f) => f.name === formation.name
    );
    const status = hasProperVersion
      ? "✅ Has proper version"
      : "⚠️  No replacement";
    console.log(`   • ${formation.name} - ${status}`);
    console.log(`     ID: ${formation.id.substring(0, 13)}...`);
    console.log(`     Usage: ${formation.usage_count || 0} plays`);
    console.log("");
  }

  // Show warnings
  const withoutReplacement = withNull.filter(
    (f) => !withDirection.some((d) => d.name === f.name)
  );

  if (withoutReplacement.length > 0) {
    console.log("⚠️  WARNING: The following formations have no replacement:");
    for (const f of withoutReplacement) {
      console.log(`   • ${f.name}`);
    }
    console.log("\n   Deleting these will leave no formation with this name!");
    console.log("   Consider creating proper left/right versions first.\n");
  }

  // Ask for confirmation
  console.log("─".repeat(60));
  const answer = await question(
    `\n❓ Delete ${withNull.length} formations with null direction? (yes/no): `
  );

  if (answer.toLowerCase() !== "yes") {
    console.log("\n❌ Cancelled. No changes made.\n");
    rl.close();
    return;
  }

  // Delete formations
  console.log("\n🗑️  Deleting...\n");

  const idsToDelete = withNull.map((f) => f.id);

  const { error: deleteError } = await supabase
    .from("formations")
    .delete()
    .in("id", idsToDelete);

  if (deleteError) {
    console.error("❌ Error deleting:", deleteError.message);
    rl.close();
    return;
  }

  console.log("✅ Success!\n");
  console.log("═".repeat(60));
  console.log(`Deleted ${idsToDelete.length} formations`);
  console.log(`Remaining: ${withDirection.length} formations`);
  console.log("═".repeat(60));
  console.log("\n💡 Next Steps:");
  console.log("   1. Refresh your app");
  console.log("   2. Verify formations display correctly");
  console.log("   3. Use bulk operations to manage remaining formations\n");

  rl.close();
}

main().catch((error) => {
  console.error("\n❌ Unexpected error:", error);
  rl.close();
  process.exit(1);
});
