import React from "react";
import { useAuth } from "../../app/auth-store";
import { PersonalCalendar } from "../dashboard/PersonalCalendar";
import { PersonalTrophyShelf } from "../dashboard/PersonalTrophyShelf";
import ProfileCard from "../dashboard/ProfileCard";
import TeamFeeds from "../dashboard/TeamFeeds";
import { Typography } from "../design-system";
import { PageLoadingSkeleton, DashboardCardSkeleton } from "../ui/Skeleton.tsx";
import { useProgressiveLoading } from "../../hooks/useProgressiveLoading";
// Onboarding components removed during cleanup

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
  const { isStepVisible } = useProgressiveLoading(4, 200);

  // Early returns for loading and error states
  if (loading) {
    return <PageLoadingSkeleton />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center max-w-md px-4">
          <Typography variant="headline-lg" className="text-error mb-4">
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
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center max-w-md px-4">
          <Typography variant="headline-lg" className="text-error mb-4">
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
    <>
      {/* 
        ============================================================================
        RESPONSIVE LAYOUT CONTAINER
        Mobile: Clean stack layout (no view switching!)
        Tablet: 2-column grid  
        Desktop: 3-column grid
        ============================================================================ 
      */}
      <div className="responsive-dashboard-container">
        {/* Onboarding section removed */}

        {/* 
          ============================================================================
          MAIN CONTENT GRID - Clean Responsive Design
          Mobile: Single column stack - ALL sections visible
          Tablet: 2x2 grid layout
          Desktop: 3-column layout
          ============================================================================ 
        */}
        <div className="responsive-content-grid">
          {/* Toast demo removed */}

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
            {isStepVisible(2) ? <TeamFeeds /> : <DashboardCardSkeleton />}
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
    </>
  );
};

export default ResponsiveDashboardLayout;
