#!/usr/bin/env ts-node
/**
 * duplicate_key_readiness.ts
 * Readiness gate for enforcing NOT NULL on plays.duplicate_key.
 * Outputs summary + READY/BLOCKED decision.
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
  const { data: totalData, error: totalErr } = await supabase
    .from("plays")
    .select("id", { count: "exact", head: true });
  if (totalErr) throw totalErr;
  const total =
    (totalData as unknown as { length: number } | null)?.length ?? 0;

  const { data: nullActiveRows, error: nullActiveErr } = await supabase
    .from("plays")
    .select("id, updated_at")
    .is("duplicate_key", null)
    .eq("is_archived", false);
  if (nullActiveErr) throw nullActiveErr;

  const { data: nullAllRows, error: nullAllErr } = await supabase
    .from("plays")
    .select("id, updated_at, is_archived")
    .is("duplicate_key", null);
  if (nullAllErr) throw nullAllErr;

  const nullActiveCount = nullActiveRows?.length ?? 0;
  const nullAllCount = nullAllRows?.length ?? 0;
  const pctNullAll = total ? ((nullAllCount / total) * 100).toFixed(2) : "0.00";
  const pctNullActive = total
    ? ((nullActiveCount / total) * 100).toFixed(4)
    : "0.0000";
  const oldest = (nullActiveRows || [])
    .map((r) =>
      r.updated_at ? Date.parse(r.updated_at as unknown as string) : Date.now()
    )
    .sort((a, b) => a - b)[0];
  const oldestIso = oldest ? new Date(oldest).toISOString() : "n/a";

  console.log("duplicate_key NOT NULL READINESS");
  console.log("--------------------------------");
  console.log(`Total plays: ${total}`);
  console.log(`Null duplicate_key (all): ${nullAllCount} (${pctNullAll}%)`);
  console.log(
    `Null duplicate_key (active only): ${nullActiveCount} (${pctNullActive}%)`
  );
  console.log(`Oldest updated_at among active nulls: ${oldestIso}`);

  if (nullActiveCount === 0) {
    console.log("READY: Safe to stage NOT NULL migration.");
    process.exit(0);
  } else {
    console.error("BLOCKED: Active rows still missing duplicate_key.");
    process.exit(3);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
