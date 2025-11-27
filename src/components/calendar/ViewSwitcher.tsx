import React, { useState, useEffect, useRef, useMemo } from "react";

import { Button } from "../ui";

export type CalendarView = "dayGridMonth" | "timeGridWeek" | "timeGridDay";

interface ViewSwitcherProps {
  value: CalendarView;
  onChange: (v: CalendarView) => void;
  className?: string;
  orientation?: "horizontal" | "vertical";
}

// Keyboard accessible roving-tabindex view switcher (role="tablist").
export const ViewSwitcher: React.FC<ViewSwitcherProps> = ({
  value,
  onChange,
  className,
  orientation = "horizontal",
}) => {
  const views: CalendarView[] = useMemo(
    () => ["dayGridMonth", "timeGridWeek", "timeGridDay"],
    []
  );
  const labels: Record<CalendarView, string> = {
    dayGridMonth: "Month",
    timeGridWeek: "Week",
    timeGridDay: "Day",
  };
  const containerRef = useRef<HTMLDivElement>(null);
  const [focusIndex, setFocusIndex] = useState(
    Math.max(0, views.indexOf(value))
  );
  useEffect(() => {
    const idx = views.indexOf(value);
    if (idx >= 0) setFocusIndex(idx);
  }, [value, views]);
  const move = (delta: number) => {
    setFocusIndex((prev) => (prev + delta + views.length) % views.length);
  };
  useEffect(() => {
    const btns =
      containerRef.current?.querySelectorAll<HTMLButtonElement>(
        "[data-view-btn]"
      );
    if (btns && btns[focusIndex]) btns[focusIndex].focus();
  }, [focusIndex]);
  return (
    <div
      ref={containerRef}
      role="tablist"
      aria-orientation={orientation}
      className={
        "inline-flex rounded-lg bg-subtle border-muted shadow-sm p-0.5 gap-0.5 " +
        (className || "")
      }
      onKeyDown={(e) => {
        if (orientation === "horizontal") {
          if (e.key === "ArrowRight") {
            e.preventDefault();
            move(1);
          } else if (e.key === "ArrowLeft") {
            e.preventDefault();
            move(-1);
          }
        } else {
          if (e.key === "ArrowDown") {
            e.preventDefault();
            move(1);
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            move(-1);
          }
        }
        if (e.key === "Home") {
          e.preventDefault();
          setFocusIndex(0);
        } else if (e.key === "End") {
          e.preventDefault();
          setFocusIndex(views.length - 1);
        } else if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          const v = views[focusIndex];
          if (v && v !== value) onChange(v);
        }
      }}
    >
      {views.map((v, i) => {
        const selected = v === value;
        return (
          <Button
            key={v}
            data-view-btn
            role="tab"
            aria-selected={selected}
            aria-controls={`calendar-view-${v}`}
            tabIndex={i === focusIndex ? 0 : -1}
            // Use ghost for base, apply custom classes for contrast
            variant={selected ? "primary" : "ghost"}
            size="xs"
            className={
              (selected
                ? "!bg-brand-jade-dark text-inverse border-brand-jade-dark"
                : [
                    // Base unselected adopts subtle surface vs raw gray
                    "surface-card text-primary border-muted",
                    // Hover / focus for better affordance using semantic hover
                    "hover:hover:bg-muted",
                    "focus-visible:ring-2 focus-visible:ring-brand-jade focus-visible:ring-offset-1 focus-visible:outline-none",
                    // Active press feedback
                    "active:bg-subtle",
                  ].join(" ")) +
              " rounded-lg min-w-14 font-medium transition-colors"
            }
            onClick={() => onChange(v)}
          >
            {labels[v]}
          </Button>
        );
      })}
    </div>
  );
};

export default ViewSwitcher;
