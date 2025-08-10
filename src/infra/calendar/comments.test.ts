import { describe, it, expect } from "vitest";
import { CalendarComments } from "./comments";

describe("CalendarComments infra", () => {
  it("lists empty comments array", async () => {
    const list = await CalendarComments.list("evt-1");
    expect(list).toEqual([]);
  });
  it("adds comment", async () => {
    const c = await CalendarComments.add({
      event_id: "evt-9",
      body: "Nice practice",
    });
    expect(c.body).toBe("Nice practice");
    expect(c.event_id).toBe("evt-9");
  });
});
