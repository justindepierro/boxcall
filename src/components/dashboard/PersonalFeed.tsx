import React from "react";
import { ActivityFeed } from "../social/ActivityFeed";
import { Typography } from "../design-system";
import { Card } from "../ui";
import { ModularIcon as Icon } from "../ui/Icon";
import { useAuth } from "../../app/auth-store";

/**
 * Personal Feed Component
 *
 * A compact feed showing personal notifications and recent activities.
 * Displays user-specific activities, mentions, and relevant updates.
 */
export const PersonalFeed: React.FC = () => {
  const { user } = useAuth();

  return (
    <Card className="h-full">
      <div className="p-4 border-b border-border-subtle">
        <div className="flex items-center gap-2 mb-2">
          <Icon name="bell" size="sm" className="text-primary" />
          <Typography variant="headline-sm" className="text-text-primary">
            What's New
          </Typography>
        </div>
        <Typography variant="caption" className="text-text-muted">
          Your personal notifications and activity
        </Typography>
      </div>

      <div className="p-4 max-h-96 overflow-y-auto">
        {user ? (
          <ActivityFeed userId={user.id} limit={10} />
        ) : (
          <div className="text-center py-8">
            <Icon
              name="bell"
              size="lg"
              className="text-text-muted mx-auto mb-3 opacity-50"
            />
            <Typography variant="body-sm" className="text-text-muted">
              Sign in to see your personal feed
            </Typography>
          </div>
        )}
      </div>
    </Card>
  );
};
