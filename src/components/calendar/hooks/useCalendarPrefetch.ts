import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";

import { CalendarAPI } from "../../../infra/calendar/api";
import { calendarKeys } from "../../../stores/calendar/queryKeys";

import type { CalendarFilters } from "../../../domain/calendar/types";
import type { BoxCallCalendarRef } from "../BoxCallCalendar";

interface PrefetchArgs {
  calendarRef: React.RefObject<BoxCallCalendarRef | null>;
  currentView: "dayGridMonth" | "timeGridWeek" | "timeGridDay";
  filters: CalendarFilters;
  userId: string;
  devMode?: string;
  setUrlState: (s: { date?: string }) => void;
  events: unknown[]; // trigger on events change only
}

export function useCalendarPrefetch({
  calendarRef,
  currentView,
  filters,
  userId,
  devMode,
  setUrlState,
  events,
}: PrefetchArgs) {
  const queryClient = useQueryClient();
  const lastDateRef = useRef<string | null>(null);

  useEffect(() => {
    const api = calendarRef.current?.getApi?.();
    if (!api) return;
    const handler = () => {
      const date = api.getDate();
      const iso = date.toISOString().split("T")[0];

      // Only update URL state if the date actually changed
      if (lastDateRef.current !== iso) {
        lastDateRef.current = iso;
        setUrlState({ date: iso });
      }

      if (currentView === "dayGridMonth") {
        const year = date.getFullYear();
        const month = date.getMonth();
        const startPrev = new Date(year, month - 1, 1);
        const startNext = new Date(year, month + 1, 1);
        const endPrev = new Date(year, month, 0);
        const endNext = new Date(year, month + 2, 0);
        const toISO = (d: Date) => d.toISOString().split("T")[0];
        const ranges = [
          { start: toISO(startPrev), end: toISO(endPrev) },
          { start: toISO(startNext), end: toISO(endNext) },
        ];
        ranges.forEach((r) => {
          queryClient.prefetchQuery({
            queryKey: calendarKeys.events(
              { ...filters, dateRange: { start: r.start, end: r.end } },
              r,
              devMode ? "1" : undefined
            ),
            queryFn: () =>
              CalendarAPI.listUserEvents(userId, devMode, {
                ...filters,
                dateRange: { start: r.start, end: r.end },
              }),
            staleTime: 60_000,
          });
        });
      }
    };
    handler();
    const id = setInterval(handler, 5000);
    return () => clearInterval(id);
  }, [
    calendarRef,
    currentView,
    filters,
    userId,
    devMode,
    setUrlState,
    queryClient,
    events,
  ]);
}
