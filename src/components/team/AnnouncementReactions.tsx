/**
 * AnnouncementReactions Component
 *
 * Displays reactions on announcements with picker for adding/removing reactions
 * Shows: 👍 (like), ❤️ (love), 🎉 (celebrate), 🏈 (football)
 */

import React, { useState, useEffect } from "react";
import {
  ReactionsService,
  type ReactionType,
  type ReactionSummary,
  REACTION_EMOJIS,
  REACTION_LABELS,
} from "../../services/reactionsService";

interface AnnouncementReactionsProps {
  announcementId: string;
  onReactionChange?: () => void;
}

export const AnnouncementReactions: React.FC<AnnouncementReactionsProps> = ({
  announcementId,
  onReactionChange,
}) => {
  const [summary, setSummary] = useState<ReactionSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [animatingReaction, setAnimatingReaction] =
    useState<ReactionType | null>(null);

  // Load reactions
  const loadReactions = async () => {
    const { summary: reactionSummary } =
      await ReactionsService.getReactions(announcementId);
    setSummary(reactionSummary);
  };

  useEffect(() => {
    loadReactions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [announcementId]);

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
      const result = await ReactionsService.toggleReaction(
        announcementId,
        reactionType
      );

      if (result.success) {
        // Reload to get accurate data from server
        await loadReactions();
        onReactionChange?.();
      } else {
        // Revert optimistic update on error
        await loadReactions();
        console.error("Failed to toggle reaction:", result.error);
      }
    } catch (error) {
      // Revert optimistic update on error
      await loadReactions();
      console.error("Error toggling reaction:", error);
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
    <div className="flex items-center gap-2 flex-wrap">
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
              flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium
              transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
              ${isAnimating ? "scale-110" : "scale-100"}
              ${
                hasReacted
                  ? "bg-brand-primary-light text-brand-primary-dark shadow-sm"
                  : count > 0
                    ? "bg-surface-primary text-text-primary hover:bg-jade-50"
                    : "bg-transparent text-text-secondary hover:bg-surface-subtle"
              }
            `}
            title={`${REACTION_LABELS[type]}${
              hasReacted ? " (You reacted)" : ""
            }${count > 0 ? ` - ${count} reaction${count !== 1 ? "s" : ""}` : ""}`}
          >
            <span
              className={`
                text-xl leading-none transition-all duration-200 
                ${isAnimating ? "scale-125" : ""}
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
