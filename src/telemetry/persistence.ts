import { createClient } from "@supabase/supabase-js";

import type { TelemetryEvent } from "./dispatcher";

interface TelemetryContext {
  session_id?: string;
  trace_id?: string;
  user_id?: string;
  [k: string]: unknown;
}

let supabaseClient: ReturnType<typeof createClient> | null = null;

function getClient() {
  if (supabaseClient) return supabaseClient;
  const meta: unknown = import.meta as unknown;
  const env = (meta as { env?: Record<string, string | undefined> }).env || {};
  const url = env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const key = env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
  if (!url || !key) return null; // fail open (no persistence)
  supabaseClient = createClient(url, key, { auth: { persistSession: true } });
  return supabaseClient;
}

export async function persistEventsBatch(events: TelemetryEvent[]) {
  const client = getClient();
  if (!client || !events.length) return;
  // Map to DB row shape
  const rows = events.map((e) => {
    const ctx = (e.context || {}) as TelemetryContext;
    return {
      ts: new Date(e.ts).toISOString(),
      type: e.type,
      payload: e.data ? JSON.stringify(e.data) : null,
      session_id: ctx.session_id,
      trace_id: ctx.trace_id,
      user_id: ctx.user_id || null,
    };
  });
  try {
    const { error } = await client.from("events").insert(rows);
    if (error) {
      // Soft fail; could push to retry queue (future)
      console.warn("Telemetry insert failed", error.message);
    }
  } catch (err) {
    console.warn("Telemetry persistence exception", err);
  }
}
