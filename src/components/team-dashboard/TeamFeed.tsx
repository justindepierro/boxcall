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
import { useAuth } from "../../app/auth-store";
import { Typography } from "../design-system/Typography";
import { Button } from "../ui/Button/Button";
import { Icon } from "../ui/Icon/Icon";

import type { TeamPostListItem } from "@services/postsService";
import { useTeamFeedInteractions } from "./TeamFeed/hooks";
import {
  PostItem,
  CreatePostModal,
  QuickPostComposer,
  EmptyFeed,
  LoadingFeed,
  ErrorFeed,
} from "./TeamFeed/components";

interface TeamFeedProps {
  teamId: string;
  userRole: string;
}

export const TeamFeed: React.FC<TeamFeedProps> = ({ teamId, userRole }) => {
  const { user } = useAuth();
  const {
    data: posts = [],
    isLoading,
    error,
    refetch,
  } = useTeamPosts(teamId) as {
    data: TeamPostListItem[] | undefined;
    isLoading: boolean;
    error: Error | null;
    refetch: () => Promise<unknown>;
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

  const { likedPosts, sharedPosts, handleLike, handleShare, handleComment } =
    useTeamFeedInteractions({ posts, userId: user?.id });

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

  // Empty state
  if (!isLoading && !error && posts.length === 0) {
    return (
      <EmptyFeed
        canCreate={canCreate}
        isModalOpen={open}
        onOpenModal={() => setOpen(true)}
        onCloseModal={() => setOpen(false)}
        content={content}
        onContentChange={setContent}
        onSubmit={handleSubmit}
        isCreating={creating}
        triggerRef={triggerRef}
      />
    );
  }

  return (
    <div className="space-y-4" aria-label="Team feed">
      <div className="flex items-center justify-between">
        <Typography
          variant="headline-md"
          className="flex items-center gap-2 text-primary"
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

      <CreatePostModal
        isOpen={open}
        onClose={() => setOpen(false)}
        content={content}
        onContentChange={setContent}
        onSubmit={handleSubmit}
        isCreating={creating}
        labelId="post-content-inline"
      />

      {isLoading && <LoadingFeed />}

      {!!error && <ErrorFeed error={error} onRetry={() => refetch()} />}

      {canCreate && !isLoading && !error && posts.length > 0 && (
        <QuickPostComposer
          content={content}
          onContentChange={setContent}
          onSubmit={handleSubmit}
          isCreating={creating}
        />
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
            likes_count={p.likes_count ?? 0}
            comments_count={p.comments_count ?? 0}
            shares_count={p.shares_count ?? 0}
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
