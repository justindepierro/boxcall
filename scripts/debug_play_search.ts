#!/usr/bin/env tsx
/**
 * scripts/debug_play_search.ts
 * Diagnostic script to inspect play_search_docs state and test queries.
 * Usage: npm run search:debug -- <query>
 */
import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const q = process.argv[2] || "";
const url = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false },
});

async function main() {
  const {
    data: _playsHead,
    error: pcErr,
    count: playsCount,
  } = await supabase.from("plays").select("id", { count: "exact", head: true });
  if (pcErr) throw pcErr;
  const {
    data: _docsHead,
    error: dcErr,
    count: docsCount,
  } = await supabase
    .from("play_search_docs")
    .select("play_id", { count: "exact", head: true });
  if (dcErr) throw dcErr;
  console.log("Counts:", { plays: playsCount, play_search_docs: docsCount });

  const { data: samplePlays, error: spErr } = await supabase
    .from("plays")
    .select("id, play_name, formation, p_type, personnel, tags")
    .limit(10);
  if (spErr) throw spErr;
  console.log("\nSample plays (first 10):");
  console.table(samplePlays);

  const { data: sampleDocs, error: sdErr } = await supabase
    .from("play_search_docs")
    .select("play_id, search_text")
    .limit(10);
  if (sdErr) throw sdErr;
  console.log("\nSample docs (first 10):");
  console.table(sampleDocs);

  if (q) {
    console.log(`\nSearch via RPC search_plays('${q}'):`);
    const { data: searchData, error: searchErr } = await supabase.rpc(
      "search_plays",
      { q, lim: 10 }
    );
    if (searchErr) console.error("RPC search error:", searchErr.message);
    else console.table(searchData);

    console.log(`\nFallback ILIKE search_text ILIKE %${q}%:`);
    const { data: likeData, error: likeErr } = await supabase
      .from("play_search_docs")
      .select("play_id, search_text")
      .ilike("search_text", `%${q}%`)
      .limit(10);
    if (likeErr) console.error("ILIKE error:", likeErr.message);
    else console.table(likeData);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
