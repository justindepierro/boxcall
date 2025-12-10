/**
 * Announcement Views Service
 *
 * Tracks when users view announcements for read receipts
 * Provides analytics on who has/hasn't viewed announcements
 */

import { supabase } from "../lib/supabase";
import { getCurrentUserId } from "../lib/auth-helpers";
import { logError } from "../utils/logger";

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface AnnouncementView {
  id: string;
  announcement_id: string;
  user_id: string;
  team_id: string;
  viewed_at: string;
}

export interface ViewerInfo {
  user_id: string;
  user_name: string;
  user_role: string;
  viewed_at: string;
}

export interface ReadReceiptStats {
  total_members: number;
  viewed_count: number;
  unviewed_count: number;
  view_percentage: number;
  viewers: ViewerInfo[];
  non_viewers: Array<{
    user_id: string;
    user_name: string;
    user_role: string;
  }>;
}

// ============================================
// VIEWS SERVICE
// ============================================

export class AnnouncementViewsService {
  /**
   * Record that a user has viewed an announcement
   * Safe to call multiple times - uses UPSERT to prevent duplicates
   */
  static async recordView(
    announcementId: string,
    teamId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Use cached user ID for bulletproof performance
      const userId = getCurrentUserId();

      if (!userId) {
        return {
          success: false,
          error: "User not authenticated",
        };
      }

      // Use upsert to handle duplicates gracefully
      const { error } = await supabase.from("announcement_views" as any).upsert(
        {
          announcement_id: announcementId,
          user_id: userId,
          team_id: teamId,
          viewed_at: new Date().toISOString(),
        },
        {
          onConflict: "announcement_id,user_id",
          ignoreDuplicates: true,
        }
      );

      if (error) {
        logError("Error recording view:", error);
        return {
          success: false,
          error: error.message,
        };
      }

      return { success: true };
    } catch (error) {
      logError("Unexpected error recording view:", error);
      return {
        success: false,
        error: "An unexpected error occurred",
      };
    }
  }

  /**
   * Get read receipt statistics for an announcement
   * Shows who has/hasn't viewed it
   */
  static async getReadReceipts(
    announcementId: string,
    teamId: string
  ): Promise<ReadReceiptStats | null> {
    try {
      // Get all team members
      const { data: members, error: membersError } = await supabase
        .from("team_members" as any)
        .select(
          `
          user_id,
          team_role,
          profiles!inner(
            id,
            full_name,
            display_name
          )
        `
        )
        .eq("team_id", teamId)
        .eq("status", "active");

      if (membersError) {
        logError("Error fetching team members:", membersError);
        return null;
      }

      // Get all views for this announcement
      const { data: views, error: viewsError } = await supabase
        .from("announcement_views" as any)
        .select("user_id, viewed_at")
        .eq("announcement_id", announcementId);

      if (viewsError) {
        logError("Error fetching views:", viewsError);
        return null;
      }

      // Create a map of user_id -> viewed_at
      const viewMap = new Map(
        (views || []).map((v: any) => [v.user_id, v.viewed_at])
      );

      // Build viewers and non-viewers lists
      const viewers: ViewerInfo[] = [];
      const nonViewers: Array<{
        user_id: string;
        user_name: string;
        user_role: string;
      }> = [];

      (members || []).forEach((member: any) => {
        const userName =
          member.profiles?.display_name ||
          member.profiles?.full_name ||
          "Unknown";
        const userId = member.user_id;
        const userRole = member.team_role;

        if (viewMap.has(userId)) {
          viewers.push({
            user_id: userId,
            user_name: userName,
            user_role: userRole,
            viewed_at: viewMap.get(userId)!,
          });
        } else {
          nonViewers.push({
            user_id: userId,
            user_name: userName,
            user_role: userRole,
          });
        }
      });

      // Sort viewers by most recent first
      viewers.sort(
        (a, b) =>
          new Date(b.viewed_at).getTime() - new Date(a.viewed_at).getTime()
      );

      const totalMembers = (members || []).length;
      const viewedCount = viewers.length;
      const unviewedCount = nonViewers.length;
      const viewPercentage =
        totalMembers > 0 ? Math.round((viewedCount / totalMembers) * 100) : 0;

      return {
        total_members: totalMembers,
        viewed_count: viewedCount,
        unviewed_count: unviewedCount,
        view_percentage: viewPercentage,
        viewers,
        non_viewers: nonViewers,
      };
    } catch (error) {
      logError("Unexpected error getting read receipts:", error);
      return null;
    }
  }

  /**
   * Check if current user has viewed an announcement
   */
  static async hasViewed(announcementId: string): Promise<boolean> {
    try {
      // Use cached user ID for bulletproof performance
      const userId = getCurrentUserId();

      if (!userId) return false;

      const { data, error } = await supabase
        .from("announcement_views" as any)
        .select("id")
        .eq("announcement_id", announcementId)
        .eq("user_id", userId)
        .single();

      if (error && error.code !== "PGRST116") {
        // PGRST116 = not found, which is expected
        logError("Error checking view status:", error);
      }

      return !!data;
    } catch (error) {
      logError("Unexpected error checking view status:", error);
      return false;
    }
  }

  /**
   * Get view count for an announcement
   */
  static async getViewCount(announcementId: string): Promise<number> {
    try {
      const { count, error } = await supabase
        .from("announcement_views" as any)
        .select("*", { count: "exact", head: true })
        .eq("announcement_id", announcementId);

      if (error) {
        logError("Error getting view count:", error);
        return 0;
      }

      return count || 0;
    } catch (error) {
      logError("Unexpected error getting view count:", error);
      return 0;
    }
  }
}
