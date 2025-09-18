import React, { useState } from "react";

import {
  useRSVPs,
  useUpdateRSVP,
  useComments,
  useAddComment,
} from "../../state/calendar/hooks";
import { Typography } from "../design-system/Typography";
import { PracticePlannerModal } from "../practice/PracticePlannerModal";
import { Button } from "../ui";
import { Icon } from "../ui/Icon";
import { useToast } from "../../hooks/useToast";
import { logger } from "../../telemetry/logger";

import { EventDetails } from "./EventModal/EventDetails";
import { EventForm } from "./EventModal/EventForm";

import type {
  CalendarEvent,
  CalendarEventCreate,
  EventRSVP,
} from "../../domain/calendar/types";
import type { MinimalMutation } from "../../types/mutations";
import type { Database } from "../../types/database";

type UserProfile = Database["public"]["Tables"]["profiles"]["Row"];

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: CalendarEvent | null;
  setEvent: React.Dispatch<React.SetStateAction<CalendarEvent | null>>;
  isCreating: boolean;
  setIsCreating: (v: boolean) => void;
  isEditing: boolean;
  setIsEditing: (v: boolean) => void;
  profile: UserProfile | null;
  userId: string | undefined;
  createEventMutation: MinimalMutation<
    CalendarEventCreate,
    Error,
    CalendarEvent
  >;
  updateEventMutation: MinimalMutation<
    { id: string; updates: Partial<CalendarEventCreate> },
    Error,
    null
  >;
  deleteEventMutation: MinimalMutation<string, Error, boolean>;
  onOpenPracticePlanner: (event: CalendarEvent) => void;
}

export const EventModal: React.FC<EventModalProps> = ({
  isOpen,
  onClose,
  event,
  setEvent,
  isCreating,
  setIsCreating,
  isEditing,
  setIsEditing,
  profile,
  userId,
  createEventMutation,
  updateEventMutation,
  deleteEventMutation,
  onOpenPracticePlanner,
}) => {
  const [showPracticePlanner, setShowPracticePlanner] = useState(false);
  const toast = useToast();
  // local UI state delegated to child components now

  const eventId = isOpen && event && !isCreating && event.id ? event.id : "";
  const rsvps = useRSVPs(eventId);
  const updateRSVPMutation = useUpdateRSVP(eventId);
  const comments = useComments(eventId);
  const addCommentMutation = useAddComment(eventId);

  if (!isOpen || !event) return null;

  const closeAll = () => {
    onClose();
    setIsCreating(false);
    setIsEditing(false);
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div className="surface-card elevation-modal rounded-md w-full max-w-xl calendar-event-modal-container">
          <div className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Icon
                  name={isCreating || isEditing ? "plus" : "calendar"}
                  size="lg"
                  className="text-navy-600"
                />
                <Typography variant="headline-md" className="text-navy-900">
                  {isCreating
                    ? "Create Event"
                    : isEditing
                      ? "Edit Event"
                      : "Event Details"}
                </Typography>
              </div>
              <Button
                variant="ghost"
                size="xs"
                onClick={closeAll}
                className="h-auto"
                icon={<Icon name="close" size="sm" />}
                iconPosition="only"
                aria-label="Close event modal"
              />
            </div>
            {isCreating && event ? (
              <EventForm
                mode="create"
                event={event}
                setEvent={(e) => setEvent(e)}
                submitting={createEventMutation.status === "pending"}
                onCancel={() => {
                  setIsCreating(false);
                  onClose();
                }}
                onSubmit={async (e) => {
                  try {
                    await createEventMutation.mutateAsync({
                      title: e.title,
                      start: e.start,
                      end: e.end,
                      type: e.type,
                      location: e.location,
                      description: e.description,
                    });
                    setIsCreating(false);
                    onClose();
                    toast.success("Event created", "Calendar");
                  } catch (err) {
                    logger.error("Failed to create event", err);
                    toast.error(
                      "Could not create event. Please try again.",
                      "Calendar"
                    );
                  }
                }}
              />
            ) : isEditing && event ? (
              <EventForm
                mode="edit"
                event={event}
                setEvent={(e) => setEvent(e)}
                submitting={updateEventMutation.status === "pending"}
                onCancel={() => setIsEditing(false)}
                onSubmit={async (e) => {
                  try {
                    await updateEventMutation.mutateAsync({
                      id: e.id,
                      updates: {
                        title: e.title,
                        start: e.start,
                        end: e.end,
                        type: e.type,
                        location: e.location,
                        description: e.description,
                      },
                    });
                    setIsEditing(false);
                    toast.success("Event updated", "Calendar");
                  } catch (err) {
                    logger.error("Failed to update event", err);
                    toast.error(
                      "Could not update event. Please try again.",
                      "Calendar"
                    );
                  }
                }}
              />
            ) : event ? (
              <EventDetails
                event={event}
                profileRole={profile?.role || null}
                userId={userId}
                onEdit={() => setIsEditing(true)}
                onDelete={async () => {
                  try {
                    if (event.id) {
                      await deleteEventMutation.mutateAsync(event.id);
                      onClose();
                      setEvent(null);
                      toast.success("Event deleted", "Calendar");
                    }
                  } catch (err) {
                    logger.error("Failed to delete event", err);
                    toast.error(
                      "Could not delete event. Please try again.",
                      "Calendar"
                    );
                  }
                }}
                deletePending={deleteEventMutation.status === "pending"}
                onPlanPractice={() => {
                  setShowPracticePlanner(true);
                  onClose();
                  onOpenPracticePlanner(event);
                }}
                rsvps={rsvps}
                myRsvpStatus={
                  rsvps.data?.find((r: EventRSVP) => r.user_id === userId)
                    ?.status
                }
                onRsvp={(status) =>
                  updateRSVPMutation.mutate({ userId: userId || "", status })
                }
                rsvpPending={updateRSVPMutation.status === "pending"}
                comments={comments}
                onAddComment={(body) => addCommentMutation.mutate(body)}
                addCommentPending={addCommentMutation.status === "pending"}
                rsvpRequired={!!event.rsvp_required}
              />
            ) : null}
          </div>
        </div>
      </div>
      {showPracticePlanner && event && event.type === "practice" && (
        <PracticePlannerModal
          event={event}
          onClose={() => setShowPracticePlanner(false)}
        />
      )}
    </>
  );
};

export default EventModal;
