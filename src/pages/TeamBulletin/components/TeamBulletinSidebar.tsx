/**
 * TeamBulletinSidebar
 * Left and right sidebar components
 */

import React from "react";
import { useNavigate } from "react-router-dom";
import { Typography } from "../../../components/design-system";
import { Button, Card } from "../../../components/ui";
import { Icon } from "../../../components/ui/Icon/Icon";
import { TeamQuickActions } from "../../../components/team-dashboard/TeamQuickActions";
import { TeamCalendar } from "../../../components/team-dashboard/TeamCalendar";
import { PlayerRosterContainer } from "../../../components/team/PlayerRosterContainer";

interface LeftSidebarProps {
  teamId: string;
  userRole: string;
  onOpenTrophyCase: () => void;
  onOpenTeamGoals: () => void;
  onOpenTeamVotes: () => void;
}

export const LeftSidebar: React.FC<LeftSidebarProps> = ({
  teamId,
  userRole,
  onOpenTrophyCase,
  onOpenTeamGoals,
  onOpenTeamVotes,
}) => (
  <aside className="hidden lg:block lg:col-span-3 space-y-4">
    <Card className="p-4 shadow-md hover:shadow-lg transition-all duration-300">
      <div className="flex items-center gap-2 mb-3">
        <Icon name="zap" size="sm" className="text-jade-600" />
        <Typography variant="headline-sm" className="font-semibold">
          Quick Actions
        </Typography>
      </div>
      <TeamQuickActions teamId={teamId} userRole={userRole} />
    </Card>

    <Card className="p-4 shadow-md hover:shadow-lg transition-all duration-300">
      <button
        onClick={onOpenTrophyCase}
        className="group w-full text-left hover:bg-gradient-to-r hover:from-orange-50 hover:to-orange-100 rounded-lg p-3 transition-all duration-200 hover:scale-[1.02]"
      >
        <div className="flex items-center gap-3">
          <Icon
            name="award"
            size="md"
            className="text-warning-600 group-hover:scale-110 transition-transform"
          />
          <div className="flex-1 min-w-0">
            <Typography variant="body-sm" className="font-semibold truncate">
              Trophy Case
            </Typography>
            <Typography variant="body-xs" color="muted" className="truncate">
              View achievements
            </Typography>
          </div>
        </div>
      </button>

      <button
        onClick={onOpenTeamGoals}
        className="group w-full text-left hover:bg-[var(--card-emerald-bg-light)] rounded-lg p-3 transition-all duration-200 hover:scale-[1.02] mt-2"
      >
        <div className="flex items-center gap-3">
          <Icon
            name="target"
            size="md"
            className="card-emerald-icon group-hover:scale-110 transition-transform"
          />
          <div className="flex-1 min-w-0">
            <Typography variant="body-sm" className="font-semibold truncate">
              Team Goals
            </Typography>
            <Typography variant="body-xs" color="muted" className="truncate">
              Track progress
            </Typography>
          </div>
        </div>
      </button>

      <button
        onClick={onOpenTeamVotes}
        className="group w-full text-left hover:bg-[var(--card-indigo-bg-light)] rounded-lg p-3 transition-all duration-200 hover:scale-[1.02] mt-2"
      >
        <div className="flex items-center gap-3">
          <Icon
            name="message"
            size="md"
            className="card-indigo-icon group-hover:scale-110 transition-transform"
          />
          <div className="flex-1 min-w-0">
            <Typography variant="body-sm" className="font-semibold truncate">
              Team Votes
            </Typography>
            <Typography variant="body-xs" color="muted" className="truncate">
              Voice your opinion
            </Typography>
          </div>
        </div>
      </button>
    </Card>
  </aside>
);

interface RightSidebarProps {
  teamId: string;
  memberCount: number;
}

export const RightSidebar: React.FC<RightSidebarProps> = ({
  teamId,
  memberCount,
}) => {
  const navigate = useNavigate();

  return (
    <aside className="lg:col-span-3 space-y-4">
      <div className="sticky top-6 space-y-4">
        <TeamCalendar teamId={teamId} />

        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Icon name="users" size="sm" className="card-blue-icon" />
              <Typography variant="headline-sm" className="font-semibold">
                Roster
              </Typography>
            </div>
            <div className="flex items-center gap-2">
              <Typography variant="body-xs" color="muted">
                {memberCount}
              </Typography>
              <Button
                variant="ghost"
                size="xs"
                onClick={() => navigate(`/team/${teamId}/edit`)}
                className="gap-1"
              >
                <Icon name="edit" size="xs" />
                Edit
              </Button>
            </div>
          </div>
          <PlayerRosterContainer teamId={teamId} compact />
        </Card>
      </div>
    </aside>
  );
};

interface MobileQuickActionsProps {
  onOpenTrophyCase: () => void;
  onOpenTeamGoals: () => void;
  onOpenTeamVotes: () => void;
  onOpenSeasonStats: () => void;
}

export const MobileQuickActions: React.FC<MobileQuickActionsProps> = ({
  onOpenTrophyCase,
  onOpenTeamGoals,
  onOpenTeamVotes,
  onOpenSeasonStats,
}) => (
  <div className="lg:hidden flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
    <button
      onClick={onOpenTrophyCase}
      className="flex-shrink-0 flex flex-col items-center gap-1 px-4 py-3 bg-primary rounded-xl shadow-md shadow-orange-500/10 hover:shadow-lg hover:shadow-orange-500/20 hover:scale-105 transition-all duration-200"
    >
      <Icon name="award" size="sm" className="text-warning-600" />
      <span className="text-xs font-medium text-secondary">Trophies</span>
    </button>
    <button
      onClick={onOpenTeamGoals}
      className="flex-shrink-0 flex flex-col items-center gap-1 px-4 py-3 bg-primary rounded-xl shadow-md shadow-[var(--card-emerald-shadow)] hover:shadow-lg hover:shadow-[var(--card-emerald-shadow-hover)] hover:scale-105 transition-all duration-200"
    >
      <Icon name="target" size="sm" className="card-emerald-icon" />
      <span className="text-xs font-medium text-secondary">Goals</span>
    </button>
    <button
      onClick={onOpenTeamVotes}
      className="flex-shrink-0 flex flex-col items-center gap-1 px-4 py-3 bg-primary rounded-xl shadow-md hover:shadow-lg transition-all"
    >
      <Icon name="message" size="sm" className="card-indigo-icon" />
      <span className="text-xs font-medium text-secondary">Votes</span>
    </button>
    <button
      onClick={onOpenSeasonStats}
      className="flex-shrink-0 flex flex-col items-center gap-1 px-4 py-3 bg-primary rounded-xl shadow-md hover:shadow-lg transition-all"
    >
      <Icon name="trending-up" size="sm" className="card-purple-icon" />
      <span className="text-xs font-medium text-secondary">Stats</span>
    </button>
  </div>
);
