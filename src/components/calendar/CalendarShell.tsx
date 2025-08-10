import React from "react";
import { useEvents } from "../../state/calendar/hooks";
import { useAuth } from "../../app/auth-store";
import { calendarKeys } from "../../state/calendar/queryKeys";
import { CalendarStats } from "./CalendarStats";

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
        Error loading events:{" "}
        {error instanceof Error ? error.message : "Unknown error"}
      </div>
    );

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-8">
        <div className="flex-1">
          <h2 className="text-xl font-semibold mb-2">Calendar (Shell)</h2>
          <p className="text-xs text-gray-500 mb-3">
            Query Key: <code>{JSON.stringify(calendarKeys.events())}</code>
          </p>
          <ul className="list-disc pl-5 space-y-1 text-sm">
            {(data || []).map((e) => (
              <li key={e.id}>
                <span className="font-medium">{e.title}</span> – {e.start}
              </li>
            ))}
          </ul>
        </div>
        <div className="w-52 shrink-0">
          <CalendarStats events={data} />
        </div>
      </div>
    </div>
  );
};

export default CalendarShell;
