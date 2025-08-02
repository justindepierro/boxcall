import React from 'react';
import { useAuth } from '../components/auth';
import { PersonalTrophyShelf } from '../components/dashboard/PersonalTrophyShelf';
import { PersonalProfile } from '../components/dashboard/PersonalProfile';
import { CrossTeamMessages } from '../components/dashboard/CrossTeamMessages';
import { PersonalCalendar } from '../components/dashboard/PersonalCalendar';
import { PlayerQuickActions } from '../components/dashboard/QuickActions/PlayerQuickActions';
import { CoachQuickActions } from '../components/dashboard/QuickActions/CoachQuickActions';
import { FamilyQuickActions } from '../components/dashboard/QuickActions/FamilyQuickActions';
import { Typography } from '../components/design-system';
import { Card } from '../components/ui';

/**
 * Personal Dashboard - Individual user's personal space
 * Think MySpace profile meets Strava achievements
 * 
 * Features:
 * - Personal Trophy Shelf (Helmet Stickers + BoxCall Medals)
 * - Editable Bio & Profile (including GPA, gear showcase)
 * - Cross-team messages and communications
 * - Personal calendar with events from all teams
 * - Role-based quick actions
 */
export const DashboardPage: React.FC = () => {
  const { user, profile } = useAuth();

  if (!user || !profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Typography variant="headline-lg" color="muted">
            Loading your dashboard...
          </Typography>
        </div>
      </div>
    );
  }

  // Determine user role for role-based content
  const userRole = profile.user_type || 'player';
  const isPlayer = userRole === 'player';
  const isCoach = userRole === 'coach' || userRole === 'head_coach';
  const isFamily = userRole === 'family';

  const renderQuickActions = () => {
    if (isPlayer) return <PlayerQuickActions />;
    if (isCoach) return <CoachQuickActions />;
    if (isFamily) return <FamilyQuickActions />;
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <Typography variant="headline-xl" className="text-gray-900 dark:text-white">
                Welcome back, {profile.first_name || user.email}!
              </Typography>
              <Typography variant="body-lg" color="muted" className="mt-1">
                Your personal football command center
              </Typography>
            </div>
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <Typography variant="body-sm" color="muted">
                  Role: {userRole.replace('_', ' ').toUpperCase()}
                </Typography>
                <Typography variant="body-sm" color="muted">
                  Active Teams: 3 {/* TODO: Get from user teams */}
                </Typography>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Dashboard Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column - Trophy Shelf & Profile */}
          <div className="lg:col-span-1 space-y-6">
            {/* Personal Trophy Shelf - Pinned at Top */}
            <PersonalTrophyShelf userId={user.id} userRole={userRole} />
            
            {/* Personal Profile */}
            <PersonalProfile 
              profile={profile} 
              isEditable={true}
              showGPA={isPlayer}
              showGearShowcase={isPlayer}
              showCoachingCredentials={isCoach}
            />
          </div>

          {/* Center Column - Communications & Quick Actions */}
          <div className="lg:col-span-1 space-y-6">
            {/* Role-Based Quick Actions */}
            <Card className="p-6">
              <Typography variant="headline-md" className="mb-4 text-gray-900 dark:text-white">
                Quick Actions
              </Typography>
              {renderQuickActions()}
            </Card>

            {/* Cross-Team Messages */}
            <CrossTeamMessages userId={user.id} />
          </div>

          {/* Right Column - Calendar & Activity */}
          <div className="lg:col-span-1 space-y-6">
            {/* Personal Calendar */}
            <PersonalCalendar userId={user.id} />
            
            {/* Recent Activity */}
            <Card className="p-6">
              <Typography variant="headline-md" className="mb-4 text-gray-900 dark:text-white">
                Recent Activity
              </Typography>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-jade-500 rounded-full"></div>
                  <Typography variant="body-sm" color="muted">
                    New helmet sticker earned - "Touchdown Pass"
                  </Typography>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <Typography variant="body-sm" color="muted">
                    Practice script updated for Friday
                  </Typography>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <Typography variant="body-sm" color="muted">
                    New message from Coach Johnson
                  </Typography>
                </div>
              </div>
            </Card>

            {/* Teams Overview */}
            <Card className="p-6">
              <Typography variant="headline-md" className="mb-4 text-gray-900 dark:text-white">
                Your Teams
              </Typography>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div>
                    <Typography variant="body-md" className="font-semibold">
                      Eastside Eagles
                    </Typography>
                    <Typography variant="body-sm" color="muted">
                      Varsity Football
                    </Typography>
                  </div>
                  <div className="text-right">
                    <Typography variant="body-sm" className="text-jade-600 dark:text-jade-400">
                      Active
                    </Typography>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div>
                    <Typography variant="body-md" className="font-semibold">
                      Elite 7v7
                    </Typography>
                    <Typography variant="body-sm" color="muted">
                      Summer League
                    </Typography>
                  </div>
                  <div className="text-right">
                    <Typography variant="body-sm" className="text-blue-600 dark:text-blue-400">
                      In Season
                    </Typography>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div>
                    <Typography variant="body-md" className="font-semibold">
                      Spring Development
                    </Typography>
                    <Typography variant="body-sm" color="muted">
                      Off-Season Training
                    </Typography>
                  </div>
                  <div className="text-right">
                    <Typography variant="body-sm" className="text-gray-600 dark:text-gray-400">
                      Off Season
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

export default DashboardPage;
