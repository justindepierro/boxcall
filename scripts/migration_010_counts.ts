#!/usr/bin/env tsx
/**
 * migration_010_counts.ts
 * Pre-migration (010) snapshot of core table row counts & basic integrity checks.
 * Outputs:
 *  - JSON file: migration_010_counts.json (counts + timestamp + simple integrity flags)
 *  - Markdown summary: MIGRATION_010_COUNTS.md
 *  - Console pretty print
 *
 * Intended to be committed prior to drafting Migration 010 SQL.
 */
import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const key =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY;
if (!url || !key) {
  console.error("Missing Supabase env vars (SUPABASE_URL + key).");
  process.exit(1);
}
const supabase = createClient(url, key, { auth: { persistSession: false } });

interface Snapshot {
  timestamp: string;
  counts: Record<string, number>;
  integrity: {
    plays_without_playbook: number;
    orphan_play_counts: number; // plays referencing non-existent playbook (sanity cross check)
    missing_duplicate_key_active: number; // active plays still missing duplicate_key
  };
}

async function count(table: string): Promise<number> {
  const { data, error } = await supabase
    .from(table)
    .select("id", { count: "exact", head: true });
  if (error) throw error;
  return (data as unknown as { length: number } | null)?.length ?? 0;
}

async function main() {
  const tables = [
    "teams",
    "playbooks",
    "plays",
    "practice_scripts",
    "practice_script_plays",
    "game_plans",
    "game_plan_situations",
    "game_plan_plays",
  ];

  const counts: Record<string, number> = {};
  for (const t of tables) {
    counts[t] = await count(t);
  }

  // Integrity: plays referencing non-existent playbook (sanity). Lightweight 2-step.
  const { data: playsRefs, error: playsErr } = await supabase
    .from("plays")
    .select("playbook_id, is_archived, duplicate_key");
  if (playsErr) throw playsErr;
  const { data: playbooksRefs, error: pbErr } = await supabase
    .from("playbooks")
    .select("id");
  if (pbErr) throw pbErr;
  const playbookSet = new Set(
    (playbooksRefs || []).map((r: { id: string }) => r.id)
  );

  let orphanPlayCount = 0;
  let missingDuplicateKeyActive = 0;
  (playsRefs || []).forEach(
    (p: {
      playbook_id: string | null;
      is_archived: boolean;
      duplicate_key: string | null;
    }) => {
      if (!p.playbook_id || !playbookSet.has(p.playbook_id)) orphanPlayCount++;
      if (
        !p.is_archived &&
        (p.duplicate_key === null || p.duplicate_key === undefined)
      )
        missingDuplicateKeyActive++;
    }
  );

  // Cross-check: any playbook with 0 plays but existing play count field >0 (if schema has play_count). Non-fatal.
  // (Optional future expansion)

  const snapshot: Snapshot = {
    timestamp: new Date().toISOString(),
    counts,
    integrity: {
      plays_without_playbook: orphanPlayCount,
      orphan_play_counts: orphanPlayCount, // alias for clarity before refactor
      missing_duplicate_key_active: missingDuplicateKeyActive,
    },
  };

  const outDir = path.resolve(process.cwd(), "docs");
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const jsonPath = path.join(outDir, "migration_010_counts.json");
  fs.writeFileSync(jsonPath, JSON.stringify(snapshot, null, 2) + "\n");

  const mdLines: string[] = [];
  mdLines.push("# Migration 010 Counts Snapshot");
  mdLines.push("");
  mdLines.push(`Timestamp: ${snapshot.timestamp}`);
  mdLines.push("");
  mdLines.push("## Table Row Counts");
  mdLines.push("");
  mdLines.push("| Table | Count |");
  mdLines.push("|-------|-------|");
  for (const t of tables) {
    mdLines.push(`| ${t} | ${counts[t]} |`);
  }
  mdLines.push("");
  mdLines.push("## Integrity Checks");
  mdLines.push("");
  mdLines.push(`- Plays referencing non-existent playbook: ${orphanPlayCount}`);
  mdLines.push(
    `- Active plays missing duplicate_key: ${missingDuplicateKeyActive}`
  );
  mdLines.push("");
  mdLines.push("## Notes");
  mdLines.push(
    "- Commit this file with the JSON snapshot before drafting SQL."
  );
  mdLines.push(
    "- Zero orphan or missing duplicate_key active rows expected before NOT NULL enforcement."
  );
  mdLines.push("");
  const mdPath = path.join(outDir, "MIGRATION_010_COUNTS.md");
  fs.writeFileSync(mdPath, mdLines.join("\n") + "\n");

  console.log("MIGRATION 010 COUNTS SNAPSHOT");
  console.log("------------------------------");
  for (const t of tables) console.log(`${t.padEnd(24)} ${counts[t]}`);
  console.log("---");
  console.log(`Orphan plays (no playbook): ${orphanPlayCount}`);
  console.log(
    `Active plays missing duplicate_key: ${missingDuplicateKeyActive}`
  );
  console.log("\nWritten:");
  console.log(" -", jsonPath);
  console.log(" -", mdPath);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
