import React from "react";
import { DashboardProvider } from "../../context/DashboardContext";

import { useAuth } from "../../app/auth-store";
import { useMobileNavigation } from "../../hooks/useMobileNavigation";
import { useProgressiveLoading } from "../../hooks/useProgressiveLoading";
import { useDashboardStore } from "../../stores/dashboardStore";
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
import { DashboardErrorBoundary } from "./DashboardErrorBoundary";
import { DashboardCustomizationPanel } from "./DashboardCustomizationPanel";
import { DashboardCustomizationTrigger } from "./DashboardCustomizationTrigger";
import { ContextualActionsPanel } from "./ContextualActionsPanel";

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

  // Phase 2A: Dashboard customization state
  const {
    currentLayout: _currentLayout,
    loadLayouts,
    personalizationSettings: _personalizationSettings,
  } = useDashboardStore();
  const [showCustomization, setShowCustomization] = React.useState(false);

  // Load user's dashboard layouts on mount
  React.useEffect(() => {
    if (user?.id) {
      loadLayouts(user.id);
    }
  }, [user?.id, loadLayouts]);

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
            {/* Phase 2A Sprint 2: Smart Actions */}
            <div
              className="smart-actions-section min-h-[120px]"
              role="region"
              aria-label="Smart Actions"
            >
              <DashboardErrorBoundary>
                <ContextualActionsPanel />
              </DashboardErrorBoundary>
            </div>

            {/* Profile Card */}
            <div
              className="profile-section min-h-[320px]"
              role="region"
              aria-label="Profile"
            >
              <DashboardErrorBoundary>
                {isStepVisible(0) ? (
                  <React.Suspense fallback={<DashboardCardSkeleton />}>
                    <ProfileCard />
                  </React.Suspense>
                ) : (
                  <DashboardCardSkeleton />
                )}
              </DashboardErrorBoundary>
            </div>

            {/* Team Feeds (now middle column) */}
            <div
              className="feeds-section min-h-[320px]"
              role="region"
              aria-label="Team Feeds"
            >
              <DashboardErrorBoundary>
                {isStepVisible(2) ? (
                  <React.Suspense fallback={<DashboardCardSkeleton />}>
                    <TeamFeeds />
                  </React.Suspense>
                ) : (
                  <DashboardCardSkeleton />
                )}
              </DashboardErrorBoundary>
            </div>

            {/* Trophy Shelf (now right column) */}
            <div
              className="trophy-section min-h-[320px]"
              role="region"
              aria-label="Trophy Shelf"
            >
              <DashboardErrorBoundary>
                {isStepVisible(1) ? (
                  <React.Suspense fallback={<DashboardCardSkeleton />}>
                    <PersonalTrophyShelf />
                  </React.Suspense>
                ) : (
                  <DashboardCardSkeleton />
                )}
              </DashboardErrorBoundary>
            </div>

            {/* Calendar */}
            <div
              className="calendar-section min-h-[320px]"
              role="region"
              aria-label="Calendar"
            >
              <DashboardErrorBoundary>
                {isStepVisible(3) ? (
                  <React.Suspense fallback={<DashboardCardSkeleton />}>
                    <PersonalCalendar />
                  </React.Suspense>
                ) : (
                  <DashboardCardSkeleton />
                )}
              </DashboardErrorBoundary>
            </div>
          </div>
        </main>

        {/* MOBILE BOTTOM NAVIGATION */}
        <div className="mobile-bottom-nav lg:hidden">
          <MobileBottomNavigation items={items} />
        </div>

        {/* PHASE 2A: Dashboard Customization */}
        <DashboardCustomizationTrigger
          onClick={() => setShowCustomization(true)}
        />

        <DashboardCustomizationPanel
          isOpen={showCustomization}
          onClose={() => setShowCustomization(false)}
        />
      </div>
    </DashboardProvider>
  );
};

export default ResponsiveDashboardLayout;
