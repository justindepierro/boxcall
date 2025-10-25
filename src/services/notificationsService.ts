/**
 * Notifications Service
 * Handles creating, fetching, and managing in-app notifications
 * Supports: mentions, comment replies, reactions, announcements
 */

import { supabase } from "../lib/supabase";
import { emitTelemetry } from "../lib/telemetry";
import { MentionsService } from "./mentionsService";

// ============================================
// TYPE DEFINITIONS
// ============================================

export type NotificationType =
  | "mention"
  | "comment_reply"
  | "reaction"
  | "announcement";

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  announcement_id: string | null;
  comment_id: string | null;
  triggered_by_user_id: string | null;
  data: Record<string, any>;
  read: boolean;
  created_at: string;
  updated_at: string;
}

export interface NotificationWithUser extends Notification {
  triggered_by_user?: {
    id: string;
    full_name: string;
    display_name: string;
    avatar_url: string | null;
  };
}

// ============================================
// NOTIFICATIONS SERVICE
// ============================================

export class NotificationsService {
  /**
   * Create a mention notification
   */
  static async createMentionNotification(params: {
    mentionedUserId: string;
    announcementId: string;
    announcementTitle: string;
    triggeredByUserId: string;
    triggeredByUserName: string;
    mentionedInType: "announcement" | "comment";
    commentId?: string;
  }): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.from("notifications").insert({
        user_id: params.mentionedUserId,
        type: "mention",
        title: `${params.triggeredByUserName} mentioned you`,
        message: `You were mentioned in ${params.mentionedInType === "announcement" ? "an announcement" : "a comment"}: "${params.announcementTitle}"`,
        announcement_id: params.announcementId,
        comment_id: params.commentId || null,
        triggered_by_user_id: params.triggeredByUserId,
        data: {
          mentioned_in: params.mentionedInType,
        },
      });

      if (error) {
        console.error("Error creating mention notification:", error);
        return { success: false, error: error.message };
      }

      emitTelemetry("notification.created", {
        type: "mention",
        user_id: params.mentionedUserId,
      });

      return { success: true };
    } catch (error) {
      console.error("Error in createMentionNotification:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Extract mentions from content and create notifications
   */
  static async processMentions(params: {
    contentJson: string;
    announcementId: string;
    announcementTitle: string;
    authorId: string;
    authorName: string;
    type: "announcement" | "comment";
    commentId?: string;
  }): Promise<void> {
    try {
      // Extract mention IDs from content
      const mentionedUserIds = MentionsService.extractMentionedUserIds(
        params.contentJson
      );

      // Don't notify yourself
      const filteredIds = mentionedUserIds.filter(
        (id) => id !== params.authorId
      );

      // Create notifications for each mentioned user
      await Promise.all(
        filteredIds.map((userId) =>
          this.createMentionNotification({
            mentionedUserId: userId,
            announcementId: params.announcementId,
            announcementTitle: params.announcementTitle,
            triggeredByUserId: params.authorId,
            triggeredByUserName: params.authorName,
            mentionedInType: params.type,
            commentId: params.commentId,
          })
        )
      );
    } catch (error) {
      console.error("Error processing mentions:", error);
    }
  }

  /**
   * Get notifications for current user
   */
  static async getNotifications(params?: {
    unreadOnly?: boolean;
    limit?: number;
  }): Promise<NotificationWithUser[]> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return [];

      let query = supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (params?.unreadOnly) {
        query = query.eq("read", false);
      }

      if (params?.limit) {
        query = query.limit(params.limit);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching notifications:", error);
        return [];
      }

      const notifications = (data || []) as Notification[];

      // Fetch triggered_by user details
      const userIds = notifications
        .map((n) => n.triggered_by_user_id)
        .filter((id): id is string => id !== null);

      if (userIds.length === 0) {
        return notifications as NotificationWithUser[];
      }

      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, display_name, avatar_url")
        .in("id", userIds);

      const profileMap = new Map((profiles || []).map((p: any) => [p.id, p]));

      return notifications.map((n) => ({
        ...n,
        triggered_by_user: n.triggered_by_user_id
          ? profileMap.get(n.triggered_by_user_id)
          : undefined,
      }));
    } catch (error) {
      console.error("Error in getNotifications:", error);
      return [];
    }
  }

  /**
   * Mark notification as read
   */
  static async markAsRead(
    notificationId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from("notifications")
        .update({ read: true })
        .eq("id", notificationId);

      if (error) {
        console.error("Error marking notification as read:", error);
        return { success: false, error: error.message };
      }

      emitTelemetry("notification.marked_read", {
        notification_id: notificationId,
      });

      return { success: true };
    } catch (error) {
      console.error("Error in markAsRead:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Mark all notifications as read
   */
  static async markAllAsRead(): Promise<{ success: boolean; error?: string }> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: "Not authenticated" };
      }

      const { error } = await supabase
        .from("notifications")
        .update({ read: true })
        .eq("user_id", user.id)
        .eq("read", false);

      if (error) {
        console.error("Error marking all notifications as read:", error);
        return { success: false, error: error.message };
      }

      emitTelemetry("notification.marked_all_read", {});

      return { success: true };
    } catch (error) {
      console.error("Error in markAllAsRead:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Delete a notification
   */
  static async deleteNotification(
    notificationId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from("notifications")
        .delete()
        .eq("id", notificationId);

      if (error) {
        console.error("Error deleting notification:", error);
        return { success: false, error: error.message };
      }

      emitTelemetry("notification.deleted", {
        notification_id: notificationId,
      });

      return { success: true };
    } catch (error) {
      console.error("Error in deleteNotification:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Get unread count
   */
  static async getUnreadCount(): Promise<number> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return 0;

      const { count, error } = await supabase
        .from("notifications")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("read", false);

      if (error) {
        console.error("Error getting unread count:", error);
        return 0;
      }

      return count || 0;
    } catch (error) {
      console.error("Error in getUnreadCount:", error);
      return 0;
    }
  }

  /**
   * Subscribe to real-time notifications
   */
  static subscribeToNotifications(
    userId: string,
    onNotification: (notification: Notification) => void
  ) {
    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          onNotification(payload.new as Notification);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }
}
