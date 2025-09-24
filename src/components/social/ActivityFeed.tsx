// Activity Feed Component
// Displays a timeline of social activities (reactions, follows, comments, etc.)

import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "../../lib/supabase";
import { Heart, UserPlus, MessageCircle, Play, FileText } from "lucide-react";
import type { ActivityType } from "../../types/social";

interface ActivityItem {
  id: string;
  activity_type: ActivityType;
  actor_name: string;
  actor_avatar?: string;
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
      let query = supabase
        .from("activity_feed")
        .select(
          `
          *,
          actor:profiles(display_name, avatar_url)
        `
        )
        .order("created_at", { ascending: false })
        .limit(limit);

      if (userId) {
        query = query.or(
          `actor_id.eq.${userId},mentioned_user_id.eq.${userId}`
        );
      }

      const { data, error } = await query;

      if (error) throw error;

      // Transform the data to match our interface
      const transformedActivities: ActivityItem[] = (data || []).map(
        (item) => ({
          id: item.id,
          activity_type: item.activity_type,
          actor_name: item.actor?.display_name || "Unknown User",
          actor_avatar: item.actor?.avatar_url,
          content_type: item.content_type,
          content_title: item.metadata?.content_title,
          created_at: item.created_at,
          metadata: item.metadata,
        })
      );

      setActivities(transformedActivities);
    } catch (error) {
      console.error("Failed to load activities:", error);
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
        return <Heart className="w-4 h-4 text-red-500" />;
      case "follow_started":
        return <UserPlus className="w-4 h-4 text-blue-500" />;
      case "comment_posted":
        return <MessageCircle className="w-4 h-4 text-green-500" />;
      case "play_created":
        return <Play className="w-4 h-4 text-purple-500" />;
      case "game_plan_created":
        return <FileText className="w-4 h-4 text-orange-500" />;
      default:
        return <div className="w-4 h-4 bg-gray-300 rounded-full" />;
    }
  };

  const formatActivityMessage = (activity: ActivityItem): string => {
    const { actor_name, activity_type, content_type } = activity;

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
              <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                <div className="h-3 bg-gray-300 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
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
          className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg"
        >
          {/* Activity Icon */}
          <div className="flex-shrink-0 mt-1">
            {getActivityIcon(activity.activity_type)}
          </div>

          {/* Activity Content */}
          <div className="flex-1 min-w-0">
            <p className="text-sm text-gray-900">
              {formatActivityMessage(activity)}
            </p>
            {activity.content_title && (
              <p className="text-sm text-blue-600 font-medium mt-1">
                "{activity.content_title}"
              </p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              {formatTimeAgo(activity.created_at)}
            </p>
          </div>

          {/* Actor Avatar */}
          {activity.actor_avatar && (
            <div className="flex-shrink-0">
              <img
                src={activity.actor_avatar}
                alt={activity.actor_name}
                className="w-8 h-8 rounded-full"
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
