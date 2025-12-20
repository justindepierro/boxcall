import React, { useState } from "react";

import { useCreateEvent, useTeamEvents } from "../../hooks/teamDataHooks";
import { telemetry } from "../../lib/telemetry";
import {
  CAPABILITIES,
  getCapabilitiesForRole,
  hasCapability,
} from "@services/capabilities/capabilityMap";
import { Typography } from "../design-system/Typography";
import { OnboardingHint } from "../onboarding/OnboardingHint";
import { Card } from "../ui";
import { Button } from "../ui/Button/Button";
import { Icon } from "../ui/Icon/Icon";
import { Input } from "../ui/Input";
import { Modal } from "../ui/Modal/Modal";
import { Dropdown } from "../ui/Dropdown";

interface TeamCalendarProps {
  teamId: string;
  userRole?: string;
}
/**
 * Team Calendar - Team-specific events and schedule
 *
 * Features:
 * - Team games, practices, and meetings
 * - Team-specific calendar view
 * - Event details and locations
 * - RSVP functionality for events
 */
export const TeamCalendar: React.FC<TeamCalendarProps> = ({
  teamId,
  userRole,
}) => {
  const { data: events = [], isLoading } = useTeamEvents(teamId);
  const { mutateAsync: createEvent, isPending } = useCreateEvent(teamId);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    title: "",
    eventType: "practice",
    startsAt: "",
    location: "",
  });
  const caps = getCapabilitiesForRole(userRole);
  // Reuse CREATE_POST until a dedicated CREATE_EVENT capability constant is added
  const canCreate = hasCapability(caps, CAPABILITIES.CREATE_POST);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title || !form.startsAt) return;
    await createEvent({
      title: form.title,
      eventType: form.eventType,
      startsAt: new Date(form.startsAt).toISOString(),
      location: form.location || undefined,
    });
    if (events.length === 0) {
      telemetry.track("event.first", { teamId });
    }
    setOpen(false);
    setForm({ title: "", eventType: "practice", startsAt: "", location: "" });
  }
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <Typography
          variant="headline-md"
          className="flex items-center gap-2 text-primary"
        >
          <Icon name="calendar" size="md" /> Team Calendar
        </Typography>
        {canCreate && (
          <Button size="sm" variant="primary" onClick={() => setOpen(true)}>
            New Event
          </Button>
        )}
      </div>
      {isLoading && (
        <div className="text-sm text-secondary">Loading events...</div>
      )}
      {!isLoading && !events.length && (
        <OnboardingHint
          icon="calendar"
          title="Schedule Your First Event"
          message="Add games, practices, meetings, and film sessions to build your season schedule."
          steps={[
            "Create an event (coach roles)",
            "Players will see upcoming commitments",
            "RSVP & attendance tracking (roadmap)",
          ]}
          actions={[
            {
              label: "Plan Event",
              variant: "primary",
              onClick: () => setOpen(true),
            },
            {
              label: "View Roadmap",
              variant: "ghost",
              onClick: () =>
                telemetry.track("onboarding.calendar.view_roadmap", { teamId }),
            },
          ]}
        />
      )}
      {!!events.length && !isLoading && (
        <ul className="space-y-2" aria-label="Upcoming team events">
          {events.slice(0, 6).map((ev) => (
            <li
              key={ev.id}
              className="flex items-center justify-between text-sm bg-subtle rounded-lg px-3 py-2 hover:bg-subtle/70 transition-colors"
            >
              <span className="font-medium text-primary">{ev.title}</span>
              <span className="text-secondary">
                {new Date(ev.starts_at).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </li>
          ))}
        </ul>
      )}
      {open && (
        <Modal
          isOpen={open}
          onClose={() => setOpen(false)}
          title="Create Event"
        >
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <Typography
                variant="body-sm"
                as="label"
                className="block font-medium mb-1"
                htmlFor="ev-title"
              >
                Title
              </Typography>
              <Input
                id="ev-title"
                value={form.title}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setForm((f) => ({ ...f, title: e.target.value }))
                }
                required
                placeholder="Practice / Game vs Central"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 bc-grid-gap">
              <div>
                <Typography
                  variant="body-sm"
                  as="label"
                  className="block font-medium mb-1"
                  htmlFor="ev-type"
                >
                  Type
                </Typography>
                <Dropdown
                  id="ev-type"
                  value={form.eventType}
                  onChange={(value) =>
                    setForm((f) => ({ ...f, eventType: value }))
                  }
                  options={[
                    { value: "practice", label: "Practice" },
                    { value: "game", label: "Game" },
                    { value: "meeting", label: "Meeting" },
                    { value: "workout", label: "Workout" },
                    { value: "other", label: "Other" },
                  ]}
                />
              </div>
              <div>
                <Typography
                  variant="body-sm"
                  as="label"
                  className="block font-medium mb-1"
                  htmlFor="ev-start"
                >
                  Starts At
                </Typography>
                <Input
                  id="ev-start"
                  type="datetime-local"
                  value={form.startsAt}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setForm((f) => ({ ...f, startsAt: e.target.value }))
                  }
                  required
                />
              </div>
            </div>
            <div>
              <Typography
                variant="body-sm"
                as="label"
                className="block font-medium mb-1"
                htmlFor="ev-location"
              >
                Location (optional)
              </Typography>
              <Input
                id="ev-location"
                value={form.location}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setForm((f) => ({ ...f, location: e.target.value }))
                }
                placeholder="Main Field"
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setOpen(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={isPending}>
                {isPending ? "Creating..." : "Create Event"}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </Card>
  );
};
