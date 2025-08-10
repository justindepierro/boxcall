import { useState } from "react";
import type { CalendarEvent } from "../../../domain/calendar/types";

export function useCalendarSelection() {
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    null
  );
  const [showEventModal, setShowEventModal] = useState(false);
  const [isCreatingEvent, setIsCreatingEvent] = useState(false);
  const [isEditingEvent, setIsEditingEvent] = useState(false);
  const resetSelection = () => {
    setShowEventModal(false);
    setSelectedEvent(null);
    setIsCreatingEvent(false);
    setIsEditingEvent(false);
  };
  return {
    selectedEvent,
    setSelectedEvent,
    showEventModal,
    setShowEventModal,
    isCreatingEvent,
    setIsCreatingEvent,
    isEditingEvent,
    setIsEditingEvent,
    resetSelection,
  };
}
