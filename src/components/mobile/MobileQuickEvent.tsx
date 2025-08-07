import React, { useState } from "react";
import { format, addHours, startOfHour } from "date-fns";
import { Icon } from "../ui/Icon/Icon";
import { Typography } from "../design-system";
import { Button } from "../ui/Button/Button";
import type { CalendarEventCreate } from "../../services/calendarService";

export interface MobileQuickEventProps {
  selectedDate?: Date | null;
  onEventCreate: (eventData: CalendarEventCreate) => void;
  onCancel: () => void;
  className?: string;
}

type EventTemplate = {
  id: string;
  title: string;
  icon: "users" | "trophy" | "message" | "target" | "play" | "calendar";
  duration: number; // in hours
  description?: string;
  color: string;
};

const eventTemplates: EventTemplate[] = [
  {
    id: "practice",
    title: "Team Practice",
    icon: "users",
    duration: 2,
    description: "Regular team practice session",
    color: "bg-blue-500",
  },
  {
    id: "game",
    title: "Game",
    icon: "trophy",
    duration: 3,
    description: "Scheduled game",
    color: "bg-red-500",
  },
  {
    id: "meeting",
    title: "Team Meeting",
    icon: "message",
    duration: 1,
    description: "Team discussion and planning",
    color: "bg-green-500",
  },
  {
    id: "training",
    title: "Individual Training",
    icon: "target",
    duration: 1.5,
    description: "Skills development session",
    color: "bg-purple-500",
  },
  {
    id: "film",
    title: "Film Review",
    icon: "play",
    duration: 1,
    description: "Game film analysis",
    color: "bg-gray-500",
  },
  {
    id: "custom",
    title: "Custom Event",
    icon: "calendar",
    duration: 1,
    description: "Create your own event",
    color: "bg-brand-jade",
  },
];

/**
 * Mobile Quick Event Creation
 *
 * Features:
 * - Pre-defined event templates for quick selection
 * - Touch-optimized time picker
 * - Smart default times based on event type
 * - One-tap event creation
 * - Custom event creation option
 * - Visual time slot indicators
 */
export const MobileQuickEvent: React.FC<MobileQuickEventProps> = ({
  selectedDate,
  onEventCreate,
  onCancel,
  className = "",
}) => {
  const [selectedTemplate, setSelectedTemplate] =
    useState<EventTemplate | null>(null);
  const [eventTitle, setEventTitle] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [startTime, setStartTime] = useState(() => {
    const now = new Date();
    const nextHour = startOfHour(addHours(now, 1));
    return format(nextHour, "HH:mm");
  });

  const eventDate = selectedDate || new Date();

  // Handle template selection
  const handleTemplateSelect = (template: EventTemplate) => {
    setSelectedTemplate(template);
    setEventTitle(template.title);
    setEventDescription(template.description || "");

    // Set smart default times based on event type
    const now = new Date();
    let defaultTime = startOfHour(addHours(now, 1));

    if (template.id === "practice") {
      // Practices typically after school/work
      defaultTime = new Date(eventDate);
      defaultTime.setHours(16, 0, 0, 0); // 4:00 PM
    } else if (template.id === "game") {
      // Games typically on weekends
      defaultTime = new Date(eventDate);
      defaultTime.setHours(14, 0, 0, 0); // 2:00 PM
    } else if (template.id === "meeting") {
      // Meetings typically in the evening
      defaultTime = new Date(eventDate);
      defaultTime.setHours(19, 0, 0, 0); // 7:00 PM
    }

    setStartTime(format(defaultTime, "HH:mm"));
  };

  // Handle event creation
  const handleCreateEvent = () => {
    if (!eventTitle.trim() || !selectedTemplate) return;

    const [hours, minutes] = startTime.split(":").map(Number);
    const eventStart = new Date(eventDate);
    eventStart.setHours(hours, minutes, 0, 0);

    const eventEnd = addHours(eventStart, selectedTemplate.duration);

    const eventData: CalendarEventCreate = {
      title: eventTitle,
      description: eventDescription,
      start: eventStart.toISOString(),
      end: eventEnd.toISOString(),
      type: getEventType(selectedTemplate.id),
    };

    onEventCreate(eventData);
  };

  // Generate time slots for picker
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 6; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeStr = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
        slots.push(timeStr);
      }
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  // Map template ID to calendar event type
  const getEventType = (
    templateId: string
  ): "game" | "practice" | "meeting" | "film" | "other" => {
    switch (templateId) {
      case "practice":
        return "practice";
      case "game":
        return "game";
      case "meeting":
        return "meeting";
      case "film":
        return "film";
      default:
        return "other";
    }
  };

  return (
    <div
      className={`fixed inset-0 bg-black bg-opacity-50 flex items-end z-50 ${className}`}
    >
      <div className="bg-white dark:bg-gray-800 w-full rounded-t-xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors touch-manipulation"
          >
            <Icon name="close" size="md" />
          </button>
          <Typography variant="headline-sm" className="font-semibold">
            Quick Event
          </Typography>
          <Button
            variant="primary"
            size="sm"
            onClick={handleCreateEvent}
            disabled={!eventTitle.trim() || !selectedTemplate}
          >
            Create
          </Button>
        </div>

        {/* Date display */}
        <div className="p-4 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
          <Typography variant="body-md" color="muted">
            Creating event for
          </Typography>
          <Typography variant="headline-sm" className="text-brand-jade">
            {format(eventDate, "EEEE, MMMM d, yyyy")}
          </Typography>
        </div>

        {/* Event templates */}
        {!selectedTemplate ? (
          <div className="p-4">
            <Typography variant="body-md" className="mb-4 font-medium">
              Choose event type
            </Typography>
            <div className="grid grid-cols-2 gap-3">
              {eventTemplates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => handleTemplateSelect(template)}
                  className="p-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-brand-jade transition-colors text-left touch-manipulation"
                >
                  <div
                    className={`w-12 h-12 ${template.color} rounded-lg flex items-center justify-center mb-3`}
                  >
                    <Icon
                      name={template.icon}
                      size="md"
                      className="text-white"
                    />
                  </div>
                  <Typography variant="body-sm" className="font-medium mb-1">
                    {template.title}
                  </Typography>
                  <Typography variant="body-xs" color="muted">
                    {template.duration}h duration
                  </Typography>
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Event details form */
          <div className="p-4 space-y-4">
            {/* Back button */}
            <button
              onClick={() => setSelectedTemplate(null)}
              className="flex items-center text-brand-jade hover:text-brand-jade-dark transition-colors touch-manipulation"
            >
              <Icon name="chevron-left" size="sm" className="mr-1" />
              <Typography variant="body-sm">Back to templates</Typography>
            </button>

            {/* Event type indicator */}
            <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <div
                className={`w-10 h-10 ${selectedTemplate.color} rounded-lg flex items-center justify-center mr-3`}
              >
                <Icon
                  name={selectedTemplate.icon}
                  size="sm"
                  className="text-white"
                />
              </div>
              <div>
                <Typography variant="body-md" className="font-medium">
                  {selectedTemplate.title}
                </Typography>
                <Typography variant="body-xs" color="muted">
                  Duration: {selectedTemplate.duration} hours
                </Typography>
              </div>
            </div>

            {/* Event title */}
            <div>
              <Typography variant="body-sm" className="mb-2 font-medium">
                Event Title
              </Typography>
              <input
                type="text"
                value={eventTitle}
                onChange={(e) => setEventTitle(e.target.value)}
                className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-jade focus:border-transparent prevent-zoom"
                placeholder="Enter event title..."
                autoFocus
              />
            </div>

            {/* Start time */}
            <div>
              <Typography variant="body-sm" className="mb-2 font-medium">
                Start Time
              </Typography>
              <select
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-jade focus:border-transparent"
              >
                {timeSlots.map((time) => (
                  <option key={time} value={time}>
                    {format(new Date(`2024-01-01T${time}:00`), "h:mm a")}
                  </option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div>
              <Typography variant="body-sm" className="mb-2 font-medium">
                Description (Optional)
              </Typography>
              <textarea
                value={eventDescription}
                onChange={(e) => setEventDescription(e.target.value)}
                className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-jade focus:border-transparent resize-none prevent-zoom"
                placeholder="Add event details..."
                rows={3}
              />
            </div>

            {/* Duration display */}
            <div className="p-3 bg-brand-jade-light dark:bg-brand-jade-dark rounded-lg">
              <Typography
                variant="body-sm"
                className="text-brand-jade-dark dark:text-brand-jade-light"
              >
                <strong>Event Summary:</strong>
                <br />
                {format(
                  new Date(`2024-01-01T${startTime}:00`),
                  "h:mm a"
                )} -{" "}
                {format(
                  addHours(
                    new Date(`2024-01-01T${startTime}:00`),
                    selectedTemplate.duration
                  ),
                  "h:mm a"
                )}
                ({selectedTemplate.duration} hours)
              </Typography>
            </div>
          </div>
        )}

        {/* Safe area bottom padding */}
        <div className="h-safe-area-inset-bottom"></div>
      </div>
    </div>
  );
};
