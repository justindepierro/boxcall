/**
 * TeamBulletinHeader
 * Header section with team info and activity stats
 */

import React from "react";
import { Typography } from "../../../components/design-system";
import { Icon } from "../../../components/ui/Icon/Icon";
import type { TeamData } from "../hooks/useTeamBulletinData";

interface TeamBulletinHeaderProps {
  teamData: TeamData;
  activityStats: {
    loading: boolean;
    newPostsToday: number;
    onlineMembers: number;
  };
  onOpenSeasonStats: () => void;
}

export const TeamBulletinHeader: React.FC<TeamBulletinHeaderProps> = ({
  teamData,
  activityStats,
  onOpenSeasonStats,
}) => (
  <header className="mb-6">
    <div className="flex items-center justify-between mb-4">
      <div>
        <Typography variant="headline-lg" className="text-primary mb-1">
          {teamData.name} Bulletin
        </Typography>
        <Typography variant="body" className="text-secondary">
          Season {teamData.season} • {teamData.memberCount} members
        </Typography>
      </div>
    </div>

    {/* Compact Stats Bar */}
    <div className="flex items-center gap-4 text-sm flex-wrap">
      <div className="flex items-center gap-2 px-3 py-1.5 bg-surface-card rounded-full shadow-sm">
        <Icon name="message" size="sm" className="text-jade-600" />
        <span className="font-semibold text-primary">
          {activityStats.loading ? "..." : activityStats.newPostsToday}{" "}
          <span className="font-normal text-secondary">posts today</span>
        </span>
      </div>
      {activityStats.onlineMembers > 0 && (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-surface-card rounded-full shadow-sm">
          <div className="w-2 h-2 bg-[var(--color-accent-emerald-500)] rounded-full animate-pulse shadow-sm shadow-[var(--card-emerald-shadow)]" />
          <span className="font-semibold text-primary">
            {activityStats.onlineMembers}{" "}
            <span className="font-normal text-secondary">online</span>
          </span>
        </div>
      )}
      <div className="flex items-center gap-2 px-3 py-1.5 bg-surface-card rounded-full shadow-sm">
        <Icon name="users" size="sm" className="card-blue-icon" />
        <span className="font-semibold text-primary">
          {teamData?.memberCount || 0}{" "}
          <span className="font-normal text-secondary">members</span>
        </span>
      </div>
      <button
        onClick={onOpenSeasonStats}
        className="ml-auto flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-full shadow-md shadow-purple-500/30 hover:shadow-lg hover:shadow-purple-500/40 hover:scale-105 transition-all duration-200"
      >
        <Icon name="trending-up" size="sm" className="text-white" />
        <span className="font-bold text-sm">
          {teamData.record.wins}-{teamData.record.losses}
        </span>
      </button>
    </div>
  </header>
);
