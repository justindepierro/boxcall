/**
 * PostItem - Individual post display in the team feed
 */
import React, { useState } from "react";
import { Typography } from "../../../design-system/Typography";
import { Button } from "../../../ui/Button/Button";
import { Icon } from "../../../ui/Icon/Icon";
import { UserAvatar } from "../../../ui/UserAvatar";

interface PostItemProps {
  id: string;
  content: string;
  created_at: string | null;
  is_pinned: boolean | null;
  canPin: boolean;
  onTogglePin: (id: string, current: boolean | null) => void;
  author?:
    | {
        id: string;
        display_name: string | null;
        full_name: string | null;
        avatar_url: string | null;
      }[]
    | null;
  likes_count: number;
  comments_count: number;
  shares_count: number;
  userId?: string;
  onLike?: (postId: string) => void;
  onComment?: (postId: string) => void;
  onShare?: (postId: string) => void;
  isLiked?: boolean;
  isShared?: boolean;
}

const MAX_CONTENT_LENGTH = 280;

export const PostItem: React.FC<PostItemProps> = ({
  id,
  content,
  created_at,
  is_pinned,
  canPin,
  onTogglePin,
  author,
  likes_count,
  comments_count,
  shares_count,
  userId,
  onLike,
  onComment,
  onShare,
  isLiked,
  isShared,
}) => {
  const [expanded, setExpanded] = useState(false);
  const over = content.length > MAX_CONTENT_LENGTH;
  const display =
    over && !expanded ? `${content.slice(0, MAX_CONTENT_LENGTH)}…` : content;

  const authorData = author?.[0];
  const displayName =
    authorData?.display_name || authorData?.full_name || "Team Member";
  const avatarUrl = authorData?.avatar_url;

  return (
    <li className="rounded-lg border border-muted bg-primary elevation-card p-4 hover:shadow-md transition-shadow">
      {/* Post Header with Author Info */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          {authorData?.id ? (
            <UserAvatar
              userId={authorData.id}
              name={displayName}
              avatarUrl={avatarUrl}
              size="md"
              showName={true}
              showPopover={true}
              showOnHover={true}
              placement="bottom"
            />
          ) : (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-text-info to-text-primary flex items-center justify-center text-inverse font-semibold text-sm flex-shrink-0">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={`${displayName}'s avatar`}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  displayName.charAt(0).toUpperCase()
                )}
              </div>
              <Typography
                variant="body-sm"
                className="font-semibold text-primary truncate"
              >
                {displayName}
              </Typography>
            </div>
          )}

          {/* Timestamp and Pin Badge */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              {is_pinned && (
                <span className="inline-flex items-center gap-1 text-warning bg-warning/20 px-2 py-0.5 rounded-full text-xs font-medium">
                  <Icon name="star" size="sm" />
                  Pinned
                </span>
              )}
            </div>
            <Typography variant="body-xs" color="muted" className="mt-0.5">
              {created_at
                ? new Date(created_at).toLocaleString(undefined, {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : ""}
            </Typography>
          </div>
        </div>

        {/* Pin Button */}
        {canPin && (
          <Button
            type="button"
            size="xs"
            variant={is_pinned ? "secondary" : "ghost"}
            onClick={() => onTogglePin(id, !!is_pinned)}
            aria-pressed={!!is_pinned}
            aria-label={is_pinned ? "Unpin post" : "Pin post"}
            className={
              is_pinned
                ? "bg-warning/20 border border-text-warning text-warning"
                : "text-secondary hover:text-primary"
            }
          >
            {is_pinned ? "Pinned" : "Pin"}
          </Button>
        )}
      </div>

      {/* Post Content */}
      <div className="mb-3">
        <p className="text-sm text-primary whitespace-pre-wrap leading-relaxed">
          {display}
        </p>
        {over && (
          <Button
            type="button"
            size="xs"
            variant="link"
            onClick={() => setExpanded((e) => !e)}
            className="mt-2 p-0 h-auto font-normal text-info hover:text-info"
            aria-expanded={expanded}
          >
            {expanded ? "Show less" : "Read more"}
          </Button>
        )}
      </div>

      {/* Post Actions */}
      <div className="flex items-center justify-between pt-3 border-t border-muted">
        <div className="flex items-center gap-4">
          <Button
            type="button"
            size="xs"
            variant="ghost"
            className={`text-secondary hover:text-error hover:bg-surface-error p-2 ${
              isLiked ? "text-error" : ""
            }`}
            onClick={() => onLike?.(id)}
            aria-label={isLiked ? "Unlike post" : "Like post"}
            disabled={!userId}
          >
            <Icon name="award" size="sm" className="mr-1" />
            {likes_count > 0 ? likes_count : ""} {isLiked ? "Liked" : "Like"}
          </Button>
          <Button
            type="button"
            size="xs"
            variant="ghost"
            className="text-secondary hover:text-info hover:bg-info/20 p-2"
            onClick={() => onComment?.(id)}
            aria-label="Comment on post"
          >
            <Icon name="message" size="sm" className="mr-1" />
            {comments_count > 0 ? comments_count : ""} Comment
            {comments_count !== 1 ? "s" : ""}
          </Button>
          <Button
            type="button"
            size="xs"
            variant="ghost"
            className={`text-secondary hover:text-success hover:bg-success/20 p-2 ${
              isShared ? "text-success" : ""
            }`}
            onClick={() => onShare?.(id)}
            aria-label={isShared ? "Already shared" : "Share post"}
            disabled={!userId || isShared}
          >
            <Icon name="upload" size="sm" className="mr-1" />
            {shares_count > 0 ? shares_count : ""}{" "}
            {isShared ? "Shared" : "Share"}
          </Button>
        </div>
      </div>
    </li>
  );
};
