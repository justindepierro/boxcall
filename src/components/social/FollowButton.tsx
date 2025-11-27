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
        className={`${buttonSizeClasses[size]} bg-border animate-pulse rounded-lg flex items-center gap-2`}
      >
        <div className={`${sizeClasses[size]} bg-border-light rounded`} />
        <div className="h-4 bg-border-light rounded-lg w-16" />
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
            ? "text-success bg-success/20 hover:bg-success/20"
            : "text-tertiary hover:text-primary hover:bg-secondary"
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
          ? "border-text-success bg-success/20 text-success hover:bg-success/20"
          : "border-light bg-primary text-primary hover:bg-secondary"
      }`}
      disabled={isLoading}
    >
      {isLoading ? (
        <div
          className={`${sizeClasses[size]} border-2 border-text-primary border-t-transparent rounded-full animate-spin`}
        />
      ) : is_following ? (
        <UserCheck className={sizeClasses[size]} />
      ) : (
        <UserPlus className={sizeClasses[size]} />
      )}

      <span>{is_following ? "Following" : "Follow"}</span>

      {follower_count > 0 && (
        <span className="flex items-center gap-1 text-sm text-muted ml-1">
          <Users className="w-3 h-3" />
          {follower_count}
        </span>
      )}
    </button>
  );
};
