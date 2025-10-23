// Calendar query key factory (Phase 3)
// Centralized keys to prevent collisions and enable partial invalidation.
export type EventFilters = {
  teamIds?: string[];
  eventTypes?: string[];
  dateRange?: { start: string; end: string };
  tags?: string[];
};

export const calendarKeys = {
  all: ["calendar"] as const,
  events: (
    filters?: EventFilters,
    range?: { start: string; end: string },
    devMode?: string
  ) =>
    [
      ...calendarKeys.all,
      "events",
      {
        ...(filters || {}),
        range: range ? { s: range.start, e: range.end } : undefined,
        devMode,
      },
    ] as const,
  event: (id: string) => [...calendarKeys.all, "event", id] as const,
  rsvps: (eventId: string) => [...calendarKeys.all, "rsvps", eventId] as const,
  comments: (eventId: string) =>
    [...calendarKeys.all, "comments", eventId] as const,
};
