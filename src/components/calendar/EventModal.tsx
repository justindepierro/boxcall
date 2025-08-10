/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { Button, Input } from "../ui";
import Icon from "../ui/Icon/Icon";
import { Tag, mapEventTypeToTagVariant } from "../ui/Tag";
import { Typography } from "../design-system/Typography";
import type {
  CalendarEvent,
  EventRSVP,
  CalendarComment,
} from "../../domain/calendar/types";
import { PracticePlannerModal } from "../practice/PracticePlannerModal";
import {
  useRSVPs,
  useUpdateRSVP,
  useComments,
  useAddComment,
} from "../../state/calendar/hooks";
import type { Database } from "../../types/database";

type UserProfile = Database["public"]["Tables"]["profiles"]["Row"];

// Minimal shape compatible with react-query mutation objects we pass in.
type MinimalMutation = {
  status: string;
  mutate: (...args: any[]) => void;
  mutateAsync: (...args: any[]) => Promise<any>;
};

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
  createEventMutation: MinimalMutation;
  updateEventMutation: MinimalMutation;
  deleteEventMutation: MinimalMutation;
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
  const [newComment, setNewComment] = useState("");

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
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-96 overflow-y-auto">
          <div className="p-6">
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
                className="text-gray-400 hover:text-gray-600 h-auto"
                icon={<Icon name="close" size="sm" />}
                iconPosition="only"
                aria-label="Close event modal"
              />
            </div>
            {isCreating ? (
              <div className="space-y-4">
                <Input
                  label="Event Title"
                  value={event.title}
                  onChange={(e) =>
                    setEvent({
                      ...(event as CalendarEvent),
                      title: e.target.value,
                    })
                  }
                  placeholder="Practice, Game vs. Team Name, etc."
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Start Date"
                    type="datetime-local"
                    value={event.start?.slice(0, 16)}
                    onChange={(e) =>
                      setEvent({
                        ...(event as CalendarEvent),
                        start: e.target.value,
                      })
                    }
                  />
                  <Input
                    label="End Date"
                    type="datetime-local"
                    value={event.end?.slice(0, 16) || ""}
                    onChange={(e) =>
                      setEvent({
                        ...(event as CalendarEvent),
                        end: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Event Type
                    </label>
                    <select
                      value={event.type}
                      onChange={(e) =>
                        setEvent({
                          ...(event as CalendarEvent),
                          type: e.target.value as CalendarEvent["type"],
                        })
                      }
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
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
                    onChange={(e) =>
                      setEvent({
                        ...(event as CalendarEvent),
                        location: e.target.value,
                      })
                    }
                    placeholder="Field, Stadium, etc."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={event.description || ""}
                    onChange={(e) =>
                      setEvent({
                        ...(event as CalendarEvent),
                        description: e.target.value,
                      })
                    }
                    placeholder="Event details, notes, etc."
                    rows={3}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                <div className="flex space-x-3 pt-4">
                  <Button
                    variant="primary"
                    disabled={
                      createEventMutation.status === "pending" ||
                      !event.title ||
                      !event.start
                    }
                    onClick={async () => {
                      try {
                        await createEventMutation.mutateAsync({
                          title: event.title,
                          start: event.start,
                          end: event.end,
                          type: event.type,
                          location: event.location,
                          description: event.description,
                        });
                        setIsCreating(false);
                        onClose();
                      } catch (err) {
                        console.error("Failed to create event:", err);
                      }
                    }}
                  >
                    {createEventMutation.status === "pending"
                      ? "Creating..."
                      : "Create Event"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsCreating(false);
                      onClose();
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : isEditing ? (
              <div className="space-y-4">
                <Input
                  label="Event Title"
                  value={event.title}
                  onChange={(e) =>
                    setEvent({
                      ...(event as CalendarEvent),
                      title: e.target.value,
                    })
                  }
                  placeholder="Practice, Game vs. Team Name, etc."
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Start Date"
                    type="datetime-local"
                    value={event.start?.slice(0, 16)}
                    onChange={(e) =>
                      setEvent({
                        ...(event as CalendarEvent),
                        start: e.target.value,
                      })
                    }
                  />
                  <Input
                    label="End Date"
                    type="datetime-local"
                    value={event.end?.slice(0, 16) || ""}
                    onChange={(e) =>
                      setEvent({
                        ...(event as CalendarEvent),
                        end: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Event Type
                    </label>
                    <select
                      value={event.type}
                      onChange={(e) =>
                        setEvent({
                          ...(event as CalendarEvent),
                          type: e.target.value as CalendarEvent["type"],
                        })
                      }
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
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
                    onChange={(e) =>
                      setEvent({
                        ...(event as CalendarEvent),
                        location: e.target.value,
                      })
                    }
                    placeholder="Field, Stadium, etc."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={event.description || ""}
                    onChange={(e) =>
                      setEvent({
                        ...(event as CalendarEvent),
                        description: e.target.value,
                      })
                    }
                    placeholder="Event details, notes, etc."
                    rows={3}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                <div className="flex space-x-3 pt-4">
                  <Button
                    variant="primary"
                    disabled={
                      updateEventMutation.status === "pending" ||
                      !event.title ||
                      !event.start
                    }
                    onClick={async () => {
                      try {
                        await updateEventMutation.mutateAsync({
                          id: event.id,
                          updates: {
                            title: event.title,
                            start: event.start,
                            end: event.end,
                            type: event.type,
                            location: event.location,
                            description: event.description,
                          },
                        });
                        setIsEditing(false);
                      } catch (err) {
                        console.error("Failed to update event:", err);
                      }
                    }}
                  >
                    {updateEventMutation.status === "pending"
                      ? "Saving..."
                      : "Save Changes"}
                  </Button>
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Tag variant={mapEventTypeToTagVariant(event.type)} size="sm">
                    {event.type}
                  </Tag>
                  {event.is_home && (
                    <Tag variant="success" size="sm">
                      HOME
                    </Tag>
                  )}
                </div>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center">
                    <Icon
                      name="calendar"
                      size="sm"
                      color="secondary"
                      className="mr-2"
                    />
                    {new Date(event.start).toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </div>
                  <div className="flex items-center">
                    <span className="w-4 h-4 mr-2">⏰</span>
                    {new Date(event.start).toLocaleTimeString("en-US", {
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                    {event.end && (
                      <>
                        {" "}
                        -{" "}
                        {new Date(event.end).toLocaleTimeString("en-US", {
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </>
                    )}
                  </div>
                  {event.location && (
                    <div className="flex items-center">
                      <Icon
                        name="target"
                        size="sm"
                        color="secondary"
                        className="mr-2"
                      />
                      {event.location}
                    </div>
                  )}
                  {event.team_name && (
                    <div className="flex items-center">
                      <Icon
                        name="users"
                        size="sm"
                        color="secondary"
                        className="mr-2"
                      />
                      {event.team_name}
                    </div>
                  )}
                  {event.opponent && (
                    <div className="flex items-center">
                      <Icon
                        name="target"
                        size="sm"
                        color="secondary"
                        className="mr-2"
                      />
                      vs. {event.opponent}
                    </div>
                  )}
                </div>
                {event.description && (
                  <div className="pt-3 border-t border-gray-200">
                    <Typography variant="body-md" className="text-gray-700">
                      {event.description}
                    </Typography>
                  </div>
                )}
                <div className="flex space-x-3 pt-4 flex-wrap">
                  {event.type === "practice" &&
                    (profile?.role === "coach" ||
                      profile?.role === "admin") && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => {
                          setShowPracticePlanner(true);
                          onClose();
                          onOpenPracticePlanner(event);
                        }}
                      >
                        <Icon name="file" size="sm" className="mr-1" />
                        Plan Practice
                      </Button>
                    )}
                  {(profile?.role === "coach" || profile?.role === "admin") &&
                    event.id && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsEditing(true)}
                      >
                        Edit
                      </Button>
                    )}
                  <Button variant="outline" size="sm">
                    Add to Personal Calendar
                  </Button>
                  {(profile?.role === "coach" || profile?.role === "admin") &&
                    event.id && (
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={deleteEventMutation.status === "pending"}
                        onClick={async () => {
                          try {
                            await deleteEventMutation.mutateAsync(event.id);
                            onClose();
                            setEvent(null);
                          } catch (err) {
                            console.error("Failed to delete event:", err);
                          }
                        }}
                      >
                        {deleteEventMutation.status === "pending"
                          ? "Deleting..."
                          : "Delete"}
                      </Button>
                    )}
                </div>
                {event.rsvp_required && event.id && (
                  <div className="mt-4 border-t border-gray-200 pt-4">
                    <Typography
                      variant="body-sm"
                      className="font-semibold mb-2 text-gray-700"
                    >
                      RSVP
                    </Typography>
                    {rsvps.isLoading ? (
                      <div className="text-sm text-gray-500">
                        Loading RSVP...
                      </div>
                    ) : rsvps.isError ? (
                      <div className="text-sm text-red-500">
                        Failed to load RSVP
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 flex-wrap">
                        {(["attending", "maybe", "not_attending"] as const).map(
                          (status) => {
                            const myStatus = rsvps.data?.find(
                              (r: EventRSVP) => r.user_id === userId
                            )?.status;
                            const isActive = myStatus === status;
                            return (
                              <Button
                                key={status}
                                size="xs"
                                variant={isActive ? "primary" : "outline"}
                                disabled={
                                  updateRSVPMutation.status === "pending" ||
                                  !userId
                                }
                                onClick={() =>
                                  updateRSVPMutation.mutate({
                                    userId: userId || "",
                                    status,
                                  })
                                }
                              >
                                {status === "attending"
                                  ? "Going"
                                  : status === "maybe"
                                    ? "Maybe"
                                    : "Can't Go"}
                              </Button>
                            );
                          }
                        )}
                        {updateRSVPMutation.status === "pending" && (
                          <span className="text-xs text-gray-500">
                            Saving...
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                )}
                {event.id && (
                  <div className="mt-6 border-t border-gray-200 pt-4">
                    <Typography
                      variant="body-sm"
                      className="font-semibold mb-2 text-gray-700"
                    >
                      Comments
                    </Typography>
                    {comments.isLoading ? (
                      <div className="text-sm text-gray-500">
                        Loading comments...
                      </div>
                    ) : comments.isError ? (
                      <div className="text-sm text-red-500">
                        Failed to load comments
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-40 overflow-y-auto pr-1">
                        {comments.data && comments.data.length > 0 ? (
                          comments.data.map((c: CalendarComment) => (
                            <div
                              key={c.id}
                              className="p-2 bg-gray-50 rounded border border-gray-100"
                            >
                              <div className="text-xs text-gray-500 mb-1">
                                {new Date(c.created_at).toLocaleString()} •{" "}
                                {c.user_id}
                              </div>
                              <div className="text-sm text-gray-800 whitespace-pre-wrap">
                                {c.body}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-xs text-gray-500">
                            No comments yet.
                          </div>
                        )}
                      </div>
                    )}
                    <div className="mt-3 space-y-2">
                      <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Add a comment..."
                        rows={2}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                        disabled={addCommentMutation.status === "pending"}
                      />
                      <div className="flex items-center gap-2">
                        <Button
                          size="xs"
                          variant="primary"
                          disabled={
                            addCommentMutation.status === "pending" ||
                            !newComment.trim()
                          }
                          onClick={() => {
                            addCommentMutation.mutate(newComment.trim());
                            setNewComment("");
                          }}
                        >
                          {addCommentMutation.status === "pending"
                            ? "Posting..."
                            : "Post"}
                        </Button>
                        {addCommentMutation.status === "pending" && (
                          <span className="text-xs text-gray-500">
                            Saving...
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
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
