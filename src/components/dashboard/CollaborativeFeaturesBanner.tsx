/**
 * Collaborative Features Integration Banner
 * Shows users that new collaborative planning tools are available
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "../ui";
import { Button } from "../ui";
import { Icon } from "../ui/Icon/Icon";
import { Typography } from "../design-system";

interface CollaborativeFeaturesBannerProps {
  onDismiss?: () => void;
  className?: string;
}

export function CollaborativeFeaturesBanner({
  onDismiss,
  className = "",
}: CollaborativeFeaturesBannerProps) {
  const [isDismissed, setIsDismissed] = useState(false);
  const navigate = useNavigate();

  const handleDismiss = () => {
    setIsDismissed(true);
    onDismiss?.();
  };

  const handleExplore = () => {
    navigate("/collaborative-demo");
  };

  if (isDismissed) return null;

  return (
    <Card className={`p-4 bg-primary/5 border-primary/20 ${className}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-primary/10 text-primary rounded-lg">
            <Icon name="sparkles" size="sm" />
          </div>
          <div className="flex-1">
            <Typography
              variant="headline-sm"
              className="mb-1 flex items-center gap-2"
            >
              <Icon name="sparkles" size="xs" className="text-primary" />
              New Team Collaboration Tools Available!
            </Typography>
            <Typography variant="body-sm" color="muted" className="mb-3">
              Discover real-time messaging, shared goal tracking, team voting,
              collaborative calendars, and progress sharing features.
            </Typography>
            <div className="flex gap-2">
              <Button variant="primary" size="sm" onClick={handleExplore}>
                <Icon name="arrow-right" size="xs" />
                Explore Features
              </Button>
              <Button variant="ghost" size="sm" onClick={handleDismiss}>
                Dismiss
              </Button>
            </div>
          </div>
        </div>

        <Button
          variant="ghost"
          size="xs"
          onClick={handleDismiss}
          className="flex-shrink-0"
        >
          <Icon name="close" size="xs" />
        </Button>
      </div>
    </Card>
  );
}
