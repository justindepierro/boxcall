import React from "react";
import { useEvents } from "../../state/calendar/hooks";
import { useAuth } from "../../app/auth-store";
import { calendarKeys } from "../../state/calendar/queryKeys";

// Minimal CalendarShell prototype: fetch events via state hooks and render count.
// Future: integrate toolbar, filters, stats, and FullCalendar adapter.
export const CalendarShell: React.FC = () => {
  const { user } = useAuth();
  const userId = user?.id || "dev-user";
  const { data, isLoading, isError, error } = useEvents({ userId });

  if (isLoading) return <div>Loading calendar…</div>;
  if (isError)
    return (
      <div>
        Error loading events: {error instanceof Error ? error.message : "Unknown error"}
      </div>
    );

  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">Calendar (Shell)</h2>
      <p className="text-sm text-gray-600 mb-4">
        Query Key: {JSON.stringify(calendarKeys.events())}
      </p>
      <ul className="list-disc pl-5 space-y-1">
        {(data || []).map((e) => (
          <li key={e.id}>
            <span className="font-medium">{e.title}</span> – {e.start}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CalendarShell;
