import React from "react";
import { useAuth } from "../../app/auth-store";
import { PersonalCalendar } from "../dashboard/PersonalCalendar";
import { PersonalTrophyShelf } from "../dashboard/PersonalTrophyShelf";
import { ProfileCard } from "../dashboard/ProfileCard";
import { TeamFeeds } from "../dashboard/TeamFeeds";
import { DatabaseDataDisplay } from "../dashboard/DatabaseDataDisplay";
import { Typography } from "../design-system";
import { MobileBottomNavigation } from "../mobile/MobileBottomNavigation";
import { useMobileNavigation } from "../../hooks/useMobileNavigation";
import { PageLoadingSkeleton, DashboardCardSkeleton } from "../ui/Skeleton";
import { useProgressiveLoading } from "../../hooks/useProgressiveLoading";

/**
 * Responsive Dashboard Layout
 *
 * Clean, professional responsive component - NO navigation chaos!
 * Uses CSS-only responsive behavior, no JavaScript mobile detection
 *
 * Features:
 * - Mobile-first progressive enhancement
 * - CSS Grid/Flexbox responsive layout
 * - Single, clean bottom navigation (mobile only)
 * - Professional touch-friendly interactions
 * - Desktop optimization with sidebar navigation
 * - Consistent experience across all breakpoints
 */
export const ResponsiveDashboardLayout: React.FC = () => {
  const { user, profile, loading, error } = useAuth();
  const { items } = useMobileNavigation(
    typeof window !== "undefined" ? window.location.pathname : "/"
  );
  const { isStepVisible } = useProgressiveLoading(4, 200);

  // Early returns for loading and error states
  if (loading) {
    return <PageLoadingSkeleton />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center max-w-md px-4">
          <Typography variant="headline-lg" className="text-red-600 mb-4">
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
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center max-w-md px-4">
          <Typography variant="headline-lg" className="text-red-600 mb-4">
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
      {/* 
        ============================================================================
        WELCOME HEADER - Responsive across all breakpoints
        ============================================================================ 
      */}
      <div className="responsive-welcome-header bg-gradient-to-r from-surface-jade to-surface-jade dark:from-surface-jade-dark dark:to-surface-jade-dark border-b border-surface-jade-dark dark:border-brand-jade-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 text-left">
          <Typography
            variant="headline-md"
            className="text-brand-jade-dark dark:text-brand-jade-light"
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

      {/* 
        ============================================================================
        RESPONSIVE LAYOUT CONTAINER
        Mobile: Clean stack layout (no view switching!)
        Tablet: 2-column grid  
        Desktop: 3-column grid
        ============================================================================ 
      */}
      <div className="responsive-dashboard-container">
        {/* 
          ============================================================================
          MAIN CONTENT GRID - Clean Responsive Design
          Mobile: Single column stack - ALL sections visible
          Tablet: 2x2 grid layout
          Desktop: 3-column layout
          ============================================================================ 
        */}
        <div className="responsive-content-grid">
          {/* Database Data Display - Show loaded demo data */}
          <div className="col-span-full">
            <DatabaseDataDisplay />
          </div>

          {/* Profile Card */}
          <div className="profile-section">
            {isStepVisible(0) ? (
              <ProfileCard
                profile={profile}
                userRole={userRole}
                onEditClick={() => {
                  // TODO: Implement edit functionality
                }}
              />
            ) : (
              <DashboardCardSkeleton />
            )}
          </div>

          {/* Trophy Shelf */}
          <div className="trophy-section">
            {isStepVisible(1) ? (
              <PersonalTrophyShelf userId={user.id} userRole={userRole} />
            ) : (
              <DashboardCardSkeleton />
            )}
          </div>

          {/* Team Feeds */}
          <div className="feeds-section">
            {isStepVisible(2) ? (
              <TeamFeeds userId={user.id} />
            ) : (
              <DashboardCardSkeleton />
            )}
          </div>

          {/* Calendar */}
          <div className="calendar-section">
            {isStepVisible(3) ? (
              <PersonalCalendar userId={user.id} />
            ) : (
              <DashboardCardSkeleton />
            )}
          </div>
        </div>
      </div>

      {/* 
        ============================================================================
        MOBILE BOTTOM NAVIGATION - Clean, single navigation system
        ============================================================================ 
      */}
      <div className="mobile-bottom-nav lg:hidden">
        <MobileBottomNavigation items={items} />
      </div>
    </div>
  );
};

export default ResponsiveDashboardLayout;
