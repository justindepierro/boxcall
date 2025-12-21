import type { TelemetryEvent } from "./types";
import { setTelemetryPersist } from "./dispatcher";
import { analyticsService } from "../services/analytics/AnalyticsService";

export async function persistEventsBatch(events: TelemetryEvent[]) {
  // Current production schema does not expose a telemetry/events table via PostgREST.
  // For now, normalize everything through the existing AnalyticsService so we have
  // one event schema and one dispatcher path.

  await Promise.all(
    events.map(async (event) => {
      const properties = {
        ...(event.data ?? {}),
        ...(event.context ?? {}),
        ts: event.ts,
      } as Record<string, unknown>;

      // Preserve page-view semantics (GA/PostHog treat page views differently than events)
      if (event.type === "page_view") {
        let path: string | undefined;
        const data = event.data as Record<string, unknown> | undefined;

        if (typeof data?.path === "string") {
          path = data.path;
        } else if (typeof data?.page === "string") {
          path = data.page;
        }

        if (path) {
          await analyticsService.trackPageView(path, properties);
          return;
        }
      }

      await analyticsService.trackEvent(event.type, properties);
    })
  );
}

// Register with dispatcher at module load (optional in SSR)
setTelemetryPersist((events) => {
  void persistEventsBatch(events);
});
