import { describe, it, expect } from "vitest";
import { parseEventRSVPs } from "../domain/calendar/schema";
import { CalendarAPI } from "../infra/calendar/api";
import type { CalendarEventCreate } from "../domain/calendar/types";

// Helpers
const iso = () => new Date().toISOString();

describe("Calendar API & schema negative cases", () => {
  it("rejects invalid RSVP objects", () => {
    expect(() =>
      parseEventRSVPs([{ id: "r1" } as unknown as Record<string, unknown>])
    ).toThrow();
  });

  it("rejects when creating event with invalid payload (empty title)", async () => {
    const invalidCreate = {
      title: "",
      start: iso(),
      type: "practice",
    } as unknown as CalendarEventCreate;
    await expect(CalendarAPI.createEvent(invalidCreate)).rejects.toBeTruthy();
  });

  it("returns null when updating event with invalid field values (bad type)", async () => {
    const invalidUpdate = {
      type: "not_a_real_type",
    } as unknown as Partial<CalendarEventCreate>;
    const result = await CalendarAPI.updateEvent("evt-1", invalidUpdate);
    expect(result).toBeNull();
  });
});
