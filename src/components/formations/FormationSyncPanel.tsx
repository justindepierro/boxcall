import React from "react";
import type { Play } from "../../types/play";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button/Button";
import { Typography } from "../design-system/Typography";
import { Icon } from "../ui/Icon";

interface FormationSyncPanelProps {
  plays: Play[];
  loading?: boolean;
  error?: string | null;
  onRefresh?: () => void;
  onResolve: (play: Play) => void;
  onOpenMapper?: () => void;
  isMobile?: boolean;
}

export const FormationSyncPanel: React.FC<FormationSyncPanelProps> = ({
  plays,
  loading = false,
  error,
  onRefresh,
  onResolve,
  onOpenMapper,
  isMobile = false,
}) => {
  if (loading) {
    return (
      <Card variant="default" size={isMobile ? "md" : "lg"}>
        <div className="flex items-center gap-3">
          <Icon
            name="loader"
            className="h-5 w-5 animate-spin text-muted"
          />
          <Typography variant="body-sm" className="text-secondary">
            Checking formation mappings...
          </Typography>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card variant="default" size={isMobile ? "md" : "lg"}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Icon name="alert" className="h-5 w-5 text-error-500" />
            <Typography variant="body-sm" className="text-error-600">
              {error}
            </Typography>
          </div>
          {onRefresh && (
            <Button variant="ghost" size="sm" onClick={onRefresh}>
              Retry
            </Button>
          )}
        </div>
      </Card>
    );
  }

  if (!plays || plays.length === 0) {
    return null;
  }

  const topPlays = plays.slice(0, 3);
  const remaining = plays.length - topPlays.length;

  return (
    <Card variant="default" size={isMobile ? "md" : "lg"}>
      <div className="flex items-center gap-3 mb-4">
        <Icon name="alert" className="h-5 w-5 text-warning-500" />
        <div>
          <Typography
            variant={isMobile ? "headline-sm" : "headline-md"}
            className="text-primary"
          >
            Formation Mapping Needed
          </Typography>
          <Typography variant="body-sm" className="text-secondary">
            {plays.length} play{plays.length === 1 ? "" : "s"} are missing a
            linked formation. Resolve them so your playbook stays consistent.
          </Typography>
        </div>
      </div>

      <div className="space-y-3">
        {topPlays.map((play) => (
          <div
            key={play.id}
            className="flex items-center justify-between gap-3 rounded-lg border border-border p-3 bg-surface-secondary/60"
          >
            <div className="flex flex-col gap-1 min-w-0">
              <Typography variant="body-md" className="font-semibold truncate">
                {play.play_name || "Untitled Play"}
              </Typography>
              <Typography variant="caption" className="text-muted">
                Current formation string:{" "}
                {play.formation ? `"${play.formation}"` : "—"}
              </Typography>
              {play.personnel && (
                <Typography variant="caption" className="text-muted">
                  Personnel: {play.personnel}
                </Typography>
              )}
            </div>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => onResolve(play)}
            >
              Fix
            </Button>
          </div>
        ))}
      </div>

      {remaining > 0 && (
        <Typography variant="caption" className="mt-3 text-secondary">
          +{remaining} more play{remaining === 1 ? "" : "s"} need attention.
        </Typography>
      )}

      <div className="mt-4 flex flex-col sm:flex-row gap-2">
        <Button
          onClick={onOpenMapper}
          variant="primary"
          disabled={!onOpenMapper}
        >
          Open Formation Mapper
        </Button>
        <Button
          onClick={() => {
            if (plays.length > 0) {
              onResolve(plays[0]);
            }
          }}
          variant="ghost"
        >
          Review first play
        </Button>
      </div>
    </Card>
  );
};
