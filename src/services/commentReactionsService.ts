/**
 * Comment Reactions Service
 *
 * Handles emoji reactions on announcement comments
 * Supports: 👍 (like), ❤️ (love), 🎉 (celebrate), 🏈 (football), 🔥 (fire), 👏 (clap), 🎯 (target), 💯 (hundred)
 */

import { supabase } from "../lib/supabase";
import { emitTelemetry } from "../lib/telemetry";
import { getCurrentUserId } from "../lib/auth-helpers";
import { logError } from "../utils/logger";

export type ReactionType =
  | "like"
  | "love"
  | "celebrate"
  | "football"
  | "fire"
  | "clap"
  | "target"
  | "hundred";

export const REACTION_EMOJIS: Record<ReactionType, string> = {
  like: "👍",
  love: "❤️",
  celebrate: "🎉",
  football: "🏈",
  fire: "🔥",
  clap: "👏",
  target: "🎯",
  hundred: "💯",
};

export const REACTION_LABELS: Record<ReactionType, string> = {
  like: "Like",
  love: "Love",
  celebrate: "Celebrate",
  football: "Football",
  fire: "Fire",
  clap: "Applause",
  target: "On Target",
  hundred: "Perfect",
};

export interface ReactionSummary {
  reaction_type: ReactionType;
  count: number;
  user_has_reacted: boolean;
}

export interface CommentReaction {
  id: string;
  comment_id: string;
  user_id: string;
  reaction_type: ReactionType;
  created_at: string;
}

export class CommentReactionsService {
  /**
   * Get reactions summary for a comment
   */
  static async getReactions(commentId: string): Promise<{
    summary: ReactionSummary[];
    reactions: CommentReaction[];
  }> {
    try {
      // Use cached user ID for bulletproof performance
      const userId = getCurrentUserId();
      if (!userId) {
        throw new Error("User not authenticated");
      }

      // Fetch all reactions for this comment
      const { data: reactions, error } = await supabase
        .from("comment_reactions")
        .select("*")
        .eq("comment_id", commentId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Build summary
      const summary: ReactionSummary[] = [];
      const allTypes: ReactionType[] = [
        "like",
        "love",
        "celebrate",
        "football",
        "fire",
        "clap",
        "target",
        "hundred",
      ];

      allTypes.forEach((type) => {
        const typeReactions =
          (reactions as CommentReaction[] | null)?.filter(
            (r) => r.reaction_type === type
          ) || [];
        const userHasReacted = typeReactions.some((r) => r.user_id === userId);

        summary.push({
          reaction_type: type,
          count: typeReactions.length,
          user_has_reacted: userHasReacted,
        });
      });

      return {
        summary,
        reactions: (reactions as CommentReaction[] | null) || [],
      };
    } catch (error) {
      logError("Error fetching comment reactions:", error);
      return { summary: [], reactions: [] };
    }
  }

  /**
   * Toggle a reaction (add if not present, remove if present)
   */
  static async toggleReaction(
    commentId: string,
    reactionType: ReactionType
  ): Promise<{
    success: boolean;
    action: "added" | "removed" | null;
    error?: string;
  }> {
    try {
      // Use cached user ID for bulletproof performance
      const userId = getCurrentUserId();
      if (!userId) {
        return {
          success: false,
          action: null,
          error: "User not authenticated",
        };
      }

      // Check if user already reacted with this type
      const { data: existing, error: checkError } = await supabase
        .from("comment_reactions")
        .select("id")
        .eq("comment_id", commentId)
        .eq("user_id", userId)
        .eq("reaction_type", reactionType)
        .maybeSingle();

      if (checkError) throw checkError;

      if (existing) {
        // Remove reaction
        const result = await this.removeReaction(commentId, reactionType);
        if (result.success) {
          emitTelemetry("comment.reaction_removed", {
            comment_id: commentId,
            reaction_type: reactionType,
          });
        }
        return { ...result, action: "removed" };
      }
      // Add reaction
      const result = await this.addReaction(commentId, reactionType);
      if (result.success) {
        emitTelemetry("comment.reaction_added", {
          comment_id: commentId,
          reaction_type: reactionType,
        });
      }
      return { ...result, action: "added" };
    } catch (error) {
      logError("Error toggling comment reaction:", error);
      return {
        success: false,
        action: null,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Add a reaction to a comment
   */
  static async addReaction(
    commentId: string,
    reactionType: ReactionType
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Use cached user ID for bulletproof performance
      const userId = getCurrentUserId();
      if (!userId) {
        return { success: false, error: "User not authenticated" };
      }

      const { error } = await supabase.from("comment_reactions").insert({
        comment_id: commentId,
        user_id: userId,
        reaction_type: reactionType,
      });

      if (error) {
        // Handle duplicate key error (23505 = unique violation)
        if (error.code === "23505") {
          return { success: true }; // Already exists, treat as success
        }
        throw error;
      }

      return { success: true };
    } catch (error) {
      logError("Error adding comment reaction:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Remove a reaction from a comment
   */
  static async removeReaction(
    commentId: string,
    reactionType: ReactionType
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Use cached user ID for bulletproof performance
      const userId = getCurrentUserId();
      if (!userId) {
        return { success: false, error: "User not authenticated" };
      }

      // @ts-expect-error - comment_reactions table will exist after migration
      const { error } = await supabase
        .from("comment_reactions")
        .delete()
        .eq("comment_id", commentId)
        .eq("user_id", userId)
        .eq("reaction_type", reactionType);

      if (error) throw error;

      return { success: true };
    } catch (error) {
      logError("Error removing comment reaction:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Get reactions summary for multiple comments (batch operation)
   */
  static async getReactionsSummaryBatch(commentIds: string[]): Promise<
    Record<
      string,
      {
        summary: ReactionSummary[];
      }
    >
  > {
    try {
      if (commentIds.length === 0) return {};

      // Use cached user ID for bulletproof performance
      const userId = getCurrentUserId();
      if (!userId) return {};

      // Fetch all reactions for these comments
      const { data: reactions, error } = await supabase
        .from("comment_reactions")
        .select("*")
        .in("comment_id", commentIds);

      if (error) throw error;

      // Build summary map
      const result: Record<string, { summary: ReactionSummary[] }> = {};
      const allTypes: ReactionType[] = [
        "like",
        "love",
        "celebrate",
        "football",
      ];

      commentIds.forEach((commentId) => {
        const commentReactions =
          (reactions as CommentReaction[] | null)?.filter(
            (r) => r.comment_id === commentId
          ) || [];

        const summary: ReactionSummary[] = allTypes.map((type) => {
          const typeReactions = commentReactions.filter(
            (r) => r.reaction_type === type
          );
          const userHasReacted = typeReactions.some(
            (r) => r.user_id === userId
          );

          return {
            reaction_type: type,
            count: typeReactions.length,
            user_has_reacted: userHasReacted,
          };
        });

        result[commentId] = { summary };
      });

      return result;
    } catch (error) {
      logError("Error fetching comment reactions batch:", error);
      return {};
    }
  }
}
