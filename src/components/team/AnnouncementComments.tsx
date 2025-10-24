/**
 * AnnouncementComments Component
 * 
 * Displays comments on announcements with threaded replies
 * Supports adding, editing, and deleting comments
 */

import React, { useState, useEffect } from "react";
import {
  CommentsService,
  type CommentTree,
  type CommentWithAuthor,
} from "../../services/commentsService";
import { MessageCircle, Send, Edit2, Trash2, Reply } from "lucide-react";
import { format } from "date-fns";
import { supabase } from "../../lib/supabase";
import { CommentReactions } from "./CommentReactions";

interface AnnouncementCommentsProps {
  announcementId: string;
}

export const AnnouncementComments: React.FC<AnnouncementCommentsProps> = ({
  announcementId,
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

  // Get current user
  useEffect(() => {
    async function getCurrentUser() {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);
    }
    getCurrentUser();
  }, []);

  // Load comments
  useEffect(() => {
    loadComments();
  }, [announcementId]);

  const loadComments = async () => {
    setLoading(true);
    const tree = await CommentsService.getCommentsTree(announcementId);
    setComments(tree);
    setLoading(false);
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || submitting) return;

    setSubmitting(true);
    const result = await CommentsService.addComment({
      announcement_id: announcementId,
      content: newComment,
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
    const result = await CommentsService.addComment({
      announcement_id: announcementId,
      content: replyContent,
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
    setEditContent(comment.content);
  };

  const handleSaveEdit = async (commentId: string) => {
    if (!editContent.trim() || submitting) return;

    setSubmitting(true);
    const result = await CommentsService.updateComment(commentId, {
      content: editContent,
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
        className={`${depth > 0 ? "ml-8 mt-3" : "mt-4"} ${
          depth > 0 ? "border-l-2 border-blue-200 pl-4" : ""
        }`}
      >
        {/* Comment */}
        <div className="bg-surface-secondary rounded-lg p-3">
          <div className="flex items-start justify-between mb-2">
            <div>
              <span className="font-medium text-primary">
                {comment.author_name}
              </span>
              <span className="text-xs text-muted ml-2">
                {format(new Date(comment.created_at), "MMM d 'at' h:mm a")}
              </span>
              {comment.updated_at !== comment.created_at && (
                <span className="text-xs text-muted ml-1">(edited)</span>
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

          {/* Comment Content or Edit Form */}
          {isEditing ? (
            <div className="space-y-2">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full border rounded-lg p-2 text-sm min-h-16 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={submitting}
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
              <p className="text-primary text-sm whitespace-pre-wrap mb-3">
                {comment.content}
              </p>
              
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
              <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Write a reply..."
                className="w-full border rounded-lg p-2 text-sm min-h-16 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={submitting}
                autoFocus
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
      {/* Header */}
      <div className="flex items-center gap-2 text-primary font-medium">
        <MessageCircle className="w-5 h-5" />
        <span>Comments ({comments.length})</span>
      </div>

      {/* New Comment Form */}
      <form onSubmit={handleSubmitComment} className="space-y-2">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          className="w-full border rounded-lg p-3 text-sm min-h-20 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          disabled={submitting}
        />
        <button
          type="submit"
          disabled={submitting || !newComment.trim()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
