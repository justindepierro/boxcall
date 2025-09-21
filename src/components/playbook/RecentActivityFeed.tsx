import React from "react";
import { Icon } from "../ui/Icon";
import { Typography } from "../design-system/Typography";

interface ActivityItem {
  id: string;
  type: "created" | "updated" | "duplicated" | "added_to_script" | "added_to_gameplan";
  playName: string;
  timestamp: Date;
  details?: string;
}

interface RecentActivityFeedProps {
  activities: ActivityItem[];
  className?: string;
  maxItems?: number;
}

export const RecentActivityFeed: React.FC<RecentActivityFeedProps> = ({
  activities,
  className = "",
  maxItems = 5,
}) => {
  const getActivityIcon = (type: ActivityItem["type"]) => {
    switch (type) {
      case "created":
        return "plus";
      case "updated":
        return "edit";
      case "duplicated":
        return "copy";
      case "added_to_script":
        return "file";
      case "added_to_gameplan":
        return "users";
      default:
        return "activity";
    }
  };

  const getActivityColor = (type: ActivityItem["type"]) => {
    switch (type) {
      case "created":
        return "text-green-600";
      case "updated":
        return "text-blue-600";
      case "duplicated":
        return "text-purple-600";
      case "added_to_script":
        return "text-orange-600";
      case "added_to_gameplan":
        return "text-indigo-600";
      default:
        return "text-gray-600";
    }
  };

  const getActivityLabel = (type: ActivityItem["type"]) => {
    switch (type) {
      case "created":
        return "Created";
      case "updated":
        return "Updated";
      case "duplicated":
        return "Duplicated";
      case "added_to_script":
        return "Added to script";
      case "added_to_gameplan":
        return "Added to game plan";
      default:
        return "Activity";
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;

    return date.toLocaleDateString();
  };

  const displayedActivities = activities.slice(0, maxItems);

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-4 ${className}`}>
      <div className="flex items-center mb-4">
        <Icon name="activity" className="h-5 w-5 text-jade-600 mr-2" />
        <Typography variant="headline-sm" className="text-gray-900">
          Recent Activity
        </Typography>
      </div>

      {displayedActivities.length === 0 ? (
        <div className="text-center py-6 text-gray-500">
          <Icon name="activity" className="h-8 w-8 mx-auto mb-2 text-gray-300" />
          <Typography variant="body-sm" className="text-gray-500">
            No recent activity
          </Typography>
        </div>
      ) : (
        <div className="space-y-3">
          {displayedActivities.map((activity) => (
            <div key={activity.id} className="flex items-start space-x-3">
              <div className={`flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center`}>
                <Icon
                  name={getActivityIcon(activity.type)}
                  className={`h-4 w-4 ${getActivityColor(activity.type)}`}
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <Typography variant="body-sm" className="text-gray-900 font-medium truncate">
                    {activity.playName}
                  </Typography>
                  <Typography variant="body-xs" className="text-gray-500 ml-2 flex-shrink-0">
                    {formatTimeAgo(activity.timestamp)}
                  </Typography>
                </div>
                <Typography variant="body-xs" className="text-gray-600">
                  {getActivityLabel(activity.type)}
                  {activity.details && ` • ${activity.details}`}
                </Typography>
              </div>
            </div>
          ))}
        </div>
      )}

      {activities.length > maxItems && (
        <div className="mt-4 pt-3 border-t border-gray-100">
          <Typography variant="body-xs" className="text-gray-500 text-center">
            +{activities.length - maxItems} more activities
          </Typography>
        </div>
      )}
    </div>
  );
};