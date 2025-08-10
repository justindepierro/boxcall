import React, { useMemo } from "react";
import type { CalendarEvent } from "../../domain/calendar/types";

interface CalendarStatsProps {
  events: CalendarEvent[] | undefined;
  className?: string;
}

export const CalendarStats: React.FC<CalendarStatsProps> = ({ events = [], className }) => {
  const now = new Date();
  const month = now.getMonth();
  const year = now.getFullYear();
  const stats = useMemo(() => {
    const total = events.length;
    let monthCount = 0;
    const byType: Record<string, number> = {};
    events.forEach((e) => {
      const d = new Date(e.start);
      if (d.getMonth() === month && d.getFullYear() === year) monthCount++;
      byType[e.type] = (byType[e.type] || 0) + 1;
    });
    return { total, monthCount, byType };
  }, [events, month, year]);

  return (
    <div className={`space-y-2 ${className || ""}`.trim()}>
      <h3 className="text-sm font-semibold text-gray-700">Stats (Shell)</h3>
      <dl className="grid grid-cols-2 gap-2 text-xs">
        <div>
          <dt className="text-gray-500">Total</dt>
          <dd className="font-medium">{stats.total}</dd>
        </div>
        <div>
          <dt className="text-gray-500">This Month</dt>
          <dd className="font-medium">{stats.monthCount}</dd>
        </div>
        {Object.entries(stats.byType).map(([type, count]) => (
          <div key={type}>
            <dt className="text-gray-500 capitalize">{type}</dt>
            <dd className="font-medium">{count}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
};

export default CalendarStats;
