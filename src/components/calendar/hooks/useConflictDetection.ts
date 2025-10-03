import { useMemo } from "react";

import type { CalendarEvent } from "../../../domain/calendar/types";

export interface ConflictInfo {
  eventId: string;
  conflictingEvents: CalendarEvent[];
  severity: "warning" | "error";
  message: string;
}

interface ConflictDetectionResult {
  conflicts: ConflictInfo[];
  hasConflicts: boolean;
  totalConflicts: number;
}

/**
 * useConflictDetection - Detects scheduling conflicts in calendar events
 */
export function useConflictDetection(
  events: CalendarEvent[]
): ConflictDetectionResult {
  const conflicts = useMemo((): ConflictInfo[] => {
    const conflictList: ConflictInfo[] = [];

    // Group events by day for efficient conflict checking
    const eventsByDay = new Map<string, CalendarEvent[]>();

    events.forEach((event) => {
      const eventDate = new Date(event.start);
      const dayKey = eventDate.toDateString();
      if (!eventsByDay.has(dayKey)) {
        eventsByDay.set(dayKey, []);
      }
      eventsByDay.get(dayKey)!.push(event);
    });

    // Check for conflicts within each day
    eventsByDay.forEach((dayEvents) => {
      for (let i = 0; i < dayEvents.length; i++) {
        const eventA = dayEvents[i];
        const conflictsForA: CalendarEvent[] = [];

        for (let j = i + 1; j < dayEvents.length; j++) {
          const eventB = dayEvents[j];

          if (eventsOverlap(eventA, eventB)) {
            conflictsForA.push(eventB);
          }
        }

        if (conflictsForA.length > 0) {
          const severity = determineConflictSeverity(eventA, conflictsForA);
          conflictList.push({
            eventId: eventA.id || `temp-${i}`,
            conflictingEvents: conflictsForA,
            severity,
            message: generateConflictMessage(eventA, conflictsForA, severity),
          });
        }
      }
    });

    return conflictList;
  }, [events]);

  return {
    conflicts,
    hasConflicts: conflicts.length > 0,
    totalConflicts: conflicts.length,
  };
}

function eventsOverlap(eventA: CalendarEvent, eventB: CalendarEvent): boolean {
  const startA = new Date(eventA.start);
  const endA = new Date(eventA.end || eventA.start);
  const startB = new Date(eventB.start);
  const endB = new Date(eventB.end || eventB.start);

  // Events overlap if one's start is before the other's end and vice versa
  return startA < endB && startB < endA;
}

function determineConflictSeverity(
  primaryEvent: CalendarEvent,
  conflictingEvents: CalendarEvent[]
): "warning" | "error" {
  // Error if there are 2+ conflicts or if it's a high-priority event
  if (conflictingEvents.length >= 2) return "error";

  // Error if conflicting with games (highest priority)
  if (
    primaryEvent.type === "game" ||
    conflictingEvents.some((e) => e.type === "game")
  ) {
    return "error";
  }

  // Warning for other conflicts
  return "warning";
}

function generateConflictMessage(
  primaryEvent: CalendarEvent,
  conflictingEvents: CalendarEvent[],
  severity: "warning" | "error"
): string {
  const conflictCount = conflictingEvents.length;
  const primaryType = primaryEvent.type;
  const conflictTypes = conflictingEvents.map((e) => e.type);

  if (severity === "error") {
    if (conflictCount >= 2) {
      return `Multiple scheduling conflicts (${conflictCount} overlapping events)`;
    }
    if (primaryType === "game" || conflictTypes.includes("game")) {
      return "Game scheduling conflict - immediate attention required";
    }
    return "Critical scheduling conflict detected";
  }

  // Warning messages
  if (conflictCount === 1) {
    const conflictType = conflictTypes[0];
    return `Overlaps with ${conflictType} event`;
  }

  return `${conflictCount} overlapping events detected`;
}

/**
 * Check if a proposed event would conflict with existing events
 */
export function checkProposedEventConflicts(
  proposedEvent: { start: Date; end: Date; title?: string; type?: string },
  existingEvents: CalendarEvent[]
): ConflictInfo | null {
  const conflictingEvents = existingEvents.filter((event) =>
    eventsOverlap(
      {
        id: "proposed",
        title: proposedEvent.title || "Proposed Event",
        type: (proposedEvent.type as any) || "practice",
        start: proposedEvent.start.toISOString(),
        end: proposedEvent.end.toISOString(),
      } as CalendarEvent,
      event
    )
  );

  if (conflictingEvents.length === 0) return null;

  const mockEvent: CalendarEvent = {
    id: "proposed",
    title: proposedEvent.title || "Proposed Event",
    type: (proposedEvent.type as any) || "practice",
    start: proposedEvent.start.toISOString(),
    end: proposedEvent.end.toISOString(),
  };

  return {
    eventId: "proposed",
    conflictingEvents,
    severity: determineConflictSeverity(mockEvent, conflictingEvents),
    message: generateConflictMessage(
      mockEvent,
      conflictingEvents,
      determineConflictSeverity(mockEvent, conflictingEvents)
    ),
  };
}
