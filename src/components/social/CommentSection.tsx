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
import { logError } from "../../utils/logger";
import { useToast } from "../../hooks/useToast";
import { ConfirmationModal } from "../ui/ConfirmationModal/ConfirmationModal";
import type {
  CommentSectionProps,
  Comment,
  CreateCommentRequest,
} from "../../types/social";

/** Comment avatar display */
function CommentAvatar({ user }: { user?: Comment["user"] }) {
  return (
    <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
      {user?.avatar_url ? (
        <img
          src={user.avatar_url}
          alt={user.display_name || "User"}
          className="w-8 h-8 rounded-full"
        />
      ) : (
        <span className="text-sm font-medium text-secondary">
          {(user?.display_name || "U")[0].toUpperCase()}
        </span>
      )}
    </div>
  );
}

interface CommentItemProps {
  comment: Comment;
  contentType: string;
  contentId: string;
  maxDepth?: number;
  depth?: number;
  onReply?: (parentComment: Comment) => void;
  showReactions?: boolean;
}

const CommentItemActions: React.FC<{
  comment: Comment;
  depth: number;
  maxDepth: number;
  onReply?: (parentComment: Comment) => void;
  showReactions: boolean;
  canEdit: boolean;
  canDelete: boolean;
  showMenu: boolean;
  onToggleMenu: () => void;
  onStartEdit: () => void;
  onDelete: () => void;
}> = ({
  comment,
  depth,
  maxDepth,
  onReply,
  showReactions,
  canEdit,
  canDelete,
  showMenu,
  onToggleMenu,
  onStartEdit,
  onDelete,
}) => {
  return (
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
            onClick={onToggleMenu}
            className="p-1 text-muted hover:text-secondary rounded-lg"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {showMenu && (
            <div className="absolute right-0 top-full mt-1 bg-white dark:bg-navy-800 border border-neutral-200 dark:border-navy-600 rounded-lg shadow-2xl py-1 z-popover">
              {canEdit && (
                <button
                  onClick={onStartEdit}
                  className="flex items-center gap-xs px-sm py-xs text-sm text-content-primary hover:bg-secondary/50 w-full text-left"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit
                </button>
              )}
              {canDelete && (
                <button
                  onClick={onDelete}
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
  );
};

const CommentItemReplies: React.FC<{
  replies: Comment[];
  contentType: string;
  contentId: string;
  maxDepth: number;
  depth: number;
  onReply?: (parentComment: Comment) => void;
  showReactions: boolean;
}> = ({
  replies,
  contentType,
  contentId,
  maxDepth,
  depth,
  onReply,
  showReactions,
}) => {
  if (replies.length === 0) return null;

  return (
    <div className="mt-sm space-y-sm">
      {replies.map((reply) => (
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
  );
};

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
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const toast = useToast();

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
      logError("Failed to edit comment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    try {
      await socialService.deleteComment(comment.id);
      toast.success("Comment deleted");
      window.location.reload(); // Temporary - should use proper state management
    } catch (error) {
      logError("Failed to delete comment:", error);
      toast.error("Failed to delete comment");
    } finally {
      setShowDeleteConfirm(false);
    }
  };

  const canEdit = comment.user_id === "current-user-id"; // TODO: Get from auth context
  const canDelete = canEdit;

  const createdAtLabel = comment.created_at
    ? new Date(comment.created_at).toLocaleDateString()
    : "";
  const isEdited =
    !!comment.updated_at &&
    !!comment.created_at &&
    comment.updated_at !== comment.created_at;

  return (
    <div
      className={`${depth > 0 ? "ml-xl border-l-2 border-secondary pl-md" : ""}`}
    >
      <div className="flex gap-sm">
        {/* Avatar */}
        <div className="flex-shrink-0">
          <CommentAvatar user={comment.user} />
        </div>

        {/* Comment Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-xs mb-1">
            <span className="font-medium text-sm text-primary">
              {comment.user?.display_name || "Anonymous"}
            </span>
            <span className="text-xs text-muted">{createdAtLabel}</span>
            {isEdited && <span className="text-xs text-muted">(edited)</span>}
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
          <CommentItemActions
            comment={comment}
            depth={depth}
            maxDepth={maxDepth}
            onReply={onReply}
            showReactions={showReactions}
            canEdit={canEdit}
            canDelete={canDelete}
            showMenu={showMenu}
            onToggleMenu={() => setShowMenu(!showMenu)}
            onStartEdit={() => {
              setIsEditing(true);
              setShowMenu(false);
            }}
            onDelete={handleDelete}
          />

          {/* Replies */}
          <CommentItemReplies
            replies={comment.replies ?? []}
            contentType={contentType}
            contentId={contentId}
            maxDepth={maxDepth}
            depth={depth}
            onReply={onReply}
            showReactions={showReactions}
          />
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={confirmDelete}
        title="Delete Comment"
        message="Are you sure you want to delete this comment?"
        variant="danger"
        confirmText="Delete"
        cancelText="Cancel"
      />
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
      logError("Failed to load comments:", error);
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
        entity_type: contentType,
        entity_id: contentId,
        content: newComment.trim(),
        parent_id: replyTo?.id,
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
      logError("Failed to submit comment:", error);
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
                  {(() => {
                    if (isSubmitting) return "Posting...";
                    if (replyTo) return "Reply";
                    return "Comment";
                  })()}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Comments List */}
      <div className="space-y-md">
        {(() => {
          if (isLoading)
            return (
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
            );
          if (comments.length === 0)
            return (
              <div className="text-center py-xl text-muted">
                <MessageCircle className="w-12 h-12 mx-auto mb-sm text-muted" />
                <p>No comments yet. Be the first to share your thoughts!</p>
              </div>
            );
          return comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              contentType={contentType}
              contentId={contentId}
              maxDepth={maxDepth}
              onReply={handleReply}
              showReactions={showReactions}
            />
          ));
        })()}
      </div>
    </div>
  );
};
