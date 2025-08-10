import { useCallback } from "react";
import type { CalendarEvent } from "../../../domain/calendar/types";

interface UseCalendarActionsArgs {
  profile: { role?: string } | null;
  setIsCreatingEvent: (b: boolean) => void;
  setSelectedEvent: (e: CalendarEvent | null) => void;
  setShowEventModal: (b: boolean) => void;
}

export function useCalendarActions({
  profile,
  setIsCreatingEvent,
  setSelectedEvent,
  setShowEventModal,
}: UseCalendarActionsArgs) {
  const canAddEvent = profile?.role === "coach" || profile?.role === "admin";

  const handleExportCalendar = useCallback(() => {
    alert("Calendar export coming soon");
  }, []);

  const handleAddEvent = useCallback(() => {
    if (!canAddEvent) return;
    setIsCreatingEvent(true);
    setSelectedEvent({
      id: "",
      title: "",
      start: new Date().toISOString(),
      type: "practice",
      created_at: new Date().toISOString(),
    } as CalendarEvent);
    setShowEventModal(true);
  }, [canAddEvent, setIsCreatingEvent, setSelectedEvent, setShowEventModal]);

  return { canAddEvent, handleAddEvent, handleExportCalendar };
}
