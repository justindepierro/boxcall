/**
 * AnnouncementComments Component
 *
 * Displays comments on announcements with threaded replies
 * Supports adding, editing, and deleting comments with rich text and inline images
 */

import React, { useState, useEffect, useCallback } from "react";
import {
  CommentsService,
  type CommentTree,
  type CommentWithAuthor,
} from "../../services/commentsService";
import { Send, Edit2, Trash2, Reply } from "lucide-react";
import { format } from "date-fns";
import { supabase } from "../../lib/supabase";
import { CommentReactions } from "./CommentReactions";
import { RichTextEditor } from "./RichTextEditor";
import { RichTextDisplay } from "./RichTextDisplay";
import { Avatar } from "../ui/Avatar";
import { UserProfilePopover } from "../ui/UserProfilePopover";

interface AnnouncementCommentsProps {
  announcementId: string;
  teamId?: string; // Optional: for team-specific context in popovers
}

export const AnnouncementComments: React.FC<AnnouncementCommentsProps> = ({
  announcementId,
  teamId,
}) => {
  const [comments, setComments] = useState<CommentTree[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [avatarUrls, setAvatarUrls] = useState<Map<string, string | null>>(
    new Map()
  );

  // Get current user
  useEffect(() => {
    async function getCurrentUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);
    }
    getCurrentUser();
  }, []);

  // Helper to extract plain text from TipTap JSON
  const getPlainText = (jsonContent: string): string => {
    try {
      const json = JSON.parse(jsonContent);
      const extractText = (node: any): string => {
        if (node.type === "text") {
          return node.text || "";
        }
        if (node.content && Array.isArray(node.content)) {
          return node.content.map(extractText).join("");
        }
        return "";
      };
      return extractText(json).trim() || jsonContent;
    } catch {
      return jsonContent;
    }
  };

  const loadComments = useCallback(async () => {
    setLoading(true);
    const tree = await CommentsService.getCommentsTree(announcementId);
    setComments(tree);

    // Load avatars for all comment authors
    const userIds = new Set<string>();
    const collectUserIds = (nodes: CommentTree[]) => {
      nodes.forEach((node) => {
        userIds.add(node.comment.user_id);
        if (node.replies.length > 0) {
          collectUserIds(node.replies);
        }
      });
    };
    collectUserIds(tree);

    // Fetch all avatars in one query
    if (userIds.size > 0) {
      const { data } = await supabase
        .from("profiles")
        .select("id, avatar_url")
        .in("id", Array.from(userIds));

      if (data) {
        const avatarMap = new Map<string, string | null>();
        data.forEach((profile) => {
          avatarMap.set(profile.id, profile.avatar_url);
        });
        setAvatarUrls(avatarMap);
      }
    }

    setLoading(false);
  }, [announcementId]);

  // Load comments
  useEffect(() => {
    loadComments();
  }, [loadComments]);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || submitting) return;

    setSubmitting(true);
    const plainTextContent = getPlainText(newComment);

    const result = await CommentsService.addComment({
      announcement_id: announcementId,
      content: plainTextContent,
      content_json: newComment,
    });

    if (result.success) {
      setNewComment("");
      await loadComments();
    } else {
      alert(`Failed to post comment: ${result.error}`);
    }
    setSubmitting(false);
  };

  const handleSubmitReply = async (parentId: string) => {
    if (!replyContent.trim() || submitting) return;

    setSubmitting(true);
    const plainTextContent = getPlainText(replyContent);

    const result = await CommentsService.addComment({
      announcement_id: announcementId,
      content: plainTextContent,
      content_json: replyContent,
      parent_id: parentId,
    });

    if (result.success) {
      setReplyingTo(null);
      setReplyContent("");
      await loadComments();
    } else {
      alert(`Failed to post reply: ${result.error}`);
    }
    setSubmitting(false);
  };

  const handleStartEdit = (comment: CommentWithAuthor) => {
    setEditingComment(comment.id);
    setEditContent(comment.content_json || comment.content);
  };

  const handleSaveEdit = async (commentId: string) => {
    if (!editContent.trim() || submitting) return;

    setSubmitting(true);
    const plainTextContent = getPlainText(editContent);

    const result = await CommentsService.updateComment(commentId, {
      content: plainTextContent,
      content_json: editContent,
    });

    if (result.success) {
      setEditingComment(null);
      setEditContent("");
      await loadComments();
    } else {
      alert(`Failed to update comment: ${result.error}`);
    }
    setSubmitting(false);
  };

  const handleDelete = async (commentId: string) => {
    if (!confirm("Are you sure you want to delete this comment?")) return;

    const result = await CommentsService.deleteComment(commentId);
    if (result.success) {
      await loadComments();
    } else {
      alert(`Failed to delete comment: ${result.error}`);
    }
  };

  const renderComment = (node: CommentTree, depth: number = 0) => {
    const { comment, replies } = node;
    const isEditing = editingComment === comment.id;
    const isReplying = replyingTo === comment.id;
    const isOwnComment = currentUserId === comment.user_id;

    return (
      <div
        key={comment.id}
        className={`${depth > 0 ? "ml-6 mt-3" : "mt-4"}`}
      >
        {/* Comment */}
        <div className="rounded-xl p-4 bg-white hover:bg-surface-subtle transition-colors border border-border-subtle">
          <div className="flex items-start gap-3 mb-2">
            {/* Avatar with Popover */}
            <UserProfilePopover
              userId={comment.user_id}
              teamId={teamId}
              trigger={
                <Avatar
                  src={avatarUrls.get(comment.user_id) || null}
                  name={comment.author_name}
                  size="sm"
                />
              }
              showOnHover={true}
            />

            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <UserProfilePopover
                    userId={comment.user_id}
                    teamId={teamId}
                    trigger={
                      <span className="font-medium text-primary hover:underline cursor-pointer">
                        {comment.author_name}
                      </span>
                    }
                    showOnHover={true}
                  />
                  <span className="text-xs text-muted">
                    {format(new Date(comment.created_at), "MMM d 'at' h:mm a")}
                  </span>
                  {comment.updated_at !== comment.created_at && (
                    <span className="text-xs text-muted">(edited)</span>
                  )}
                </div>
                {isOwnComment && !isEditing && (
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleStartEdit(comment)}
                      className="p-1 text-muted hover:text-primary transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(comment.id)}
                      className="p-1 text-muted hover:text-error-600 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Comment Content or Edit Form */}
          {isEditing ? (
            <div className="space-y-2">
              <RichTextEditor
                content={editContent}
                onChange={setEditContent}
                placeholder="Edit your comment..."
                disabled={submitting}
                teamId={teamId}
              />
              <div className="flex gap-2">
                <button
                  onClick={() => handleSaveEdit(comment.id)}
                  disabled={submitting || !editContent.trim()}
                  className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setEditingComment(null);
                    setEditContent("");
                  }}
                  disabled={submitting}
                  className="px-3 py-1 border rounded text-sm hover:bg-surface-secondary transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="prose prose-sm max-w-none text-primary text-sm mb-3">
                {comment.content_json ? (
                  <RichTextDisplay content={comment.content_json} />
                ) : (
                  <p className="whitespace-pre-wrap">{comment.content}</p>
                )}
              </div>

              {/* Reactions */}
              <div className="mb-2">
                <CommentReactions
                  commentId={comment.id}
                  onReactionChange={loadComments}
                  compact={true}
                />
              </div>

              {!isReplying && (
                <button
                  onClick={() => setReplyingTo(comment.id)}
                  className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"
                >
                  <Reply className="w-3 h-3" />
                  Reply
                </button>
              )}
            </>
          )}
        </div>

        {/* Reply Form */}
        {isReplying && (
          <div className="mt-2 ml-4">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmitReply(comment.id);
              }}
              className="space-y-2"
            >
              <RichTextEditor
                content={replyContent}
                onChange={setReplyContent}
                placeholder="Write a reply..."
                disabled={submitting}
                teamId={teamId}
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={submitting || !replyContent.trim()}
                  className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                >
                  <Send className="w-3 h-3" />
                  Reply
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setReplyingTo(null);
                    setReplyContent("");
                  }}
                  disabled={submitting}
                  className="px-3 py-1 border rounded text-sm hover:bg-surface-secondary transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Nested Replies */}
        {replies.length > 0 && (
          <div className="space-y-0">
            {replies.map((reply) => renderComment(reply, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="text-center py-4 text-muted">Loading comments...</div>
    );
  }

  return (
    <div className="space-y-4">
      {/* New Comment Form */}
      <form onSubmit={handleSubmitComment} className="space-y-3">
        <RichTextEditor
          content={newComment}
          onChange={setNewComment}
          placeholder="Add a comment... You can add images by dragging & dropping or pasting them!"
          disabled={submitting}
          teamId={teamId}
        />
        <button
          type="submit"
          disabled={submitting || !newComment.trim()}
          className="px-4 py-2 bg-gradient-to-r from-blue-600 to-brand-jade text-white rounded-lg hover:from-blue-700 hover:to-jade-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium shadow-sm"
        >
          <Send className="w-4 h-4" />
          Post Comment
        </button>
      </form>

      {/* Comments List */}
      {comments.length === 0 ? (
        <p className="text-center text-muted py-8">
          No comments yet. Be the first to comment!
        </p>
      ) : (
        <div className="space-y-1">
          {comments.map((commentTree) => renderComment(commentTree))}
        </div>
      )}
    </div>
  );
};
