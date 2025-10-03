// Social Service
// Comprehensive service for all social interactions

import { supabase } from '../lib/supabase';
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
  SocialService
} from '../types/social';

export class SocialServiceImpl implements SocialService {
  // =============================================================================
  // REACTIONS
  // =============================================================================

  async getReactions(contentType: ContentType, contentId: string): Promise<ReactionSummary> {
    // Get all reactions for this content
    const { data: reactions, error } = await supabase
      .from('reactions')
      .select('*')
      .eq('content_type', contentType)
      .eq('content_id', contentId);

    if (error) throw error;

    // Get current user's reaction
    const { data: userReaction } = await supabase
      .from('reactions')
      .select('reaction_type')
      .eq('content_type', contentType)
      .eq('content_id', contentId)
      .eq('user_id', supabase.auth.getUser()?.then(({ data }) => data.user?.id))
      .single();

    // Aggregate reactions
    const reactionCounts: { [key in ReactionType]?: number } = {};
    reactions?.forEach((reaction: Reaction) => {
      const reactionType = reaction.reaction_type as ReactionType;
      reactionCounts[reactionType] = (reactionCounts[reactionType] || 0) + 1;
    });

    return {
      content_type: contentType,
      content_id: contentId,
      total_count: reactions?.length || 0,
      reactions: reactionCounts,
      user_reaction: userReaction?.reaction_type
    };
  }

  async addReaction(request: CreateReactionRequest): Promise<Reaction> {
    const { data, error } = await supabase
      .from('reactions')
      .insert({
        user_id: supabase.auth.getUser()?.then(({ data }) => data.user?.id),
        ...request
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async removeReaction(contentType: ContentType, contentId: string): Promise<void> {
    const { error } = await supabase
      .from('reactions')
      .delete()
      .eq('content_type', contentType)
      .eq('content_id', contentId)
      .eq('user_id', supabase.auth.getUser()?.then(({ data }) => data.user?.id));

    if (error) throw error;
  }

  async toggleReaction(request: CreateReactionRequest): Promise<Reaction | null> {
    const userId = (await supabase.auth.getUser()).data.user?.id;
    if (!userId) throw new Error('User not authenticated');

    // Check if reaction already exists
    const { data: existing } = await supabase
      .from('reactions')
      .select('*')
      .eq('user_id', userId)
      .eq('content_type', request.content_type)
      .eq('content_id', request.content_id)
      .single();

    if (existing) {
      if (existing.reaction_type === request.reaction_type) {
        // Same reaction type - remove it
        await this.removeReaction(request.content_type, request.content_id);
        return null;
      } else {
        // Different reaction type - update it
        const { data, error } = await supabase
          .from('reactions')
          .update({ reaction_type: request.reaction_type, updated_at: new Date().toISOString() })
          .eq('id', existing.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    } else {
      // No existing reaction - add it
      return await this.addReaction(request);
    }
  }

  // =============================================================================
  // FOLLOWS
  // =============================================================================

  async getFollowStatus(followingType: FollowingType, followingId: string): Promise<FollowSummary> {
    const userId = (await supabase.auth.getUser()).data.user?.id;

    // Get follower count
    const { count: followerCount } = await supabase
      .from('follows')
      .select('*', { count: 'exact', head: true })
      .eq('following_type', followingType)
      .eq('following_id', followingId);

    // Check if current user is following
    let isFollowing = false;
    if (userId) {
      const { data } = await supabase
        .from('follows')
        .select('id')
        .eq('follower_id', userId)
        .eq('following_type', followingType)
        .eq('following_id', followingId)
        .single();

      isFollowing = !!data;
    }

    return {
      following_type: followingType,
      following_id: followingId,
      follower_count: followerCount || 0,
      is_following: isFollowing
    };
  }

  async follow(request: CreateFollowRequest): Promise<Follow> {
    const userId = (await supabase.auth.getUser()).data.user?.id;
    if (!userId) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('follows')
      .insert({
        follower_id: userId,
        ...request
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async unfollow(followingType: FollowingType, followingId: string): Promise<void> {
    const userId = (await supabase.auth.getUser()).data.user?.id;
    if (!userId) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('follows')
      .delete()
      .eq('follower_id', userId)
      .eq('following_type', followingType)
      .eq('following_id', followingId);

    if (error) throw error;
  }

  async getFollowers(followingType: FollowingType, followingId: string): Promise<Follow[]> {
    const { data, error } = await supabase
      .from('follows')
      .select(`
        *,
        follower:profiles(id, display_name, avatar_url)
      `)
      .eq('following_type', followingType)
      .eq('following_id', followingId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getFollowing(userId: string): Promise<Follow[]> {
    const { data, error } = await supabase
      .from('follows')
      .select(`
        *,
        following_team:teams(id, name, mascot),
        following_user:profiles(id, display_name, avatar_url)
      `)
      .eq('follower_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // =============================================================================
  // COMMENTS
  // =============================================================================

  async getComments(contentType: ContentType, contentId: string, parentId?: string): Promise<Comment[]> {
    let query = supabase
      .from('comments')
      .select(`
        *,
        user:profiles(id, display_name, avatar_url),
        replies:comments!parent_comment_id(
          *,
          user:profiles(id, display_name, avatar_url)
        )
      `)
      .eq('content_type', contentType)
      .eq('content_id', contentId)
      .is('parent_comment_id', parentId || null)
      .order('created_at', { ascending: true });

    const { data, error } = await query;
    if (error) throw error;

    // Get reaction summaries for each comment
    const commentsWithReactions = await Promise.all(
      (data || []).map(async (comment) => {
        const reactions = await this.getReactions('comment', comment.id);
        const replyCount = comment.replies?.length || 0;

        return {
          ...comment,
          reactions,
          reply_count: replyCount
        };
      })
    );

    return commentsWithReactions;
  }

  async addComment(request: CreateCommentRequest): Promise<Comment> {
    const userId = (await supabase.auth.getUser()).data.user?.id;
    if (!userId) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('comments')
      .insert({
        user_id: userId,
        ...request
      })
      .select(`
        *,
        user:profiles(id, display_name, avatar_url)
      `)
      .single();

    if (error) throw error;
    return data;
  }

  async updateComment(commentId: string, request: UpdateCommentRequest): Promise<Comment> {
    const { data, error } = await supabase
      .from('comments')
      .update({
        content: request.content,
        is_edited: true,
        edited_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', commentId)
      .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
      .select(`
        *,
        user:profiles(id, display_name, avatar_url)
      `)
      .single();

    if (error) throw error;
    return data;
  }

  async deleteComment(commentId: string): Promise<void> {
    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId)
      .eq('user_id', (await supabase.auth.getUser()).data.user?.id);

    if (error) throw error;
  }

  // =============================================================================
  // NOTIFICATIONS
  // =============================================================================

  async getNotifications(limit = 20, offset = 0): Promise<NotificationSummary> {
    const userId = (await supabase.auth.getUser()).data.user?.id;
    if (!userId) throw new Error('User not authenticated');

    const { data, error, count } = await supabase
      .from('notifications')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    const { count: unreadCount } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    return {
      total_count: count || 0,
      unread_count: unreadCount || 0,
      notifications: data || []
    };
  }

  async markNotificationRead(notificationId: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .update({
        is_read: true,
        read_at: new Date().toISOString()
      })
      .eq('id', notificationId)
      .eq('user_id', (await supabase.auth.getUser()).data.user?.id);

    if (error) throw error;
  }

  async markAllNotificationsRead(): Promise<void> {
    const userId = (await supabase.auth.getUser()).data.user?.id;
    if (!userId) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('notifications')
      .update({
        is_read: true,
        read_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) throw error;
  }

  // =============================================================================
  // ACTIVITY FEED
  // =============================================================================

  async getActivityFeed(limit = 20, offset = 0): Promise<ActivityItem[]> {
    const userId = (await supabase.auth.getUser()).data.user?.id;
    if (!userId) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('activity_feed')
      .select(`
        *,
        user:profiles(id, display_name, avatar_url)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return data || [];
  }
}

// Export singleton instance
export const socialService = new SocialServiceImpl();