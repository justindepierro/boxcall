import React, { useState, useRef, useEffect } from "react";

import {
  useTeamPosts,
  useCreatePost,
  usePinPost,
} from "../../hooks/teamDataHooks";
import { useToast } from "../../hooks/useToast";
import { telemetry } from "../../lib/telemetry";
import {
  CAPABILITIES,
  getCapabilitiesForRole,
  hasCapability,
} from "@services/capabilities/capabilityMap";
import {
  likePost,
  unlikePost,
  checkUserLike,
  sharePost,
  checkUserShare,
} from "../../services/postsService";
import { useAuth } from "../../app/auth-store";
import { Typography } from "../design-system/Typography";
import { OnboardingHint } from "../onboarding/OnboardingHint";
import { Button } from "../ui/Button/Button";
import { Icon } from "../ui/Icon/Icon";
import { Modal } from "../ui/Modal/Modal";
import { TextArea } from "../ui/TextArea";
import { UserAvatar } from "../ui/UserAvatar";

import type { TeamPostListItem } from "@services/postsService";

interface TeamFeedProps {
  teamId: string;
  userRole: string;
}

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

const PostItem: React.FC<PostItemProps> = ({
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
  const MAX = 280;
  const over = content.length > MAX;
  const display = over && !expanded ? content.slice(0, MAX) + "…" : content;

  // Get display name and avatar (author is an array from Supabase join)
  const authorData = author?.[0];
  const displayName =
    authorData?.display_name || authorData?.full_name || "Team Member";
  const avatarUrl = authorData?.avatar_url;

  return (
    <li className="rounded-lg border border-subtle surface-card elevation-card p-4 hover:shadow-md transition-shadow">
      {/* Post Header with Author Info */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          {/* User Avatar with Popover */}
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
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-text-info to-text-primary flex items-center justify-center text-text-inverse font-semibold text-sm flex-shrink-0">
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
                className="font-semibold text-text-primary truncate"
              >
                {displayName}
              </Typography>
            </div>
          )}

          {/* Timestamp and Pin Badge */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              {is_pinned && (
                <span className="inline-flex items-center gap-1 text-text-warning bg-surface-warning px-2 py-0.5 rounded-full text-xs font-medium">
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
                ? "bg-surface-warning border border-text-warning text-text-warning"
                : "text-text-secondary hover:text-text-primary"
            }
          >
            {is_pinned ? "Pinned" : "Pin"}
          </Button>
        )}
      </div>

      {/* Post Content */}
      <div className="mb-3">
        <p className="text-sm text-text-primary whitespace-pre-wrap leading-relaxed">
          {display}
        </p>
        {over && (
          <Button
            type="button"
            size="xs"
            variant="link"
            onClick={() => setExpanded((e) => !e)}
            className="mt-2 p-0 h-auto font-normal text-text-info hover:text-text-info"
            aria-expanded={expanded}
          >
            {expanded ? "Show less" : "Read more"}
          </Button>
        )}
      </div>

      {/* Post Actions */}
      <div className="flex items-center justify-between pt-3 border-t border-subtle">
        <div className="flex items-center gap-4">
          <Button
            type="button"
            size="xs"
            variant="ghost"
            className={`text-text-secondary hover:text-text-error hover:bg-surface-error p-2 ${
              isLiked ? "text-text-error" : ""
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
            className="text-text-secondary hover:text-text-info hover:bg-surface-info p-2"
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
            className={`text-text-secondary hover:text-text-success hover:bg-surface-success p-2 ${
              isShared ? "text-text-success" : ""
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

export const TeamFeed: React.FC<TeamFeedProps> = ({ teamId, userRole }) => {
  const { user } = useAuth();
  const {
    data: posts = [],
    isLoading,
    error,
  } = useTeamPosts(teamId) as {
    data: TeamPostListItem[] | undefined;
    isLoading: boolean;
    error: Error | null;
  };
  const { mutateAsync: createPost, isPending: creating } =
    useCreatePost(teamId);
  const { mutate: pinMutate } = usePinPost(teamId);
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState("");
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const toast = useToast();
  const caps = getCapabilitiesForRole(userRole);
  const canCreate = hasCapability(caps, CAPABILITIES.CREATE_POST);
  const canPin = hasCapability(caps, CAPABILITIES.PIN_POST);

  // Interaction state
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [sharedPosts, setSharedPosts] = useState<Set<string>>(new Set());
  const [_loadingInteractions, setLoadingInteractions] = useState<Set<string>>(
    new Set()
  );

  useEffect(() => {
    if (!open && triggerRef.current) triggerRef.current.focus();
  }, [open]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;
    try {
      await createPost(content.trim());
      toast.success("Post created");
      if (posts.length === 0) {
        telemetry.track("post.first", { teamId });
      }
      setOpen(false);
      setContent("");
    } catch (e) {
      toast.error("Failed to create post", (e as Error).message);
    }
  }

  function togglePin(id: string, current: boolean | null) {
    pinMutate({ postId: id, pin: !current });
  }

  // Interaction handlers
  async function handleLike(postId: string) {
    if (!user?.id) return;

    setLoadingInteractions((prev) => new Set(prev).add(postId));

    try {
      const isCurrentlyLiked = likedPosts.has(postId);
      if (isCurrentlyLiked) {
        await unlikePost(postId);
        setLikedPosts((prev) => {
          const newSet = new Set(prev);
          newSet.delete(postId);
          return newSet;
        });
      } else {
        await likePost(postId);
        setLikedPosts((prev) => new Set(prev).add(postId));
      }
    } catch (error) {
      toast.error("Failed to update like", (error as Error).message);
    } finally {
      setLoadingInteractions((prev) => {
        const newSet = new Set(prev);
        newSet.delete(postId);
        return newSet;
      });
    }
  }

  async function handleShare(postId: string) {
    if (!user?.id) return;

    setLoadingInteractions((prev) => new Set(prev).add(postId));

    try {
      const isCurrentlyShared = sharedPosts.has(postId);
      if (!isCurrentlyShared) {
        await sharePost(postId);
        setSharedPosts((prev) => new Set(prev).add(postId));
        toast.success("Post shared!");
      }
    } catch (error) {
      toast.error("Failed to share post", (error as Error).message);
    } finally {
      setLoadingInteractions((prev) => {
        const newSet = new Set(prev);
        newSet.delete(postId);
        return newSet;
      });
    }
  }

  function handleComment(_postId: string) {
    // TODO: Implement comment modal or inline comments
    toast.info("Comments coming soon!");
  }

  // Load user's interaction state for posts
  useEffect(() => {
    if (!user?.id || posts.length === 0) return;

    const loadInteractions = async () => {
      const liked = new Set<string>();
      const shared = new Set<string>();

      await Promise.all(
        posts.map(async (post) => {
          try {
            const [isLiked, isShared] = await Promise.all([
              checkUserLike(post.id, user.id),
              checkUserShare(post.id, user.id),
            ]);
            if (isLiked) liked.add(post.id);
            if (isShared) shared.add(post.id);
          } catch {
            // Ignore individual post errors
          }
        })
      );

      setLikedPosts(liked);
      setSharedPosts(shared);
    };

    loadInteractions();
  }, [user?.id, posts]);

  if (!isLoading && !error && posts.length === 0) {
    return (
      <div className="space-y-4">
        {canCreate && (
          <Button
            variant="primary"
            size="sm"
            onClick={() => setOpen(true)}
            ref={triggerRef}
          >
            <Icon name="plus" size="sm" /> New Post
          </Button>
        )}
        <OnboardingHint
          icon="message"
          title="Team Feed"
          message="Announcements, practice scripts, and achievements will appear here once you begin posting."
          steps={[
            "Click New Post (coach roles)",
            "Share schedule or practice focus",
            "Attach scripts or files (roadmap)",
          ]}
          actions={
            canCreate
              ? [
                  {
                    label: "Plan First Post",
                    variant: "primary",
                    onClick: () => setOpen(true),
                  },
                ]
              : [
                  {
                    label: "View Roadmap",
                    variant: "ghost",
                    onClick: () =>
                      console.info("telemetry:onboarding.feed.view_roadmap"),
                  },
                ]
          }
        />
        {open && (
          <Modal
            isOpen={open}
            onClose={() => setOpen(false)}
            title="Create Post"
          >
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <div>
                <Typography
                  variant="body-sm"
                  as="label"
                  className="block font-medium mb-1"
                  htmlFor="post-content"
                >
                  Announcement
                </Typography>
                <TextArea
                  id="post-content"
                  value={content}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setContent(e.target.value)
                  }
                  placeholder="Practice moved to 6:30 PM – arrive early for warmups."
                  required
                  rows={5}
                />
              </div>
              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setOpen(false)}
                  disabled={creating}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" disabled={creating}>
                  {creating ? "Posting..." : "Publish"}
                </Button>
              </div>
            </form>
          </Modal>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4" aria-label="Team feed">
      <div className="flex items-center justify-between">
        <Typography
          variant="headline-md"
          className="flex items-center gap-2 text-text-primary"
        >
          <Icon name="message" size="md" /> Team Feed
        </Typography>
        {canCreate && (
          <Button
            size="sm"
            variant="primary"
            onClick={() => setOpen(true)}
            ref={triggerRef}
          >
            <Icon name="plus" size="sm" /> New Post
          </Button>
        )}
      </div>
      {open && (
        <Modal isOpen={open} onClose={() => setOpen(false)} title="Create Post">
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <Typography
                variant="body-sm"
                as="label"
                className="block font-medium mb-1"
                htmlFor="post-content-inline"
              >
                Announcement
              </Typography>
              <TextArea
                id="post-content-inline"
                value={content}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setContent(e.target.value)
                }
                placeholder="Game film uploaded. Review by Friday."
                required
                rows={5}
              />
            </div>
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setOpen(false)}
                disabled={creating}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={creating}>
                {creating ? "Posting..." : "Publish"}
              </Button>
            </div>
          </form>
        </Modal>
      )}
      {isLoading && (
        <ul className="space-y-3" aria-hidden="true">
          {Array.from({ length: 3 }).map((_, i) => (
            <li
              key={i}
              className="animate-pulse rounded border-subtle surface-card p-3"
            >
              <div className="h-4 surface-subtle dark:bg-text-tertiary rounded w-5/6 mb-2" />
              <div className="h-4 surface-subtle dark:bg-text-tertiary rounded w-2/3" />
            </li>
          ))}
        </ul>
      )}
      {!!error && (
        <div className="rounded border border-text-error surface-subtle bg-surface-error p-4 text-sm text-text-error">
          Failed to load posts.
          <Button
            type="button"
            variant="link"
            size="xs"
            className="ml-1"
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
          {error.message && (
            <div className="mt-1 text-xs opacity-75">{error.message}</div>
          )}
        </div>
      )}
      {canCreate && !isLoading && !error && posts.length > 0 && (
        <div
          className="border-subtle surface-card elevation-card rounded p-4"
          aria-label="Quick post composer"
        >
          <form onSubmit={handleSubmit} className="space-y-3" noValidate>
            <TextArea
              id="inline-composer"
              value={content}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setContent(e.target.value)
              }
              placeholder="Share an update..."
              rows={3}
            />
            <div className="flex justify-end gap-2">
              <Button
                type="submit"
                size="sm"
                variant="primary"
                disabled={creating || !content.trim()}
              >
                {creating ? "Posting..." : "Post"}
              </Button>
            </div>
          </form>
        </div>
      )}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {posts.length ? `${posts.length} posts loaded` : "No posts"}
      </div>
      <ul className="space-y-3" aria-label="Posts list">
        {posts.map((p: TeamPostListItem) => (
          <PostItem
            key={p.id}
            id={p.id}
            content={p.content}
            created_at={p.created_at}
            is_pinned={p.is_pinned}
            canPin={canPin}
            onTogglePin={togglePin}
            likes_count={p.likes_count}
            comments_count={p.comments_count}
            shares_count={p.shares_count}
            userId={user?.id}
            onLike={handleLike}
            onComment={handleComment}
            onShare={handleShare}
            isLiked={likedPosts.has(p.id)}
            isShared={sharedPosts.has(p.id)}
          />
        ))}
      </ul>
    </div>
  );
};
