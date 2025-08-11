#!/usr/bin/env tsx
/**
 * scripts/search_plays.ts
 * CLI helper to query play search docs.
 * Usage: npm run search:plays -- "query string" [limit]
 */
import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

// Parse args: search_plays <query> [limit] [--playbook=<uuid>]
const args = process.argv.slice(2);
const query = args[0];
let limit = 10;
let playbook: string | undefined;
if (args[1] && !args[1].startsWith("--")) limit = parseInt(args[1], 10) || 10;
for (const a of args.slice(1)) {
  if (a.startsWith("--playbook=")) playbook = a.split("=")[1];
  if (a === "-p") {
    const idx = args.indexOf(a);
    if (idx >= 0 && args[idx + 1]) playbook = args[idx + 1];
  }
}

if (!query) {
  console.error(
    "Usage: search_plays <query> [limit] [--playbook=<uuid>|-p <uuid>]"
  );
  process.exit(1);
}

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
  const { data, error } = await supabase.rpc("search_plays", {
    q: query,
    lim: limit,
    playbook,
  });
  if (error) {
    console.error("Search error:", error.message);
    process.exit(1);
  }
  console.log(
    `Results (${data?.length || 0})${playbook ? ` for playbook ${playbook}` : ""}:`
  );
  interface SearchResult {
    play_id: string;
    rank: number;
  }
  ((data as SearchResult[] | null) || []).forEach(
    (r: SearchResult, i: number) => {
      console.log(`${i + 1}. ${r.play_id} (rank=${Number(r.rank).toFixed(3)})`);
    }
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
