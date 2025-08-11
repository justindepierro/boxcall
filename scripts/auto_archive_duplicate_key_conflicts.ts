#!/usr/bin/env ts-node
/**
 * auto_archive_duplicate_key_conflicts.ts
 * Archives surplus rows in each (playbook_id, duplicate_key) cluster (is_archived=false) so only 1 active remains.
 * Canonical selection heuristic (keep):
 *  1. Higher times_called
 *  2. More recent last_used_at (NULL last)
 *  3. More recent updated_at
 *  4. Lowest UUID (stable tie-breaker)
 * Usage:
 *  npx tsx scripts/auto_archive_duplicate_key_conflicts.ts          # perform
 *  npx tsx scripts/auto_archive_duplicate_key_conflicts.ts --dry    # dry run only
 */
import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

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

interface PlayRow {
  id: string;
  playbook_id: string;
  duplicate_key: string;
  is_archived: boolean;
  times_called: number | null;
  last_used_at: string | null;
  updated_at: string | null;
}

const args = process.argv.slice(2);
const dry = args.includes("--dry");

function pickCanonical(rows: PlayRow[]): PlayRow {
  return [...rows].sort((a, b) => {
    const ta = a.times_called ?? 0;
    const tb = b.times_called ?? 0;
    if (tb !== ta) return tb - ta; // desc
    const la = a.last_used_at ? Date.parse(a.last_used_at) : -1;
    const lb = b.last_used_at ? Date.parse(b.last_used_at) : -1;
    if (lb !== la) return lb - la; // desc (null last)
    const ua = a.updated_at ? Date.parse(a.updated_at) : 0;
    const ub = b.updated_at ? Date.parse(b.updated_at) : 0;
    if (ub !== ua) return ub - ua; // desc
    return a.id.localeCompare(b.id); // asc stable
  })[0];
}

async function main() {
  const { data, error } = await supabase
    .from("plays")
    .select(
      "id, playbook_id, duplicate_key, is_archived, times_called, last_used_at, updated_at"
    )
    .not("duplicate_key", "is", null)
    .eq("is_archived", false);
  if (error) throw error;
  const rows = (data as PlayRow[]) || [];
  const clusters = new Map<string, PlayRow[]>();
  for (const r of rows) {
    const key = `${r.playbook_id}__${r.duplicate_key}`;
    if (!clusters.has(key)) clusters.set(key, []);
    clusters.get(key)!.push(r);
  }
  const conflictClusters = [...clusters.entries()].filter(
    ([, arr]) => arr.length > 1
  );
  if (!conflictClusters.length) {
    console.log("No active duplicate conflicts. Nothing to do.");
    return;
  }
  console.log(`Found ${conflictClusters.length} duplicate clusters.`);

  const archiveIds: string[] = [];
  for (const [compound, arr] of conflictClusters) {
    const canonical = pickCanonical(arr);
    const toArchive = arr.filter((r) => r.id !== canonical.id);
    archiveIds.push(...toArchive.map((r) => r.id));
    const [playbook_id, duplicate_key] = compound.split("__");
    console.log(
      `Cluster ${playbook_id} ${duplicate_key}: keeping ${canonical.id}, archiving ${toArchive.map((r) => r.id).join(", ")}`
    );
  }

  if (!archiveIds.length) {
    console.log("Nothing to archive.");
    return;
  }
  if (dry) {
    console.log(`[DRY RUN] Would archive ${archiveIds.length} rows.`);
    return;
  }
  // Batch archive in chunks (safety)
  const chunkSize = 50;
  for (let i = 0; i < archiveIds.length; i += chunkSize) {
    const chunk = archiveIds.slice(i, i + chunkSize);
    const { error: updErr } = await supabase
      .from("plays")
      .update({ is_archived: true })
      .in("id", chunk);
    if (updErr) throw updErr;
  }
  console.log(`Archived ${archiveIds.length} rows.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
