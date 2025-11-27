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
    <div className={`overflow-visible ${className}`}>
      <div className="flex items-center mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-jade-500 to-emerald-600 flex items-center justify-center shadow-md shadow-jade-500/20 mr-3">
          <Icon name="activity" className="h-5 w-5 text-white" />
        </div>
        <Typography variant="headline-sm" className="text-primary font-bold">
          Recent Activity
        </Typography>
      </div>

      {displayedActivities.length === 0 ? (
        <div className="text-center py-12 px-4 bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-xl border-2 border-dashed border-divider">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center">
            <Icon name="activity" className="h-8 w-8 text-muted" />
          </div>
          <Typography
            variant="body-md"
            className="text-secondary font-medium mb-1"
          >
            No recent activity
          </Typography>
          <Typography variant="body-xs" className="text-muted">
            Your playbook changes will appear here
          </Typography>
        </div>
      ) : (
        <div className="space-y-2">
          {displayedActivities.map((activity, index) => (
            <div
              key={activity.id}
              className="group flex items-start space-x-3 p-3 rounded-xl hover:bg-gradient-to-r hover:from-jade-50/50 hover:to-emerald-50/30 transition-all duration-200 hover:shadow-sm"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-jade-100 to-emerald-100 flex items-center justify-center shadow-sm group-hover:shadow-md group-hover:scale-105 transition-all duration-200">
                <Icon
                  name={getActivityIcon(activity.type)}
                  className="h-5 w-5 text-jade-700"
                />
              </div>
              <div className="flex-1 min-w-0 pt-1">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <Typography
                      variant="body-sm"
                      className="text-primary font-semibold truncate mb-1"
                    >
                      {activity.playName}
                    </Typography>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-jade-100 text-jade-700 text-xs font-medium">
                        {getActivityLabel(activity.type)}
                      </span>
                      {activity.details && (
                        <Typography
                          variant="body-xs"
                          className="text-secondary"
                        >
                          {activity.details}
                        </Typography>
                      )}
                    </div>
                  </div>
                  <Typography
                    variant="body-xs"
                    className="text-muted font-medium flex-shrink-0"
                  >
                    {formatTimeAgo(activity.timestamp)}
                  </Typography>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activities.length > maxItems && (
        <div className="mt-4 pt-4 border-t-2 border-divider">
          <div className="text-center px-4 py-2 rounded-lg bg-gradient-to-r from-jade-50 to-emerald-50">
            <Typography
              variant="body-xs"
              className="text-jade-700 font-semibold"
            >
              +{activities.length - maxItems} more{" "}
              {activities.length - maxItems === 1 ? "activity" : "activities"}
            </Typography>
          </div>
        </div>
      )}
    </div>
  );
};
