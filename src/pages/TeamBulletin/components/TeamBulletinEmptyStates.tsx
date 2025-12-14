/**
 * TeamBulletinEmptyStates
 * Empty and error state components for TeamBulletin
 */

import React from "react";
import { Typography } from "../../../components/design-system";
import { Button } from "../../../components/ui";
import { Icon } from "../../../components/ui/Icon/Icon";
import { LogoIcon } from "../../../components/ui/Logo";

interface NoTeamStateProps {
  onCreateTeam: () => void;
  onJoinTeam: () => void;
}

export const NoTeamState: React.FC<NoTeamStateProps> = ({
  onCreateTeam,
  onJoinTeam,
}) => (
  <div className="min-h-screen bg-secondary p-4 md:p-6">
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center max-w-md px-4">
          <Typography variant="headline-lg" className="mb-3">
            Welcome to BoxCall
          </Typography>
          <Typography variant="body-lg" color="muted" className="mb-6">
            You haven't joined a team yet. Create one or request access to start
            collaborating with your staff and players.
          </Typography>
          <div className="flex gap-3 justify-center">
            <Button onClick={onCreateTeam}>
              <Icon name="plus" size="sm" className="mr-2" /> Create Team
            </Button>
            <Button variant="outline" onClick={onJoinTeam}>
              <Icon name="search" size="sm" className="mr-2" /> Find a Team
            </Button>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export const SelectTeamState: React.FC = () => (
  <div className="min-h-screen bg-secondary p-4 md:p-6">
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center max-w-md px-4">
          <Typography variant="headline-lg" className="mb-4">
            Select a Team
          </Typography>
          <Typography variant="body-lg" color="muted">
            Use the team switcher in the header to choose which team's bulletin
            you'd like to view.
          </Typography>
        </div>
      </div>
    </div>
  </div>
);

interface TeamNotFoundStateProps {
  devMode: string | null;
  isSuperAdmin: boolean;
  onCreateTeam: () => void;
  onJoinTeam: () => void;
}

export const TeamNotFoundState: React.FC<TeamNotFoundStateProps> = ({
  devMode,
  isSuperAdmin,
  onCreateTeam,
  onJoinTeam,
}) => (
  <div className="min-h-screen bg-secondary p-4 md:p-6">
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="container-content text-center">
        <div className="bg-primary elevation-card border-muted rounded-lg p-8">
          <LogoIcon size="xl" color="brand" className="mx-auto mb-4" />
          <Typography variant="headline-lg" className="mb-2">
            No Team Found
          </Typography>
          <Typography variant="body-lg" color="muted" className="mb-6">
            {devMode === "blank_slate"
              ? "Create your first team or join an existing one to get started."
              : "This team doesn't exist or you don't have access to it."}
          </Typography>
          <div className="flex gap-3 justify-center">
            <Button
              onClick={onCreateTeam}
              variant="primary"
              className="px-6 py-2 rounded-lg font-medium flex items-center gap-2"
            >
              Create Team
              {isSuperAdmin && (
                <Icon name="unlock" size="sm" className="text-primary" />
              )}
            </Button>
            <Button
              onClick={onJoinTeam}
              variant="ghost"
              className="px-6 py-2 rounded-lg font-medium"
            >
              Join Team
            </Button>
          </div>
          {isSuperAdmin && (
            <div className="mt-2 text-xs text-jade-600 dark:text-jade-400">
              Super Admin: Unlimited team creation access
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
);
