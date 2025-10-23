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
import { Plus } from "lucide-react";

interface AnnouncementReactionsProps {
  announcementId: string;
  onReactionChange?: () => void;
}

export const AnnouncementReactions: React.FC<AnnouncementReactionsProps> = ({
  announcementId,
  onReactionChange,
}) => {
  const [summary, setSummary] = useState<ReactionSummary[]>([]);
  const [showPicker, setShowPicker] = useState(false);
  const [loading, setLoading] = useState(false);

  // Load reactions
  useEffect(() => {
    loadReactions();
  }, [announcementId]);

  const loadReactions = async () => {
    const { summary: reactionSummary } = await ReactionsService.getReactions(
      announcementId
    );
    setSummary(reactionSummary);
  };

  const handleToggleReaction = async (reactionType: ReactionType) => {
    if (loading) return;

    setLoading(true);
    setShowPicker(false);

    try {
      const result = await ReactionsService.toggleReaction(
        announcementId,
        reactionType
      );

      if (result.success) {
        await loadReactions();
        onReactionChange?.();
      } else {
        console.error("Failed to toggle reaction:", result.error);
      }
    } catch (error) {
      console.error("Error toggling reaction:", error);
    } finally {
      setLoading(false);
    }
  };

  const allReactionTypes: ReactionType[] = ["like", "love", "celebrate", "football"];

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Existing Reactions */}
      {summary.map((reactionSummary) => (
        <button
          key={reactionSummary.reaction_type}
          onClick={() => handleToggleReaction(reactionSummary.reaction_type)}
          disabled={loading}
          className={`
            flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium
            transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
            ${
              reactionSummary.user_has_reacted
                ? "bg-blue-100 text-blue-700 border-2 border-blue-500 hover:bg-blue-200"
                : "bg-surface-secondary text-secondary border hover:bg-surface-muted"
            }
          `}
          title={`${REACTION_LABELS[reactionSummary.reaction_type]}${
            reactionSummary.user_has_reacted ? " (You reacted)" : ""
          }`}
        >
          <span className="text-lg leading-none">
            {REACTION_EMOJIS[reactionSummary.reaction_type]}
          </span>
          <span className="font-semibold">{reactionSummary.count}</span>
        </button>
      ))}

      {/* Add Reaction Button / Picker */}
      <div className="relative">
        <button
          onClick={() => setShowPicker(!showPicker)}
          disabled={loading}
          className="
            flex items-center justify-center
            w-8 h-8 rounded-full
            bg-surface-secondary hover:bg-surface-muted
            text-secondary hover:text-primary
            border
            transition-colors
            disabled:opacity-50 disabled:cursor-not-allowed
          "
          title="Add reaction"
        >
          <Plus className="w-4 h-4" />
        </button>

        {/* Reaction Picker Popup */}
        {showPicker && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-10"
              onClick={() => setShowPicker(false)}
            />

            {/* Picker */}
            <div className="absolute bottom-full left-0 mb-2 z-20 bg-white rounded-lg shadow-lg border p-2 flex gap-1">
              {allReactionTypes.map((type) => {
                const existingSummary = summary.find((s) => s.reaction_type === type);
                const hasReacted = existingSummary?.user_has_reacted || false;

                return (
                  <button
                    key={type}
                    onClick={() => handleToggleReaction(type)}
                    disabled={loading}
                    className={`
                      w-10 h-10 rounded-lg text-2xl
                      transition-all duration-200
                      hover:scale-125 hover:bg-surface-secondary
                      disabled:opacity-50 disabled:cursor-not-allowed
                      ${hasReacted ? "bg-blue-100 scale-110" : ""}
                    `}
                    title={REACTION_LABELS[type]}
                  >
                    {REACTION_EMOJIS[type]}
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
