import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../app/auth-store";
import { useDevMode } from "../app/dev-mode-hooks";
import { usePermissions } from "../hooks/usePermissions";
import { TeamCalendar } from "../components/team-dashboard/TeamCalendar";
import { TeamFeed } from "../components/team-dashboard/TeamFeed";
import { TeamQuickActions } from "../components/team-dashboard/TeamQuickActions";
import { TeamTrophyCase } from "../components/team-dashboard/TeamTrophyCase";
// import TeamNavigation from '../components/team-dashboard/TeamNavigation';
import { Typography } from "../components/design-system";
import { Card } from "../components/ui";
import { Icon } from "../components/ui/Icon/Icon";
/**
 * Team Bulletin - Team-specific communication hub
 * Facebook-style team feed with role-based functionality
 *
 * Features:
 * - Team Trophy Case (collective achievements)
 * - Facebook-style team feed (announcements, plays, scripts)
 * - Team calendar and events
 * - Team roster overview
 * - Role-based quick actions for team management
 * - Multi-team switching capability
 */
export const TeamBulletin: React.FC = () => {
  const { teamId } = useParams<{ teamId: string }>();
  const { user, profile } = useAuth();
  const { devMode, isDevMode } = useDevMode();
  const { isSuperAdmin, canCreateTeamUnlimited } = usePermissions();
  const navigate = useNavigate();

  if (!user || !profile || !teamId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Typography variant="headline-lg" color="muted">
            Loading team dashboard...
          </Typography>
        </div>
      </div>
    );
  }

  const handleCreateTeam = () => {
    // TODO: Implement team creation flow
    console.log("🎯 Creating team...", {
      isSuperAdmin,
      canCreateTeamUnlimited,
    });
    // For now, navigate to a team creation page (to be implemented)
    navigate("/create-team");
  };

  const handleJoinTeam = () => {
    // TODO: Implement team joining flow
    console.log("🤝 Joining team...");
    navigate("/join-team");
  };

  // Get team data based on dev mode
  const getTeamData = () => {
    if (devMode === "blank_slate") {
      // New user experience - no team data
      return null;
    }

    if (devMode === "production" || devMode === "super_admin_real") {
      // Production/real modes - try to fetch real team data
      // TODO: Implement real team data fetching from Supabase
      // For now, return null to show "no team" state until real implementation
      console.log(
        "🔍 TeamBulletin: Production/Real mode - would fetch real team data"
      );
      return null;
    }

    if (isDevMode) {
      // Dev mock modes - show mock team data
      return {
        id: teamId,
        name: "BoxCall Dev Team",
        season: "2024 Varsity",
        colors: { primary: "#00A86B", secondary: "#1E3A8A" },
        logo: "eagle",
        record: { wins: 8, losses: 2 },
        nextGame: "Friday vs. Central Lions",
        memberCount: 35,
      };
    }

    // Fallback - return null
    return null;
  };

  const teamData = getTeamData();

  // Show team creation/joining flow for blank slate or no team data
  if (!teamData) {
    return (
      <div className="py-6">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-8">
            <Icon
              name="boxcall"
              size="xl"
              color="primary"
              className="mx-auto mb-4"
            />
            <Typography variant="headline-lg" className="mb-2">
              No Team Found
            </Typography>
            <Typography variant="body-lg" color="muted" className="mb-6">
              {devMode === "blank_slate"
                ? "Create your first team or join an existing one to get started."
                : "This team doesn't exist or you don't have access to it."}
            </Typography>
            <div className="flex gap-3 justify-center">
              <button
                onClick={handleCreateTeam}
                className="bg-jade-500 hover:bg-jade-600 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                Create Team
                {isSuperAdmin && (
                  <Icon name="unlock" size="sm" className="text-white" />
                )}
              </button>
              <button
                onClick={handleJoinTeam}
                className="border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 px-6 py-2 rounded-lg font-medium transition-colors"
              >
                Join Team
              </button>
            </div>
            {isSuperAdmin && (
              <div className="mt-2 text-xs text-jade-600 dark:text-jade-400">
                Super Admin: Unlimited team creation access
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Determine user role for team-specific content
  const userRole = profile.role || "player";
  const isCoach = userRole === "coach";
  return (
    <div className="py-6">
      {/* Team Header */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg mb-6">
        <div className="px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Team Logo Placeholder */}
              <div className="relative group">
                <div className="flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-gray-700 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-gray-400 dark:hover:border-gray-500 transition-colors cursor-pointer">
                  <div className="text-center">
                    <Icon name="boxcall" size="md" color="secondary" />
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-medium">
                      Team Logo
                    </div>
                  </div>
                </div>
                {isCoach && (
                  <button
                    className="absolute -top-2 -right-2 bg-jade-500 hover:bg-jade-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                    title="Upload team logo (Go to Team Settings)"
                    onClick={() =>
                      (window.location.href = `/team/${teamId}/settings`)
                    }
                  >
                    <Icon name="edit" size="xs" />
                  </button>
                )}
                {!isCoach && (
                  <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="bg-gray-800 text-white text-xs py-1 px-2 rounded whitespace-nowrap">
                      Coaches can add team logo
                    </div>
                  </div>
                )}
              </div>
              <div>
                <Typography
                  variant="headline-xl"
                  className="text-gray-900 dark:text-white"
                >
                  {teamData.name}
                </Typography>
                <Typography
                  variant="body-lg"
                  className="mt-1 text-gray-600 dark:text-gray-300"
                >
                  {teamData.season} • Record: {teamData.record.wins}-
                  {teamData.record.losses}
                </Typography>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <div className="text-right">
                <Typography
                  variant="body-sm"
                  className="text-gray-500 dark:text-gray-400"
                >
                  Next Game
                </Typography>
                <Typography
                  variant="body-md"
                  className="font-semibold text-gray-900 dark:text-white"
                >
                  {teamData.nextGame}
                </Typography>
              </div>
              <div className="text-right">
                <Typography
                  variant="body-sm"
                  className="text-gray-500 dark:text-gray-400"
                >
                  Team Members
                </Typography>
                <Typography
                  variant="body-md"
                  className="font-semibold text-gray-900 dark:text-white"
                >
                  {teamData.memberCount}
                </Typography>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Team Navigation */}
      {/* <TeamNavigation teamId={teamId} userRole={userRole} /> */}
      {/* Main Team Dashboard Content */}
      <div className="px-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Column - Trophy Case & Quick Actions */}
          <div className="lg:col-span-1 space-y-6">
            {/* Team Trophy Case */}
            <TeamTrophyCase teamId={teamId} />
            {/* Role-Based Quick Actions */}
            <Card className="p-6">
              <Typography
                variant="headline-md"
                className="mb-4 text-gray-900 dark:text-white"
              >
                Team Actions
              </Typography>
              <TeamQuickActions teamId={teamId} userRole={userRole} />
            </Card>
            {/* Team Stats Summary */}
            <Card className="p-6">
              <Typography
                variant="headline-md"
                className="mb-4 text-gray-900 dark:text-white"
              >
                Season Stats
              </Typography>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <Typography variant="body-sm" color="muted">
                    Games Played
                  </Typography>
                  <Typography
                    variant="body-sm"
                    className="font-semibold text-gray-900 dark:text-white"
                  >
                    10
                  </Typography>
                </div>
                <div className="flex justify-between">
                  <Typography variant="body-sm" color="muted">
                    Points Scored
                  </Typography>
                  <Typography
                    variant="body-sm"
                    className="font-semibold text-gray-900 dark:text-white"
                  >
                    284
                  </Typography>
                </div>
                <div className="flex justify-between">
                  <Typography variant="body-sm" color="muted">
                    Points Against
                  </Typography>
                  <Typography
                    variant="body-sm"
                    className="font-semibold text-gray-900 dark:text-white"
                  >
                    142
                  </Typography>
                </div>
                <div className="flex justify-between">
                  <Typography variant="body-sm" color="muted">
                    League Rank
                  </Typography>
                  <Typography
                    variant="body-sm"
                    className="font-semibold text-jade-600 dark:text-jade-400"
                  >
                    #2
                  </Typography>
                </div>
              </div>
            </Card>
          </div>
          {/* Center Column - Team Feed (Facebook Style) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Team Feed */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <Typography
                  variant="headline-md"
                  className="text-gray-900 dark:text-white"
                >
                  Team Feed
                </Typography>
                {isCoach && (
                  <button className="px-4 py-2 bg-jade-500 text-white rounded-md hover:bg-jade-600 transition-colors">
                    + New Post
                  </button>
                )}
              </div>
              <TeamFeed teamId={teamId} userRole={userRole} />
            </Card>
          </div>
          {/* Right Column - Calendar & Roster */}
          <div className="lg:col-span-1 space-y-6">
            {/* Team Calendar */}
            <TeamCalendar teamId={teamId} />
            {/* Quick Roster View */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Typography
                  variant="headline-md"
                  className="text-gray-900 dark:text-white"
                >
                  Roster
                </Typography>
                <Typography variant="body-sm" color="muted">
                  {teamData.memberCount} members
                </Typography>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {/* Mock roster data */}
                {[
                  {
                    name: "Marcus Johnson",
                    number: "12",
                    position: "QB",
                    status: "starter",
                  },
                  {
                    name: "Tyler Williams",
                    number: "23",
                    position: "RB",
                    status: "starter",
                  },
                  {
                    name: "Jake Martinez",
                    number: "88",
                    position: "WR",
                    status: "starter",
                  },
                  {
                    name: "Devon Brown",
                    number: "77",
                    position: "OL",
                    status: "starter",
                  },
                  {
                    name: "Chris Davis",
                    number: "44",
                    position: "LB",
                    status: "rotation",
                  },
                  {
                    name: "Alex Thompson",
                    number: "9",
                    position: "QB",
                    status: "backup",
                  },
                ].map((player, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded-md"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-jade-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                        {player.number}
                      </div>
                      <div>
                        <Typography
                          variant="body-sm"
                          className="font-semibold text-gray-900 dark:text-white"
                        >
                          {player.name}
                        </Typography>
                        <Typography variant="caption" color="muted">
                          {player.position}
                        </Typography>
                      </div>
                    </div>
                    <div
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        player.status === "starter"
                          ? "bg-jade-100 text-jade-800 dark:bg-jade-900 dark:text-jade-200"
                          : player.status === "rotation"
                            ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                            : "bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-200"
                      }`}
                    >
                      {player.status}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                <button className="w-full py-2 text-jade-600 dark:text-jade-400 hover:bg-jade-50 dark:hover:bg-jade-900/20 rounded-md transition-colors">
                  View Full Roster
                </button>
              </div>
            </Card>
            {/* Upcoming Events */}
            <Card className="p-6">
              <Typography
                variant="headline-md"
                className="mb-4 text-gray-900 dark:text-white"
              >
                Upcoming Events
              </Typography>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <div>
                    <Typography
                      variant="body-sm"
                      className="font-semibold text-gray-900 dark:text-white"
                    >
                      Game vs. Central Lions
                    </Typography>
                    <Typography variant="caption" color="muted">
                      Friday 7:00 PM
                    </Typography>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div>
                    <Typography
                      variant="body-sm"
                      className="font-semibold text-gray-900 dark:text-white"
                    >
                      Practice
                    </Typography>
                    <Typography variant="caption" color="muted">
                      Tuesday 3:30 PM
                    </Typography>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-jade-500 rounded-full"></div>
                  <div>
                    <Typography
                      variant="body-sm"
                      className="font-semibold text-gray-900 dark:text-white"
                    >
                      Team Meeting
                    </Typography>
                    <Typography variant="caption" color="muted">
                      Wednesday 2:45 PM
                    </Typography>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
export default TeamBulletin;
