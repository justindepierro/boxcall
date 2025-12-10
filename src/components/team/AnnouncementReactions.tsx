/**
 * AnnouncementReactions Component
 *
 * Displays reactions on announcements with picker for adding/removing reactions
 * Shows: 👍 (like), ❤️ (love), 🎉 (celebrate), 🏈 (football)
 */

import React, { useState, useEffect } from "react";
import { logError } from "../../utils/logger";
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
        logError("Failed to toggle reaction:", result.error);
      }
    } catch (error) {
      // Revert optimistic update on error
      await loadReactions();
      logError("Error toggling reaction:", error);
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

  // Get reactions with counts > 0 for display
  const activeReactions = allReactionTypes
    .map((type) => ({
      type,
      summary: summary.find((s) => s.reaction_type === type),
    }))
    .filter((r) => (r.summary?.count || 0) > 0)
    .sort((a, b) => (b.summary?.count || 0) - (a.summary?.count || 0));

  // Show compact picker with only the essentials
  const quickReactions: ReactionType[] = ["like", "love", "celebrate", "fire"];

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {/* Active reactions with counts - compact bubbles */}
      {activeReactions.map(({ type, summary }) => {
        const count = summary?.count || 0;
        const hasReacted = summary?.user_has_reacted || false;
        const isAnimating = animatingReaction === type;

        return (
          <button
            key={type}
            onClick={() => handleToggleReaction(type)}
            disabled={loading}
            className={`
              flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium
              transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
              ${isAnimating ? "scale-110" : "scale-100"}
              ${
                hasReacted
                  ? "bg-brand-primary-light text-brand-primary ring-1 ring-brand-primary/30"
                  : "bg-secondary text-secondary hover:bg-muted"
              }
            `}
            title={`${REACTION_LABELS[type]}${hasReacted ? " (You reacted)" : ""}`}
          >
            <span
              className={`
                text-sm leading-none transition-all duration-200 
                ${isAnimating ? "scale-125" : ""}
              `}
            >
              {REACTION_EMOJIS[type]}
            </span>
            <span className="font-semibold text-xs">{count}</span>
          </button>
        );
      })}

      {/* Quick add buttons - only show if no reactions or on hover */}
      <div className="flex items-center gap-1 opacity-60 hover:opacity-100 transition-opacity">
        {quickReactions
          .filter((type) => !activeReactions.find((r) => r.type === type))
          .slice(0, 3)
          .map((type) => {
            const isAnimating = animatingReaction === type;
            return (
              <button
                key={type}
                onClick={() => handleToggleReaction(type)}
                disabled={loading}
                className={`
                  p-1 rounded-full text-base
                  transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
                  hover:bg-secondary hover:scale-110
                  ${isAnimating ? "scale-125" : "scale-100"}
                `}
                title={REACTION_LABELS[type]}
              >
                <span className="grayscale hover:grayscale-0 transition-all">
                  {REACTION_EMOJIS[type]}
                </span>
              </button>
            );
          })}
      </div>
    </div>
  );
};
