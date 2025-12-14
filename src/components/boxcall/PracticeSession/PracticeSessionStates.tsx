/**
 * PracticeSession State Components
 *
 * Renders loading, error, no-team, and pre-session states
 */

import React from "react";
import { Typography } from "../../design-system";
import { Button, Card } from "../../ui";
import { Icon } from "../../ui/Icon/Icon";
import type {
  LoadingStateProps,
  NoTeamStateProps,
  ErrorStateProps,
  PreSessionStateProps,
} from "./types";

/**
 * Loading state while session data is being fetched
 */
export const LoadingState: React.FC<LoadingStateProps> = () => (
  <div className="py-6">
    <div className="container-page">
      <div className="flex items-center justify-center py-12">
        <Typography variant="body-lg" color="muted">
          Loading practice session...
        </Typography>
      </div>
    </div>
  </div>
);

/**
 * No team selected state
 */
export const NoTeamState: React.FC<NoTeamStateProps> = ({ onNavigate }) => (
  <div className="py-6">
    <div className="container-page">
      <Card className="p-6 text-center">
        <Icon name="users" size="xl" color="warning" className="mb-4" />
        <Typography variant="headline-md" className="mb-2">
          No Team Selected
        </Typography>
        <Typography variant="body-md" color="muted" className="mb-4">
          Please select a team from the dashboard to start a practice session.
        </Typography>
        <Button variant="primary" onClick={onNavigate}>
          Go to Dashboard
        </Button>
      </Card>
    </div>
  </div>
);

/**
 * Error state when session fails to load
 */
export const ErrorState: React.FC<ErrorStateProps> = ({
  error,
  scriptId,
  onBack,
  onCreate,
}) => (
  <div className="py-6">
    <div className="container-page">
      <Card className="p-6 text-center">
        <Icon name="alert-circle" size="xl" color="error" className="mb-4" />
        <Typography variant="headline-md" className="mb-2">
          Error Loading Practice
        </Typography>
        <Typography variant="body-md" color="muted" className="mb-4">
          {error?.message || "Practice script not found"}
        </Typography>
        <Typography variant="body-sm" color="muted" className="mb-4">
          Script ID: {scriptId || "(none)"}
        </Typography>
        <div className="flex gap-3 justify-center">
          <Button variant="secondary" onClick={onBack}>
            Back to BoxCall
          </Button>
          <Button variant="primary" onClick={onCreate}>
            Create Script
          </Button>
        </div>
      </Card>
    </div>
  </div>
);

/**
 * Pre-session screen before starting practice
 */
export const PreSessionState: React.FC<PreSessionStateProps> = ({
  practiceScript,
  scriptPlays,
  mode,
  onCancel,
  onStart,
}) => (
  <div className="py-6">
    <div className="container-page">
      <Card className="p-8">
        <div className="text-center mb-6">
          <Typography variant="headline-lg" className="mb-2">
            {practiceScript.name}
          </Typography>
          <Typography variant="body-md" color="muted">
            {scriptPlays.length} plays ·{" "}
            {mode === "live" ? "Live" : "Retroactive"} session
          </Typography>
        </div>

        <div className="bg-secondary rounded-lg p-6 mb-6">
          <Typography variant="body-md" className="mb-4">
            <strong>Session Overview:</strong>
          </Typography>
          <ul className="space-y-2 text-secondary">
            <li className="flex items-start gap-2">
              <Icon name="check" size="sm" className="mt-0.5" />
              <Typography variant="body-sm">
                Track{" "}
                {scriptPlays.reduce((sum, p) => sum + (p.repetitions || 10), 0)}{" "}
                total reps
              </Typography>
            </li>
            <li className="flex items-start gap-2">
              <Icon name="check" size="sm" className="mt-0.5" />
              <Typography variant="body-sm">
                Auto-save every 30 seconds
              </Typography>
            </li>
            <li className="flex items-start gap-2">
              <Icon name="check" size="sm" className="mt-0.5" />
              <Typography variant="body-sm">
                Works offline with auto-sync
              </Typography>
            </li>
            <li className="flex items-start gap-2">
              <Icon name="check" size="sm" className="mt-0.5" />
              <Typography variant="body-sm">
                Keyboard shortcuts: S (success), F (failure), N (neutral), K
                (skip)
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
            Start Practice
          </Button>
        </div>
      </Card>
    </div>
  </div>
);
