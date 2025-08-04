import React from "react";
import { useAuth } from "../app/auth-store";
import { PersonalCalendar } from "../components/dashboard/PersonalCalendar";
import { PersonalTrophyShelf } from "../components/dashboard/PersonalTrophyShelf";
import { ProfileCard } from "../components/dashboard/ProfileCard";
import { TeamFeeds } from "../components/dashboard/TeamFeeds";
import { Typography } from "../components/design-system";
/**
 * Personal Dashboard - Simplified 4-Component Layout
 * Based on user's vision: Profile Card, Trophy Shelf, Team Feeds, Calendar
 *
 * Features:
 * - Profile Card (left column) - modal-viewable
 * - Trophy Shelf (spanning top middle & right)
 * - Team Feeds (middle column, under trophy shelf)
 * - Calendar (right column, under trophy shelf)
 */
export const DashboardPage: React.FC = () => {
  const { user, profile, loading, error } = useAuth();
  // Early returns for loading and error states
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-jade-600"></div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Typography variant="headline-lg" className="text-red-600 mb-2">
            Authentication Error
          </Typography>
          <Typography variant="body-lg" color="muted">
            {error}
          </Typography>
        </div>
      </div>
    );
  }
  if (!user || !profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Typography variant="headline-lg" className="text-red-600 mb-2">
            Failed to load dashboard
          </Typography>
          <Typography variant="body-lg" color="muted">
            User profile not found
          </Typography>
        </div>
      </div>
    );
  }
  const userRole = profile.role || "player";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Welcome Section - Subtle, Left-aligned */}
      <div className="bg-gradient-to-r from-jade-50 to-jade-100 dark:from-jade-900/20 dark:to-jade-800/20 border-b border-jade-200 dark:border-jade-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 text-left">
          <Typography
            variant="headline-md"
            className="text-jade-800 dark:text-jade-200"
          >
            Welcome back,{" "}
            {profile.full_name?.split(" ")[0] ||
              profile.display_name ||
              user.email}
            !
          </Typography>
          <Typography variant="body-sm" color="muted" className="mt-1">
            Your command center awaits • Quote of the day coming soon
          </Typography>
        </div>
      </div>
      {/* Main Dashboard Content - New 4-Component Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[calc(100vh-12rem)]">
          {/* Left Column - Profile Card */}
          <div className="lg:col-span-1">
            <ProfileCard
              profile={profile}
              userRole={userRole}
              onEditClick={() => {
                // TODO: Implement edit functionality
              }}
            />
          </div>
          {/* Middle & Right Columns */}
          <div className="lg:col-span-2 grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Trophy Shelf spanning both middle and right */}
            <div className="lg:col-span-2">
              <PersonalTrophyShelf userId={user.id} userRole={userRole} />
            </div>
            {/* Team Feeds - Middle Column */}
            <div className="lg:col-span-1">
              <TeamFeeds userId={user.id} />
            </div>
            {/* Calendar - Right Column */}
            <div className="lg:col-span-1">
              <PersonalCalendar userId={user.id} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default DashboardPage;
