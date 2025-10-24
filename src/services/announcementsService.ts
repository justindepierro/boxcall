/**
 * Team Announcements Service
 * 
 * Handles CRUD operations for team announcements
 * Supports pinning, soft deletes, and visibility controls
 */

import { supabase } from "../lib/supabase";
import { emitTelemetry } from "../lib/telemetry";

// ============================================
// TYPE DEFINITIONS
// ============================================

export type AnnouncementVisibility = "all" | "staff_only" | "players_only" | "families_only";

export interface Attachment {
  name: string;
  url: string;
  type: string; // MIME type
  size: number; // bytes
}

export interface Announcement {
  id: string;
  team_id: string;
  title: string;
  content: string; // Legacy plain text - kept for backward compatibility
  content_json?: string; // Rich text content (TipTap JSON format)
  created_by: string;
  created_at: string;
  updated_at: string;
  is_pinned: boolean;
  attachments: Attachment[];
  visibility: AnnouncementVisibility;
  deleted_at: string | null;
}

export interface AnnouncementCreate {
  team_id: string;
  title: string;
  content?: string; // Optional - for backward compatibility
  content_json?: string; // Rich text content (TipTap JSON format)
  is_pinned?: boolean;
  attachments?: Attachment[];
  visibility?: AnnouncementVisibility;
}

export interface AnnouncementUpdate {
  title?: string;
  content?: string; // Optional - for backward compatibility
  content_json?: string; // Rich text content (TipTap JSON format)
  is_pinned?: boolean;
  attachments?: Attachment[];
  visibility?: AnnouncementVisibility;
}

export interface AnnouncementFilters {
  visibility?: AnnouncementVisibility;
  pinnedOnly?: boolean;
  fromDate?: string;
  toDate?: string;
}

// ============================================
// ANNOUNCEMENTS SERVICE
// ============================================

export class AnnouncementsService {
  /**
   * Get all announcements for a team
   */
  static async getAnnouncements(
    teamId: string,
    filters?: AnnouncementFilters
  ): Promise<Announcement[]> {
    try {
      let query = supabase
        .from("team_announcements" as any)
        .select("*")
        .eq("team_id", teamId)
        .is("deleted_at", null)
        .order("is_pinned", { ascending: false })
        .order("created_at", { ascending: false });

      // Apply filters
      if (filters?.visibility) {
        query = query.eq("visibility", filters.visibility);
      }

      if (filters?.pinnedOnly) {
        query = query.eq("is_pinned", true);
      }

      if (filters?.fromDate) {
        query = query.gte("created_at", filters.fromDate);
      }

      if (filters?.toDate) {
        query = query.lte("created_at", filters.toDate);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching announcements:", error);
        throw error;
      }

      return (data || []) as unknown as Announcement[];
    } catch (error) {
      console.error("Error in getAnnouncements:", error);
      throw error;
    }
  }

  /**
   * Get a single announcement by ID
   */
  static async getAnnouncement(announcementId: string): Promise<Announcement | null> {
    try {
      const { data, error } = await supabase
        .from("team_announcements" as any)
        .select("*")
        .eq("id", announcementId)
        .is("deleted_at", null)
        .single();

      if (error) {
        console.error("Error fetching announcement:", error);
        return null;
      }

      return data as unknown as Announcement;
    } catch (error) {
      console.error("Error in getAnnouncement:", error);
      return null;
    }
  }

  /**
   * Create a new announcement
   */
  static async createAnnouncement(
    announcement: AnnouncementCreate
  ): Promise<{ success: boolean; announcement?: Announcement; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return {
          success: false,
          error: "User not authenticated",
        };
      }

      const newAnnouncement = {
        ...announcement,
        created_by: user.id,
        attachments: announcement.attachments || [],
        visibility: announcement.visibility || "all",
        is_pinned: announcement.is_pinned || false,
      };

      const { data, error } = await supabase
        .from("team_announcements" as any)
        .insert(newAnnouncement)
        .select()
        .single();

      if (error) {
        console.error("Error creating announcement:", error);
        return {
          success: false,
          error: error.message,
        };
      }

      emitTelemetry("announcement.created", {
        team_id: announcement.team_id,
        has_attachments: (announcement.attachments?.length || 0) > 0,
        is_pinned: announcement.is_pinned,
        visibility: announcement.visibility,
      });

      return {
        success: true,
        announcement: data as unknown as Announcement,
      };
    } catch (error) {
      console.error("Error in createAnnouncement:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Update an announcement
   */
  static async updateAnnouncement(
    announcementId: string,
    updates: AnnouncementUpdate
  ): Promise<{ success: boolean; announcement?: Announcement; error?: string }> {
    try {
      const { data, error } = await supabase
        .from("team_announcements" as any)
        .update(updates)
        .eq("id", announcementId)
        .select()
        .single();

      if (error) {
        console.error("Error updating announcement:", error);
        return {
          success: false,
          error: error.message,
        };
      }

      emitTelemetry("announcement.updated", {
        announcement_id: announcementId,
        fields_updated: Object.keys(updates),
      });

      return {
        success: true,
        announcement: data as unknown as Announcement,
      };
    } catch (error) {
      console.error("Error in updateAnnouncement:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Toggle pin status of an announcement
   */
  static async togglePin(announcementId: string): Promise<{ success: boolean; error?: string }> {
    try {
      // First get current state
      const announcement = await this.getAnnouncement(announcementId);
      
      if (!announcement) {
        return {
          success: false,
          error: "Announcement not found",
        };
      }

      const { error } = await supabase
        .from("team_announcements" as any)
        .update({ is_pinned: !announcement.is_pinned })
        .eq("id", announcementId);

      if (error) {
        console.error("Error toggling pin:", error);
        return {
          success: false,
          error: error.message,
        };
      }

      emitTelemetry("announcement.pin_toggled", {
        announcement_id: announcementId,
        is_pinned: !announcement.is_pinned,
      });

      return { success: true };
    } catch (error) {
      console.error("Error in togglePin:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Soft delete an announcement
   */
  static async deleteAnnouncement(announcementId: string): Promise<{ success: boolean; error?: string }> {
    try {
      // First check if the announcement exists and get the team_id
      const { data: announcement, error: fetchError } = await supabase
        .from("team_announcements" as any)
        .select("id, team_id, created_by")
        .eq("id", announcementId)
        .single();

      if (fetchError || !announcement) {
        console.error("Error fetching announcement:", fetchError);
        return {
          success: false,
          error: "Announcement not found or you don't have permission to delete it",
        };
      }

      // Perform soft delete by setting deleted_at timestamp
      const { error } = await supabase
        .from("team_announcements" as any)
        .update({ deleted_at: new Date().toISOString() } as any)
        .eq("id", announcementId);

      if (error) {
        console.error("Error deleting announcement:", error);
        return {
          success: false,
          error: "You don't have permission to delete this announcement. Only the creator or team head coaches can delete announcements.",
        };
      }

      emitTelemetry("announcements", { action: "deleted", announcement_id: announcementId });

      return { success: true };
    } catch (error) {
      console.error("Error deleting announcement:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Permanently delete an announcement (hard delete)
   */
  static async permanentlyDelete(announcementId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from("team_announcements" as any)
        .delete()
        .eq("id", announcementId);

      if (error) {
        console.error("Error permanently deleting announcement:", error);
        return {
          success: false,
          error: error.message,
        };
      }

      emitTelemetry("announcement.permanently_deleted", {
        announcement_id: announcementId,
      });

      return { success: true };
    } catch (error) {
      console.error("Error in permanentlyDelete:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Get announcement statistics for a team
   */
  static async getStats(teamId: string): Promise<{
    total: number;
    pinned: number;
    recent: number; // last 7 days
  }> {
    try {
      const announcements = await this.getAnnouncements(teamId);
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      return {
        total: announcements.length,
        pinned: announcements.filter((a) => a.is_pinned).length,
        recent: announcements.filter(
          (a) => new Date(a.created_at) > sevenDaysAgo
        ).length,
      };
    } catch (error) {
      console.error("Error getting announcement stats:", error);
      return { total: 0, pinned: 0, recent: 0 };
    }
  }
}
