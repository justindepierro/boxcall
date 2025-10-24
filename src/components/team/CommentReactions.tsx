/**
 * CommentReactions Component
 *
 * Compact inline reactions for comments
 * Shows: 👍 (like), ❤️ (love), 🎉 (celebrate), 🏈 (football)
 */

import React, { useState, useEffect } from "react";
import {
  CommentReactionsService,
  type ReactionType,
  type ReactionSummary,
  REACTION_EMOJIS,
  REACTION_LABELS,
} from "../../services/commentReactionsService";

interface CommentReactionsProps {
  commentId: string;
  onReactionChange?: () => void;
  compact?: boolean; // If true, use more compact styling
}

export const CommentReactions: React.FC<CommentReactionsProps> = ({
  commentId,
  onReactionChange,
  compact = true,
}) => {
  const [summary, setSummary] = useState<ReactionSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [animatingReaction, setAnimatingReaction] =
    useState<ReactionType | null>(null);

  // Load reactions
  const loadReactions = async () => {
    const { summary: reactionSummary } =
      await CommentReactionsService.getReactions(commentId);
    setSummary(reactionSummary);
  };

  useEffect(() => {
    loadReactions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [commentId]);

  const handleToggleReaction = async (reactionType: ReactionType) => {
    if (loading) return;

    // Optimistic update - update UI immediately
    const currentSummary = summary.find(
      (s) => s.reaction_type === reactionType
    );
    const wasReacted = currentSummary?.user_has_reacted || false;
    const currentCount = currentSummary?.count || 0;

    // Update UI optimistically
    setSummary((prev) => {
      return prev.map((s) => {
        if (s.reaction_type === reactionType) {
          return {
            ...s,
            user_has_reacted: !wasReacted,
            count: wasReacted
              ? Math.max(0, currentCount - 1)
              : currentCount + 1,
          };
        }
        return s;
      });
    });

    setLoading(true);
    setAnimatingReaction(reactionType);

    try {
      const result = await CommentReactionsService.toggleReaction(
        commentId,
        reactionType
      );

      if (result.success) {
        // Reload to get accurate data from server
        await loadReactions();
        onReactionChange?.();
      } else {
        // Revert optimistic update on error
        await loadReactions();
        console.error("Failed to toggle comment reaction:", result.error);
      }
    } catch (error) {
      // Revert optimistic update on error
      await loadReactions();
      console.error("Error toggling comment reaction:", error);
    } finally {
      setLoading(false);
      // Keep animation class for a bit longer
      setTimeout(() => setAnimatingReaction(null), 300);
    }
  };

  const allReactionTypes: ReactionType[] = [
    "like",
    "love",
    "celebrate",
    "football",
    "fire",
    "clap",
    "target",
    "hundred",
  ];

  return (
    <div
      className={`flex items-center gap-1.5 flex-wrap ${compact ? "text-xs" : "text-sm"}`}
    >
      {/* Always show all reaction types as inline buttons */}
      {allReactionTypes.map((type) => {
        const existingSummary = summary.find((s) => s.reaction_type === type);
        const count = existingSummary?.count || 0;
        const hasReacted = existingSummary?.user_has_reacted || false;
        const isAnimating = animatingReaction === type;

        return (
          <button
            key={type}
            onClick={() => handleToggleReaction(type)}
            disabled={loading}
            className={`
              flex items-center gap-1 rounded-full font-medium
              transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
              ${compact ? "px-2 py-1" : "px-3 py-1.5"}
              ${isAnimating ? "scale-110" : "scale-100"}
              ${
                hasReacted
                  ? "bg-blue-50 text-blue-700"
                  : count > 0
                    ? "bg-white text-text-primary hover:bg-jade-50"
                    : "bg-transparent text-text-secondary hover:bg-surface-subtle"
              }
            `}
            title={`${REACTION_LABELS[type]}${
              hasReacted ? " (You reacted)" : ""
            }${count > 0 ? ` - ${count} reaction${count !== 1 ? "s" : ""}` : ""}`}
          >
            <span
              className={`
                leading-none transition-all duration-200 
                ${isAnimating ? "scale-125" : ""} 
                ${compact ? "text-base" : "text-lg"}
              `}
            >
              {REACTION_EMOJIS[type]}
            </span>
            {count > 0 && <span className="font-semibold">{count}</span>}
          </button>
        );
      })}
    </div>
  );
};
