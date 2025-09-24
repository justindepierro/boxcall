// Reaction Button Component
// Reusable component for adding reactions to content

import React, { useState, useEffect, useCallback } from "react";
import { Heart, ThumbsUp, Laugh, Frown, Meh, Angry } from "lucide-react";
import { socialService } from "../../services/socialService";
import type {
  ReactionButtonProps,
  ReactionSummary,
  ReactionType,
} from "../../types/social";

const reactionIcons: Record<ReactionType, React.ComponentType<any>> = {
  like: ThumbsUp,
  love: Heart,
  laugh: Laugh,
  wow: Meh,
  sad: Frown,
  angry: Angry,
};

const reactionColors: Record<ReactionType, string> = {
  like: "text-blue-500",
  love: "text-red-500",
  laugh: "text-yellow-500",
  wow: "text-purple-500",
  sad: "text-gray-500",
  angry: "text-orange-500",
};

export const ReactionButton: React.FC<ReactionButtonProps> = ({
  contentType,
  contentId,
  size = "md",
  showCount = true,
  variant = "button",
}) => {
  const [reactionSummary, setReactionSummary] =
    useState<ReactionSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPicker, setShowPicker] = useState(false);

  const loadReactions = useCallback(async () => {
    try {
      const summary = await socialService.getReactions(contentType, contentId);
      setReactionSummary(summary);
    } catch (error) {
      console.error("Failed to load reactions:", error);
    }
  }, [contentType, contentId]);

  useEffect(() => {
    loadReactions();
  }, [loadReactions]);

  const handleReaction = async (reactionType: ReactionType) => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      await socialService.toggleReaction({
        content_type: contentType,
        content_id: contentId,
        reaction_type: reactionType,
      });
      await loadReactions();
      setShowPicker(false);
    } catch (error) {
      console.error("Failed to toggle reaction:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-10 h-10",
  };

  const buttonSizeClasses = {
    sm: "px-2 py-1 text-sm",
    md: "px-3 py-2 text-base",
    lg: "px-4 py-3 text-lg",
  };

  if (!reactionSummary) {
    return (
      <div
        className={`${sizeClasses[size]} bg-gray-200 animate-pulse rounded`}
      />
    );
  }

  const userReaction = reactionSummary.user_reaction;
  const totalCount = reactionSummary.total_count;

  if (variant === "icon") {
    return (
      <div className="relative">
        <button
          onClick={() => setShowPicker(!showPicker)}
          className={`flex items-center gap-1 ${buttonSizeClasses[size]} rounded-full transition-colors ${
            userReaction
              ? `${reactionColors[userReaction]} bg-opacity-10 hover:bg-opacity-20`
              : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
          }`}
          disabled={isLoading}
        >
          {userReaction ? (
            React.createElement(reactionIcons[userReaction], {
              className: `${sizeClasses[size]} ${reactionColors[userReaction]}`,
            })
          ) : (
            <Heart className={`${sizeClasses[size]} text-gray-400`} />
          )}
          {showCount && totalCount > 0 && (
            <span className="text-sm font-medium">{totalCount}</span>
          )}
        </button>

        {showPicker && (
          <div className="absolute bottom-full mb-2 left-0 bg-white border border-gray-200 rounded-lg shadow-lg p-2 flex gap-1 z-10">
            {(Object.keys(reactionIcons) as ReactionType[]).map(
              (reactionType) => {
                const Icon = reactionIcons[reactionType];
                const count = reactionSummary.reactions[reactionType] || 0;

                return (
                  <button
                    key={reactionType}
                    onClick={() => handleReaction(reactionType)}
                    className={`flex items-center gap-1 px-2 py-1 rounded transition-colors ${
                      userReaction === reactionType
                        ? "bg-gray-100"
                        : "hover:bg-gray-50"
                    }`}
                    disabled={isLoading}
                  >
                    <Icon
                      className={`w-5 h-5 ${reactionColors[reactionType]}`}
                    />
                    {count > 0 && (
                      <span className="text-xs font-medium">{count}</span>
                    )}
                  </button>
                );
              }
            )}
          </div>
        )}
      </div>
    );
  }

  // Button variant - shows most popular reaction or default
  const topReaction = Object.entries(reactionSummary.reactions).sort(
    ([, a], [, b]) => (b || 0) - (a || 0)
  )[0];

  return (
    <button
      onClick={() => setShowPicker(!showPicker)}
      className={`flex items-center gap-2 ${buttonSizeClasses[size]} border border-gray-300 rounded-lg transition-colors ${
        userReaction ? "bg-gray-50 border-gray-400" : "hover:bg-gray-50"
      }`}
      disabled={isLoading}
    >
      {userReaction ? (
        <>
          {React.createElement(reactionIcons[userReaction], {
            className: `${sizeClasses[size]} ${reactionColors[userReaction]}`,
          })}
          <span className="capitalize text-sm">{userReaction}</span>
        </>
      ) : topReaction ? (
        <>
          {React.createElement(reactionIcons[topReaction[0] as ReactionType], {
            className: `${sizeClasses[size]} ${reactionColors[topReaction[0] as ReactionType]}`,
          })}
          <span className="text-sm">{topReaction[1]}</span>
        </>
      ) : (
        <>
          <Heart className={`${sizeClasses[size]} text-gray-400`} />
          <span className="text-sm text-gray-500">React</span>
        </>
      )}

      {showPicker && (
        <div className="absolute top-full mt-2 left-0 bg-white border border-gray-200 rounded-lg shadow-lg p-2 flex gap-1 z-10">
          {(Object.keys(reactionIcons) as ReactionType[]).map(
            (reactionType) => {
              const Icon = reactionIcons[reactionType];
              const count = reactionSummary.reactions[reactionType] || 0;

              return (
                <button
                  key={reactionType}
                  onClick={() => handleReaction(reactionType)}
                  className={`flex items-center gap-1 px-2 py-1 rounded transition-colors ${
                    userReaction === reactionType
                      ? "bg-gray-100"
                      : "hover:bg-gray-50"
                  }`}
                  disabled={isLoading}
                >
                  <Icon className={`w-5 h-5 ${reactionColors[reactionType]}`} />
                  {count > 0 && (
                    <span className="text-xs font-medium">{count}</span>
                  )}
                </button>
              );
            }
          )}
        </div>
      )}
    </button>
  );
};
