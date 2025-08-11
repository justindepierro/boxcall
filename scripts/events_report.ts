#!/usr/bin/env tsx
/**
 * events_report.ts
 * Simple inspection script: prints recent event counts by type + sample payload.
 */
import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

// CLI args: --limit N (default 200), --since minutes (default 60)
const args = process.argv.slice(2);
function getArg(name: string, fallback: string | null = null) {
  const idx = args.indexOf(name);
  if (idx !== -1 && args[idx + 1]) return args[idx + 1];
  return fallback;
}
const limit = parseInt(getArg("--limit", "200")!, 10);
const sinceMinutes = parseInt(getArg("--since", "60")!, 10);
const sinceIso = new Date(Date.now() - sinceMinutes * 60000).toISOString();

const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const key =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY;
if (!url || !key) {
  console.error("Missing Supabase env vars for events report.");
  process.exit(1);
}
const supabase = createClient(url, key, { auth: { persistSession: false } });

async function main() {
  const query = supabase
    .from("events")
    .select("type, payload, ts, session_id")
    .gte("ts", sinceIso)
    .order("ts", { ascending: false })
    .limit(limit);
  const { data, error } = await query;
  if (error) throw error;
  const grouped: Record<string, { count: number; sample?: unknown }> = {};
  let suggestionShown = 0;
  let suggestionAccept = 0;
  const acceptPositions: number[] = [];
  const vitals: Record<string, number[]> = {};
  const sessions: Record<string, number> = {};
  (data || []).forEach((r) => {
    if (!grouped[r.type]) grouped[r.type] = { count: 0 };
    grouped[r.type].count++;
    if (!grouped[r.type].sample) grouped[r.type].sample = r.payload;
    if (r.session_id)
      sessions[r.session_id] = (sessions[r.session_id] || 0) + 1;
    if (r.type.startsWith("vital:")) {
      try {
        const parsed =
          typeof r.payload === "string" ? JSON.parse(r.payload) : r.payload;
        const val = parsed?.value;
        if (typeof val === "number") {
          const key = r.type.split(":")[1];
          if (!vitals[key]) vitals[key] = [];
          vitals[key].push(val);
        }
      } catch {
        // ignore malformed payload
      }
    }
    if (r.type === "suggestion:shown") {
      suggestionShown++;
    }
    if (r.type === "suggestion:accept") {
      suggestionAccept++;
      try {
        const parsed =
          typeof r.payload === "string" ? JSON.parse(r.payload) : r.payload;
        const pos = parsed?.position;
        if (typeof pos === "number") acceptPositions.push(pos);
      } catch {
        /* ignore */
      }
    }
  });
  console.log(`EVENTS REPORT (limit=${limit}, since=${sinceMinutes}m)`);
  console.log("--------------------------------");
  Object.entries(grouped)
    .sort((a, b) => b[1].count - a[1].count)
    .forEach(([type, meta]) => {
      console.log(type.padEnd(32), "x" + meta.count);
    });
  if (Object.keys(vitals).length) {
    console.log("\nWeb Vitals Summary:");
    Object.entries(vitals).forEach(([name, values]) => {
      values.sort((a, b) => a - b);
      const avg = values.reduce((s, v) => s + v, 0) / values.length;
      const pick = (p: number) =>
        values[Math.min(values.length - 1, Math.floor(values.length * p))];
      const p75 = pick(0.75);
      const p95 = pick(0.95);
      console.log(
        `  ${name.padEnd(6)} n=${values.length} avg=${avg.toFixed(2)} p75=${p75.toFixed(2)} p95=${p95.toFixed(2)}`
      );
    });
  }
  if (Object.keys(sessions).length) {
    console.log("\nTop Sessions (by event count):");
    Object.entries(sessions)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .forEach(([sid, count]) => console.log(`  ${sid}: ${count}`));
  }
  if (suggestionShown || suggestionAccept) {
    const rate = suggestionShown
      ? ((suggestionAccept / suggestionShown) * 100).toFixed(1)
      : "0.0";
    const avgPos = acceptPositions.length
      ? (
          acceptPositions.reduce((s, v) => s + v, 0) / acceptPositions.length
        ).toFixed(2)
      : "-";
    console.log("\nSuggestion Metrics:");
    console.log(`  shown events: ${suggestionShown}`);
    console.log(`  accept events: ${suggestionAccept}`);
    console.log(`  accept rate: ${rate}%`);
    console.log(`  avg accepted position: ${avgPos}`);
  }
  console.log("\nSamples:");
  Object.entries(grouped)
    .slice(0, 5)
    .forEach(([type, meta]) => {
      console.log(`\n# ${type}`);
      console.log(JSON.stringify(meta.sample, null, 2));
    });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
