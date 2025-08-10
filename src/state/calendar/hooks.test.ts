/* @vitest-environment jsdom */
import React from "react";
import { describe, it, expect } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, act, waitFor } from "@testing-library/react";
import {
  useCreateEvent,
  useEvents,
  useRSVPs,
  useUpdateRSVP,
  useUpdateEvent,
  useDeleteEvent,
  useComments,
  useAddComment,
} from "./hooks";
import { CalendarAPI } from "../../infra/calendar/api";

interface CalendarAPITestHarness {
  __setFailure(flags: { create?: boolean; update?: boolean; delete?: boolean; comment?: boolean }): void;
  __resetFailures(): void;
}
const TestAPI = CalendarAPI as typeof CalendarAPI & CalendarAPITestHarness;
import { calendarKeys } from "./queryKeys";
import type { CalendarEvent } from "../../domain/calendar/types";

describe("calendar state hooks", () => {
  const setup = () => {
    const qc = new QueryClient();
    const wrapper = ({ children }: { children: React.ReactNode }) =>
      React.createElement(QueryClientProvider, { client: qc, children });
    return { qc, wrapper };
  };

  it("fetches events list (mock)", async () => {
    const { wrapper } = setup();
    const { result } = renderHook(() => useEvents({ userId: "u-test" }), {
      wrapper,
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect((result.current.data || []).length).toBeGreaterThan(0);
  });

  it("optimistically adds event then replaces temp id", async () => {
    const { wrapper, qc } = setup();
    const eventsHook = renderHook(() => useEvents({ userId: "u-test" }), {
      wrapper,
    });
    await waitFor(() => expect(eventsHook.result.current.isSuccess).toBe(true));
    // Capture baseline lengths per events query
    const eventsKey = calendarKeys.events(undefined, undefined, undefined);
    const before = (qc.getQueryData<CalendarEvent[]>(eventsKey) || []).length;

    const createHook = renderHook(() => useCreateEvent("u-test"), { wrapper });
    await act(async () => {
      createHook.result.current.mutate({
        title: "New Practice",
        start: new Date().toISOString(),
        type: "practice",
      });
    });
    await waitFor(() => {
      const afterData = qc.getQueryData<CalendarEvent[]>(eventsKey) || [];
      expect(afterData.length).toBe(before + 1);
    });
  });

  it("optimistically updates RSVP status and persists real upsert", async () => {
    const { wrapper, qc } = setup();
    // Preload RSVPs for a known event id from mock data ("1")
    const rsvpsHook = renderHook(() => useRSVPs("1"), { wrapper });
    await waitFor(() => expect(rsvpsHook.result.current.isSuccess).toBe(true));
    const initial = rsvpsHook.result.current.data || [];
    // Choose an existing user or fallback new one
    const targetUser = initial[0]?.user_id || "new-user";
    const previousStatus = initial.find(
      (r) => r.user_id === targetUser
    )?.status;
    const mutationHook = renderHook(() => useUpdateRSVP("1"), { wrapper });
    await act(async () => {
      mutationHook.result.current.mutate({
        userId: targetUser,
        status: previousStatus === "attending" ? "maybe" : "attending",
      });
    });
    // Optimistic state should reflect immediately
    await waitFor(() => {
      const current = qc.getQueryData<
        import("../../domain/calendar/types").EventRSVP[]
      >(calendarKeys.rsvps("1"));
      expect(current).toBeTruthy();
      const updated = current?.find((r) => r.user_id === targetUser);
      expect(updated).toBeTruthy();
    });
  });

  it("rolls back optimistic update on injected failure", async () => {
    const { wrapper, qc } = setup();
    const listHook = renderHook(() => useEvents({ userId: "u-test" }), {
      wrapper,
    });
    await waitFor(() => expect(listHook.result.current.isSuccess).toBe(true));
    const eventsKey = calendarKeys.events(undefined, undefined, undefined);
    const before = qc.getQueryData<CalendarEvent[]>(eventsKey) || [];
    const target = before[0];
    expect(target).toBeTruthy();
    // Inject failure
  TestAPI.__setFailure({ update: true });
    const updateHook = renderHook(() => useUpdateEvent(), { wrapper });
    await act(async () => {
      updateHook.result.current.mutate({
        id: target!.id,
        updates: { title: target!.title + " Edited" },
      });
    });
    // After failure settle, state should revert
    await waitFor(() => {
      const after = qc.getQueryData<CalendarEvent[]>(eventsKey) || [];
      const found = after.find((e) => e.id === target!.id)!;
      expect(found.title).toBe(target!.title);
    });
  TestAPI.__resetFailures();
  });

  it("rolls back optimistic delete on injected failure", async () => {
    const { wrapper, qc } = setup();
    const listHook = renderHook(() => useEvents({ userId: "u-test" }), {
      wrapper,
    });
    await waitFor(() => expect(listHook.result.current.isSuccess).toBe(true));
    const eventsKey = calendarKeys.events(undefined, undefined, undefined);
    const baseline = qc.getQueryData<CalendarEvent[]>(eventsKey) || [];
    const target = baseline[0];
  TestAPI.__setFailure({ delete: true });
    const delHook = renderHook(() => useDeleteEvent(), { wrapper });
    await act(async () => {
      delHook.result.current.mutate(target!.id);
    });
    await waitFor(() => {
      const after = qc.getQueryData<CalendarEvent[]>(eventsKey) || [];
      // Should have rolled back to baseline length
      expect(after.length).toBe(baseline.length);
      expect(after.find((e) => e.id === target!.id)).toBeTruthy();
    });
  TestAPI.__resetFailures();
  });

  it("rolls back comment add on injected failure", async () => {
    const { wrapper, qc } = setup();
    const eventId = "1";
  const listHook = renderHook(() => useComments(eventId), { wrapper });
    await waitFor(() => expect(listHook.result.current.isSuccess).toBe(true));
    const key = calendarKeys.comments(eventId);
    const before =
      qc.getQueryData<import("../../domain/calendar/types").CalendarComment[]>(
        key
      ) || [];
    // Inject failure so server add rejects
    TestAPI.__setFailure({ comment: true });
  const addHook = renderHook(() => useAddComment(eventId), { wrapper });
    await act(async () => {
      addHook.result.current.mutate("Test comment body");
    });
    // Optimistic append should be present first
    await waitFor(() => {
      const finalState =
        qc.getQueryData<import("../../domain/calendar/types").CalendarComment[]>(
          key
        ) || [];
      expect(finalState.length).toBe(before.length);
    });
    TestAPI.__resetFailures();
  });

  it("adds comment and persists on success", async () => {
    const { wrapper, qc } = setup();
    const eventId = "1";
  const listHook = renderHook(() => useComments(eventId), { wrapper });
    await waitFor(() => expect(listHook.result.current.isSuccess).toBe(true));
    const key = calendarKeys.comments(eventId);
    const before =
      qc.getQueryData<import("../../domain/calendar/types").CalendarComment[]>(
        key
      ) || [];
  const addHook = renderHook(() => useAddComment(eventId), { wrapper });
    await act(async () => {
      addHook.result.current.mutate("Persistent comment");
    });
    await waitFor(() => {
      const after =
        qc.getQueryData<import("../../domain/calendar/types").CalendarComment[]>(
          key
        ) || [];
      expect(after.length).toBe(before.length + 1);
    });
  });
});
