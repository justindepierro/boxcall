// Follow Button Component
// Reusable component for following teams and users

import React, { useState, useEffect, useCallback } from "react";
import { UserPlus, UserCheck, Users } from "lucide-react";
import { socialService } from "../../services/socialService";
import type { FollowButtonProps, FollowSummary } from "../../types/social";

export const FollowButton: React.FC<FollowButtonProps> = ({
  followingType,
  followingId,
  variant = "button",
  size = "md",
}) => {
  const [followSummary, setFollowSummary] = useState<FollowSummary | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);

  const loadFollowStatus = useCallback(async () => {
    try {
      const summary = await socialService.getFollowStatus(
        followingType,
        followingId
      );
      setFollowSummary(summary);
    } catch (error) {
      console.error("Failed to load follow status:", error);
    }
  }, [followingType, followingId]);

  useEffect(() => {
    loadFollowStatus();
  }, [loadFollowStatus]);

  const handleFollowToggle = async () => {
    if (isLoading || !followSummary) return;

    setIsLoading(true);
    try {
      if (followSummary.is_following) {
        await socialService.unfollow(followingType, followingId);
      } else {
        await socialService.follow({
          following_type: followingType,
          following_id: followingId,
        });
      }
      await loadFollowStatus();
    } catch (error) {
      console.error("Failed to toggle follow:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  const buttonSizeClasses = {
    sm: "px-2 py-1 text-sm",
    md: "px-3 py-2 text-base",
    lg: "px-4 py-3 text-lg",
  };

  if (!followSummary) {
    return (
      <div
        className={`${buttonSizeClasses[size]} bg-gray-200 animate-pulse rounded-lg flex items-center gap-2`}
      >
        <div className={`${sizeClasses[size]} bg-gray-300 rounded`} />
        <div className="h-4 bg-gray-300 rounded w-16" />
      </div>
    );
  }

  const { is_following, follower_count } = followSummary;

  if (variant === "icon") {
    return (
      <button
        onClick={handleFollowToggle}
        className={`flex items-center gap-1 ${buttonSizeClasses[size]} rounded-full transition-colors ${
          is_following
            ? "text-green-600 bg-green-50 hover:bg-green-100"
            : "text-gray-600 hover:text-gray-800 hover:bg-gray-100"
        }`}
        disabled={isLoading}
        title={is_following ? "Unfollow" : "Follow"}
      >
        {is_following ? (
          <UserCheck className={sizeClasses[size]} />
        ) : (
          <UserPlus className={sizeClasses[size]} />
        )}
        {follower_count > 0 && (
          <span className="text-sm font-medium">{follower_count}</span>
        )}
      </button>
    );
  }

  // Button variant
  return (
    <button
      onClick={handleFollowToggle}
      className={`flex items-center gap-2 ${buttonSizeClasses[size]} border rounded-lg font-medium transition-colors ${
        is_following
          ? "border-green-300 bg-green-50 text-green-700 hover:bg-green-100"
          : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
      }`}
      disabled={isLoading}
    >
      {isLoading ? (
        <div
          className={`${sizeClasses[size]} border-2 border-current border-t-transparent rounded-full animate-spin`}
        />
      ) : is_following ? (
        <UserCheck className={sizeClasses[size]} />
      ) : (
        <UserPlus className={sizeClasses[size]} />
      )}

      <span>{is_following ? "Following" : "Follow"}</span>

      {follower_count > 0 && (
        <span className="flex items-center gap-1 text-sm text-gray-500 ml-1">
          <Users className="w-3 h-3" />
          {follower_count}
        </span>
      )}
    </button>
  );
};
