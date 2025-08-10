import React from "react";
import { Button } from "../../components/ui";

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
    <div className={"flex items-center justify-between mb-6 " + (className || "")}>      
      <div className="flex items-center space-x-4">
        <Button variant="outline" size="sm" onClick={onToday}>Today</Button>
        <Button variant="outline" size="sm" onClick={onPrev}>‹ Prev</Button>
        <Button variant="outline" size="sm" onClick={onNext}>Next ›</Button>
      </div>
      <div className="flex rounded-lg bg-gray-100 p-1">
        <Button
          variant={currentView === "dayGridMonth" ? "primary" : "ghost"}
          size="xs"
          onClick={() => onViewChange("dayGridMonth")}
          className={currentView === "dayGridMonth" ? "bg-white text-navy-900" : "text-gray-600"}
        >
          Month
        </Button>
        <Button
          variant={currentView === "timeGridWeek" ? "primary" : "ghost"}
          size="xs"
          onClick={() => onViewChange("timeGridWeek")}
          className={currentView === "timeGridWeek" ? "bg-white text-navy-900" : "text-gray-600"}
        >
          Week
        </Button>
        <Button
          variant={currentView === "timeGridDay" ? "primary" : "ghost"}
          size="xs"
          onClick={() => onViewChange("timeGridDay")}
          className={currentView === "timeGridDay" ? "bg-white text-navy-900" : "text-gray-600"}
        >
          Day
        </Button>
      </div>
    </div>
  );
};

export default CalendarToolbar;
