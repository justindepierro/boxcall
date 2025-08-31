import React from "react";
import { DashboardProvider } from "../../context/DashboardContext";

import { useAuth } from "../../app/auth-store";
import { useMobileNavigation } from "../../hooks/useMobileNavigation";
import { useProgressiveLoading } from "../../hooks/useProgressiveLoading";
const ProfileCard = React.lazy(
  () =>
    import("../dashboard/ProfileCard") as Promise<{
      default: React.ComponentType<{ onEditClick?: () => void }>;
    }>
);
const PersonalTrophyShelf = React.lazy(
  () =>
    import("../dashboard/PersonalTrophyShelf") as Promise<{
      default: React.ComponentType<unknown>;
    }>
);
const TeamFeeds = React.lazy(
  () =>
    import("../dashboard/TeamFeeds") as Promise<{
      default: React.ComponentType<unknown>;
    }>
);
const PersonalCalendar = React.lazy(
  () =>
    import("../dashboard/PersonalCalendar") as Promise<{
      default: React.ComponentType<unknown>;
    }>
);
import { Typography } from "../design-system";
import DashboardHeader from "./DashboardHeader";
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
        {/* MODERN DASHBOARD HEADER */}
        <DashboardHeader />

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
                <React.Suspense fallback={<DashboardCardSkeleton />}>
                  <ProfileCard />
                </React.Suspense>
              ) : (
                <DashboardCardSkeleton />
              )}
            </div>

            {/* Team Feeds (now middle column) */}
            <div
              className="feeds-section min-h-[320px]"
              role="region"
              aria-label="Team Feeds"
            >
              {isStepVisible(2) ? (
                <React.Suspense fallback={<DashboardCardSkeleton />}>
                  <TeamFeeds />
                </React.Suspense>
              ) : (
                <DashboardCardSkeleton />
              )}
            </div>

            {/* Trophy Shelf (now right column) */}
            <div
              className="trophy-section min-h-[320px]"
              role="region"
              aria-label="Trophy Shelf"
            >
              {isStepVisible(1) ? (
                <React.Suspense fallback={<DashboardCardSkeleton />}>
                  <PersonalTrophyShelf />
                </React.Suspense>
              ) : (
                <DashboardCardSkeleton />
              )}
            </div>

            {/* Calendar */}
            <div
              className="calendar-section min-h-[320px]"
              role="region"
              aria-label="Calendar"
            >
              {isStepVisible(3) ? (
                <React.Suspense fallback={<DashboardCardSkeleton />}>
                  <PersonalCalendar />
                </React.Suspense>
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
