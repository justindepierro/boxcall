import { logger } from "./logger";
import { supabase } from "../lib/supabase";
import type { TelemetryEvent, TelemetryContext } from "./types";
import { setTelemetryPersist } from "./dispatcher";

export async function persistEventsBatch(events: TelemetryEvent[]) {
  if (!events.length) return;
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
    const { error } = await supabase.from("events").insert(rows);
    if (error) logger.warn("Telemetry insert failed", { error: error.message });
  } catch (err) {
    logger.warn("Telemetry persistence exception", { err });
  }
}

// Register with dispatcher at module load (optional in SSR)
setTelemetryPersist((events) => {
  void persistEventsBatch(events);
});
