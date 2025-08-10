import { describe, it, expect } from "vitest";
import { eventToICS } from "./ics";

describe("ICS generator", () => {
  it("produces minimal valid VCALENDAR content", () => {
    const ics = eventToICS({
      id: "evt-ics",
      title: "ICS Event",
      start: new Date().toISOString(),
      type: "practice",
    });
    expect(ics).toMatch(/BEGIN:VCALENDAR/);
    expect(ics).toMatch(/UID:evt-ics@boxcall/);
    expect(ics).toMatch(/DTSTART:/);
    expect(ics).toMatch(/SUMMARY:ICS Event/);
  });

  it("escapes commas, semicolons, backslashes, and newlines", () => {
    const ics = eventToICS({
      id: "evt-escape",
      title: "Title, With; Special\\Chars\nNextLine",
      start: new Date().toISOString(),
      type: "other",
    });
    expect(ics).toMatch(/SUMMARY:Title\\, With\\; Special\\\\Chars\\nNextLine/);
  });
});
