import { useCallback, useEffect, useRef, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export interface CalendarUrlState {
  view?: "month" | "week" | "day";
  date?: string; // YYYY-MM-DD
  event?: string; // event id
}

interface Options {
  onChange?: (state: CalendarUrlState) => void;
  replaceThresholdMs?: number; // consecutive changes under threshold -> replaceState
}

// Maps internal FullCalendar view names to compact query values
const viewMap: Record<string, CalendarUrlState["view"]> = {
  dayGridMonth: "month",
  timeGridWeek: "week",
  timeGridDay: "day",
};

const reverseViewMap: Record<string, string> = {
  month: "dayGridMonth",
  week: "timeGridWeek",
  day: "timeGridDay",
};

export function mapInternalViewToQuery(
  view: string
): CalendarUrlState["view"] | undefined {
  return viewMap[view];
}
export function mapQueryViewToInternal(
  view: string | undefined
): string | undefined {
  if (!view) return undefined;
  return reverseViewMap[view] || undefined;
}

export function useCalendarUrlState(options: Options = {}) {
  const navigate = useNavigate();
  const location = useLocation();
  const lastPushRef = useRef<number>(0);
  const replaceThreshold = options.replaceThresholdMs ?? 750;

  // Memoize parsed state to prevent unnecessary re-renders
  const state = useMemo((): CalendarUrlState => {
    const params = new URLSearchParams(location.search);
    const view = params.get("view") as CalendarUrlState["view"] | null;
    const date = params.get("date");
    const event = params.get("event");
    return {
      view: (view as CalendarUrlState["view"]) || undefined,
      date: date || undefined,
      event: event || undefined,
    };
  }, [location.search]);

  // Notify changes - only call onChange if it exists and state actually changed
  const prevStateRef = useRef<CalendarUrlState | null>(null);

  useEffect(() => {
    if (!options.onChange) return;

    // Skip if state hasn't meaningfully changed
    const prev = prevStateRef.current;
    if (
      prev &&
      prev.view === state.view &&
      prev.date === state.date &&
      prev.event === state.event
    ) {
      return;
    }

    prevStateRef.current = state;
    options.onChange(state);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- options object changes on every render, only need onChange
  }, [state, options.onChange]);

  const setState = useCallback(
    (patch: CalendarUrlState, replace = false) => {
      const params = new URLSearchParams(location.search);
      // apply patch
      if (patch.view !== undefined) {
        if (patch.view) params.set("view", patch.view);
        else params.delete("view");
      }
      if (patch.date !== undefined) {
        if (patch.date) params.set("date", patch.date);
        else params.delete("date");
      }
      if (patch.event !== undefined) {
        if (patch.event) params.set("event", patch.event);
        else params.delete("event");
      }
      const search = params.toString();
      const next = search ? `?${search}` : "";
      const now = Date.now();
      const shouldReplace =
        replace || now - lastPushRef.current < replaceThreshold;
      if (shouldReplace) {
        navigate(
          { pathname: location.pathname, search: next },
          { replace: true }
        );
      } else {
        navigate(
          { pathname: location.pathname, search: next },
          { replace: false }
        );
        lastPushRef.current = now;
      }
    },
    [location.pathname, location.search, navigate, replaceThreshold]
  );

  return { state, setState };
}
