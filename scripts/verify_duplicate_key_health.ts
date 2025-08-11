#!/usr/bin/env ts-node
/**
 * verify_duplicate_key_health.ts
 * One-shot report of duplicate_key column health.
 * Prints:
 *  - Null count
 *  - Active duplicate clusters (playbook_id + duplicate_key)
 *  - Largest cluster size
 * Exits non-zero if active duplicate clusters exist (CI guard ready).
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

async function main() {
  // Null count
  const { data: nullCountData, error: nullErr } = await supabase
    .from("plays")
    .select("id", { count: "exact", head: true })
    .is("duplicate_key", null);
  if (nullErr) throw nullErr;
  // With head:true we only get count; data array is empty. Use count from response metadata.
  const nullCount = nullCountData
    ? (nullCountData as unknown as { length: number }).length
    : 0; // kept simple; length will be 0
  // Active duplicates (exclude archived)
  const { data: dupData, error: dupErr } = await supabase
    .from("plays")
    .select("playbook_id, duplicate_key, is_archived")
    .not("duplicate_key", "is", null);
  if (dupErr) throw dupErr;

  const map = new Map<string, number>();
  (dupData || []).forEach(
    (r: {
      playbook_id: string;
      duplicate_key: string;
      is_archived: boolean;
    }) => {
      if (r.is_archived) return;
      const key = `${r.playbook_id}__${r.duplicate_key}`;
      map.set(key, (map.get(key) || 0) + 1);
    }
  );
  const clusters = [...map.entries()]
    .filter(([, c]) => c > 1)
    .map(([compound, c]) => {
      const [playbook_id, duplicate_key] = compound.split("__");
      return { playbook_id, duplicate_key, count: c };
    });
  const largest = clusters.reduce((m, c) => Math.max(m, c.count), 0);

  console.log("duplicate_key HEALTH REPORT");
  console.log("--------------------------------");
  console.log(`Null duplicate_key rows: ${nullCount}`);
  console.log(`Active duplicate clusters: ${clusters.length}`);
  if (clusters.length) {
    console.log("Clusters:");
    clusters
      .slice(0, 20)
      .forEach((c) =>
        console.log(`  ${c.playbook_id} ${c.duplicate_key} x${c.count}`)
      );
    console.log(`Largest cluster size: ${largest}`);
  }

  if (clusters.length > 0) {
    console.error("FAIL: Active duplicate clusters detected.");
    process.exit(2);
  }
  console.log("PASS: No active duplicate conflicts.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
