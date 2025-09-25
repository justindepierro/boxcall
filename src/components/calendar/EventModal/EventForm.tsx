import React from "react";
import { Button, Input } from "../../ui";
import type { CalendarEvent } from "../../../domain/calendar/types";
import { Typography } from "@components/design-system/Typography";

export interface EventFormProps {
  mode: "create" | "edit";
  event: CalendarEvent;
  setEvent: (e: CalendarEvent) => void;
  onCancel: () => void;
  onSubmit: (e: CalendarEvent) => Promise<void> | void;
  submitting: boolean;
}

export const EventForm: React.FC<EventFormProps> = ({
  mode,
  event,
  setEvent,
  onCancel,
  onSubmit,
  submitting,
}) => {
  return (
    <div className="space-y-4">
      <Input
        label="Event Title"
        value={event.title}
        onChange={(e) => setEvent({ ...event, title: e.target.value })}
        placeholder="Practice, Game vs. Team Name, etc."
      />
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Start Date"
          type="datetime-local"
          value={event.start?.slice(0, 16)}
          onChange={(e) => setEvent({ ...event, start: e.target.value })}
        />
        <Input
          label="End Date"
          type="datetime-local"
          value={event.end?.slice(0, 16) || ""}
          onChange={(e) => setEvent({ ...event, end: e.target.value })}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Typography
            variant="body-sm"
            as="label"
            className="block font-medium text-text-primary mb-1"
          >
            Event Type
          </Typography>
          <select
            value={event.type}
            onChange={(e) =>
              setEvent({
                ...event,
                type: e.target.value as CalendarEvent["type"],
              })
            }
            className="w-full border border-border-medium rounded-md px-3 py-2"
          >
            <option value="practice">Practice</option>
            <option value="game">Game</option>
            <option value="meeting">Meeting</option>
            <option value="film">Film Session</option>
            <option value="other">Other</option>
          </select>
        </div>
        <Input
          label="Location"
          value={event.location || ""}
          onChange={(e) => setEvent({ ...event, location: e.target.value })}
          placeholder="Field, Stadium, etc."
        />
      </div>
      <div>
        <Typography
          variant="body-sm"
          as="label"
          className="block font-medium text-text-primary mb-1"
        >
          Description
        </Typography>
        <textarea
          value={event.description || ""}
          onChange={(e) => setEvent({ ...event, description: e.target.value })}
          placeholder="Event details, notes, etc."
          rows={3}
          className="w-full border border-border-medium rounded-md px-3 py-2"
        />
      </div>
      <div className="flex space-x-3 pt-4">
        <Button
          variant="primary"
          disabled={submitting || !event.title || !event.start}
          onClick={() => onSubmit(event)}
        >
          {submitting
            ? mode === "create"
              ? "Creating..."
              : "Saving..."
            : mode === "create"
              ? "Create Event"
              : "Save Changes"}
        </Button>
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
};

export default EventForm;
