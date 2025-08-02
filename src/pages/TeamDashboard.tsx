import React from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../components/auth';
import { TeamTrophyCase } from '../components/team-dashboard/TeamTrophyCase';
import { TeamFeed } from '../components/team-dashboard/TeamFeed';
import { TeamCalendar } from '../components/team-dashboard/TeamCalendar';
import { TeamRoster } from '../components/team-dashboard/TeamRoster';
import { TeamQuickActions } from '../components/team-dashboard/TeamQuickActions';
import { TeamNavigation } from '../components/team-dashboard/TeamNavigation';
import { Typography } from '../components/design-system';
import { Card } from '../components/ui';

/**
 * Team Dashboard - Team-specific command center
 * Facebook-style team feed with role-based functionality
 * 
 * Features:
 * - Team Trophy Case (collective achievements)
 * - Facebook-style team feed (announcements, plays, scripts)
 * - Team calendar and events
 * - Team roster overview
 * - Role-based quick actions for team management
 */
export const TeamDashboard: React.FC = () => {
import React from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../components/auth';
import { TeamTrophyCase } from '../components/team-dashboard/TeamTrophyCase';
import { TeamFeed } from '../components/team-dashboard/TeamFeed';
import { TeamCalendar } from '../components/team-dashboard/TeamCalendar';
import { TeamRoster } from '../components/team-dashboard/TeamRoster';
import { TeamQuickActions } from '../components/team-dashboard/TeamQuickActions';
import { TeamNavigation } from '../components/team-dashboard/TeamNavigation';
import { Typography } from '../components/design-system';
import { Card } from '../components/ui';

/**
 * Team Dashboard - Team-specific command center
 * Facebook-style team feed with role-based functionality
 * 
 * Features:
 * - Team Trophy Case (collective achievements)
 * - Facebook-style team feed (announcements, plays, scripts)
 * - Team calendar and events
 * - Team roster overview
 * - Role-based quick actions for team management
 */
export const TeamDashboard: React.FC = () => {
  const { teamId } = useParams<{ teamId: string }>();
  const { user, profile } = useAuth();

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

  // Mock team data - TODO: Fetch from database
  const mockTeam = {
    id: teamId,
    name: "Eastside Eagles",
    season: "2024 Varsity",
    colors: { primary: "#00A86B", secondary: "#1E3A8A" },
    logo: "🦅",
    record: { wins: 8, losses: 2 },
    nextGame: "Friday vs. Central Lions",
    memberCount: 35
  };

  // Determine user role for team-specific content
  const userRole = profile.user_type || 'player';
  const isCoach = userRole === 'coach' || userRole === 'head_coach';
  const isPlayer = userRole === 'player';
  const isFamily = userRole === 'family';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Team Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="text-4xl">{mockTeam.logo}</div>
              <div>
                <Typography variant="headline-xl" className="text-gray-900 dark:text-white">
                  {mockTeam.name}
                </Typography>
                <Typography variant="body-lg" color="muted" className="mt-1">
                  {mockTeam.season} • Record: {mockTeam.record.wins}-{mockTeam.record.losses}
                </Typography>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <div className="text-right">
                <Typography variant="body-sm" color="muted">
                  Next Game
                </Typography>
                <Typography variant="body-md" className="font-semibold">
                  {mockTeam.nextGame}
                </Typography>
              </div>
              <div className="text-right">
                <Typography variant="body-sm" color="muted">
                  Team Members
                </Typography>
                <Typography variant="body-md" className="font-semibold">
                  {mockTeam.memberCount}
                </Typography>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Team Navigation */}
      <TeamNavigation teamId={teamId} userRole={userRole} />

      {/* Main Team Dashboard Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Left Column - Trophy Case & Quick Actions */}
          <div className="lg:col-span-1 space-y-6">
            {/* Team Trophy Case */}
            <TeamTrophyCase teamId={teamId} />
            
            {/* Role-Based Quick Actions */}
            <Card className="p-6">
              <Typography variant="headline-md" className="mb-4 text-gray-900 dark:text-white">
                Team Actions
              </Typography>
              <TeamQuickActions teamId={teamId} userRole={userRole} />
            </Card>

            {/* Team Stats Summary */}
            <Card className="p-6">
              <Typography variant="headline-md" className="mb-4 text-gray-900 dark:text-white">
                Season Stats
              </Typography>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <Typography variant="body-sm" color="muted">
                    Games Played
                  </Typography>
                  <Typography variant="body-sm" className="font-semibold">
                    10
                  </Typography>
                </div>
                <div className="flex justify-between">
                  <Typography variant="body-sm" color="muted">
                    Points Scored
                  </Typography>
                  <Typography variant="body-sm" className="font-semibold">
                    284
                  </Typography>
                </div>
                <div className="flex justify-between">
                  <Typography variant="body-sm" color="muted">
                    Points Against
                  </Typography>
                  <Typography variant="body-sm" className="font-semibold">
                    142
                  </Typography>
                </div>
                <div className="flex justify-between">
                  <Typography variant="body-sm" color="muted">
                    League Rank
                  </Typography>
                  <Typography variant="body-sm" className="font-semibold text-jade-600 dark:text-jade-400">
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
                <Typography variant="headline-md" className="text-gray-900 dark:text-white">
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
                <Typography variant="headline-md" className="text-gray-900 dark:text-white">
                  Roster
                </Typography>
                <Typography variant="body-sm" color="muted">
                  {mockTeam.memberCount} members
                </Typography>
              </div>
              
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {/* Mock roster data */}
                {[
                  { name: "Marcus Johnson", number: "12", position: "QB", status: "starter" },
                  { name: "Tyler Williams", number: "23", position: "RB", status: "starter" },
                  { name: "Jake Martinez", number: "88", position: "WR", status: "starter" },
                  { name: "Devon Brown", number: "77", position: "OL", status: "starter" },
                  { name: "Chris Davis", number: "44", position: "LB", status: "rotation" },
                  { name: "Alex Thompson", number: "9", position: "QB", status: "backup" },
                ].map((player, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded-md">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-jade-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                        {player.number}
                      </div>
                      <div>
                        <Typography variant="body-sm" className="font-semibold">
                          {player.name}
                        </Typography>
                        <Typography variant="caption" color="muted">
                          {player.position}
                        </Typography>
                      </div>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      player.status === 'starter' 
                        ? 'bg-jade-100 text-jade-800 dark:bg-jade-900 dark:text-jade-200'
                        : player.status === 'rotation'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-200'
                    }`}>
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
              <Typography variant="headline-md" className="mb-4 text-gray-900 dark:text-white">
                Upcoming Events
              </Typography>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <div>
                    <Typography variant="body-sm" className="font-semibold">
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
                    <Typography variant="body-sm" className="font-semibold">
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
                    <Typography variant="body-sm" className="font-semibold">
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

export default TeamDashboard;
