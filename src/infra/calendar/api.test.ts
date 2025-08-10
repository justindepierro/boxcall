import { describe, it, expect } from "vitest";
import { CalendarAPI } from "./api";
import { eventToICS } from "./ics";
import { FullCalendarAdapter } from "../../adapters/fullcalendar/FullCalendarAdapter";

const iso = () => new Date().toISOString();

describe("Calendar Infra Phase 2 scaffolding", () => {
  it("creates event via API and converts to FullCalendar & ICS", async () => {
    const created = await CalendarAPI.createEvent({
      title: "Adapter Test",
      start: iso(),
      type: "practice",
    });
    expect(created).not.toBeNull();
    if (!created) return;
    const fc = FullCalendarAdapter.toFullCalendar(created);
    expect(fc.id).toBe(created.id);
    const domainAgain = FullCalendarAdapter.fromFullCalendar(fc);
    expect(domainAgain.title).toBe(created.title);
    const ics = eventToICS(created);
    expect(ics).toMatch(/BEGIN:VCALENDAR/);
    expect(ics).toMatch(/SUMMARY:Adapter Test/);
  });
});
