/**
 * ReactionPicker Component
 * Enhanced reaction system with emoji picker and "who reacted" tooltips
 */

import React, { useState, useRef, useEffect } from "react";
import {
  type ReactionType,
  type ReactionSummary,
  REACTION_EMOJIS,
  REACTION_LABELS,
  ReactionsService,
} from "../../services/reactionsService";

interface ReactionPickerProps {
  announcementId: string;
  summary: ReactionSummary[];
  onReactionChange?: () => void;
}

export const ReactionPicker: React.FC<ReactionPickerProps> = ({
  announcementId,
  summary,
  onReactionChange,
}) => {
  const [showPicker, setShowPicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [animatingReaction, setAnimatingReaction] =
    useState<ReactionType | null>(null);
  const [hoveredReaction, setHoveredReaction] = useState<ReactionType | null>(
    null
  );
  const [reactionUsers, setReactionUsers] = useState<
    Map<ReactionType, Array<{ id: string; name: string; avatar_url?: string }>>
  >(new Map());
  const pickerRef = useRef<HTMLDivElement>(null);

  const allReactionTypes: ReactionType[] = [
    "like",
    "love",
    "fire",
    "clap",
    "celebrate",
    "football",
    "target",
    "hundred",
  ];

  // Close picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        pickerRef.current &&
        !pickerRef.current.contains(event.target as Node)
      ) {
        setShowPicker(false);
      }
    };

    if (showPicker) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showPicker]);

  // Load reaction users when hovering
  const handleMouseEnter = async (type: ReactionType) => {
    setHoveredReaction(type);

    const existingSummary = summary.find((s) => s.reaction_type === type);
    if (!existingSummary || existingSummary.count === 0) return;

    // Only fetch if we don't have the data yet
    if (!reactionUsers.has(type)) {
      const users = await ReactionsService.getReactionUsers(
        announcementId,
        type
      );
      setReactionUsers((prev) => new Map(prev).set(type, users));
    }
  };

  const handleMouseLeave = () => {
    setHoveredReaction(null);
  };

  const handleToggleReaction = async (reactionType: ReactionType) => {
    if (loading) return;

    setLoading(true);
    setAnimatingReaction(reactionType);
    setShowPicker(false);

    try {
      const result = await ReactionsService.toggleReaction(
        announcementId,
        reactionType
      );

      if (result.success) {
        onReactionChange?.();
      } else {
        console.error("Failed to toggle reaction:", result.error);
      }
    } catch (error) {
      console.error("Error toggling reaction:", error);
    } finally {
      setLoading(false);
      setTimeout(() => setAnimatingReaction(null), 300);
    }
  };

  // Reactions that have at least one count
  const activeReactions = summary.filter((s) => s.count > 0);

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Active reactions (shown inline) */}
      {activeReactions.map(({ reaction_type, count, user_has_reacted }) => {
        const isAnimating = animatingReaction === reaction_type;
        const isHovered = hoveredReaction === reaction_type;
        const users = reactionUsers.get(reaction_type) || [];

        return (
          <div key={reaction_type} className="relative">
            <button
              onClick={() => handleToggleReaction(reaction_type)}
              onMouseEnter={() => handleMouseEnter(reaction_type)}
              onMouseLeave={handleMouseLeave}
              disabled={loading}
              className={`
                flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium
                transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
                ${isAnimating ? "scale-110" : "scale-100"}
                ${
                  user_has_reacted
                    ? "bg-blue-100 text-blue-700 border-2 border-blue-500 hover:bg-blue-200"
                    : "bg-surface-secondary text-secondary border hover:bg-surface-muted hover:border-gray-300"
                }
              `}
            >
              <span
                className={`
                  text-lg leading-none transition-all duration-200 
                  ${isAnimating ? "scale-125" : ""}
                `}
              >
                {REACTION_EMOJIS[reaction_type]}
              </span>
              <span className="font-semibold">{count}</span>
            </button>

            {/* Tooltip showing who reacted */}
            {isHovered && users.length > 0 && (
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-50 pointer-events-none">
                <div className="bg-primary text-white text-xs rounded-lg py-2 px-3 shadow-lg max-w-xs">
                  <div className="font-semibold mb-1">
                    {REACTION_LABELS[reaction_type]}
                  </div>
                  <div className="space-y-1">
                    {users.slice(0, 5).map((user) => (
                      <div key={user.id} className="text-white opacity-90">
                        {user.name}
                      </div>
                    ))}
                    {users.length > 5 && (
                      <div className="text-muted italic">
                        and {users.length - 5} more...
                      </div>
                    )}
                  </div>
                  {/* Arrow */}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                    <div className="border-4 border-transparent border-t-primary" />
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* Add reaction button */}
      <div className="relative" ref={pickerRef}>
        <button
          onClick={() => setShowPicker(!showPicker)}
          disabled={loading}
          className="
            flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium
            bg-surface-muted text-secondary border hover:bg-surface-secondary
            transition-colors disabled:opacity-50 disabled:cursor-not-allowed
          "
          title="Add reaction"
        >
          <span className="text-lg leading-none">😊</span>
          <span className="text-xs">+</span>
        </button>

        {/* Reaction picker dropdown */}
        {showPicker && (
          <div className="absolute bottom-full left-0 mb-2 bg-white border rounded-lg shadow-xl p-2 z-50">
            <div className="grid grid-cols-4 gap-1">
              {allReactionTypes.map((type) => {
                const existingSummary = summary.find(
                  (s) => s.reaction_type === type
                );
                const hasReacted = existingSummary?.user_has_reacted || false;

                return (
                  <button
                    key={type}
                    onClick={() => handleToggleReaction(type)}
                    className={`
                      p-2 rounded-lg text-2xl hover:bg-surface-muted transition-colors
                      ${hasReacted ? "bg-blue-50 ring-2 ring-blue-500" : ""}
                    `}
                    title={REACTION_LABELS[type]}
                  >
                    {REACTION_EMOJIS[type]}
                  </button>
                );
              })}
            </div>
            {/* Arrow */}
            <div className="absolute top-full left-4 transform -translate-x-1/2 -mt-1">
              <div className="border-4 border-transparent border-t-white" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
