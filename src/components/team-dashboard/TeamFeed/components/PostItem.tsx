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

type PostAuthor = NonNullable<PostItemProps["author"]>[number];

const MAX_CONTENT_LENGTH = 280;

function formatPostTimestamp(createdAt: string | null): string {
  if (!createdAt) return "";
  return new Date(createdAt).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function PinnedBadge() {
  return (
    <span className="inline-flex items-center gap-1 text-warning bg-warning/20 px-2 py-0.5 rounded-full text-xs font-medium">
      <Icon name="star" size="sm" />
      Pinned
    </span>
  );
}

function AuthorFallback({
  avatarUrl,
  displayName,
}: {
  avatarUrl: string | null | undefined;
  displayName: string;
}) {
  return (
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
  );
}

function PostHeader({
  id,
  authorData,
  displayName,
  avatarUrl,
  createdAt,
  isPinned,
  canPin,
  onTogglePin,
}: {
  id: string;
  authorData: PostAuthor | undefined;
  displayName: string;
  avatarUrl: string | null | undefined;
  createdAt: string | null;
  isPinned: boolean;
  canPin: boolean;
  onTogglePin: (id: string, current: boolean | null) => void;
}) {
  return (
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
          <AuthorFallback avatarUrl={avatarUrl} displayName={displayName} />
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            {isPinned ? <PinnedBadge /> : null}
          </div>
          <Typography variant="body-xs" color="muted" className="mt-0.5">
            {formatPostTimestamp(createdAt)}
          </Typography>
        </div>
      </div>

      {canPin ? (
        <Button
          type="button"
          size="xs"
          variant={isPinned ? "secondary" : "ghost"}
          onClick={() => onTogglePin(id, isPinned)}
          aria-pressed={isPinned}
          aria-label={isPinned ? "Unpin post" : "Pin post"}
          className={
            isPinned
              ? "bg-warning/20 border border-text-warning text-warning"
              : "text-secondary hover:text-primary"
          }
        >
          {isPinned ? "Pinned" : "Pin"}
        </Button>
      ) : null}
    </div>
  );
}

function PostContent({
  display,
  over,
  expanded,
  onToggleExpanded,
}: {
  display: string;
  over: boolean;
  expanded: boolean;
  onToggleExpanded: () => void;
}) {
  return (
    <div className="mb-3">
      <p className="text-sm text-primary whitespace-pre-wrap leading-relaxed">
        {display}
      </p>
      {over ? (
        <Button
          type="button"
          size="xs"
          variant="link"
          onClick={onToggleExpanded}
          className="mt-2 p-0 h-auto font-normal text-info hover:text-info"
          aria-expanded={expanded}
        >
          {expanded ? "Show less" : "Read more"}
        </Button>
      ) : null}
    </div>
  );
}

function PostActions({
  id,
  likesCount,
  commentsCount,
  sharesCount,
  userId,
  isLiked,
  isShared,
  onLike,
  onComment,
  onShare,
}: {
  id: string;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  userId?: string;
  isLiked?: boolean;
  isShared?: boolean;
  onLike?: (postId: string) => void;
  onComment?: (postId: string) => void;
  onShare?: (postId: string) => void;
}) {
  return (
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
          {likesCount > 0 ? likesCount : ""} {isLiked ? "Liked" : "Like"}
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
          {commentsCount > 0 ? commentsCount : ""} Comment
          {commentsCount !== 1 ? "s" : ""}
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
          {sharesCount > 0 ? sharesCount : ""} {isShared ? "Shared" : "Share"}
        </Button>
      </div>
    </div>
  );
}

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
  const isPinned = Boolean(is_pinned);
  const toggleExpanded = () => setExpanded((e) => !e);

  return (
    <li className="rounded-lg border border-muted bg-primary elevation-card p-4 hover:shadow-md transition-shadow">
      <PostHeader
        id={id}
        authorData={authorData}
        displayName={displayName}
        avatarUrl={avatarUrl}
        createdAt={created_at}
        isPinned={isPinned}
        canPin={canPin}
        onTogglePin={onTogglePin}
      />

      <PostContent
        display={display}
        over={over}
        expanded={expanded}
        onToggleExpanded={toggleExpanded}
      />

      <PostActions
        id={id}
        likesCount={likes_count}
        commentsCount={comments_count}
        sharesCount={shares_count}
        userId={userId}
        isLiked={isLiked}
        isShared={isShared}
        onLike={onLike}
        onComment={onComment}
        onShare={onShare}
      />
    </li>
  );
};
