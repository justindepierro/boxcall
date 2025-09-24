// Social Features Types
// Comprehensive type definitions for all social interactions

export type ReactionType = 'like' | 'love' | 'laugh' | 'wow' | 'sad' | 'angry';

export type ContentType = 'play' | 'game_plan' | 'comment' | 'practice_script';

export type FollowingType = 'team' | 'user';

export type NotificationType = 'reaction' | 'follow' | 'comment' | 'mention' | 'reply' | 'team_invite' | 'game_reminder';

export type ActivityType = 'reaction_added' | 'follow_started' | 'comment_posted' | 'play_created' | 'game_plan_created';

// =============================================================================
// REACTIONS
// =============================================================================

export interface Reaction {
  id: string;
  user_id: string;
  content_type: ContentType;
  content_id: string;
  reaction_type: ReactionType;
  created_at: string;
  updated_at: string;
}

export interface ReactionSummary {
  content_type: ContentType;
  content_id: string;
  total_count: number;
  reactions: {
    [key in ReactionType]?: number;
  };
  user_reaction?: ReactionType;
}

export interface CreateReactionRequest {
  content_type: ContentType;
  content_id: string;
  reaction_type: ReactionType;
}

// =============================================================================
// FOLLOWS
// =============================================================================

export interface Follow {
  id: string;
  follower_id: string;
  following_type: FollowingType;
  following_id: string;
  created_at: string;
}

export interface FollowSummary {
  following_type: FollowingType;
  following_id: string;
  follower_count: number;
  is_following: boolean;
}

export interface CreateFollowRequest {
  following_type: FollowingType;
  following_id: string;
}

// =============================================================================
// COMMENTS
// =============================================================================

export interface Comment {
  id: string;
  user_id: string;
  content_type: ContentType;
  content_id: string;
  parent_comment_id?: string;
  content: string;
  is_edited: boolean;
  edited_at?: string;
  created_at: string;
  updated_at: string;
  // Populated from joins
  user?: {
    id: string;
    display_name?: string;
    avatar_url?: string;
  };
  reactions?: ReactionSummary;
  replies?: Comment[];
  reply_count?: number;
}

export interface CreateCommentRequest {
  content_type: ContentType;
  content_id: string;
  parent_comment_id?: string;
  content: string;
}

export interface UpdateCommentRequest {
  content: string;
}

// =============================================================================
// MENTIONS
// =============================================================================

export interface Mention {
  id: string;
  comment_id: string;
  mentioned_user_id: string;
  mentioner_user_id: string;
  mention_position: number;
  created_at: string;
  // Populated from joins
  mentioned_user?: {
    id: string;
    display_name?: string;
  };
  mentioner_user?: {
    id: string;
    display_name?: string;
  };
}

// =============================================================================
// NOTIFICATIONS
// =============================================================================

export interface Notification {
  id: string;
  user_id: string;
  notification_type: NotificationType;
  title: string;
  message: string;
  related_content_type?: ContentType | 'team' | 'user';
  related_content_id?: string;
  is_read: boolean;
  read_at?: string;
  action_url?: string;
  created_at: string;
}

export interface NotificationSummary {
  total_count: number;
  unread_count: number;
  notifications: Notification[];
}

// =============================================================================
// ACTIVITY FEED
// =============================================================================

export interface ActivityItem {
  id: string;
  user_id: string;
  activity_type: ActivityType;
  content_type?: ContentType | 'team' | 'user';
  content_id?: string;
  metadata: Record<string, any>;
  created_at: string;
  // Populated from joins
  user?: {
    id: string;
    display_name?: string;
    avatar_url?: string;
  };
  content?: any; // Depends on content_type
}

// =============================================================================
// SERVICE INTERFACES
// =============================================================================

export interface SocialService {
  // Reactions
  getReactions(contentType: ContentType, contentId: string): Promise<ReactionSummary>;
  addReaction(request: CreateReactionRequest): Promise<Reaction>;
  removeReaction(contentType: ContentType, contentId: string): Promise<void>;
  toggleReaction(request: CreateReactionRequest): Promise<Reaction | null>;

  // Follows
  getFollowStatus(followingType: FollowingType, followingId: string): Promise<FollowSummary>;
  follow(request: CreateFollowRequest): Promise<Follow>;
  unfollow(followingType: FollowingType, followingId: string): Promise<void>;
  getFollowers(followingType: FollowingType, followingId: string): Promise<Follow[]>;
  getFollowing(userId: string): Promise<Follow[]>;

  // Comments
  getComments(contentType: ContentType, contentId: string, parentId?: string): Promise<Comment[]>;
  addComment(request: CreateCommentRequest): Promise<Comment>;
  updateComment(commentId: string, request: UpdateCommentRequest): Promise<Comment>;
  deleteComment(commentId: string): Promise<void>;

  // Notifications
  getNotifications(limit?: number, offset?: number): Promise<NotificationSummary>;
  markNotificationRead(notificationId: string): Promise<void>;
  markAllNotificationsRead(): Promise<void>;

  // Activity Feed
  getActivityFeed(limit?: number, offset?: number): Promise<ActivityItem[]>;
}

// =============================================================================
// COMPONENT PROPS
// =============================================================================

export interface ReactionButtonProps {
  contentType: ContentType;
  contentId: string;
  size?: 'sm' | 'md' | 'lg';
  showCount?: boolean;
  variant?: 'button' | 'icon';
}

export interface FollowButtonProps {
  followingType: FollowingType;
  followingId: string;
  variant?: 'button' | 'icon';
  size?: 'sm' | 'md' | 'lg';
}

export interface CommentSectionProps {
  contentType: ContentType;
  contentId: string;
  maxDepth?: number;
  showReactions?: boolean;
}

export interface NotificationBellProps {
  size?: 'sm' | 'md' | 'lg';
  showBadge?: boolean;
}

export interface ActivityFeedProps {
  userId?: string;
  limit?: number;
  showFilters?: boolean;
}