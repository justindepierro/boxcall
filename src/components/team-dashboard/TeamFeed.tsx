import React, { useState, useRef, useEffect } from "react";

import {
  useTeamPosts,
  useCreatePost,
  usePinPost,
} from "../../hooks/teamDataHooks";
import { useToast } from "../../hooks/useToast";
import { telemetry } from "../../lib/telemetry";
import {
  Capability,
  getCapabilitiesForRole,
  hasCapability,
} from "@services/capabilities/capabilityMap";
import { Typography } from "../design-system/Typography";
import { OnboardingHint } from "../onboarding/OnboardingHint";
import { Button } from "../ui/Button/Button";
import { Icon } from "../ui/Icon";
import { Modal } from "../ui/Modal/Modal";
import { TextArea } from "../ui/TextArea";

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
}

const PostItem: React.FC<PostItemProps> = ({
  id,
  content,
  created_at,
  is_pinned,
  canPin,
  onTogglePin,
}) => {
  const [expanded, setExpanded] = useState(false);
  const MAX = 280;
  const over = content.length > MAX;
  const display = over && !expanded ? content.slice(0, MAX) + "…" : content;
  return (
    <li className="rounded border-subtle surface-card elevation-card p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <p className="text-sm text-text-primary whitespace-pre-wrap">
            {display}
          </p>
          {over && (
            <Button
              type="button"
              size="xs"
              variant="link"
              onClick={() => setExpanded((e) => !e)}
              className="mt-1"
              aria-expanded={expanded}
            >
              {expanded ? "Show less" : "Read more"}
            </Button>
          )}
        </div>
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
                ? "bg-amber-200 dark:bg-amber-600/30 border border-amber-300 dark:border-amber-500 text-amber-800 dark:text-amber-200"
                : "border border-transparent text-text-secondary hover:text-text-primary"
            }
          >
            {is_pinned ? "Pinned" : "Pin"}
          </Button>
        )}
      </div>
      <div className="mt-2 flex items-center justify-between text-xs text-text-secondary">
        <span>
          {created_at
            ? new Date(created_at).toLocaleString(undefined, {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })
            : ""}
        </span>
        {is_pinned && (
          <span className="inline-flex items-center gap-1 text-amber-700 dark:text-amber-300">
            <Icon name="star" size="sm" />
            Pinned
          </span>
        )}
      </div>
    </li>
  );
};

export const TeamFeed: React.FC<TeamFeedProps> = ({ teamId, userRole }) => {
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
  const canCreate = hasCapability(caps, Capability.CREATE_POST);
  const canPin = hasCapability(caps, Capability.PIN_POST);

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
                    onClick: () => {
                      // console.info("telemetry:onboarding.feed.view_roadmap");
                    },
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
              <div className="h-4 surface-subtle dark:bg-gray-600 rounded w-5/6 mb-2" />
              <div className="h-4 surface-subtle dark:bg-gray-600 rounded w-2/3" />
            </li>
          ))}
        </ul>
      )}
      {!!error && (
        <div className="rounded border border-subtle dark:border-red-700 surface-subtle dark:bg-red-900/30 p-4 text-sm text-red-700 dark:text-red-300">
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
          />
        ))}
      </ul>
    </div>
  );
};
