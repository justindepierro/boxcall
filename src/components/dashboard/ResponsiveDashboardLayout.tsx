import React from "react";
import { DashboardProvider } from "../../context/DashboardContext";

import { useAuth } from "../../app/auth-store";
import { useMobileNavigation } from "../../hooks/useMobileNavigation";
import { useProgressiveLoading } from "../../hooks/useProgressiveLoading";
import { PersonalCalendar } from "../dashboard/PersonalCalendar";
import { PersonalTrophyShelf } from "../dashboard/PersonalTrophyShelf";
import { ProfileCard } from "../dashboard/ProfileCard";
import { TeamFeeds } from "../dashboard/TeamFeeds";
import { Typography } from "../design-system";
import { MobileBottomNavigation } from "../mobile/MobileBottomNavigation";
import { PageLoadingSkeleton, DashboardCardSkeleton } from "../ui/Skeleton.tsx";

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
      <div className="flex items-center justify-center min-h-screen surface-app">
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
      <div className="flex items-center justify-center min-h-screen surface-app">
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

  return (
    <DashboardProvider>
      <div className="min-h-screen surface-app">
        {/* WELCOME HEADER - Responsive across all breakpoints */}
        <div className="responsive-welcome-header bg-gradient-to-r from-surface-jade to-surface-jade dark:from-surface-jade-dark dark:to-surface-jade-dark border-b border-surface-jade-dark dark:border-brand-jade-dark">
          <div className="max-w-7xl mx-auto bc-container-padding py-3 text-left">
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

        {/* RESPONSIVE LAYOUT CONTAINER */}
        <main
          className="responsive-dashboard-container"
          role="main"
          aria-label="Dashboard main content"
        >
          <div className="responsive-content-grid">
            {/* Profile Card */}
            <div
              className="profile-section min-h-[320px]"
              role="region"
              aria-label="Profile"
            >
              {isStepVisible(0) ? (
                <ProfileCard
                  onEditClick={() => {
                    // TODO: Implement edit functionality
                  }}
                />
              ) : (
                <DashboardCardSkeleton />
              )}
            </div>

            {/* Trophy Shelf */}
            <div
              className="trophy-section min-h-[320px]"
              role="region"
              aria-label="Trophy Shelf"
            >
              {isStepVisible(1) ? (
                <PersonalTrophyShelf />
              ) : (
                <DashboardCardSkeleton />
              )}
            </div>

            {/* Team Feeds */}
            <div
              className="feeds-section min-h-[320px]"
              role="region"
              aria-label="Team Feeds"
            >
              {isStepVisible(2) ? <TeamFeeds /> : <DashboardCardSkeleton />}
            </div>

            {/* Calendar */}
            <div
              className="calendar-section min-h-[320px]"
              role="region"
              aria-label="Calendar"
            >
              {isStepVisible(3) ? (
                <PersonalCalendar />
              ) : (
                <DashboardCardSkeleton />
              )}
            </div>
          </div>
        </main>

        {/* MOBILE BOTTOM NAVIGATION */}
        <div className="mobile-bottom-nav lg:hidden">
          <MobileBottomNavigation items={items} />
        </div>
      </div>
    </DashboardProvider>
  );
};

export default ResponsiveDashboardLayout;
