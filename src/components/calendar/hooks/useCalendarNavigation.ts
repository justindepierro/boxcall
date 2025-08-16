import { useEffect, useState } from "react";

import { mapInternalViewToQuery } from "./useCalendarUrlState";

import type { CalendarEvent } from "../../../domain/calendar/types";
import type { BoxCallCalendarRef } from "../BoxCallCalendar";

interface UseCalendarNavigationArgs {
  calendarRef: React.RefObject<BoxCallCalendarRef | null>;
  setUrlState: (
    p: { view?: string; event?: string; date?: string },
    replace?: boolean
  ) => void;
  events: CalendarEvent[];
  profile: { role?: string } | null;
  setSelectedEvent: (e: CalendarEvent | null) => void;
  setShowEventModal: (b: boolean) => void;
  setIsCreatingEvent: (b: boolean) => void;
  setIsEditingEvent: (b: boolean) => void;
}

export function useCalendarNavigation(args: UseCalendarNavigationArgs) {
  const {
    calendarRef,
    setUrlState,
    events: _events,
    profile,
    setSelectedEvent,
    setShowEventModal,
    setIsCreatingEvent,
    setIsEditingEvent: _setIsEditingEvent,
  } = args;
  const [currentView, setCurrentView] = useState<
    "dayGridMonth" | "timeGridWeek" | "timeGridDay"
  >("dayGridMonth");

  useEffect(() => {
    const viewParam = mapInternalViewToQuery(currentView);
    setUrlState({ view: viewParam }, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentView]);

  const handleViewChange = (
    view: "dayGridMonth" | "timeGridWeek" | "timeGridDay"
  ) => {
    setCurrentView(view);
    calendarRef.current?.changeView(view);
    const mapped = mapInternalViewToQuery(view);
    setUrlState({ view: mapped }, true);
  };

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setShowEventModal(true);
    setUrlState({ event: event.id });
  };

  const handleDateSelect = (selectInfo: {
    startStr: string;
    endStr: string;
  }) => {
    if (profile?.role === "coach" || profile?.role === "admin") {
      setIsCreatingEvent(true);
      setSelectedEvent({
        id: "",
        title: "",
        start: selectInfo.startStr,
        end: selectInfo.endStr,
        type: "practice",
        created_at: new Date().toISOString(),
      } as CalendarEvent);
      setShowEventModal(true);
    }
  };

  return {
    currentView,
    setCurrentView,
    handleViewChange,
    handleEventClick,
    handleDateSelect,
  };
}
