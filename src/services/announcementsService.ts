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

export type AnnouncementVisibility =
  | "all"
  | "staff_only"
  | "players_only"
  | "families_only";
export type AnnouncementStatus = "draft" | "published" | "scheduled";

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
  status: AnnouncementStatus;
  scheduled_for?: string | null;
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
  status?: AnnouncementStatus;
  scheduled_for?: string | null;
}

export interface AnnouncementUpdate {
  title?: string;
  content?: string; // Optional - for backward compatibility
  content_json?: string; // Rich text content (TipTap JSON format)
  is_pinned?: boolean;
  attachments?: Attachment[];
  visibility?: AnnouncementVisibility;
  status?: AnnouncementStatus;
  scheduled_for?: string | null;
}

export interface AnnouncementFilters {
  visibility?: AnnouncementVisibility;
  status?: AnnouncementStatus;
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
        .is("deleted_at", null);

      // Filter by status (default to 'published' unless explicitly requesting drafts/scheduled)
      if (filters?.status) {
        query = query.eq("status", filters.status);
      } else {
        // Default: only show published announcements
        query = query.eq("status", "published");
      }

      // Order: pinned first, then by date
      query = query
        .order("is_pinned", { ascending: false })
        .order("created_at", { ascending: false });

      // Apply other filters
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

      // Fetch author names separately
      const announcements = data || [];
      if (announcements.length === 0) {
        return [];
      }

      // Get unique author IDs
      const authorIds = [
        ...new Set(announcements.map((a: any) => a.created_by)),
      ];

      // Fetch author profiles
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, display_name")
        .in("id", authorIds);

      // Fetch team member roles to check for coaches
      const { data: teamMembers } = await supabase
        .from("team_members")
        .select("user_id, role")
        .eq("team_id", teamId)
        .in("user_id", authorIds);

      // Create maps
      const profileMap = new Map((profiles || []).map((p: any) => [p.id, p]));

      const roleMap = new Map(
        (teamMembers || []).map((m: any) => [m.user_id, m.role])
      );

      // Helper function to format author name based on role
      const formatAuthorName = (authorId: string): string => {
        const profile = profileMap.get(authorId);
        const role = roleMap.get(authorId);

        if (!profile) return "Unknown";

        // Check if user is a coach
        const isCoach =
          role && ["head_coach", "assistant_coach", "coach"].includes(role);

        if (isCoach) {
          // Extract last name for coaches
          const fullName = profile.full_name || profile.display_name || "";
          const nameParts = fullName.trim().split(/\s+/);
          const lastName =
            nameParts.length > 1 ? nameParts[nameParts.length - 1] : fullName;
          return `Coach ${lastName}`;
        }

        // For non-coaches, use display name or full name
        return profile.display_name || profile.full_name || "Unknown";
      };

      // Enrich announcements with formatted author names
      const enrichedData = announcements.map((announcement: any) => ({
        ...announcement,
        author_name: formatAuthorName(announcement.created_by),
      }));

      return enrichedData as unknown as Announcement[];
    } catch (error) {
      console.error("Error in getAnnouncements:", error);
      throw error;
    }
  }

  /**
   * Get a single announcement by ID
   */
  static async getAnnouncement(
    announcementId: string
  ): Promise<Announcement | null> {
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
  ): Promise<{
    success: boolean;
    announcement?: Announcement;
    error?: string;
  }> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

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
  ): Promise<{
    success: boolean;
    announcement?: Announcement;
    error?: string;
  }> {
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
  static async togglePin(
    announcementId: string
  ): Promise<{ success: boolean; error?: string }> {
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
  static async deleteAnnouncement(
    announcementId: string
  ): Promise<{ success: boolean; error?: string }> {
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
          error:
            "Announcement not found or you don't have permission to delete it",
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
          error:
            "You don't have permission to delete this announcement. Only the creator or team head coaches can delete announcements.",
        };
      }

      emitTelemetry("announcements", {
        action: "deleted",
        announcement_id: announcementId,
      });

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
  static async permanentlyDelete(
    announcementId: string
  ): Promise<{ success: boolean; error?: string }> {
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

  /**
   * Get drafts for current user
   */
  static async getDrafts(teamId: string): Promise<Announcement[]> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from("team_announcements" as any)
        .select("*")
        .eq("team_id", teamId)
        .eq("status", "draft")
        .eq("created_by", user.id)
        .is("deleted_at", null)
        .order("updated_at", { ascending: false });

      if (error) {
        console.error("Error fetching drafts:", error);
        return [];
      }

      return (data || []) as unknown as Announcement[];
    } catch (error) {
      console.error("Error in getDrafts:", error);
      return [];
    }
  }

  /**
   * Save announcement as draft (create or update)
   */
  static async saveDraft(
    announcement: AnnouncementCreate & { id?: string }
  ): Promise<{
    success: boolean;
    announcement?: Announcement;
    error?: string;
  }> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return {
          success: false,
          error: "User not authenticated",
        };
      }

      const draftData = {
        ...announcement,
        status: "draft" as AnnouncementStatus,
        created_by: user.id,
        attachments: announcement.attachments || [],
        visibility: announcement.visibility || "all",
        is_pinned: announcement.is_pinned || false,
      };

      let data;
      let error;

      if (announcement.id) {
        // Update existing draft
        const updateResult = await supabase
          .from("team_announcements" as any)
          .update(draftData)
          .eq("id", announcement.id)
          .eq("created_by", user.id) // Ensure user owns the draft
          .select()
          .single();

        data = updateResult.data;
        error = updateResult.error;
      } else {
        // Create new draft
        const insertResult = await supabase
          .from("team_announcements" as any)
          .insert(draftData)
          .select()
          .single();

        data = insertResult.data;
        error = insertResult.error;
      }

      if (error) {
        console.error("Error saving draft:", error);
        return {
          success: false,
          error: error.message,
        };
      }

      emitTelemetry("announcement.draft_saved", {
        team_id: announcement.team_id,
        is_new: !announcement.id,
      });

      return {
        success: true,
        announcement: data as unknown as Announcement,
      };
    } catch (error) {
      console.error("Error in saveDraft:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Publish a draft
   */
  static async publishDraft(
    draftId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: "Not authenticated" };
      }

      const { error } = await supabase
        .from("team_announcements" as any)
        .update({ status: "published" })
        .eq("id", draftId)
        .eq("created_by", user.id)
        .eq("status", "draft");

      if (error) {
        console.error("Error publishing draft:", error);
        return { success: false, error: error.message };
      }

      emitTelemetry("announcement.draft_published", { draft_id: draftId });

      return { success: true };
    } catch (error) {
      console.error("Error in publishDraft:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Search announcements by text
   */
  static async searchAnnouncements(
    teamId: string,
    query: string,
    filters?: AnnouncementFilters
  ): Promise<Announcement[]> {
    if (!query || query.trim().length === 0) {
      return this.getAnnouncements(teamId, filters);
    }

    try {
      const searchTerm = query.trim().toLowerCase();

      // Get all announcements and filter client-side for better search
      // (Could be optimized with PostgreSQL full-text search in production)
      const announcements = await this.getAnnouncements(teamId, filters);

      return announcements.filter((announcement) => {
        // Search in title
        if (announcement.title.toLowerCase().includes(searchTerm)) {
          return true;
        }

        // Search in plain text content
        if (announcement.content?.toLowerCase().includes(searchTerm)) {
          return true;
        }

        // Search in JSON content (extract text first)
        if (announcement.content_json) {
          try {
            const jsonContent = JSON.parse(announcement.content_json);
            const extractText = (node: any): string => {
              if (!node) return "";
              if (typeof node === "string") return node;
              if (node.text) return node.text;
              if (node.content && Array.isArray(node.content)) {
                return node.content.map(extractText).join(" ");
              }
              return "";
            };
            const text = extractText(jsonContent).toLowerCase();
            if (text.includes(searchTerm)) {
              return true;
            }
          } catch {
            // Ignore JSON parse errors
          }
        }

        return false;
      });
    } catch (error) {
      console.error("Error searching announcements:", error);
      return [];
    }
  }
}
