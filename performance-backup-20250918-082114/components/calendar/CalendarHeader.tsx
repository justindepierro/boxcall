import React from "react";

import { Button } from "../ui";
import { Icon } from "../ui/Icon";

interface CalendarHeaderProps {
  canAddEvent: boolean;
  onAddEvent: () => void;
  onExport: () => void;
}

export const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  canAddEvent,
  onAddEvent,
  onExport,
}) => {
  return (
    <div className="calendar-shell-header flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Icon name="calendar" size="xl" className="text-navy-600" />
        <div>
          <span className="block">
            {/* Replaces raw h2 utility heading with Typography semantic */}
            <span className="Typography typography-headline-sm text-text-primary tracking-tight">
              Master Calendar
            </span>
          </span>
          <p className="text-xs text-text-secondary mt-0.5">
            Unified schedule & event management
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="subtle" size="sm" onClick={onExport}>
          <Icon name="download" size="sm" className="mr-1" /> Export
        </Button>
        {canAddEvent && (
          <Button variant="primary" size="sm" onClick={onAddEvent}>
            <Icon name="plus" size="sm" className="mr-1" /> Add Event
          </Button>
        )}
      </div>
    </div>
  );
};

export default CalendarHeader;
