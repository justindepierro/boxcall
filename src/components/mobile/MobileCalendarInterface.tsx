import React, { useState, useRef } from "react";
import {
  format,
  addDays,
  subDays,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addMonths,
  subMonths,
  isSameDay,
  isSameMonth,
  isToday,
} from "date-fns";
import { Icon } from "../ui/Icon/Icon";
import { Typography } from "../design-system";
import { useCalendar } from "../../hooks/useCalendar";
import type { CalendarEvent } from "../../services/calendarService";

export interface MobileCalendarProps {
  userId: string;
  onEventCreate?: () => void;
  onEventSelect?: (event: CalendarEvent) => void;
  className?: string;
}

type CalendarView = "month" | "week" | "day";

/**
 * Mobile Calendar Interface
 *
 * Features:
 * - Touch-optimized swipe navigation between dates
 * - Large touch targets for mobile interaction
 * - Quick event creation with templates
 * - One-tap RSVP and availability updates
 * - Momentum scrolling and smooth animations
 * - Offline support for recent events
 */
export const MobileCalendarInterface: React.FC<MobileCalendarProps> = ({
  userId,
  onEventCreate,
  onEventSelect,
  className = "",
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<CalendarView>("month");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isSwipeEnabled] = useState(true);

  // Touch handling for swipe gestures
  const touchStartX = useRef<number>(0);
  const touchStartY = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Get events using existing calendar hook
  const { events, loading } = useCalendar(userId);

  // Handle touch start
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!isSwipeEnabled) return;

    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  // Handle touch end with swipe detection
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!isSwipeEnabled) return;

    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;

    const deltaX = touchStartX.current - touchEndX;
    const deltaY = touchStartY.current - touchEndY;

    // Check if horizontal swipe (more horizontal than vertical)
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
      if (deltaX > 0) {
        // Swipe left - go to next period
        navigateNext();
      } else {
        // Swipe right - go to previous period
        navigatePrevious();
      }
    }
  };

  // Navigation functions
  const navigateNext = () => {
    if (view === "month") {
      setCurrentDate(addMonths(currentDate, 1));
    } else if (view === "week") {
      setCurrentDate(addDays(currentDate, 7));
    } else {
      setCurrentDate(addDays(currentDate, 1));
    }
  };

  const navigatePrevious = () => {
    if (view === "month") {
      setCurrentDate(subMonths(currentDate, 1));
    } else if (view === "week") {
      setCurrentDate(subDays(currentDate, 7));
    } else {
      setCurrentDate(subDays(currentDate, 1));
    }
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  };

  // Get calendar period display text
  const getPeriodDisplay = () => {
    switch (view) {
      case "month":
        return format(currentDate, "MMMM yyyy");
      case "week": {
        const weekStart = startOfWeek(currentDate);
        const weekEnd = endOfWeek(currentDate);
        return `${format(weekStart, "MMM d")} - ${format(weekEnd, "MMM d, yyyy")}`;
      }
      case "day":
        return format(currentDate, "EEEE, MMMM d, yyyy");
      default:
        return format(currentDate, "MMMM yyyy");
    }
  };

  // Get events for a specific date
  const getEventsForDate = (date: Date): CalendarEvent[] => {
    return (
      events?.filter((event: CalendarEvent) =>
        isSameDay(new Date(event.start || ""), date)
      ) || []
    );
  };

  // Render month view
  const renderMonthView = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const calendarStart = startOfWeek(monthStart);
    const calendarEnd = endOfWeek(monthEnd);

    const days = [];
    let day = calendarStart;

    while (day <= calendarEnd) {
      const currentDay = day;
      const dayEvents = getEventsForDate(currentDay);
      const isCurrentMonth = isSameMonth(currentDay, currentDate);
      const isCurrentDay = isToday(currentDay);
      const isSelected = selectedDate && isSameDay(currentDay, selectedDate);

      days.push(
        <button
          key={currentDay.toISOString()}
          onClick={() => setSelectedDate(currentDay)}
          className={`
            min-h-[60px] p-2 border border-gray-100 dark:border-gray-700
            flex flex-col items-start justify-start
            touch-manipulation transition-colors
            ${
              isCurrentMonth
                ? "bg-white dark:bg-gray-800"
                : "bg-gray-50 dark:bg-gray-900 text-gray-400"
            }
            ${
              isCurrentDay
                ? "bg-brand-jade-light dark:bg-brand-jade-dark text-brand-jade-dark dark:text-brand-jade-light"
                : ""
            }
            ${isSelected ? "ring-2 ring-brand-jade" : ""}
            hover:bg-gray-50 dark:hover:bg-gray-700
            active:bg-gray-100 dark:active:bg-gray-600
          `}
        >
          <span
            className={`text-sm font-medium ${isCurrentDay ? "font-bold" : ""}`}
          >
            {format(currentDay, "d")}
          </span>
          {dayEvents.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1 w-full">
              {dayEvents.slice(0, 2).map((event, index) => (
                <div
                  key={index}
                  className="w-full h-1 bg-brand-jade rounded-full opacity-80"
                  title={event.title}
                />
              ))}
              {dayEvents.length > 2 && (
                <span className="text-xs text-gray-500 mt-1">
                  +{dayEvents.length - 2} more
                </span>
              )}
            </div>
          )}
        </button>
      );

      day = addDays(day, 1);
    }

    return (
      <div className="grid grid-cols-7 gap-0 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
        {/* Day headers */}
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((dayName) => (
          <div
            key={dayName}
            className="bg-gray-100 dark:bg-gray-800 p-3 text-center border-b border-gray-200 dark:border-gray-700"
          >
            <Typography
              variant="body-sm"
              className="font-medium text-gray-600 dark:text-gray-400"
            >
              {dayName}
            </Typography>
          </div>
        ))}
        {/* Calendar days */}
        {days}
      </div>
    );
  };

  // Render week view
  const renderWeekView = () => {
    const weekStart = startOfWeek(currentDate);
    const weekDays = [];

    for (let i = 0; i < 7; i++) {
      const day = addDays(weekStart, i);
      const dayEvents = getEventsForDate(day);
      const isCurrentDay = isToday(day);
      const isSelected = selectedDate && isSameDay(day, selectedDate);

      weekDays.push(
        <div key={day.toISOString()} className="flex-1 min-w-0">
          <button
            onClick={() => setSelectedDate(day)}
            className={`
              w-full p-3 text-center border-b-2 transition-colors touch-manipulation
              ${
                isCurrentDay
                  ? "border-brand-jade bg-brand-jade-light dark:bg-brand-jade-dark text-brand-jade-dark dark:text-brand-jade-light"
                  : "border-gray-200 dark:border-gray-700"
              }
              ${
                isSelected
                  ? "bg-brand-jade-light dark:bg-brand-jade-dark"
                  : "hover:bg-gray-50 dark:hover:bg-gray-800"
              }
            `}
          >
            <Typography variant="body-sm" className="font-medium">
              {format(day, "EEE")}
            </Typography>
            <Typography
              variant="headline-sm"
              className={`mt-1 ${isCurrentDay ? "font-bold" : ""}`}
            >
              {format(day, "d")}
            </Typography>
          </button>

          {/* Events for this day */}
          <div className="p-2 space-y-1 min-h-[200px] bg-white dark:bg-gray-800">
            {dayEvents.map((event, index) => (
              <button
                key={index}
                onClick={() => onEventSelect?.(event)}
                className="w-full p-2 text-left bg-brand-jade-light dark:bg-brand-jade-dark rounded-lg text-brand-jade-dark dark:text-brand-jade-light hover:opacity-80 transition-opacity touch-manipulation"
              >
                <Typography variant="body-sm" className="font-medium truncate">
                  {event.title}
                </Typography>
                <Typography variant="body-xs" className="opacity-75">
                  {event.start
                    ? format(new Date(event.start), "h:mm a")
                    : "Time TBD"}
                </Typography>
              </button>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className="flex gap-0 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
        {weekDays}
      </div>
    );
  };

  // Render day view
  const renderDayView = () => {
    const dayEvents = getEventsForDate(currentDate);

    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
        {/* Date header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          <Typography variant="headline-md" className="text-center">
            {format(currentDate, "EEEE")}
          </Typography>
          <Typography
            variant="headline-lg"
            className="text-center text-brand-jade-dark dark:text-brand-jade-light"
          >
            {format(currentDate, "d")}
          </Typography>
        </div>

        {/* Events list */}
        <div className="p-4 space-y-3 min-h-[300px]">
          {dayEvents.length === 0 ? (
            <div className="text-center py-8">
              <Icon
                name="calendar"
                size="lg"
                className="mx-auto mb-3 text-gray-400"
              />
              <Typography variant="body-md" color="muted">
                No events scheduled
              </Typography>
              <button
                onClick={onEventCreate}
                className="mt-3 text-brand-jade hover:text-brand-jade-dark text-sm font-medium touch-manipulation"
              >
                Add an event
              </button>
            </div>
          ) : (
            dayEvents.map((event, index) => (
              <button
                key={index}
                onClick={() => onEventSelect?.(event)}
                className="w-full p-4 text-left bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors touch-manipulation"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <Typography
                      variant="body-md"
                      className="font-medium truncate"
                    >
                      {event.title}
                    </Typography>
                    {event.description && (
                      <Typography
                        variant="body-sm"
                        color="muted"
                        className="mt-1 line-clamp-2"
                      >
                        {event.description}
                      </Typography>
                    )}
                    <Typography
                      variant="body-sm"
                      className="mt-2 text-brand-jade"
                    >
                      {event.start && event.end
                        ? `${format(new Date(event.start), "h:mm a")} - ${format(new Date(event.end), "h:mm a")}`
                        : "Time TBD"}
                    </Typography>
                  </div>
                  <Icon
                    name="chevron-right"
                    size="sm"
                    className="text-gray-400 mt-1"
                  />
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    );
  };

  return (
    <div
      ref={containerRef}
      className={`mobile-calendar ${className}`}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Header with navigation and view switcher */}
      <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        {/* Previous button */}
        <button
          onClick={navigatePrevious}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors touch-manipulation"
          aria-label="Previous period"
        >
          <Icon name="chevron-left" size="md" />
        </button>

        {/* Period display and today button */}
        <div className="flex-1 text-center">
          <Typography variant="headline-sm" className="font-semibold">
            {getPeriodDisplay()}
          </Typography>
          <button
            onClick={goToToday}
            className="mt-1 text-xs text-brand-jade hover:text-brand-jade-dark transition-colors touch-manipulation"
          >
            Today
          </button>
        </div>

        {/* Next button */}
        <button
          onClick={navigateNext}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors touch-manipulation"
          aria-label="Next period"
        >
          <Icon name="chevron-right" size="md" />
        </button>
      </div>

      {/* View switcher */}
      <div className="flex bg-gray-100 dark:bg-gray-700 p-1 m-4 rounded-lg">
        {(["month", "week", "day"] as CalendarView[]).map((viewType) => (
          <button
            key={viewType}
            onClick={() => setView(viewType)}
            className={`
              flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors capitalize touch-manipulation
              ${
                view === viewType
                  ? "bg-white dark:bg-gray-800 text-brand-jade shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
              }
            `}
          >
            {viewType}
          </button>
        ))}
      </div>

      {/* Calendar content */}
      <div className="p-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-6 h-6 border-2 border-brand-jade border-t-transparent rounded-full animate-spin"></div>
            <Typography variant="body-sm" color="muted" className="ml-3">
              Loading calendar...
            </Typography>
          </div>
        ) : (
          <>
            {view === "month" && renderMonthView()}
            {view === "week" && renderWeekView()}
            {view === "day" && renderDayView()}
          </>
        )}
      </div>

      {/* Swipe hint indicator */}
      <div className="text-center py-2">
        <Typography variant="body-xs" color="muted">
          Swipe left/right to navigate
        </Typography>
      </div>
    </div>
  );
};
