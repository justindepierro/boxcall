// Activity Feed Component
// Displays a timeline of social activities (reactions, follows, comments, etc.)

import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "../../lib/supabase";
import { Heart, UserPlus, MessageCircle, Play, FileText } from "lucide-react";
import type { ActivityType } from "../../types/social";
import { logError } from "../../utils/logger";

interface ActivityItem {
  id: string;
  activity_type: ActivityType;
  content_type: string;
  content_title?: string;
  created_at: string;
  metadata?: any;
}

interface ActivityFeedProps {
  userId?: string; // If provided, shows only activities related to this user
  limit?: number;
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({
  userId,
  limit = 20,
}) => {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadActivities = useCallback(async () => {
    setLoading(true);
    try {
      // First, fetch activity data without the join
      let activityQuery = supabase
        .from("activity_feed")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit);

      if (userId) {
        activityQuery = activityQuery.eq("user_id", userId);
      }

      const { data: activities, error: activityError } = await activityQuery;

      if (activityError) throw activityError;

      if (!activities || activities.length === 0) {
        setActivities([]);
        return;
      }

      // Transform the data to match our interface
      const transformedActivities: ActivityItem[] = activities.map((item) => {
        const metadataTitle = (() => {
          const metadata = item.metadata;
          if (!metadata) return undefined;
          if (typeof metadata !== "object") return undefined;
          if (Array.isArray(metadata)) return undefined;
          const maybeTitle = (metadata as Record<string, unknown>)[
            "content_title"
          ];
          return typeof maybeTitle === "string" ? maybeTitle : undefined;
        })();

        return {
          id: item.id,
          activity_type: (item.activity_type ||
            "comment_posted") as ActivityType,
          content_type: item.entity_type || "unknown",
          content_title: item.title || item.description || metadataTitle,
          created_at: item.created_at || new Date().toISOString(),
          metadata: item.metadata,
        };
      });

      setActivities(transformedActivities);
    } catch (error) {
      logError("Failed to load activities:", error);
    } finally {
      setLoading(false);
    }
  }, [userId, limit]);

  useEffect(() => {
    loadActivities();
  }, [loadActivities]);

  const getActivityIcon = (type: ActivityType): React.ReactNode => {
    switch (type) {
      case "reaction_added":
        return <Heart className="w-4 h-4 text-error" />;
      case "follow_started":
        return <UserPlus className="w-4 h-4 text-info" />;
      case "comment_posted":
        return <MessageCircle className="w-4 h-4 text-success" />;
      case "play_created":
        return <Play className="w-4 h-4 text-primary" />;
      case "game_plan_created":
        return <FileText className="w-4 h-4 text-warning" />;
      default:
        return <div className="w-4 h-4 bg-border-light rounded-full" />;
    }
  };

  const formatActivityMessage = (activity: ActivityItem): string => {
    const { activity_type, content_type } = activity;
    const actor_name = "Someone";

    switch (activity_type) {
      case "reaction_added":
        return `${actor_name} reacted to a ${content_type}`;
      case "follow_started":
        return `${actor_name} started following someone`;
      case "comment_posted":
        return `${actor_name} commented on a ${content_type}`;
      case "play_created":
        return `${actor_name} created a new play`;
      case "game_plan_created":
        return `${actor_name} created a game plan`;
      default:
        return `${actor_name} performed an action`;
    }
  };

  const formatTimeAgo = (dateString: string): string => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-border-light rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-border-light rounded-lg w-3/4"></div>
                <div className="h-3 bg-border-light rounded-lg w-1/2"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-8 text-muted">
        <div className="text-4xl mb-2">📭</div>
        <p>No activity yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <div
          key={activity.id}
          className="flex items-start space-x-3 p-3 hover:bg-secondary rounded-lg"
        >
          {/* Activity Icon */}
          <div className="flex-shrink-0 mt-1">
            {getActivityIcon(activity.activity_type)}
          </div>

          {/* Activity Content */}
          <div className="flex-1 min-w-0">
            <p className="text-sm text-primary">
              {formatActivityMessage(activity)}
            </p>
            {activity.content_title && (
              <p className="text-sm text-info font-medium mt-1">
                "{activity.content_title}"
              </p>
            )}
            <p className="text-xs text-muted mt-1">
              {formatTimeAgo(activity.created_at)}
            </p>
          </div>

          {/* Actor Avatar */}
          {/* Avatar not available from current activity_feed schema */}
        </div>
      ))}
    </div>
  );
};
