import React, { useState } from "react";

import {
  useRSVPs,
  useUpdateRSVP,
  useComments,
  useAddComment,
} from "../../stores/calendar/hooks";
import { Typography } from "../design-system/Typography";
import { PracticeScriptModal } from "../practice/PracticeScriptModal";
import { Button } from "../ui";
import Icon from "../ui/Icon/Icon";

import { EventDetails } from "./EventModal/EventDetails";
import { EventForm } from "./EventModal/EventForm";

import type { UseMutationResult } from "@tanstack/react-query";
import type {
  CalendarEvent,
  EventRSVP,
  CalendarEventCreate,
} from "../../domain/calendar/types";
import type { Database } from "../../types/database";
import { logError } from "../../utils/logger";

type UserProfile = Database["public"]["Tables"]["profiles"]["Row"];

// Mutation types for calendar operations
type CreateEventMutation = UseMutationResult<
  CalendarEvent,
  Error,
  CalendarEventCreate
>;
type UpdateEventMutation = UseMutationResult<
  null,
  Error,
  { id: string; updates: Partial<CalendarEventCreate> }
>;
type DeleteEventMutation = UseMutationResult<boolean, Error, string>;

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
  createEventMutation: CreateEventMutation;
  updateEventMutation: UpdateEventMutation;
  deleteEventMutation: DeleteEventMutation;
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
      <div className="fixed inset-0 bg-text-primary/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div className="bg-primary elevation-modal rounded-lg w-full max-w-xl calendar-event-modal-container">
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
                  } catch (err) {
                    logError("Failed to create event:", err);
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
                  } catch (err) {
                    logError("Failed to update event:", err);
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
                    }
                  } catch (err) {
                    logError("Failed to delete event:", err);
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
        <PracticeScriptModal
          onClose={() => setShowPracticePlanner(false)}
          onSave={(script) => {
            console.log("Practice script saved:", script);
            // TODO: Save to database and show success message
            setShowPracticePlanner(false);
          }}
        />
      )}
    </>
  );
};

export default EventModal;
