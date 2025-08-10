import React, { useState } from "react";
import { Button } from "../../ui";
import Icon from "../../ui/Icon/Icon";
import { Tag, mapEventTypeToTagVariant } from "../../ui/Tag";
import { Typography } from "../../design-system/Typography";
import type {
  CalendarEvent,
  EventRSVP,
  CalendarComment,
} from "../../../domain/calendar/types";

interface EventDetailsProps {
  event: CalendarEvent;
  profileRole?: string | null;
  userId?: string;
  onEdit: () => void;
  onDelete: () => Promise<void> | void;
  deletePending: boolean;
  onPlanPractice: () => void;
  rsvps: { isLoading: boolean; isError: boolean; data?: EventRSVP[] };
  myRsvpStatus?: string;
  onRsvp: (status: "attending" | "maybe" | "not_attending") => void;
  rsvpPending: boolean;
  comments: { isLoading: boolean; isError: boolean; data?: CalendarComment[] };
  onAddComment: (body: string) => void;
  addCommentPending: boolean;
  rsvpRequired: boolean;
}

export const EventDetails: React.FC<EventDetailsProps> = ({
  event,
  profileRole,
  userId,
  onEdit,
  onDelete,
  deletePending,
  onPlanPractice,
  rsvps,
  myRsvpStatus,
  onRsvp,
  rsvpPending,
  comments,
  onAddComment,
  addCommentPending,
  rsvpRequired,
}) => {
  const [newComment, setNewComment] = useState("");
  return (
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
      <div className="space-y-2 text-sm text-text-secondary">
        <div className="flex items-center">
          <Icon name="calendar" size="sm" color="secondary" className="mr-2" />
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
            <Icon name="target" size="sm" color="secondary" className="mr-2" />
            {event.location}
          </div>
        )}
        {event.team_name && (
          <div className="flex items-center">
            <Icon name="users" size="sm" color="secondary" className="mr-2" />
            {event.team_name}
          </div>
        )}
        {event.opponent && (
          <div className="flex items-center">
            <Icon name="target" size="sm" color="secondary" className="mr-2" />
            vs. {event.opponent}
          </div>
        )}
      </div>
      {event.description && (
        <div className="pt-3 border-t border-subtle">
          <Typography variant="body-md" className="text-text-primary">
            {event.description}
          </Typography>
        </div>
      )}
      <div className="flex space-x-3 pt-4 flex-wrap">
        {event.type === "practice" &&
          (profileRole === "coach" || profileRole === "admin") && (
            <Button variant="primary" size="sm" onClick={onPlanPractice}>
              <Icon name="file" size="sm" className="mr-1" />
              Plan Practice
            </Button>
          )}
        {(profileRole === "coach" || profileRole === "admin") && event.id && (
          <Button variant="secondary" size="sm" onClick={onEdit}>
            Edit
          </Button>
        )}
        <Button variant="subtle" size="sm">
          Add to Personal Calendar
        </Button>
        {(profileRole === "coach" || profileRole === "admin") && event.id && (
          <Button
            variant="danger"
            size="sm"
            disabled={deletePending}
            onClick={async () => {
              await onDelete();
            }}
          >
            {deletePending ? "Deleting..." : "Delete"}
          </Button>
        )}
      </div>
      {rsvpRequired && event.id && (
        <div className="mt-4 border-t border-subtle pt-4">
          <Typography
            variant="body-sm"
            className="font-semibold mb-2 text-text-primary"
          >
            RSVP
          </Typography>
          {rsvps.isLoading ? (
            <div className="text-sm text-text-muted">Loading RSVP...</div>
          ) : rsvps.isError ? (
            <div className="text-sm text-red-500">Failed to load RSVP</div>
          ) : (
            <div className="flex items-center gap-2 flex-wrap">
              {(["attending", "maybe", "not_attending"] as const).map(
                (status) => {
                  const isActive = myRsvpStatus === status;
                  return (
                    <Button
                      key={status}
                      size="xs"
                      variant={isActive ? "primary" : "outline"}
                      disabled={rsvpPending || !userId}
                      onClick={() => onRsvp(status)}
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
              {rsvpPending && (
                <span className="text-xs text-text-muted">Saving...</span>
              )}
            </div>
          )}
        </div>
      )}
      {event.id && (
        <div className="mt-6 border-t border-subtle pt-4">
          <Typography
            variant="body-sm"
            className="font-semibold mb-2 text-text-primary"
          >
            Comments
          </Typography>
          {comments.isLoading ? (
            <div className="text-sm text-text-muted">Loading comments...</div>
          ) : comments.isError ? (
            <div className="text-sm text-red-500">Failed to load comments</div>
          ) : (
            <div className="space-y-3 max-h-40 overflow-y-auto pr-1">
              {comments.data && comments.data.length > 0 ? (
                comments.data.map((c) => (
                  <div
                    key={c.id}
                    className="p-2 surface-subtle rounded border border-subtle"
                  >
                    <div className="text-xs text-text-muted mb-1">
                      {new Date(c.created_at).toLocaleString()} • {c.user_id}
                    </div>
                    <div className="text-sm text-text-primary whitespace-pre-wrap">
                      {c.body}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-xs text-text-muted">No comments yet.</div>
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
              disabled={addCommentPending}
            />
            <div className="flex items-center gap-2">
              <Button
                size="xs"
                variant="primary"
                disabled={addCommentPending || !newComment.trim()}
                onClick={() => {
                  onAddComment(newComment.trim());
                  setNewComment("");
                }}
              >
                {addCommentPending ? "Posting..." : "Post"}
              </Button>
              {addCommentPending && (
                <span className="text-xs text-text-muted">Saving...</span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventDetails;
