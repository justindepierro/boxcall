#!/usr/bin/env node

/**
 * Quick script to check formation direction fields for a specific play.
 *
 * Usage:
 *   node scripts/cli/check-play-direction-db.js <play_id>
 *
 * Requires:
 *   VITE_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY (recommended; bypasses RLS)
 *   (or VITE_SUPABASE_ANON_KEY if RLS allows access)
 */

import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";

config({ path: ".env.local" });
config(); // Also load .env

const playId = process.argv[2];

if (!playId) {
  console.error("❌ Missing play_id argument");
  console.log(
    "\nUsage:\n  node scripts/cli/check-play-direction-db.js <play_id>\n"
  );
  process.exit(1);
}

const url = process.env.VITE_SUPABASE_URL;
const key =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.VITE_SUPABASE_SERVICE_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error("❌ Missing Supabase credentials in .env/.env.local");
  console.log("\nAdd at least:");
  console.log("  VITE_SUPABASE_URL=...");
  console.log("  VITE_SUPABASE_ANON_KEY=...\n");
  console.log("Recommended (bypasses RLS):");
  console.log("  SUPABASE_SERVICE_ROLE_KEY=...\n");
  process.exit(1);
}

const usingServiceRole = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);

const supabase = createClient(url, key, {
  auth: { autoRefreshToken: false, persistSession: false },
});

function printField(label, value) {
  const val =
    value === undefined
      ? "<undefined>"
      : value === null
        ? "<null>"
        : JSON.stringify(value);
  console.log(`${label}: ${val}`);
}

async function main() {
  console.log("\n🔎 Checking play direction in DB");
  console.log(`URL: ${url}`);
  console.log(
    `Auth: ${usingServiceRole ? "service role" : "anon (RLS may restrict)"}`
  );
  console.log("─".repeat(60));

  const { data: play, error } = await supabase
    .from("plays")
    .select(
      [
        "id",
        "playbook_id",
        "formation",
        "play_name",
        "f_dir",
        "formation_id",
        "formation_direction",
        "updated_at",
      ].join(",")
    )
    .eq("id", playId)
    .maybeSingle();

  if (error) {
    console.error("\n❌ Error fetching play:");
    console.error(error);
    process.exit(1);
  }

  if (!play) {
    console.log("\n❌ No play found for id:", playId);
    process.exit(1);
  }

  console.log("\n✅ Play row:");
  printField("id", play.id);
  printField("playbook_id", play.playbook_id);
  printField("formation", play.formation);
  printField("play_name", play.play_name);
  printField("f_dir", play.f_dir);
  printField("formation_direction", play.formation_direction);
  printField("formation_id", play.formation_id);
  printField("updated_at", play.updated_at);

  if (play.formation_id) {
    const { data: formation, error: formationError } = await supabase
      .from("formations")
      .select("id, name, direction, opposite_formation_id, updated_at")
      .eq("id", play.formation_id)
      .maybeSingle();

    if (formationError) {
      console.error("\n⚠️ Error fetching linked formation:");
      console.error(formationError);
      return;
    }

    console.log("\n🔗 Linked formation row:");
    if (!formation) {
      console.log("<not found>");
      return;
    }

    printField("id", formation.id);
    printField("name", formation.name);
    printField("direction", formation.direction);
    printField("opposite_formation_id", formation.opposite_formation_id);
    printField("updated_at", formation.updated_at);
  } else {
    console.log(
      "\nℹ️ formation_id is null; this play is not linked to formations table."
    );
  }

  console.log("\nDone.\n");
}

main().catch((e) => {
  console.error("\n❌ Unexpected error:");
  console.error(e);
  process.exit(1);
});
