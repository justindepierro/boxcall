import React from "react";
import { Icon } from "../ui/Icon";
import { Typography } from "../design-system/Typography";

interface ActivityItem {
  id: string;
  type:
    | "created"
    | "updated"
    | "duplicated"
    | "added_to_script"
    | "added_to_gameplan";
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
        return "text-success";
      case "updated":
        return "text-info";
      case "duplicated":
        return "text-primary";
      case "added_to_script":
        return "text-warning";
      case "added_to_gameplan":
        return "text-primary";
      default:
        return "text-tertiary";
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
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60)
    );

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
    <div
      className={`bg-surface-primary rounded-lg border border-border p-4 overflow-visible ${className}`}
    >
      <div className="flex items-center mb-4">
        <Icon name="activity" className="h-5 w-5 text-jade-600 mr-2" />
        <Typography variant="headline-sm" className="text-primary">
          Recent Activity
        </Typography>
      </div>

      {displayedActivities.length === 0 ? (
        <div className="text-center py-6 text-muted">
          <Icon
            name="activity"
            className="h-8 w-8 mx-auto mb-2 text-border-light"
          />
          <Typography variant="body-sm" className="text-muted">
            No recent activity
          </Typography>
        </div>
      ) : (
        <div className="space-y-3">
          {displayedActivities.map((activity) => (
            <div key={activity.id} className="flex items-start space-x-3">
              <div
                className={`flex-shrink-0 w-8 h-8 rounded-full bg-surface-secondary flex items-center justify-center`}
              >
                <Icon
                  name={getActivityIcon(activity.type)}
                  className={`h-4 w-4 ${getActivityColor(activity.type)}`}
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <Typography
                    variant="body-sm"
                    className="text-primary font-medium truncate"
                  >
                    {activity.playName}
                  </Typography>
                  <Typography
                    variant="body-xs"
                    className="text-muted ml-2 flex-shrink-0"
                  >
                    {formatTimeAgo(activity.timestamp)}
                  </Typography>
                </div>
                <Typography variant="body-xs" className="text-secondary">
                  {getActivityLabel(activity.type)}
                  {activity.details && ` • ${activity.details}`}
                </Typography>
              </div>
            </div>
          ))}
        </div>
      )}

      {activities.length > maxItems && (
        <div className="mt-4 pt-3 border-t border-light">
          <Typography variant="body-xs" className="text-muted text-center">
            +{activities.length - maxItems} more activities
          </Typography>
        </div>
      )}
    </div>
  );
};
