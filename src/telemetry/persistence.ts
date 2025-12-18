import type { TelemetryEvent } from "./types";
import { setTelemetryPersist } from "./dispatcher";

export async function persistEventsBatch(events: TelemetryEvent[]) {
  // Current production schema does not expose a telemetry/events table via PostgREST.
  // Keep this as a no-op to avoid crashing type-check/builds; telemetry is still
  // collected client-side and can be wired up to a dedicated table later.
  void events;
}

// Register with dispatcher at module load (optional in SSR)
setTelemetryPersist((events) => {
  void persistEventsBatch(events);
});
