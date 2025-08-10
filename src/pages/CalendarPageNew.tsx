import React from "react";
import { useAuth } from "../app/auth-store";
import { useEvents } from "../state/calendar/hooks";
import { useDevMode } from "../app/dev-mode-hooks";
import type { CalendarEvent } from "../domain/calendar/types";
import { Card, Button } from "../components/ui";
import { CalendarService } from "../services/calendarService";

// Minimal new page leveraging React Query read path (Phase 3 incremental migration)
export const CalendarPageNew: React.FC = () => {
  const { user } = useAuth();
  const { devMode } = useDevMode();
  const { data: events = [], isLoading, isError, error } = useEvents({
    userId: user?.id || "",
    devMode,
  });

  if (isLoading) return <div className="p-8 text-sm">Loading events...</div>;
  if (isError) return <div className="p-8 text-sm text-red-600">{String(error)}</div>;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-xl font-semibold">Calendar (New Read Path)</h1>
      <Card className="p-4">
        <ul className="list-disc pl-5 text-sm space-y-1">
          {events.map((e: CalendarEvent) => (
            <li key={e.id}>
              <span className="font-medium">{e.title}</span> – {e.start}
            </li>
          ))}
        </ul>
      </Card>
      <Button
        size="xs"
        variant="outline"
        onClick={() => {
            void CalendarService.searchEvents("test");
        }}
      >Test Search (legacy service)</Button>
    </div>
  );
};

export default CalendarPageNew;
