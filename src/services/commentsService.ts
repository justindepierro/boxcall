/**
 * Announcement Comments Service
 * 
 * Handles CRUD operations for comments on team announcements
 * Supports threaded replies with parent_id
 */

import { supabase } from "../lib/supabase";
import { emitTelemetry } from "../lib/telemetry";

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface Comment {
  id: string;
  announcement_id: string;
  user_id: string;
  content: string;
  parent_id: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface CommentWithAuthor extends Comment {
  author_name: string;
  author_role?: string;
}

export interface CommentCreate {
  announcement_id: string;
  content: string;
  parent_id?: string | null;
}

export interface CommentUpdate {
  content: string;
}

export interface CommentTree {
  comment: CommentWithAuthor;
  replies: CommentTree[];
}

// ============================================
// COMMENTS SERVICE
// ============================================

export class CommentsService {
  /**
   * Get all comments for an announcement (flat list)
   */
  static async getComments(announcementId: string): Promise<CommentWithAuthor[]> {
    try {
      // First get all comments
      const { data: comments, error } = await supabase
        .from("announcement_comments" as any)
        .select("*")
        .eq("announcement_id", announcementId)
        .is("deleted_at", null)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error fetching comments:", error);
        return [];
      }

      if (!comments || comments.length === 0) {
        return [];
      }

      // Get unique user IDs
      const userIds = [...new Set(comments.map((c: any) => c.user_id))];

      // Fetch all profiles in one query
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, display_name")
        .in("id", userIds);

      // Create a map of user_id -> name
      const profileMap = new Map(
        (profiles || []).map((p: any) => [
          p.id,
          p.display_name || p.full_name || "Unknown User",
        ])
      );

      // Transform to include author name
      return comments.map((comment: any) => ({
        ...comment,
        author_name: profileMap.get(comment.user_id) || "Unknown User",
      })) as CommentWithAuthor[];
    } catch (error) {
      console.error("Error in getComments:", error);
      return [];
    }
  }

  /**
   * Get comments as a tree structure (with nested replies)
   */
  static async getCommentsTree(announcementId: string): Promise<CommentTree[]> {
    const comments = await this.getComments(announcementId);
    return this.buildCommentTree(comments);
  }

  /**
   * Build a tree structure from flat comment list
   */
  private static buildCommentTree(comments: CommentWithAuthor[]): CommentTree[] {
    const commentMap = new Map<string, CommentTree>();
    const rootComments: CommentTree[] = [];

    // Create nodes for all comments
    comments.forEach((comment) => {
      commentMap.set(comment.id, {
        comment,
        replies: [],
      });
    });

    // Build the tree
    comments.forEach((comment) => {
      const node = commentMap.get(comment.id)!;
      
      if (comment.parent_id) {
        // This is a reply - add to parent's replies
        const parent = commentMap.get(comment.parent_id);
        if (parent) {
          parent.replies.push(node);
        } else {
          // Parent not found (maybe deleted), treat as root
          rootComments.push(node);
        }
      } else {
        // Top-level comment
        rootComments.push(node);
      }
    });

    return rootComments;
  }

  /**
   * Add a comment to an announcement
   */
  static async addComment(
    comment: CommentCreate
  ): Promise<{ success: boolean; comment?: CommentWithAuthor; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        return {
          success: false,
          error: "User not authenticated",
        };
      }

      const newComment = {
        announcement_id: comment.announcement_id,
        user_id: user.id,
        content: comment.content.trim(),
        parent_id: comment.parent_id || null,
      };

      const { data, error } = await supabase
        .from("announcement_comments" as any)
        .insert(newComment)
        .select()
        .single();

      if (error) {
        console.error("Error adding comment:", error);
        return {
          success: false,
          error: error.message,
        };
      }

      // Get author name
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, display_name")
        .eq("id", user.id)
        .single();

      const commentWithAuthor: CommentWithAuthor = {
        ...(data as any),
        author_name: profile
          ? ((profile as any).display_name || (profile as any).full_name || "Unknown User")
          : "Unknown User",
      };

      emitTelemetry("announcement.comment_added", {
        announcement_id: comment.announcement_id,
        is_reply: !!comment.parent_id,
      });

      return {
        success: true,
        comment: commentWithAuthor,
      };
    } catch (error) {
      console.error("Error in addComment:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Update a comment
   */
  static async updateComment(
    commentId: string,
    updates: CommentUpdate
  ): Promise<{ success: boolean; comment?: CommentWithAuthor; error?: string }> {
    try {
      const { data, error } = await supabase
        .from("announcement_comments" as any)
        .update({ content: updates.content.trim() })
        .eq("id", commentId)
        .select()
        .single();

      if (error) {
        console.error("Error updating comment:", error);
        return {
          success: false,
          error: error.message,
        };
      }

      // Get author name
      const comment = data as any;
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, display_name")
        .eq("id", comment.user_id)
        .single();

      const commentWithAuthor: CommentWithAuthor = {
        ...comment,
        author_name: profile
          ? ((profile as any).display_name || (profile as any).full_name || "Unknown User")
          : "Unknown User",
      };

      emitTelemetry("announcement.comment_updated", {
        comment_id: commentId,
      });

      return {
        success: true,
        comment: commentWithAuthor,
      };
    } catch (error) {
      console.error("Error in updateComment:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Delete a comment (soft delete)
   */
  static async deleteComment(
    commentId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from("announcement_comments" as any)
        .update({ deleted_at: new Date().toISOString() } as any)
        .eq("id", commentId);

      if (error) {
        console.error("Error deleting comment:", error);
        return {
          success: false,
          error: error.message,
        };
      }

      emitTelemetry("announcement.comment_deleted", {
        comment_id: commentId,
      });

      return { success: true };
    } catch (error) {
      console.error("Error in deleteComment:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Get comment count for an announcement
   */
  static async getCommentCount(announcementId: string): Promise<number> {
    try {
      const { count, error } = await supabase
        .from("announcement_comments" as any)
        .select("*", { count: "exact", head: true })
        .eq("announcement_id", announcementId)
        .is("deleted_at", null);

      if (error) {
        console.error("Error getting comment count:", error);
        return 0;
      }

      return count || 0;
    } catch (error) {
      console.error("Error in getCommentCount:", error);
      return 0;
    }
  }

  /**
   * Get comment counts for multiple announcements
   */
  static async getCommentCounts(
    announcementIds: string[]
  ): Promise<Map<string, number>> {
    try {
      const { data, error } = await supabase
        .from("announcement_comments" as any)
        .select("announcement_id")
        .in("announcement_id", announcementIds)
        .is("deleted_at", null);

      if (error) {
        console.error("Error getting comment counts:", error);
        return new Map();
      }

      // Count comments per announcement
      const counts = new Map<string, number>();
      announcementIds.forEach((id) => counts.set(id, 0));
      
      (data || []).forEach((comment: any) => {
        const current = counts.get(comment.announcement_id) || 0;
        counts.set(comment.announcement_id, current + 1);
      });

      return counts;
    } catch (error) {
      console.error("Error in getCommentCounts:", error);
      return new Map();
    }
  }
}
