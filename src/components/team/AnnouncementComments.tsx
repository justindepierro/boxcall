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
import { table } from "../../data/supabase/db";
import { CommentReactions } from "./CommentReactions";
import { RichTextEditor } from "./RichTextEditor";
import { RichTextDisplay } from "./RichTextDisplay";
import { Avatar } from "../ui/Avatar";
import { UserProfilePopover } from "../ui/UserProfilePopover";
import { ConfirmationModal } from "../ui/ConfirmationModal";
import { useToast } from "../../hooks/useToast";

interface AnnouncementCommentsProps {
  announcementId: string;
  teamId?: string; // Optional: for team-specific context in popovers
}

const getPlainTextFromTipTapJson = (jsonContent: string): string => {
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

const collectUserIdsFromCommentTree = (nodes: CommentTree[]): string[] => {
  const userIds = new Set<string>();
  const collectUserIds = (commentNodes: CommentTree[]) => {
    commentNodes.forEach((node) => {
      userIds.add(node.comment.user_id);
      if (node.replies.length > 0) {
        collectUserIds(node.replies);
      }
    });
  };
  collectUserIds(nodes);
  return Array.from(userIds);
};

const loadAvatarUrlsByUserId = async (
  userIds: string[]
): Promise<Map<string, string | null>> => {
  if (userIds.length === 0) return new Map();

  const { data } = await table("profiles")
    .select("id, avatar_url")
    .in("id", userIds);

  const avatarMap = new Map<string, string | null>();
  if (data) {
    data.forEach((profile) => {
      avatarMap.set(profile.id, profile.avatar_url);
    });
  }
  return avatarMap;
};

type CommentNodeProps = {
  node: CommentTree;
  depth: number;
  teamId?: string;
  currentUserId: string | null;
  avatarUrls: Map<string, string | null>;
  submitting: boolean;
  replyingTo: string | null;
  replyContent: string;
  onChangeReplyContent: (value: string) => void;
  onStartReplying: (commentId: string) => void;
  onCancelReplying: () => void;
  onSubmitReply: (parentId: string) => void;
  editingComment: string | null;
  editContent: string;
  onChangeEditContent: (value: string) => void;
  onStartEdit: (comment: CommentWithAuthor) => void;
  onCancelEdit: () => void;
  onSaveEdit: (commentId: string) => void;
  onDelete: (commentId: string) => void;
  onReload: () => void;
};

type ReplyFormProps = {
  commentId: string;
  teamId?: string;
  submitting: boolean;
  replyContent: string;
  onChangeReplyContent: (value: string) => void;
  onSubmitReply: (parentId: string) => void;
  onCancelReplying: () => void;
};

const ReplyForm: React.FC<ReplyFormProps> = ({
  commentId,
  teamId,
  submitting,
  replyContent,
  onChangeReplyContent,
  onSubmitReply,
  onCancelReplying,
}) => (
  <div className="mt-2 ml-4">
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmitReply(commentId);
      }}
      className="space-y-2"
    >
      <RichTextEditor
        content={replyContent}
        onChange={onChangeReplyContent}
        placeholder="Write a reply..."
        disabled={submitting}
        teamId={teamId}
      />
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={submitting || !replyContent.trim()}
          className="px-3 py-1 bg-brand-primary text-white rounded text-sm hover:bg-brand-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
        >
          <Send className="w-3 h-3" />
          Reply
        </button>
        <button
          type="button"
          onClick={onCancelReplying}
          disabled={submitting}
          className="px-3 py-1 border rounded text-sm hover:bg-secondary transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  </div>
);

type RepliesListProps = Omit<CommentNodeProps, "node"> & {
  replies: CommentTree[];
};

const RepliesList: React.FC<RepliesListProps> = ({
  replies,
  depth,
  teamId,
  currentUserId,
  avatarUrls,
  submitting,
  replyingTo,
  replyContent,
  onChangeReplyContent,
  onStartReplying,
  onCancelReplying,
  onSubmitReply,
  editingComment,
  editContent,
  onChangeEditContent,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onDelete,
  onReload,
}) => {
  if (replies.length === 0) return null;

  return (
    <div className="space-y-0">
      {replies.map((reply) => (
        <CommentNode
          key={reply.comment.id}
          node={reply}
          depth={depth + 1}
          teamId={teamId}
          currentUserId={currentUserId}
          avatarUrls={avatarUrls}
          submitting={submitting}
          replyingTo={replyingTo}
          replyContent={replyContent}
          onChangeReplyContent={onChangeReplyContent}
          onStartReplying={onStartReplying}
          onCancelReplying={onCancelReplying}
          onSubmitReply={onSubmitReply}
          editingComment={editingComment}
          editContent={editContent}
          onChangeEditContent={onChangeEditContent}
          onStartEdit={onStartEdit}
          onCancelEdit={onCancelEdit}
          onSaveEdit={onSaveEdit}
          onDelete={onDelete}
          onReload={onReload}
        />
      ))}
    </div>
  );
};

const CommentNode: React.FC<CommentNodeProps> = ({
  node,
  depth,
  teamId,
  currentUserId,
  avatarUrls,
  submitting,
  replyingTo,
  replyContent,
  onChangeReplyContent,
  onStartReplying,
  onCancelReplying,
  onSubmitReply,
  editingComment,
  editContent,
  onChangeEditContent,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onDelete,
  onReload,
}) => {
  const { comment, replies } = node;
  const isEditing = editingComment === comment.id;
  const isReplying = replyingTo === comment.id;
  const isOwnComment = currentUserId === comment.user_id;

  return (
    <div key={comment.id} className={`${depth > 0 ? "ml-6 mt-3" : "mt-4"}`}>
      <div className="rounded-xl p-4 bg-primary hover:bg-subtle transition-colors border border-muted">
        <div className="flex items-start gap-3 mb-2">
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
                    onClick={() => onStartEdit(comment)}
                    className="p-1 text-muted hover:text-primary transition-colors"
                    title="Edit"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onDelete(comment.id)}
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

        {isEditing ? (
          <div className="space-y-2">
            <RichTextEditor
              content={editContent}
              onChange={onChangeEditContent}
              placeholder="Edit your comment..."
              disabled={submitting}
              teamId={teamId}
            />
            <div className="flex gap-2">
              <button
                onClick={() => onSaveEdit(comment.id)}
                disabled={submitting || !editContent.trim()}
                className="px-3 py-1 bg-brand-primary text-white rounded text-sm hover:bg-brand-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save
              </button>
              <button
                onClick={onCancelEdit}
                disabled={submitting}
                className="px-3 py-1 border rounded text-sm hover:bg-secondary transition-colors"
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

            <div className="mb-2">
              <CommentReactions
                commentId={comment.id}
                onReactionChange={onReload}
                compact={true}
              />
            </div>

            {!isReplying && (
              <button
                onClick={() => onStartReplying(comment.id)}
                className="flex items-center gap-1 text-xs text-brand-primary hover:text-brand-primary-hover"
              >
                <Reply className="w-3 h-3" />
                Reply
              </button>
            )}
          </>
        )}
      </div>

      {isReplying && (
        <ReplyForm
          commentId={comment.id}
          teamId={teamId}
          submitting={submitting}
          replyContent={replyContent}
          onChangeReplyContent={onChangeReplyContent}
          onSubmitReply={onSubmitReply}
          onCancelReplying={onCancelReplying}
        />
      )}

      <RepliesList
        replies={replies}
        depth={depth}
        teamId={teamId}
        currentUserId={currentUserId}
        avatarUrls={avatarUrls}
        submitting={submitting}
        replyingTo={replyingTo}
        replyContent={replyContent}
        onChangeReplyContent={onChangeReplyContent}
        onStartReplying={onStartReplying}
        onCancelReplying={onCancelReplying}
        onSubmitReply={onSubmitReply}
        editingComment={editingComment}
        editContent={editContent}
        onChangeEditContent={onChangeEditContent}
        onStartEdit={onStartEdit}
        onCancelEdit={onCancelEdit}
        onSaveEdit={onSaveEdit}
        onDelete={onDelete}
        onReload={onReload}
      />
    </div>
  );
};

type NewCommentFormProps = {
  content: string;
  onChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  submitting: boolean;
  teamId?: string;
};

const NewCommentForm: React.FC<NewCommentFormProps> = ({
  content,
  onChange,
  onSubmit,
  submitting,
  teamId,
}) => (
  <form onSubmit={onSubmit} className="space-y-3">
    <RichTextEditor
      content={content}
      onChange={onChange}
      placeholder="Add a comment... You can add images by dragging & dropping or pasting them!"
      disabled={submitting}
      teamId={teamId}
    />
    <button
      type="submit"
      disabled={submitting || !content.trim()}
      className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-brand-jade text-white rounded-lg hover:from-blue-700 hover:to-jade-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-semibold shadow-md hover:shadow-lg"
    >
      <Send className="w-4 h-4" />
      Post Comment
    </button>
  </form>
);

type CommentsListProps = {
  comments: CommentTree[];
  teamId?: string;
  currentUserId: string | null;
  avatarUrls: Map<string, string | null>;
  submitting: boolean;
  replyingTo: string | null;
  replyContent: string;
  onChangeReplyContent: (value: string) => void;
  onStartReplying: (commentId: string) => void;
  onCancelReplying: () => void;
  onSubmitReply: (parentId: string) => void;
  editingComment: string | null;
  editContent: string;
  onChangeEditContent: (value: string) => void;
  onStartEdit: (comment: CommentWithAuthor) => void;
  onCancelEdit: () => void;
  onSaveEdit: (commentId: string) => void;
  onDelete: (commentId: string) => void;
  onReload: () => void;
};

const CommentsList: React.FC<CommentsListProps> = ({
  comments,
  teamId,
  currentUserId,
  avatarUrls,
  submitting,
  replyingTo,
  replyContent,
  onChangeReplyContent,
  onStartReplying,
  onCancelReplying,
  onSubmitReply,
  editingComment,
  editContent,
  onChangeEditContent,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onDelete,
  onReload,
}) => {
  if (comments.length === 0) {
    return (
      <p className="text-center text-muted py-8">
        No comments yet. Be the first to comment!
      </p>
    );
  }

  return (
    <div className="space-y-1">
      {comments.map((commentTree) => (
        <CommentNode
          key={commentTree.comment.id}
          node={commentTree}
          depth={0}
          teamId={teamId}
          currentUserId={currentUserId}
          avatarUrls={avatarUrls}
          submitting={submitting}
          replyingTo={replyingTo}
          replyContent={replyContent}
          onChangeReplyContent={onChangeReplyContent}
          onStartReplying={onStartReplying}
          onCancelReplying={onCancelReplying}
          onSubmitReply={onSubmitReply}
          editingComment={editingComment}
          editContent={editContent}
          onChangeEditContent={onChangeEditContent}
          onStartEdit={onStartEdit}
          onCancelEdit={onCancelEdit}
          onSaveEdit={onSaveEdit}
          onDelete={onDelete}
          onReload={onReload}
        />
      ))}
    </div>
  );
};

export const AnnouncementComments: React.FC<AnnouncementCommentsProps> = ({
  announcementId,
  teamId,
}) => {
  const toast = useToast();
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
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteCommentId, setDeleteCommentId] = useState<string | null>(null);

  // Get current user - use synchronous auth helper
  useEffect(() => {
    // Import dynamically to avoid circular dependencies
    import("../../lib/auth-helpers").then(({ getCurrentUserId }) => {
      setCurrentUserId(getCurrentUserId());
    });
  }, []);

  const loadComments = useCallback(async () => {
    setLoading(true);
    const tree = await CommentsService.getCommentsTree(announcementId);
    setComments(tree);

    const userIds = collectUserIdsFromCommentTree(tree);
    const avatarMap = await loadAvatarUrlsByUserId(userIds);
    setAvatarUrls(avatarMap);

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
    const plainTextContent = getPlainTextFromTipTapJson(newComment);

    const result = await CommentsService.addComment({
      announcement_id: announcementId,
      content: plainTextContent,
      content_json: newComment,
    });

    if (result.success) {
      setNewComment("");
      await loadComments();
    } else {
      toast.error(`Failed to post comment: ${result.error}`);
    }
    setSubmitting(false);
  };

  const handleSubmitReply = async (parentId: string) => {
    if (!replyContent.trim() || submitting) return;

    setSubmitting(true);
    const plainTextContent = getPlainTextFromTipTapJson(replyContent);

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
      toast.error(`Failed to post reply: ${result.error}`);
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
    const plainTextContent = getPlainTextFromTipTapJson(editContent);

    const result = await CommentsService.updateComment(commentId, {
      content: plainTextContent,
      content_json: editContent,
    });

    if (result.success) {
      setEditingComment(null);
      setEditContent("");
      await loadComments();
    } else {
      toast.error(`Failed to update comment: ${result.error}`);
    }
    setSubmitting(false);
  };

  const handleDelete = async (commentId: string) => {
    setDeleteCommentId(commentId);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteComment = async () => {
    if (!deleteCommentId) return;

    const result = await CommentsService.deleteComment(deleteCommentId);
    if (result.success) {
      await loadComments();
    } else {
      toast.error(`Failed to delete comment: ${result.error}`);
    }
    setShowDeleteConfirm(false);
    setDeleteCommentId(null);
  };

  if (loading) {
    return (
      <div className="text-center py-4 text-muted">Loading comments...</div>
    );
  }

  return (
    <div className="space-y-4">
      <NewCommentForm
        content={newComment}
        onChange={setNewComment}
        onSubmit={handleSubmitComment}
        submitting={submitting}
        teamId={teamId}
      />

      <CommentsList
        comments={comments}
        teamId={teamId}
        currentUserId={currentUserId}
        avatarUrls={avatarUrls}
        submitting={submitting}
        replyingTo={replyingTo}
        replyContent={replyContent}
        onChangeReplyContent={setReplyContent}
        onStartReplying={setReplyingTo}
        onCancelReplying={() => {
          setReplyingTo(null);
          setReplyContent("");
        }}
        onSubmitReply={handleSubmitReply}
        editingComment={editingComment}
        editContent={editContent}
        onChangeEditContent={setEditContent}
        onStartEdit={handleStartEdit}
        onCancelEdit={() => {
          setEditingComment(null);
          setEditContent("");
        }}
        onSaveEdit={handleSaveEdit}
        onDelete={handleDelete}
        onReload={loadComments}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setDeleteCommentId(null);
        }}
        onConfirm={confirmDeleteComment}
        title="Delete Comment"
        message="Are you sure you want to delete this comment? This action cannot be undone."
        confirmLabel="Delete"
        variant="danger"
      />
    </div>
  );
};
