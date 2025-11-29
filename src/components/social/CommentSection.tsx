// Comment Section Component
// Comprehensive component for displaying and managing comments

import React, { useState, useEffect, useCallback } from "react";
import {
  MessageCircle,
  Send,
  MoreVertical,
  Edit2,
  Trash2,
  Reply,
} from "lucide-react";
import { socialService } from "../../services/socialService";
import { MentionsService } from "../../services/mentionsService";
import { ReactionButton } from "./ReactionButton";
import { MentionsInput } from "./MentionsInput";
import type {
  CommentSectionProps,
  Comment,
  CreateCommentRequest,
} from "../../types/social";

interface CommentItemProps {
  comment: Comment;
  contentType: string;
  contentId: string;
  maxDepth?: number;
  depth?: number;
  onReply?: (parentComment: Comment) => void;
  showReactions?: boolean;
}

const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  contentType,
  contentId,
  maxDepth = 3,
  depth = 0,
  onReply,
  showReactions = true,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [showMenu, setShowMenu] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleEdit = async () => {
    if (!editContent.trim()) return;

    setIsSubmitting(true);
    try {
      await socialService.updateComment(comment.id, {
        content: editContent.trim(),
      });
      setIsEditing(false);
      // The parent component should reload comments
      window.location.reload(); // Temporary - should use proper state management
    } catch (error) {
      console.error("Failed to edit comment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this comment?")) return;

    try {
      await socialService.deleteComment(comment.id);
      window.location.reload(); // Temporary - should use proper state management
    } catch (error) {
      console.error("Failed to delete comment:", error);
    }
  };

  const canEdit = comment.user_id === "current-user-id"; // TODO: Get from auth context
  const canDelete = canEdit;

  return (
    <div
      className={`${depth > 0 ? "ml-xl border-l-2 border-secondary pl-md" : ""}`}
    >
      <div className="flex gap-sm">
        {/* Avatar */}
        <div className="flex-shrink-0">
          <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
            {comment.user?.avatar_url ? (
              <img
                src={comment.user.avatar_url}
                alt={comment.user.display_name || "User"}
                className="w-8 h-8 rounded-full"
              />
            ) : (
              <span className="text-sm font-medium text-secondary">
                {(comment.user?.display_name || "U")[0].toUpperCase()}
              </span>
            )}
          </div>
        </div>

        {/* Comment Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-xs mb-1">
            <span className="font-medium text-sm text-primary">
              {comment.user?.display_name || "Anonymous"}
            </span>
            <span className="text-xs text-muted">
              {new Date(comment.created_at).toLocaleDateString()}
            </span>
            {comment.is_edited && (
              <span className="text-xs text-muted">(edited)</span>
            )}
          </div>

          {isEditing ? (
            <div className="space-y-xs">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full px-sm py-xs border border-secondary rounded-lg resize-none focus:ring-2 focus:ring-focus-info focus:border-info"
                rows={3}
                maxLength={1000}
              />
              <div className="flex gap-xs">
                <button
                  onClick={handleEdit}
                  disabled={isSubmitting || !editContent.trim()}
                  className="px-sm py-1 bg-info/20 text-inverse text-sm rounded-lg hover:bg-info/20-hover disabled:opacity-50"
                >
                  {isSubmitting ? "Saving..." : "Save"}
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEditContent(comment.content);
                  }}
                  className="px-sm py-1 text-secondary text-sm hover:text-primary"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <p className="text-secondary whitespace-pre-wrap">
              {comment.content}
            </p>
          )}

          {/* Actions */}
          <div className="flex items-center gap-md mt-xs">
            {showReactions && (
              <ReactionButton
                contentType="comment"
                contentId={comment.id}
                size="sm"
                variant="icon"
              />
            )}

            {depth < maxDepth && onReply && (
              <button
                onClick={() => onReply(comment)}
                className="flex items-center gap-1 text-sm text-muted hover:text-secondary"
              >
                <Reply className="w-4 h-4" />
                Reply
              </button>
            )}

            {(canEdit || canDelete) && (
              <div className="relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="p-1 text-muted hover:text-secondary rounded-lg"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>

                {showMenu && (
                  <div className="absolute right-0 top-full mt-1 bg-primary/95 dark:bg-secondary/95 backdrop-blur-md border border-stroke rounded-lg shadow-2xl py-1 z-popover">
                    {canEdit && (
                      <button
                        onClick={() => {
                          setIsEditing(true);
                          setShowMenu(false);
                        }}
                        className="flex items-center gap-xs px-sm py-xs text-sm text-content-primary hover:bg-secondary/50 w-full text-left"
                      >
                        <Edit2 className="w-4 h-4" />
                        Edit
                      </button>
                    )}
                    {canDelete && (
                      <button
                        onClick={handleDelete}
                        className="flex items-center gap-xs px-sm py-xs text-sm text-error-600 hover:bg-secondary/50 w-full text-left"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Replies */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-sm space-y-sm">
              {comment.replies.map((reply) => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  contentType={contentType}
                  contentId={contentId}
                  maxDepth={maxDepth}
                  depth={depth + 1}
                  onReply={onReply}
                  showReactions={showReactions}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const CommentSection: React.FC<CommentSectionProps> = ({
  contentType,
  contentId,
  maxDepth = 3,
  showReactions = true,
}) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [replyTo, setReplyTo] = useState<Comment | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadComments = useCallback(async () => {
    setIsLoading(true);
    try {
      const loadedComments = await socialService.getComments(
        contentType,
        contentId
      );
      setComments(loadedComments);
    } catch (error) {
      console.error("Failed to load comments:", error);
    } finally {
      setIsLoading(false);
    }
  }, [contentType, contentId]);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    try {
      const request: CreateCommentRequest = {
        content_type: contentType,
        content_id: contentId,
        content: newComment.trim(),
        parent_comment_id: replyTo?.id,
      };

      // Create the comment first
      const comment = await socialService.addComment(request);

      // Parse and save mentions
      const mentions = MentionsService.parseMentions(newComment);
      if (mentions.length > 0 && comment.id) {
        await MentionsService.saveMentions(comment.id, mentions);
      }

      setNewComment("");
      setReplyTo(null);
      await loadComments();
    } catch (error) {
      console.error("Failed to submit comment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReply = (comment: Comment) => {
    setReplyTo(comment);
    setNewComment(`@${comment.user?.display_name || "User"} `);
  };

  return (
    <div className="space-y-md">
      {/* Comment Form */}
      <div className="bg-primary border border-border rounded-lg p-md">
        <div className="flex gap-sm">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-secondary">U</span>
            </div>
          </div>

          <div className="flex-1">
            {replyTo && (
              <div className="mb-xs text-sm text-secondary">
                Replying to{" "}
                <span className="font-medium">
                  {replyTo.user?.display_name || "User"}
                </span>
                <button
                  onClick={() => {
                    setReplyTo(null);
                    setNewComment("");
                  }}
                  className="ml-xs text-muted hover:text-secondary"
                >
                  ×
                </button>
              </div>
            )}

            <MentionsInput
              value={newComment}
              onChange={setNewComment}
              placeholder={replyTo ? "Write a reply..." : "Write a comment..."}
              className="w-full"
              onMentionSelect={(mention) => {
                // Handle mention selection if needed
                console.log("Mention selected:", mention);
              }}
            />

            <div className="flex justify-between items-center mt-xs">
              <span className="text-xs text-muted">
                {newComment.length}/1000 characters
              </span>

              <div className="flex gap-xs">
                {(replyTo || newComment.trim()) && (
                  <button
                    onClick={() => {
                      setNewComment("");
                      setReplyTo(null);
                    }}
                    className="px-sm py-1 text-secondary text-sm hover:text-primary"
                  >
                    Cancel
                  </button>
                )}

                <button
                  onClick={handleSubmitComment}
                  disabled={isSubmitting || !newComment.trim()}
                  className="flex items-center gap-xs px-sm py-1 bg-info/20 text-inverse text-sm rounded-lg hover:bg-info/20-hover disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  {isSubmitting ? "Posting..." : replyTo ? "Reply" : "Comment"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Comments List */}
      <div className="space-y-md">
        {isLoading ? (
          <div className="space-y-md">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-sm">
                <div className="w-8 h-8 bg-tertiary rounded-full animate-pulse" />
                <div className="flex-1 space-y-xs">
                  <div className="h-4 bg-tertiary rounded-lg animate-pulse w-1/4" />
                  <div className="h-16 bg-tertiary rounded-lg animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-xl text-muted">
            <MessageCircle className="w-12 h-12 mx-auto mb-sm text-muted" />
            <p>No comments yet. Be the first to share your thoughts!</p>
          </div>
        ) : (
          comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              contentType={contentType}
              contentId={contentId}
              maxDepth={maxDepth}
              onReply={handleReply}
              showReactions={showReactions}
            />
          ))
        )}
      </div>
    </div>
  );
};
