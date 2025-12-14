import React, { useState } from "react";

import { Typography } from "../../design-system/Typography";
import { Button } from "../../ui";
import Icon from "../../ui/Icon/Icon";
import { Tag, mapEventTypeToTagVariant } from "../../ui/Tag";
import { UserAvatar } from "../../ui/UserAvatar";

import type {
  CalendarEvent,
  EventRSVP,
  CalendarComment,
} from "../../../domain/calendar/types";

/** Format time for display */
function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

/** Format date for display */
function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

interface EventMetadataProps {
  event: CalendarEvent;
}

/** Event metadata display (date, time, location, opponent) */
const EventMetadata: React.FC<EventMetadataProps> = ({ event }) => {
  const startDate = new Date(event.start);
  const endDate = event.end ? new Date(event.end) : null;

  return (
    <div className="space-y-2">
      <div className="flex items-center">
        <Icon name="calendar" size="sm" color="secondary" className="mr-2" />
        <Typography variant="body-sm" color="muted">
          {formatDate(startDate)}
        </Typography>
      </div>
      <div className="flex items-center">
        <span className="w-4 h-4 mr-2">⏰</span>
        <Typography variant="body-sm" color="muted" as="span">
          {formatTime(startDate)}
          {endDate && <> - {formatTime(endDate)}</>}
        </Typography>
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
  );
};

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
  const isCoachOrAdmin = profileRole === "coach" || profileRole === "admin";

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

      <EventMetadata event={event} />

      {event.description && (
        <div className="pt-3">
          <Typography variant="body-md" className="text-primary">
            {event.description}
          </Typography>
        </div>
      )}

      <div className="flex space-x-3 pt-4 flex-wrap">
        {event.type === "practice" && isCoachOrAdmin && (
          <Button variant="primary" size="sm" onClick={onPlanPractice}>
            <Icon name="file" size="sm" className="mr-1" />
            Plan Practice
          </Button>
        )}
        {isCoachOrAdmin && event.id && (
          <Button variant="secondary" size="sm" onClick={onEdit}>
            Edit
          </Button>
        )}
        <Button variant="subtle" size="sm">
          Add to Personal Calendar
        </Button>
        {isCoachOrAdmin && event.id && (
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
        <div className="mt-4 pt-4">
          <Typography
            variant="body-sm"
            className="font-semibold mb-2 text-primary"
          >
            RSVP
          </Typography>
          <RSVPSection
            rsvps={rsvps}
            myRsvpStatus={myRsvpStatus}
            onRsvp={onRsvp}
            rsvpPending={rsvpPending}
            userId={userId}
          />
        </div>
      )}

      {event.id && (
        <div className="mt-6 pt-4">
          <Typography
            variant="body-sm"
            className="font-semibold mb-2 text-primary"
          >
            Comments
          </Typography>
          <CommentsSection
            comments={comments}
            onAddComment={onAddComment}
            addCommentPending={addCommentPending}
          />
        </div>
      )}
    </div>
  );
};

interface RSVPSectionProps {
  rsvps: { isLoading: boolean; isError: boolean; data?: EventRSVP[] };
  myRsvpStatus?: string;
  onRsvp: (status: "attending" | "maybe" | "not_attending") => void;
  rsvpPending: boolean;
  userId?: string;
}

/** RSVP button group */
const RSVPSection: React.FC<RSVPSectionProps> = ({
  rsvps,
  myRsvpStatus,
  onRsvp,
  rsvpPending,
  userId,
}) => {
  if (rsvps.isLoading) {
    return (
      <Typography variant="body-sm" color="muted">
        Loading RSVP...
      </Typography>
    );
  }

  if (rsvps.isError) {
    return (
      <Typography variant="body-sm" className="text-error">
        Failed to load RSVP
      </Typography>
    );
  }

  const rsvpOptions: Array<{
    status: "attending" | "maybe" | "not_attending";
    label: string;
  }> = [
    { status: "attending", label: "Going" },
    { status: "maybe", label: "Maybe" },
    { status: "not_attending", label: "Can't Go" },
  ];

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {rsvpOptions.map(({ status, label }) => (
        <Button
          key={status}
          size="xs"
          variant={myRsvpStatus === status ? "primary" : "outline"}
          disabled={rsvpPending || !userId}
          onClick={() => onRsvp(status)}
        >
          {label}
        </Button>
      ))}
      {rsvpPending && (
        <Typography variant="caption" color="muted" as="span">
          Saving...
        </Typography>
      )}
    </div>
  );
};

interface CommentsSectionProps {
  comments: { isLoading: boolean; isError: boolean; data?: CalendarComment[] };
  onAddComment: (body: string) => void;
  addCommentPending: boolean;
}

/** Comments display and form */
const CommentsSection: React.FC<CommentsSectionProps> = ({
  comments,
  onAddComment,
  addCommentPending,
}) => {
  const [newComment, setNewComment] = useState("");

  const handleSubmit = () => {
    onAddComment(newComment.trim());
    setNewComment("");
  };

  return (
    <>
      {(() => {
        if (comments.isLoading) {
          return (
            <Typography variant="body-sm" color="muted">
              Loading comments...
            </Typography>
          );
        }
        if (comments.isError) {
          return (
            <Typography variant="body-sm" className="text-error">
              Failed to load comments
            </Typography>
          );
        }
        return (
          <div className="space-y-3 max-h-40 overflow-y-auto pr-1">
            {comments.data && comments.data.length > 0 ? (
              comments.data.map((c) => (
                <div
                  key={c.id}
                  className="p-3 bg-subtle rounded-lg border border-muted"
                >
                  <div className="flex items-start gap-3">
                    <UserAvatar
                      userId={c.user_id}
                      size="sm"
                      showName={true}
                      showPopover={true}
                      showOnHover={true}
                      placement="bottom"
                    />
                    <div className="flex-1 min-w-0">
                      <Typography
                        variant="caption"
                        color="muted"
                        className="mb-2 block"
                      >
                        {new Date(c.created_at).toLocaleString()}
                      </Typography>
                      <Typography
                        variant="body-sm"
                        className="text-primary whitespace-pre-wrap"
                      >
                        {c.body}
                      </Typography>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <Typography variant="caption" color="muted">
                No comments yet.
              </Typography>
            )}
          </div>
        );
      })()}
      <div className="mt-3 space-y-2">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          rows={2}
          className="w-full border border-secondary rounded-lg px-3 py-2"
          disabled={addCommentPending}
        />
        <div className="flex items-center gap-2">
          <Button
            size="xs"
            variant="primary"
            disabled={addCommentPending || !newComment.trim()}
            onClick={handleSubmit}
          >
            {addCommentPending ? "Posting..." : "Post"}
          </Button>
          {addCommentPending && (
            <Typography variant="caption" color="muted" as="span">
              Saving...
            </Typography>
          )}
        </div>
      </div>
    </>
  );
};

export default EventDetails;
