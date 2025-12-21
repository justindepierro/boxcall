// Social Service
// Comprehensive service for all social interactions

import { table } from "../data/supabase/db";
import { getCurrentUserId } from "../lib/auth-helpers";
import type {
  Reaction,
  ReactionSummary,
  CreateReactionRequest,
  Follow,
  FollowSummary,
  CreateFollowRequest,
  Comment,
  CreateCommentRequest,
  UpdateCommentRequest,
  NotificationSummary,
  ActivityItem,
  ContentType,
  FollowingType,
  ReactionType,
  SocialService,
} from "../types/social";

function isReactionType(value: string): value is ReactionType {
  return (
    value === "like" ||
    value === "love" ||
    value === "laugh" ||
    value === "wow" ||
    value === "sad" ||
    value === "angry"
  );
}

export class SocialServiceImpl implements SocialService {
  // =============================================================================
  // REACTIONS
  // =============================================================================

  async getReactions(
    contentType: ContentType,
    contentId: string
  ): Promise<ReactionSummary> {
    const userId = getCurrentUserId();

    // Get all reactions for this content
    const { data: reactions, error } = await table("reactions")
      .select("*")
      .eq("entity_type", contentType)
      .eq("entity_id", contentId);

    if (error) throw error;

    // Get current user's reaction (only if logged in)
    let userReaction = null;
    if (userId) {
      const { data } = await table("reactions")
        .select("reaction_type")
        .eq("entity_type", contentType)
        .eq("entity_id", contentId)
        .eq("user_id", userId)
        .single();
      userReaction = data;
    }

    // Aggregate reactions
    const reactionCounts: { [key in ReactionType]?: number } = {};
    reactions?.forEach((reaction) => {
      const rawType = String(reaction.reaction_type);
      if (!isReactionType(rawType)) return;
      reactionCounts[rawType] = (reactionCounts[rawType] || 0) + 1;
    });

    return {
      entity_type: contentType,
      entity_id: contentId,
      total_count: reactions?.length || 0,
      reactions: reactionCounts,
      user_reaction: userReaction?.reaction_type
        ? (String(userReaction.reaction_type) as ReactionType)
        : undefined,
    };
  }

  async addReaction(request: CreateReactionRequest): Promise<Reaction> {
    const userId = getCurrentUserId();
    if (!userId) throw new Error("User not authenticated");

    const { data, error } = await table("reactions")
      .insert({
        user_id: userId,
        ...request,
      })
      .select()
      .single();

    if (error) throw error;
    return {
      ...data,
      reaction_type: data.reaction_type as ReactionType,
    };
  }

  async removeReaction(
    contentType: ContentType,
    contentId: string
  ): Promise<void> {
    const userId = getCurrentUserId();
    if (!userId) throw new Error("User not authenticated");

    const { error } = await table("reactions")
      .delete()
      .eq("entity_type", contentType)
      .eq("entity_id", contentId)
      .eq("user_id", userId);

    if (error) throw error;
  }

  async toggleReaction(
    request: CreateReactionRequest
  ): Promise<Reaction | null> {
    const userId = getCurrentUserId();
    if (!userId) throw new Error("User not authenticated");

    // Check if reaction already exists
    const { data: existing } = await table("reactions")
      .select("*")
      .eq("user_id", userId)
      .eq("entity_type", request.entity_type)
      .eq("entity_id", request.entity_id)
      .single();

    if (existing) {
      if (existing.reaction_type === request.reaction_type) {
        // Same reaction type - remove it
        await this.removeReaction(request.entity_type, request.entity_id);
        return null;
      }
      // Different reaction type - update it
      const { data, error } = await table("reactions")
        .update({
          reaction_type: request.reaction_type,
        })
        .eq("id", existing.id)
        .select()
        .single();

      if (error) throw error;
      return {
        ...data,
        reaction_type: data.reaction_type as ReactionType,
      };
    }
    // No existing reaction - add it
    return await this.addReaction(request);
  }

  // =============================================================================
  // FOLLOWS
  // =============================================================================

  async getFollowStatus(
    followingType: FollowingType,
    followingId: string
  ): Promise<FollowSummary> {
    const userId = getCurrentUserId();

    // Get follower count
    const { count: followerCount } = await table("follows")
      .select("*", { count: "exact", head: true })
      .eq("following_id", followingId);

    // Check if current user is following
    let isFollowing = false;
    if (userId) {
      const { data } = await table("follows")
        .select("id")
        .eq("follower_id", userId)
        .eq("following_id", followingId)
        .single();

      isFollowing = !!data;
    }

    return {
      following_type: followingType,
      following_id: followingId,
      follower_count: followerCount || 0,
      is_following: isFollowing,
    };
  }

  async follow(request: CreateFollowRequest): Promise<Follow> {
    const userId = getCurrentUserId();
    if (!userId) throw new Error("User not authenticated");

    const { data, error } = await table("follows")
      .insert({
        follower_id: userId,
        ...request,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async unfollow(
    _followingType: FollowingType,
    followingId: string
  ): Promise<void> {
    const userId = getCurrentUserId();
    if (!userId) throw new Error("User not authenticated");

    const { error } = await table("follows")
      .delete()
      .eq("follower_id", userId)
      .eq("following_id", followingId);

    if (error) throw error;
  }

  async getFollowers(
    _followingType: FollowingType,
    followingId: string
  ): Promise<Follow[]> {
    const { data, error } = await table("follows")
      .select("*")
      .eq("following_id", followingId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getFollowing(userId: string): Promise<Follow[]> {
    const { data, error } = await table("follows")
      .select("*")
      .eq("follower_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // =============================================================================
  // COMMENTS
  // =============================================================================

  async getComments(
    contentType: ContentType,
    contentId: string,
    parentId?: string
  ): Promise<Comment[]> {
    let query = table("comments")
      .select("*")
      .eq("entity_type", contentType)
      .eq("entity_id", contentId)
      .order("created_at", { ascending: true });

    if (parentId) query = query.eq("parent_id", parentId);
    else query = query.is("parent_id", null);

    const { data, error } = await query;
    if (error) throw error;

    // Get reaction summaries for each comment
    const commentsWithReactions = await Promise.all(
      (data || []).map(async (comment) => {
        const reactions = await this.getReactions("comment", comment.id);
        return {
          ...comment,
          reactions,
          reply_count: 0,
        };
      })
    );

    return commentsWithReactions;
  }

  async addComment(request: CreateCommentRequest): Promise<Comment> {
    const userId = getCurrentUserId();
    if (!userId) throw new Error("User not authenticated");

    const { data, error } = await table("comments")
      .insert({
        user_id: userId,
        ...request,
      })
      .select("*")
      .single();

    if (error) throw error;
    return data;
  }

  async updateComment(
    commentId: string,
    request: UpdateCommentRequest
  ): Promise<Comment> {
    const userId = getCurrentUserId();
    if (!userId) throw new Error("User not authenticated");

    const { data, error } = await table("comments")
      .update({
        content: request.content,
        updated_at: new Date().toISOString(),
      })
      .eq("id", commentId)
      .eq("user_id", userId)
      .select("*")
      .single();

    if (error) throw error;
    return data;
  }

  async deleteComment(commentId: string): Promise<void> {
    const userId = getCurrentUserId();
    if (!userId) throw new Error("User not authenticated");

    const { error } = await table("comments")
      .delete()
      .eq("id", commentId)
      .eq("user_id", userId);

    if (error) throw error;
  }

  // =============================================================================
  // NOTIFICATIONS
  // =============================================================================

  async getNotifications(limit = 20, offset = 0): Promise<NotificationSummary> {
    const userId = getCurrentUserId();
    if (!userId) throw new Error("User not authenticated");

    const { data, error, count } = await table("notifications")
      .select("*", { count: "exact" })
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    const { count: unreadCount } = await table("notifications")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("read", false);

    return {
      total_count: count || 0,
      unread_count: unreadCount || 0,
      notifications: data || [],
    };
  }

  async markNotificationRead(notificationId: string): Promise<void> {
    const userId = getCurrentUserId();
    if (!userId) throw new Error("User not authenticated");

    const { error } = await table("notifications")
      .update({
        read: true,
      })
      .eq("id", notificationId)
      .eq("user_id", userId);

    if (error) throw error;
  }

  async markAllNotificationsRead(): Promise<void> {
    const userId = getCurrentUserId();
    if (!userId) throw new Error("User not authenticated");

    const { error } = await table("notifications")
      .update({
        read: true,
      })
      .eq("user_id", userId)
      .eq("read", false);

    if (error) throw error;
  }

  // =============================================================================
  // ACTIVITY FEED
  // =============================================================================

  async getActivityFeed(limit = 20, offset = 0): Promise<ActivityItem[]> {
    const userId = getCurrentUserId();
    if (!userId) throw new Error("User not authenticated");

    const { data, error } = await table("activity_feed")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return (data || []).map((item) => ({
      ...item,
      metadata: item.metadata as unknown,
    }));
  }
}

// Export singleton instance
export const socialService = new SocialServiceImpl();
