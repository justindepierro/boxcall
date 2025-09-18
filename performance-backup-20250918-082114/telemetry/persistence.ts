import { logger } from "./logger";
import { createClient } from "@supabase/supabase-js";
import type { TelemetryEvent, TelemetryContext } from "./types";
import { setTelemetryPersist } from "./dispatcher";

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
    if (error) logger.warn("Telemetry insert failed", { error: error.message });
  } catch (err) {
    logger.warn("Telemetry persistence exception", { err });
  }
}

// Register with dispatcher at module load (optional in SSR)
setTelemetryPersist((events) => {
  void persistEventsBatch(events);
});
