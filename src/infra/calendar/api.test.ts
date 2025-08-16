import { describe, it, expect } from "vitest";

import { FullCalendarAdapter } from "../../adapters/fullcalendar/FullCalendarAdapter";

import { CalendarAPI } from "./api";
import { eventToICS } from "./ics";

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

  it("returns null on empty update payload", async () => {
    const created = await CalendarAPI.createEvent({
      title: "Needs Update",
      start: iso(),
      type: "practice",
    });
    const res = await CalendarAPI.updateEvent(created.id, {});
    expect(res).toBeNull();
  });

  it("search matches on location/opponent/description", async () => {
    const results = await CalendarAPI.search("Memorial");
    expect(
      results.find((e) => /memorial/i.test(e.location || ""))
    ).toBeTruthy();
  });

  it("listUserEvents blank slate returns empty", async () => {
    const events = await CalendarAPI.listUserEvents("user-x", "blank_slate");
    expect(events).toEqual([]);
  });

  it("listUserEvents dev profile returns professional dev events", async () => {
    const events = await CalendarAPI.listUserEvents(
      "dev-coach",
      "dev_head_coach"
    );
    expect(events.length).toBeGreaterThan(0);
  });

  it("listUserEvents production branch returns empty (placeholder)", async () => {
    const events = await CalendarAPI.listUserEvents(
      "u-prod",
      "super_admin_real"
    );
    expect(events).toEqual([]);
  });

  it("listUserEvents mock with filters applies tag filter", async () => {
    const events = await CalendarAPI.listUserEvents(
      "u-mock",
      "super_admin_mock",
      { tags: ["homecoming"] }
    );
    expect(events.every((e) => (e.tags || []).includes("homecoming"))).toBe(
      true
    );
  });

  it("listUserEvents default path returns base mock events", async () => {
    const events = await CalendarAPI.listUserEvents("u-default");
    expect(events.length).toBeGreaterThan(0);
  });

  it("listUserEvents filters by teamIds producing empty when mismatch", async () => {
    const events = await CalendarAPI.listUserEvents("u-filter", undefined, {
      teamIds: ["non-existent-team"],
    });
    expect(events).toEqual([]);
  });

  it("listUserEvents filters by eventTypes", async () => {
    const events = await CalendarAPI.listUserEvents("u-filter2", undefined, {
      eventTypes: ["game"],
    });
    expect(events.every((e) => e.type === "game")).toBe(true);
  });

  it("listUserEvents filters by dateRange excluding all", async () => {
    const events = await CalendarAPI.listUserEvents("u-filter3", undefined, {
      dateRange: { start: "2030-01-01T00:00:00Z", end: "2030-01-02T00:00:00Z" },
    });
    expect(events).toEqual([]);
  });

  it("listTeamEvents returns only matching team events", async () => {
    const events = await CalendarAPI.listTeamEvents("team-1");
    expect(events.every((e) => e.team_id === "team-1")).toBe(true);
  });

  it("upcoming returns future events", async () => {
    // Ensure at least one guaranteed future event exists
    const futureStart = new Date(Date.now() + 60_000).toISOString();
    await CalendarAPI.createEvent({
      title: "Future Test",
      start: futureStart,
      type: "practice",
    });
    const events = await CalendarAPI.upcoming("u-upcoming", 2);
    expect(events.length).toBeGreaterThan(0);
    const now = Date.now();
    expect(events.every((e) => new Date(e.start).getTime() >= now)).toBe(true);
  });

  it("deleteEvent returns true", async () => {
    const ok = await CalendarAPI.deleteEvent("evt-del");
    expect(ok).toBe(true);
  });

  it("updateEvent invalid field returns null", async () => {
    // Intentionally pass an invalid ISO string; cast through unknown to avoid any
    const invalidDate = "not-a-date" as unknown as string;
    const res = await CalendarAPI.updateEvent("evt-x", { start: invalidDate });
    expect(res).toBeNull();
  });

  it("getRSVPs returns RSVP list", async () => {
    const list = await CalendarAPI.getRSVPs("evt-rsvp");
    expect(list.length).toBeGreaterThan(0);
  });

  it("comments list returns empty then addComment returns created comment", async () => {
    const initial = await CalendarAPI.listComments("evt-c");
    expect(initial).toEqual([]);
    const added = await CalendarAPI.addComment({
      event_id: "evt-c",
      body: "Test",
    });
    expect(added).toMatchObject({ event_id: "evt-c", body: "Test" });
  });
});
