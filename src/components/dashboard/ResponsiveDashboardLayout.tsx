import React, { useMemo } from "react";
import { useAuth } from "../../app/auth-store";
import { PersonalCalendar } from "../dashboard/PersonalCalendar";
import { PersonalFeed } from "../dashboard/PersonalFeed";
import ProfileCard from "../dashboard/ProfileCard";
import TeamFeeds from "../dashboard/TeamFeeds";
import { Typography } from "../design-system";
import { PageLoadingSkeleton, DashboardCardSkeleton } from "../ui/Skeleton.tsx";
import { useProgressiveLoading } from "../../hooks/useProgressiveLoading";
import { AuroraTile } from "../ui/AuroraTile";
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

  const scrollToSection = (sectionId: string) => {
    if (typeof window === "undefined") return;
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const teamMembershipCount = Array.isArray(
    (profile as unknown as { team_memberships?: unknown[] })?.team_memberships
  )
    ? (
        (profile as unknown as { team_memberships?: unknown[] })
          .team_memberships?.length || 0
      )
    : typeof (profile as unknown as { teams_count?: number })?.teams_count ===
        "number"
      ? (profile as unknown as { teams_count?: number }).teams_count || 0
      : 0;

  const dashboardHeroTiles = useMemo(
    () => [
      {
        key: "profile",
        title: "My Role",
        description: "Snapshot of your identity inside every team.",
        icon: "user",
        accentOverlayClass: "bg-aurora-amber",
        glowClassName: "glow-aurora-amber",
        statusBadge: (userRole || "player").replace("_", " ").toUpperCase(),
        iconClassName: "text-amber-600",
        footnote: "View profile",
        body: (
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between text-text-secondary">
              <span>Signed in as</span>
              <span className="font-semibold text-text-primary">
                {profile?.display_name || profile?.full_name || "Member"}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs text-text-secondary">
              <span>Teams joined</span>
              <span className="font-semibold text-text-primary">
                {teamMembershipCount}
              </span>
            </div>
          </div>
        ),
        target: "dashboard-profile-section",
      },
      {
        key: "activity",
        title: "Team Pulse",
        description: "Keep up with posts, votes, and announcements.",
        icon: "message",
        accentOverlayClass: "bg-aurora-teal",
        glowClassName: "glow-aurora-teal",
        statusBadge: "Updates",
        iconClassName: "text-teal-600",
        footnote: "Open activity",
        body: (
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between text-text-secondary">
              <span>Feed highlights</span>
              <span className="font-semibold text-text-primary">Live</span>
            </div>
            <div className="flex items-center justify-between text-xs text-text-secondary">
              <span>Mentions watched</span>
              <span className="font-semibold text-text-primary">Auto</span>
            </div>
          </div>
        ),
        target: "dashboard-feed-section",
      },
      {
        key: "calendar",
        title: "Schedule",
        description: "Practices, games, and meetings at a glance.",
        icon: "calendar",
        accentOverlayClass: "bg-aurora-indigo",
        glowClassName: "glow-aurora-indigo",
        statusBadge: "Today",
        iconClassName: "text-indigo-600",
        footnote: "Jump to calendar",
        body: (
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between text-text-secondary">
              <span>Upcoming</span>
              <span className="font-semibold text-text-primary">Stay sharp</span>
            </div>
            <div className="flex items-center justify-between text-xs text-text-secondary">
              <span>Sync status</span>
              <span className="font-semibold text-text-primary">Real-time</span>
            </div>
          </div>
        ),
        target: "dashboard-calendar-section",
      },
    ],
    [
      profile?.display_name,
      profile?.full_name,
      teamMembershipCount,
      userRole,
    ]
  );

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

        {/* Aurora hero tiles */}
        <div className="dashboard-hero-section mb-8">
          <div className="rounded-glass-lg border border-slate-200/40 bg-aurora-shell p-6 shadow-md shadow-slate-200/40 backdrop-blur-sm dark:border-slate-700/60 dark:bg-slate-900/80 dark:shadow-slate-900/40 sm:p-8">
            <div className="mb-6">
              <Typography variant="headline-sm" className="text-text-primary">
                Welcome back, {profile?.display_name || profile?.full_name || "Coach"}
              </Typography>
              <Typography variant="body-sm" className="text-text-secondary mt-1">
                Launch the workspace you need and keep your day moving.
              </Typography>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-5">
              {dashboardHeroTiles.map((tile) => (
                <AuroraTile
                  key={tile.key}
                  title={tile.title}
                  description={tile.description}
                  icon={tile.icon}
                  accentOverlayClass={tile.accentOverlayClass}
                  glowClassName={tile.glowClassName}
                  statusBadge={tile.statusBadge}
                  iconClassName={tile.iconClassName}
                  footnote={tile.footnote}
                  onOpen={() => scrollToSection(tile.target)}
                >
                  {tile.body}
                </AuroraTile>
              ))}
            </div>
          </div>
        </div>

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
          <div className="left-column" id="dashboard-profile-section">
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
            <div className="personal-feed-section" id="dashboard-feed-section">
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
            <div className="calendar-section" id="dashboard-calendar-section">
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
