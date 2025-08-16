#!/usr/bin/env ts-node
/** Node-friendly version of duplicate_key backfill (dry + execute) that reads .env directly */
import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

import { computeDuplicateKey } from "../src/utils/playDataStandardization";

const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const key =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY;
if (!url || !key) {
  console.error(
    "Missing SUPABASE_URL and/or key env vars (SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY)."
  );
  process.exit(1);
}
const supabase = createClient(url, key, { auth: { persistSession: false } });

interface PlayRow {
  id: string;
  play_name: string | null;
  formation: string | null;
  duplicate_key?: string | null;
}

async function loadPlays(): Promise<PlayRow[]> {
  const { data, error } = await supabase
    .from("plays")
    .select("id, play_name, formation, duplicate_key")
    .is("duplicate_key", null); // only rows needing update
  if (error) throw error;
  return data as PlayRow[];
}

function group(rows: PlayRow[]) {
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
  const g = group(rows);
  const clusters = [...g.entries()].filter(([, arr]) => arr.length > 1);
  console.log(`Clusters >1: ${clusters.length}`);
  let largest = 0;
  let largestKey = "";
  for (const [k, arr] of clusters) {
    if (arr.length > largest) {
      largest = arr.length;
      largestKey = k;
    }
  }
  console.log(`Largest cluster size: ${largest} (${largestKey})`);
  console.log("First 15 clusters:");
  for (const [k, arr] of clusters.slice(0, 15)) {
    console.log(`  ${k} -> ${arr.map((r) => r.id).join(",")}`);
  }
}

async function execute(rows: PlayRow[]) {
  let updated = 0;
  for (const r of rows) {
    // Skip pathological empty records (both name & formation missing)
    if (!r.play_name && !r.formation) {
      console.warn(`Skipping row ${r.id} (no play_name & no formation)`);
      continue;
    }
    const duplicate_key = computeDuplicateKey({
      play_name: r.play_name || undefined,
      formation: r.formation || undefined,
    });
    const { error } = await supabase
      .from("plays")
      .update({ duplicate_key })
      .eq("id", r.id);
    if (error) throw error;
    updated++;
    if (updated % 50 === 0) process.stdout.write(`Updated ${updated}\r`);
  }
  console.log(`\nDone. Updated ${updated}`);
}

async function main() {
  const dry = process.argv.includes("--dry");
  const rows = await loadPlays();
  console.log(`Rows needing duplicate_key: ${rows.length}`);
  if (dry) await dryRun(rows);
  else await execute(rows);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
