#!/usr/bin/env ts-node
/**
 * backfill_duplicate_key.ts
 * Dry-run & execution script to populate plays.duplicate_key using computeDuplicateKey.
 * Usage:
 *  DRY RUN:   ts-node scripts/backfill_duplicate_key.ts --dry
 *  EXECUTE:   ts-node scripts/backfill_duplicate_key.ts
 */
import { supabase } from "../src/lib/supabase";
import { computeDuplicateKey } from "../src/utils/playDataStandardization";

interface PlayRow {
  id: string;
  play_name: string | null;
  formation: string | null;
  duplicate_key?: string | null;
  team_id?: string | null;
}

async function loadPlays(): Promise<PlayRow[]> {
  const { data, error } = await supabase
    .from("plays")
    .select("id, play_name, formation, duplicate_key, team_id");
  if (error) throw error;
  return data as PlayRow[];
}

function groupByDuplicateKey(rows: PlayRow[]) {
  const map = new Map<string, PlayRow[]>();
  for (const r of rows) {
    const key = computeDuplicateKey({
      play_name: r.play_name || undefined,
      formation: r.formation || undefined,
    });
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(r);
  }
  return map;
}

async function dryRun(rows: PlayRow[]) {
  const groups = groupByDuplicateKey(rows);
  const clusters = [...groups.entries()].filter(([, arr]) => arr.length > 1);
  console.log(
    `Found ${clusters.length} potential duplicate clusters (>1 play sharing key)`
  );
  for (const [key, arr] of clusters.slice(0, 20)) {
    console.log(`Key: ${key} -> ${arr.map((p) => p.id).join(", ")}`);
  }
  console.log("(Showing up to first 20 clusters; run with --full to list all)");
}

async function execute(rows: PlayRow[]) {
  let updated = 0;
  for (const batch of chunk(rows, 200)) {
    const updates = batch.map((r) => ({
      id: r.id,
      duplicate_key: computeDuplicateKey({
        play_name: r.play_name || undefined,
        formation: r.formation || undefined,
      }),
    }));
    const { error } = await supabase
      .from("plays")
      .upsert(updates, { onConflict: "id" });
    if (error) throw error;
    updated += updates.length;
    process.stdout.write(`Updated ${updated}\r`);
  }
  console.log(`\nBackfill complete. Updated ${updated} rows.`);
}

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

async function main() {
  const dry = process.argv.includes("--dry");
  const rows = await loadPlays();
  if (dry) {
    await dryRun(rows);
  } else {
    await execute(rows);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
