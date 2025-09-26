import React from "react";
import { useAuth } from "../../app/auth-store";
import { PersonalCalendar } from "../dashboard/PersonalCalendar";
import { PersonalTrophyShelf } from "../dashboard/PersonalTrophyShelf";
import ProfileCard from "../dashboard/ProfileCard";
import TeamFeeds from "../dashboard/TeamFeeds";
import { GamePlanningAnalytics } from "../dashboard/analytics/GamePlanningAnalytics";
import { AdaptiveContentWidget } from "../dashboard/AdaptiveContentWidget";
import { Typography } from "../design-system";
import { PageLoadingSkeleton, DashboardCardSkeleton } from "../ui/Skeleton.tsx";
import { useProgressiveLoading } from "../../hooks/useProgressiveLoading";
import { useAdvancedTheme } from "../design-system/AdvancedThemeProvider";
import { Button } from "../ui/Button/Button";
import Card from "../ui/Card/Card";
import { Tooltip } from "../ui/Tooltip";
import { ROUTES } from "../../routes/paths";
import { useNavigate } from "react-router-dom";
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
  const { isStepVisible } = useProgressiveLoading(6, 200);
  const theme = useAdvancedTheme();
  const navigate = useNavigate();

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

          {/* Game Planning Analytics */}
          <div className="analytics-section">
            {isStepVisible(4) ? (
              <GamePlanningAnalytics teamId={user.id} />
            ) : (
              <DashboardCardSkeleton />
            )}
          </div>

          {/* Adaptive Content Widget */}
          <div className="adaptive-content-section">
            {isStepVisible(5) ? (
              <AdaptiveContentWidget />
            ) : (
              <DashboardCardSkeleton />
            )}
          </div>
        </div>

        {/* Design System Showcase - Only show in dev mode */}
        {import.meta.env.DEV && (
          <div className="mt-8">
            <Card variant="glass" className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Typography variant="headline-md">
                  🎨 Design System Preview
                </Typography>
                <Tooltip content="View full design system showcase">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(ROUTES.DESIGN_SYSTEM)}
                  >
                    View All
                  </Button>
                </Tooltip>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <Button variant="primary" size="sm">
                  Primary
                </Button>
                <Button variant="gradient" size="sm">
                  Gradient
                </Button>
                <Button variant="glass" size="sm">
                  Glass
                </Button>
                <Button variant="success" size="sm">
                  Success
                </Button>
              </div>

              <div className="flex gap-4 text-sm">
                <span>
                  Theme:{" "}
                  <strong>
                    {theme.currentEmotion || theme.currentContext || "Default"}
                  </strong>
                </span>
                <span>
                  Mode: <strong>{theme.themeConfig.mode}</strong>
                </span>
                <span>
                  Accessibility:{" "}
                  <strong>{theme.themeConfig.accessibility}</strong>
                </span>
              </div>
            </Card>
          </div>
        )}
      </div>
    </>
  );
};

export default ResponsiveDashboardLayout;
