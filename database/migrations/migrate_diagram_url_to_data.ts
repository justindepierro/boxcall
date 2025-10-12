/**
 * Migrate diagram_url (TEXT with JSON strings) to diagram_data (JSONB)
 *
 * This script migrates legacy data from the old diagram_url field to the new diagram_data field.
 * It handles:
 * - Parsing JSON from diagram_url TEXT field
 * - Validating diagram structure
 * - Converting to DiagramDocument format
 * - Setting appropriate diagram_version
 * - Progress tracking
 * - Dry-run mode for testing
 * - Error handling for malformed JSON
 *
 * Usage:
 *   DRY_RUN=true npx tsx database/migrations/migrate_diagram_url_to_data.ts
 *   npx tsx database/migrations/migrate_diagram_url_to_data.ts
 */

import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

// ESM-compatible __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env file
config({ path: resolve(__dirname, "../../.env") });

// Load environment variables
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error("❌ Missing Supabase credentials");
  console.error("   VITE_SUPABASE_URL:", SUPABASE_URL ? "✓" : "✗");
  console.error("   VITE_SUPABASE_ANON_KEY:", SUPABASE_ANON_KEY ? "✓" : "✗");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Check if running in dry-run mode
const DRY_RUN = process.env.DRY_RUN === "true";

interface PlayRow {
  id: string;
  play_name: string;
  diagram_url: string | null;
  diagram_data: unknown | null;
}

interface DiagramDocument {
  version: number;
  players: Array<{
    id: string;
    x: number;
    y: number;
    jerseyNumber: string;
    team: "offense" | "defense";
    color?: number;
    role?: string;
    position?: "regular" | "center";
  }>;
  meta?: {
    createdAt: number;
    updatedAt: number;
  };
}

/**
 * Parse and validate diagram_url JSON
 */
function parseDiagramUrl(diagramUrl: string): DiagramDocument | null {
  try {
    const parsed = JSON.parse(diagramUrl);

    // Check if it's already a valid DiagramDocument (v2)
    if (parsed.version === 2 && Array.isArray(parsed.players)) {
      return parsed as DiagramDocument;
    }

    // Legacy format: Array of players (v1)
    if (Array.isArray(parsed)) {
      return {
        version: 2,
        players: parsed.map((p: any, index: number) => ({
          id: p.id || `player-${index}`,
          x: Number(p.x) || 0,
          y: Number(p.y) || 0,
          jerseyNumber: String(p.jerseyNumber || index + 1),
          team: p.team === "defense" ? "defense" : "offense",
          color: p.color || undefined,
          role: p.role || undefined,
          position: p.position || "regular",
        })),
        meta: {
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      };
    }

    // Unknown format
    console.warn("⚠️  Unknown diagram format:", parsed);
    return null;
  } catch (err) {
    console.error("❌ Failed to parse diagram_url JSON:", err);
    return null;
  }
}

/**
 * Main migration function
 */
async function migrateDiagrams() {
  console.log("\n📊 Diagram URL → Diagram Data Migration");
  console.log("=====================================\n");

  if (DRY_RUN) {
    console.log("🔍 DRY RUN MODE - No data will be modified\n");
  }

  // Step 1: Find plays with diagram_url but no diagram_data
  console.log("Step 1: Finding plays to migrate...");
  const { data: plays, error: fetchError } = await supabase
    .from("plays")
    .select("id, play_name, diagram_url, diagram_data")
    .not("diagram_url", "is", null)
    .is("diagram_data", null);

  if (fetchError) {
    console.error("❌ Failed to fetch plays:", fetchError.message);
    process.exit(1);
  }

  if (!plays || plays.length === 0) {
    console.log("✅ No plays need migration (all diagram_url data already migrated)");
    return;
  }

  console.log(`   Found ${plays.length} plays to migrate\n`);

  // Step 2: Parse and validate each diagram
  console.log("Step 2: Parsing and validating diagrams...");
  const validPlays: Array<{ play: PlayRow; document: DiagramDocument }> = [];
  const invalidPlays: Array<{ play: PlayRow; error: string }> = [];

  for (const play of plays) {
    if (!play.diagram_url) continue;

    const document = parseDiagramUrl(play.diagram_url);
    if (document) {
      validPlays.push({ play, document });
    } else {
      invalidPlays.push({
        play,
        error: "Failed to parse or unknown format",
      });
    }
  }

  console.log(`   ✓ Valid: ${validPlays.length}`);
  console.log(`   ✗ Invalid: ${invalidPlays.length}\n`);

  if (invalidPlays.length > 0) {
    console.log("⚠️  Invalid plays (will be skipped):");
    invalidPlays.forEach(({ play, error }) => {
      console.log(`   - ${play.play_name} (${play.id}): ${error}`);
    });
    console.log();
  }

  if (validPlays.length === 0) {
    console.log("❌ No valid plays to migrate");
    return;
  }

  // Step 3: Migrate data (or show dry-run results)
  console.log("Step 3: Migrating data...");

  if (DRY_RUN) {
    console.log("\n📋 DRY RUN RESULTS:\n");
    validPlays.slice(0, 3).forEach(({ play, document }) => {
      console.log(`Play: ${play.play_name}`);
      console.log(`  - Players: ${document.players.length}`);
      console.log(
        `  - Teams: ${document.players.filter((p) => p.team === "offense").length} offense, ${document.players.filter((p) => p.team === "defense").length} defense`
      );
      console.log(`  - Version: ${document.version}\n`);
    });

    if (validPlays.length > 3) {
      console.log(`... and ${validPlays.length - 3} more\n`);
    }

    console.log("✅ Dry run complete. Run without DRY_RUN=true to apply changes.");
    return;
  }

  // Actual migration
  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < validPlays.length; i++) {
    const { play, document } = validPlays[i];
    const progress = `[${i + 1}/${validPlays.length}]`;

    try {
      const { error: updateError } = await supabase
        .from("plays")
        .update({
          diagram_data: document,
          diagram_version: document.version,
        })
        .eq("id", play.id);

      if (updateError) {
        console.error(`${progress} ❌ ${play.play_name}: ${updateError.message}`);
        errorCount++;
      } else {
        console.log(`${progress} ✓ ${play.play_name}`);
        successCount++;
      }
    } catch (err) {
      console.error(
        `${progress} ❌ ${play.play_name}: ${err instanceof Error ? err.message : "Unknown error"}`
      );
      errorCount++;
    }
  }

  // Step 4: Summary
  console.log("\n📊 Migration Summary");
  console.log("===================");
  console.log(`Total plays processed: ${validPlays.length}`);
  console.log(`✅ Successful: ${successCount}`);
  console.log(`❌ Failed: ${errorCount}`);

  if (invalidPlays.length > 0) {
    console.log(`⚠️  Skipped (invalid): ${invalidPlays.length}`);
  }

  console.log("\n✨ Migration complete!\n");
}

// Run migration
migrateDiagrams().catch((err) => {
  console.error("❌ Migration failed:", err);
  process.exit(1);
});
