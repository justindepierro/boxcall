/**
 * Announcement Reactions Service
 * 
 * Handles adding, removing, and fetching reactions to team announcements
 * Supports: 👍 (like), ❤️ (love), 🎉 (celebrate), 🏈 (football)
 */

import { supabase } from "../lib/supabase";
import { emitTelemetry } from "../lib/telemetry";

// ============================================
// TYPE DEFINITIONS
// ============================================

export type ReactionType = "like" | "love" | "celebrate" | "football";

export interface Reaction {
  id: string;
  announcement_id: string;
  user_id: string;
  reaction_type: ReactionType;
  created_at: string;
}

export interface ReactionSummary {
  reaction_type: ReactionType;
  count: number;
  user_has_reacted: boolean;
}

// Emoji mapping
export const REACTION_EMOJIS: Record<ReactionType, string> = {
  like: "👍",
  love: "❤️",
  celebrate: "🎉",
  football: "🏈",
};

export const REACTION_LABELS: Record<ReactionType, string> = {
  like: "Like",
  love: "Love",
  celebrate: "Celebrate",
  football: "Football",
};

// ============================================
// REACTIONS SERVICE
// ============================================

export class ReactionsService {
  /**
   * Get all reactions for an announcement with summary
   */
  static async getReactions(announcementId: string): Promise<{
    reactions: Reaction[];
    summary: ReactionSummary[];
  }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from("announcement_reactions" as any)
        .select("*")
        .eq("announcement_id", announcementId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching reactions:", error);
        return { reactions: [], summary: [] };
      }

      const reactions = (data || []) as unknown as Reaction[];

      // Calculate summary
      const summary = this.calculateSummary(reactions, user?.id);

      return { reactions, summary };
    } catch (error) {
      console.error("Error in getReactions:", error);
      return { reactions: [], summary: [] };
    }
  }

  /**
   * Add a reaction to an announcement
   */
  static async addReaction(
    announcementId: string,
    reactionType: ReactionType
  ): Promise<{ success: boolean; reaction?: Reaction; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        return {
          success: false,
          error: "User not authenticated",
        };
      }

      const newReaction = {
        announcement_id: announcementId,
        user_id: user.id,
        reaction_type: reactionType,
      };

      const { data, error } = await supabase
        .from("announcement_reactions" as any)
        .insert(newReaction)
        .select()
        .single();

      if (error) {
        // Check if it's a duplicate reaction error
        if (error.code === "23505") {
          return {
            success: false,
            error: "You've already added this reaction",
          };
        }
        console.error("Error adding reaction:", error);
        return {
          success: false,
          error: error.message,
        };
      }

      emitTelemetry("announcement.reaction_added", {
        announcement_id: announcementId,
        reaction_type: reactionType,
      });

      return {
        success: true,
        reaction: data as unknown as Reaction,
      };
    } catch (error) {
      console.error("Error in addReaction:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Remove a reaction from an announcement
   */
  static async removeReaction(
    announcementId: string,
    reactionType: ReactionType
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        return {
          success: false,
          error: "User not authenticated",
        };
      }

      const { error } = await supabase
        .from("announcement_reactions" as any)
        .delete()
        .eq("announcement_id", announcementId)
        .eq("user_id", user.id)
        .eq("reaction_type", reactionType);

      if (error) {
        console.error("Error removing reaction:", error);
        return {
          success: false,
          error: error.message,
        };
      }

      emitTelemetry("announcement.reaction_removed", {
        announcement_id: announcementId,
        reaction_type: reactionType,
      });

      return { success: true };
    } catch (error) {
      console.error("Error in removeReaction:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Toggle a reaction (add if not present, remove if present)
   */
  static async toggleReaction(
    announcementId: string,
    reactionType: ReactionType
  ): Promise<{ success: boolean; action: "added" | "removed"; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        return {
          success: false,
          action: "added",
          error: "User not authenticated",
        };
      }

      // Check if reaction already exists
      const { data: existing } = await supabase
        .from("announcement_reactions" as any)
        .select("id")
        .eq("announcement_id", announcementId)
        .eq("user_id", user.id)
        .eq("reaction_type", reactionType)
        .single();

      if (existing) {
        // Remove reaction
        const result = await this.removeReaction(announcementId, reactionType);
        return {
          success: result.success,
          action: "removed",
          error: result.error,
        };
      } else {
        // Add reaction
        const result = await this.addReaction(announcementId, reactionType);
        return {
          success: result.success,
          action: "added",
          error: result.error,
        };
      }
    } catch (error) {
      console.error("Error in toggleReaction:", error);
      return {
        success: false,
        action: "added",
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Get reactions summary for multiple announcements
   */
  static async getReactionsSummaryBatch(
    announcementIds: string[]
  ): Promise<Map<string, ReactionSummary[]>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { data, error } = await supabase
        .from("announcement_reactions" as any)
        .select("*")
        .in("announcement_id", announcementIds);

      if (error) {
        console.error("Error fetching reactions batch:", error);
        return new Map();
      }

      const reactions = (data || []) as unknown as Reaction[];

      // Group by announcement_id
      const grouped = new Map<string, Reaction[]>();
      reactions.forEach((reaction) => {
        const existing = grouped.get(reaction.announcement_id) || [];
        grouped.set(reaction.announcement_id, [...existing, reaction]);
      });

      // Calculate summary for each announcement
      const summaries = new Map<string, ReactionSummary[]>();
      announcementIds.forEach((id) => {
        const announcementReactions = grouped.get(id) || [];
        summaries.set(id, this.calculateSummary(announcementReactions, user?.id));
      });

      return summaries;
    } catch (error) {
      console.error("Error in getReactionsSummaryBatch:", error);
      return new Map();
    }
  }

  /**
   * Calculate reaction summary from reactions array
   */
  private static calculateSummary(
    reactions: Reaction[],
    currentUserId?: string
  ): ReactionSummary[] {
    const reactionTypes: ReactionType[] = ["like", "love", "celebrate", "football"];
    
    return reactionTypes.map((type) => {
      const typeReactions = reactions.filter((r) => r.reaction_type === type);
      return {
        reaction_type: type,
        count: typeReactions.length,
        user_has_reacted: currentUserId
          ? typeReactions.some((r) => r.user_id === currentUserId)
          : false,
      };
    }).filter((summary) => summary.count > 0 || summary.user_has_reacted); // Only show reactions that have been used or user reacted
  }
}
