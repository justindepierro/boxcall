import React from "react";
import { Button } from "../../components/ui";
import { ViewSwitcher } from "./ViewSwitcher";

export interface CalendarToolbarProps {
  currentView: "dayGridMonth" | "timeGridWeek" | "timeGridDay";
  onViewChange: (view: CalendarToolbarProps["currentView"]) => void;
  onToday: () => void;
  onPrev: () => void;
  onNext: () => void;
  className?: string;
}

export const CalendarToolbar: React.FC<CalendarToolbarProps> = ({
  currentView,
  onViewChange,
  onToday,
  onPrev,
  onNext,
  className,
}) => {
  return (
    <div
      className={"flex items-center justify-between mb-6 " + (className || "")}
    >
      <div className="flex items-center space-x-4">
        <Button variant="outline" size="sm" onClick={onToday}>
          Today
        </Button>
        <Button variant="outline" size="sm" onClick={onPrev}>
          ‹ Prev
        </Button>
        <Button variant="outline" size="sm" onClick={onNext}>
          Next ›
        </Button>
      </div>
  <ViewSwitcher value={currentView} onChange={onViewChange} />
    </div>
  );
};

export default CalendarToolbar;
