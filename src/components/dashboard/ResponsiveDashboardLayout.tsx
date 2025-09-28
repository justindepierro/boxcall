import React from "react";
import { useAuth } from "../../app/auth-store";
import { PersonalCalendar } from "../dashboard/PersonalCalendar";
import { PersonalFeed } from "../dashboard/PersonalFeed";
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
  const { user, profile, loading, profileLoading, error } = useAuth();
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

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center max-w-md px-4">
          <Typography variant="headline-lg" className="text-error mb-4">
            Access Denied
          </Typography>
          <Typography variant="body-lg" color="muted">
            Please log in to access the dashboard
          </Typography>
        </div>
      </div>
    );
  }

  // Show loading while profile is being fetched, but with a timeout
  if (!profile && profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center max-w-md px-4">
          <Typography variant="headline-lg" className="text-text-primary mb-4">
            Loading Dashboard
          </Typography>
          <Typography variant="body-lg" color="muted">
            Setting up your profile...
          </Typography>
          <div className="mt-4">
            <PageLoadingSkeleton />
          </div>
        </div>
      </div>
    );
  }

  // If we have a user but no profile after loading is complete, create a basic profile
  if (!profile && !loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center max-w-md px-4">
          <Typography variant="headline-lg" className="text-text-primary mb-4">
            Welcome to BoxCall!
          </Typography>
          <Typography variant="body-lg" color="muted" className="mb-4">
            Your profile is being set up. Please refresh the page or contact
            support if this persists.
          </Typography>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  const userRole = profile?.role || "player";

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
          {/* Left Column (1/3) - Profile and Personal Feed */}
          <div className="left-column">
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

            {/* Personal Feed */}
            <div className="personal-feed-section">
              {isStepVisible(1) ? <PersonalFeed /> : <DashboardCardSkeleton />}
            </div>
          </div>

          {/* Right Column (2/3) - Team Feeds and Calendar */}
          <div className="right-column">
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
      </div>
    </>
  );
};

export default ResponsiveDashboardLayout;
