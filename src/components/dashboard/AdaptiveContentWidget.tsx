/**
 * Adaptive Content Widget
 * Shows personalized content recommendations based on user context and time
 */

import React, { useMemo } from "react";
import { Card } from "@components/ui";
import { Button } from "@components/ui";
import { Icon } from "@components/ui/Icon";
import { Typography } from "../design-system";
import { useAuth } from "../../app/auth-store";
import { AdaptiveContentService } from "../../services/adaptiveContentService";
import type { UserRole } from "../../stores/dashboardStore";
import type { IconName } from "../ui/Icon/Icon";

interface AdaptiveContentWidgetProps {
  className?: string;
}

export const AdaptiveContentWidget: React.FC<AdaptiveContentWidgetProps> = ({
  className = "",
}) => {
  const { user, profile } = useAuth();

  const recommendations = useMemo(() => {
    if (!user || !profile) return [];

    const userRole = (profile.role || "player") as UserRole;
    const contextResult = AdaptiveContentService.detectCurrentContext(userRole);
    return AdaptiveContentService.getRecommendedQuickActions(
      contextResult.context,
      contextResult.timeContext,
      userRole
    );
  }, [user, profile]);

  if (!user || recommendations.length === 0) {
    return null;
  }

  return (
    <Card variant="elevated" className={`p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <Typography variant="headline-sm" className="text-content-primary">
          Quick Actions
        </Typography>
        <Icon name="sparkles" className="w-4 h-4 text-accent-primary" />
      </div>

      <div className="space-y-2">
        {recommendations.slice(0, 3).map((rec, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-2 rounded-lg bg-secondary hover:bg-surface-hover transition-colors cursor-pointer"
          >
            <div className="flex items-center space-x-2">
              <Icon
                name={rec.icon as IconName}
                className="w-3 h-3 text-content-secondary"
              />
              <Typography variant="body-sm" className="text-content-primary">
                {rec.title}
              </Typography>
            </div>
            <Icon
              name="arrow-right"
              className="w-3 h-3 text-content-tertiary"
            />
          </div>
        ))}
      </div>

      <div className="mt-3 pt-3 border-t border-primary">
        <Button variant="ghost" size="sm" className="w-full">
          <Typography variant="body-sm" className="text-accent-primary">
            View All Recommendations
          </Typography>
        </Button>
      </div>
    </Card>
  );
};
