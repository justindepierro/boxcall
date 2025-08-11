#!/usr/bin/env tsx
/**
 * scripts/migration_010_verify.ts
 * Verifies post-execution state of Migration 010 (play data normalization) using Supabase client.
 */
import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  console.error(
    "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment."
  );
  process.exit(1);
}

interface PlayRow {
  id: string;
  playbook_id: string;
  duplicate_key: string | null;
  is_archived: boolean;
}

const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false },
});

async function fetchAllActivePlays(
  batch = 1000,
  max = 20000
): Promise<PlayRow[]> {
  const rows: PlayRow[] = [];
  let from = 0;
  while (from < max) {
    const to = from + batch - 1;
    const { data, error } = await supabase
      .from("plays")
      .select("id,playbook_id,duplicate_key,is_archived")
      .eq("is_archived", false)
      .range(from, to);
    if (error) throw error;
    if (!data || data.length === 0) break;
    rows.push(...(data as PlayRow[]));
    if (data.length < batch) break; // last page
    from += batch;
  }
  return rows;
}

async function main() {
  const start = Date.now();
  const rows = await fetchAllActivePlays();
  const activeCount = rows.length;
  const nullDuplicate = rows.filter(
    (r) => !r.duplicate_key || r.duplicate_key.trim() === ""
  ).length;

  const clusterMap = new Map<string, number>();
  for (const r of rows) {
    const key = `${r.playbook_id}::${r.duplicate_key}`;
    if (!r.duplicate_key) continue;
    clusterMap.set(key, (clusterMap.get(key) || 0) + 1);
  }
  const duplicateClusters = Array.from(clusterMap.values()).filter(
    (c) => c > 1
  ).length;

  const summary = {
    scanned: activeCount,
    nullDuplicateKey: nullDuplicate,
    duplicateClusters,
    passed: nullDuplicate === 0 && duplicateClusters === 0,
    durationMs: Date.now() - start,
    timestamp: new Date().toISOString(),
  };
  console.log(JSON.stringify(summary, null, 2));
  if (!summary.passed) {
    console.error("\n[FAIL] Migration 010 verification failed.");
    process.exit(1);
  }
  console.log("\n[OK] Migration 010 verification passed.");
}

main().catch((e) => {
  console.error("Verification error:", e.message || e);
  process.exit(1);
});
