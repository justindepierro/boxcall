// FullCalendarAdapter (Phase 2)
// Translates domain CalendarEvent <-> FullCalendar event input object.
import type { CalendarEvent } from "../../domain/calendar/types";

export interface FullCalendarEventLike {
  id: string;
  title: string;
  start: string | Date;
  end?: string | Date;
  extendedProps?: Record<string, unknown>;
}

export const FullCalendarAdapter = {
  toFullCalendar(event: CalendarEvent): FullCalendarEventLike {
    return {
      id: event.id,
      title: event.title,
      start: event.start,
      end: event.end,
      extendedProps: {
        type: event.type,
        team_id: event.team_id,
        location: event.location,
        rsvp_required: event.rsvp_required,
        tags: event.tags,
      },
    };
  },
  fromFullCalendar(raw: FullCalendarEventLike): CalendarEvent {
    return {
      id: raw.id,
      title: raw.title,
      start:
        typeof raw.start === "string" ? raw.start : raw.start.toISOString(),
      end: raw.end
        ? typeof raw.end === "string"
          ? raw.end
          : raw.end.toISOString()
        : undefined,
      type: (raw.extendedProps?.type as CalendarEvent["type"]) ?? "other",
      team_id: raw.extendedProps?.team_id as string | undefined,
      location: raw.extendedProps?.location as string | undefined,
      rsvp_required: raw.extendedProps?.rsvp_required as boolean | undefined,
      tags: raw.extendedProps?.tags as string[] | undefined,
    };
  },
};
