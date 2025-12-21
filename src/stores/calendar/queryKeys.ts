// Calendar query key factory (compat shim)
// Prefer `queryKeys.calendar*` from `src/lib/queryKeys.ts`.

import { queryKeys } from "../../lib/queryKeys";
export type EventFilters = {
  teamIds?: string[];
  eventTypes?: string[];
  dateRange?: { start: string; end: string };
  tags?: string[];
};

export const calendarKeys = {
  all: queryKeys.calendar,
  events: (
    filters?: EventFilters,
    range?: { start: string; end: string },
    devMode?: string
  ) => queryKeys.calendarEvents(filters, range, devMode),
  event: queryKeys.calendarEvent,
  rsvps: queryKeys.calendarRsvps,
  comments: queryKeys.calendarComments,
};
