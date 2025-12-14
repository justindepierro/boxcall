/**
 * GameSessionStates - Loading, Error, and Pre-session states
 */

import React from "react";
import { Typography } from "../../design-system";
import { Button } from "../../ui";
import { Card } from "../../ui";
import { Icon } from "../../ui/Icon/Icon";

interface LoadingStateProps {
  message?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = "Loading game session...",
}) => {
  return (
    <div className="py-6">
      <div className="container-page">
        <div className="flex items-center justify-center py-12">
          <Typography variant="body-lg" color="muted">
            {message}
          </Typography>
        </div>
      </div>
    </div>
  );
};

interface ErrorStateProps {
  message: string;
  onBack: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ message, onBack }) => {
  return (
    <div className="py-6">
      <div className="container-page">
        <Card className="p-6 text-center">
          <Icon name="alert-circle" size="xl" color="error" className="mb-4" />
          <Typography variant="headline-md" className="mb-2">
            Error Loading Game
          </Typography>
          <Typography variant="body-md" color="muted" className="mb-4">
            {message}
          </Typography>
          <Button variant="secondary" onClick={onBack}>
            Back to BoxCall
          </Button>
        </Card>
      </div>
    </div>
  );
};

interface PreSessionStateProps {
  gamePlanName: string;
  opponent: string;
  playCount: number;
  mode: "live" | "retroactive";
  onCancel: () => void;
  onStart: () => void;
}

export const PreSessionState: React.FC<PreSessionStateProps> = ({
  gamePlanName,
  opponent,
  playCount,
  mode,
  onCancel,
  onStart,
}) => {
  return (
    <div className="py-6">
      <div className="container-page">
        <Card className="p-8">
          <div className="text-center mb-6">
            <Typography variant="headline-lg" className="mb-2">
              {gamePlanName}
            </Typography>
            <Typography variant="body-md" color="muted">
              vs {opponent} · {playCount} plays ·{" "}
              {mode === "live" ? "Live" : "Retroactive"} session
            </Typography>
          </div>

          <div className="bg-secondary rounded-lg p-6 mb-6">
            <Typography variant="body-md" className="mb-4">
              <strong>Game Session Features:</strong>
            </Typography>
            <ul className="space-y-2 text-secondary">
              <li className="flex items-start gap-2">
                <Icon name="check" size="sm" className="mt-0.5" />
                <Typography variant="body-sm">
                  Situational play filtering (Billick situations)
                </Typography>
              </li>
              <li className="flex items-start gap-2">
                <Icon name="check" size="sm" className="mt-0.5" />
                <Typography variant="body-sm">
                  Auto-advance down/distance logic
                </Typography>
              </li>
              <li className="flex items-start gap-2">
                <Icon name="check" size="sm" className="mt-0.5" />
                <Typography variant="body-sm">
                  Track touchdowns, turnovers, penalties
                </Typography>
              </li>
              <li className="flex items-start gap-2">
                <Icon name="check" size="sm" className="mt-0.5" />
                <Typography variant="body-sm">
                  Drive statistics and analytics
                </Typography>
              </li>
              <li className="flex items-start gap-2">
                <Icon name="check" size="sm" className="mt-0.5" />
                <Typography variant="body-sm">
                  Works offline with auto-sync
                </Typography>
              </li>
            </ul>
          </div>

          <div className="flex gap-3">
            <Button
              variant="secondary"
              size="lg"
              onClick={onCancel}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="lg"
              onClick={onStart}
              className="flex-1"
            >
              <Icon name="play" size="sm" />
              Start Game
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};
