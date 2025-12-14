// ICS generation (Phase 2 prototype)
// Minimal single-event ICS producer; expand later for feeds.
import type { CalendarEvent } from "../../domain/calendar/types";

export function eventToICS(event: CalendarEvent): string {
  const dtStamp = `${
    new Date().toISOString().replace(/-/g, "").replace(/:/g, "").split(".")[0]
  }Z`;
  const start = `${event.start.replace(/-/g, "").replace(/:/g, "").split(".")[0]}Z`;
  const end = `${
    (event.end ?? event.start).replace(/-/g, "").replace(/:/g, "").split(".")[0]
  }Z`;
  const uid = `${event.id}@boxcall`;
  const summary = escapeICS(event.title);
  const location = event.location
    ? `\nLOCATION:${escapeICS(event.location)}`
    : "";
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//BoxCall//Calendar 1.0//EN",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `DTSTAMP:${dtStamp}`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `UID:${uid}`,
    `SUMMARY:${summary}${location}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\n");
}

function escapeICS(str: string): string {
  return str
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}
