import { describe, it, expect } from "vitest";
import { FullCalendarAdapter } from "./FullCalendarAdapter";

describe("FullCalendarAdapter edge cases", () => {
  it("round-trips optional fields and tags", () => {
    const domainEvent = {
      id: "edge-1",
      title: "Edge Event",
      start: new Date().toISOString(),
      end: undefined,
      type: "other" as const,
      team_id: undefined,
      location: "Field",
      rsvp_required: true,
      tags: ["a", "b"],
    };
    const fc = FullCalendarAdapter.toFullCalendar(domainEvent);
    expect(fc.extendedProps?.tags).toEqual(["a", "b"]);
    const back = FullCalendarAdapter.fromFullCalendar(fc);
    expect(back.tags).toEqual(["a", "b"]);
    expect(back.type).toBe("other");
  });

  it("falls back type to other when missing", () => {
    const raw = {
      id: "x",
      title: "No Type",
      start: new Date().toISOString(),
      extendedProps: {},
    };
    const back = FullCalendarAdapter.fromFullCalendar(raw);
    expect(back.type).toBe("other");
  });
});
