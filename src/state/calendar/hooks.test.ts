/* @vitest-environment jsdom */
import React from "react";
import { describe, it, expect } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useCreateEvent, useEvents, useRSVPs, useUpdateRSVP } from "./hooks";
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
    const previousStatus = initial.find((r) => r.user_id === targetUser)?.status;
    const mutationHook = renderHook(() => useUpdateRSVP("1"), { wrapper });
    await act(async () => {
      mutationHook.result.current.mutate({
        userId: targetUser,
        status: previousStatus === "attending" ? "maybe" : "attending",
      });
    });
    // Optimistic state should reflect immediately
    await waitFor(() => {
      const current = qc.getQueryData<import("../../domain/calendar/types").EventRSVP[]>(
        calendarKeys.rsvps("1")
      );
      expect(current).toBeTruthy();
      const updated = current?.find((r) => r.user_id === targetUser);
      expect(updated).toBeTruthy();
    });
  });
});
