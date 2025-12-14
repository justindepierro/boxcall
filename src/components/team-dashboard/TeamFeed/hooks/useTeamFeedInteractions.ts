/**
 * useTeamFeedInteractions - Manages like, share, and comment interactions
 */
import { useState, useEffect, useCallback } from "react";
import { useToast } from "../../../../hooks/useToast";
import {
  likePost,
  unlikePost,
  checkUserLike,
  sharePost,
  checkUserShare,
} from "../../../../services/postsService";
import type { TeamPostListItem } from "../../../../services/postsService";

interface UseTeamFeedInteractionsProps {
  posts: TeamPostListItem[];
  userId?: string;
}

export function useTeamFeedInteractions({
  posts,
  userId,
}: UseTeamFeedInteractionsProps) {
  const toast = useToast();
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [sharedPosts, setSharedPosts] = useState<Set<string>>(new Set());
  const [loadingInteractions, setLoadingInteractions] = useState<Set<string>>(
    new Set()
  );

  // Load user's interaction state for posts
  useEffect(() => {
    if (!userId || posts.length === 0) return;

    const loadInteractions = async () => {
      const liked = new Set<string>();
      const shared = new Set<string>();

      await Promise.all(
        posts.map(async (post) => {
          try {
            const [isLiked, isShared] = await Promise.all([
              checkUserLike(post.id, userId),
              checkUserShare(post.id, userId),
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
  }, [userId, posts]);

  const handleLike = useCallback(
    async (postId: string) => {
      if (!userId) return;

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
    },
    [userId, likedPosts, toast]
  );

  const handleShare = useCallback(
    async (postId: string) => {
      if (!userId) return;

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
    },
    [userId, sharedPosts, toast]
  );

  const handleComment = useCallback(
    (_postId: string) => {
      toast.info("Comments coming soon!");
    },
    [toast]
  );

  return {
    likedPosts,
    sharedPosts,
    loadingInteractions,
    handleLike,
    handleShare,
    handleComment,
  };
}
