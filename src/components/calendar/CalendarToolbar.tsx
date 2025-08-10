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
    <div className={"flex flex-wrap items-center justify-between gap-3 mb-4 " + (className || "")}>
      <div className="flex items-center gap-2">
        <Button variant="secondary" size="xs" onClick={onToday}>
          Today
        </Button>
        <Button variant="secondary" size="xs" onClick={onPrev}>
          ‹
        </Button>
        <Button variant="secondary" size="xs" onClick={onNext}>
          ›
        </Button>
      </div>
      <ViewSwitcher value={currentView} onChange={onViewChange} className="ml-auto" />
    </div>
  );
};

export default CalendarToolbar;
