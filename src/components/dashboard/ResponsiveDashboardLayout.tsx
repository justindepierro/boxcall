import React, { useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../app/auth-store";
import { PersonalCalendar } from "../dashboard/PersonalCalendar";
import { PersonalFeed } from "../dashboard/PersonalFeed";
import ProfileCard from "../dashboard/ProfileCard";
import TeamFeeds from "../dashboard/TeamFeeds";
import { RosterQuickAdd } from "../dashboard/RosterQuickAdd";
import { Typography } from "../design-system";
import { PageLoadingSkeleton, DashboardCardSkeleton } from "../ui/Skeleton.tsx";
import { useProgressiveLoading } from "../../hooks/useProgressiveLoading";
import { useDashboardStats } from "../../hooks/useDashboardStats";
import { useMobileNavigation } from "../../hooks/useMobileNavigation";
import { MobileBottomNavigation } from "../mobile/core/MobileBottomNavigation";
import { AuroraTile } from "../ui/AuroraTile";
import type { IconName } from "../ui/Icon/Icon";
import { MobileHeroStatsCard, MobileQuickActionGrid } from "../mobile";
// Onboarding components removed during cleanup

interface DashboardHeroTile {
  key: string;
  title: string;
  description: string;
  icon: IconName;
  accentOverlayClass: string;
  glowClassName: string;
  statusBadge: string;
  iconClassName: string;
  iconContainerClassName: string;
  footnote: string;
  body: React.ReactNode;
  target: string;
}

const DashboardStatusScreen: React.FC<{
  title: string;
  message: string;
  variant?: "error" | "primary";
  action?: React.ReactNode;
}> = ({ title, message, variant = "error", action }) => (
  <div className="flex items-center justify-center min-h-screen bg-background">
    <div className="text-center max-w-md px-4">
      <Typography variant="headline-lg" className={`text-${variant} mb-4`}>
        {title}
      </Typography>
      <Typography
        variant="body-lg"
        color="muted"
        className={action ? "mb-4" : ""}
      >
        {message}
      </Typography>
      {action}
    </div>
  </div>
);

const ProfileLoadingScreen: React.FC = () => (
  <div className="flex items-center justify-center min-h-screen bg-background">
    <div className="text-center max-w-md px-4">
      <Typography variant="headline-lg" className="text-primary mb-4">
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

// Desktop Hero Section with Aurora tiles
interface DesktopHeroSectionProps {
  displayName: string;
  tiles: DashboardHeroTile[];
  onTileClick: (target: string) => void;
}

const DesktopHeroSection: React.FC<DesktopHeroSectionProps> = ({
  displayName,
  tiles,
  onTileClick,
}) => (
  <div className="dashboard-hero-section mb-8 hidden md:block">
    <div className="rounded-xl bg-primary p-6 shadow-lg backdrop-blur-sm sm:p-8">
      <div className="mb-6">
        <Typography variant="headline-sm" className="text-primary">
          Welcome back, {displayName}
        </Typography>
        <Typography variant="body-sm" className="text-secondary mt-1">
          Launch the workspace you need and keep your day moving.
        </Typography>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-5">
        {tiles.map((tile) => (
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
            onOpen={() => onTileClick(tile.target)}
          >
            {tile.body}
          </AuroraTile>
        ))}
      </div>
    </div>
  </div>
);

const createDashboardHeroTiles = (
  displayName: string | null | undefined,
  fullName: string | null | undefined,
  teamMembershipCount: number,
  userRole: string
): DashboardHeroTile[] => [
  {
    key: "profile",
    title: "My Role",
    description: "Snapshot of your identity inside every team.",
    icon: "user",
    accentOverlayClass: "bg-gradient-to-br from-amber-400 to-amber-600",
    glowClassName: "bg-amber-400",
    statusBadge: (userRole || "player").replace("_", " ").toUpperCase(),
    iconClassName: "text-amber-600",
    iconContainerClassName:
      "bg-gradient-to-br from-amber-50 to-amber-100 border-l-4 border-amber-500",
    footnote: "View profile",
    body: (
      <div className="space-y-2 text-sm">
        <div className="flex items-center justify-between text-secondary">
          <span>Signed in as</span>
          <span className="font-semibold text-primary">
            {displayName || fullName || "Member"}
          </span>
        </div>
        <div className="flex items-center justify-between text-xs text-secondary">
          <span>Teams joined</span>
          <span className="font-semibold text-primary">
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
    accentOverlayClass: "bg-gradient-to-br from-cyan-400 to-cyan-600",
    glowClassName: "bg-cyan-400",
    statusBadge: "Updates",
    iconClassName: "text-cyan-600",
    iconContainerClassName:
      "bg-gradient-to-br from-cyan-50 to-cyan-100 border-l-4 border-cyan-500",
    footnote: "Open activity",
    body: (
      <div className="space-y-2 text-sm">
        <div className="flex items-center justify-between text-secondary">
          <span>Feed highlights</span>
          <span className="font-semibold text-primary">Live</span>
        </div>
        <div className="flex items-center justify-between text-xs text-secondary">
          <span>Mentions watched</span>
          <span className="font-semibold text-primary">Auto</span>
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
    accentOverlayClass: "bg-gradient-to-br from-purple-400 to-purple-600",
    glowClassName: "bg-purple-400",
    statusBadge: "Today",
    iconClassName: "text-purple-600",
    iconContainerClassName:
      "bg-gradient-to-br from-purple-50 to-purple-100 border-l-4 border-purple-500",
    footnote: "Jump to calendar",
    body: (
      <div className="space-y-2 text-sm">
        <div className="flex items-center justify-between text-secondary">
          <span>Upcoming</span>
          <span className="font-semibold text-primary">Stay sharp</span>
        </div>
        <div className="flex items-center justify-between text-xs text-secondary">
          <span>Sync status</span>
          <span className="font-semibold text-primary">Real-time</span>
        </div>
      </div>
    ),
    target: "dashboard-calendar-section",
  },
];

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
  const { isStepVisible } = useProgressiveLoading(5, 200);
  const navigate = useNavigate();
  const location = useLocation();

  // Fetch real dashboard statistics
  const dashboardStats = useDashboardStats(user?.id);

  // Mobile navigation
  const { items: mobileNavItems } = useMobileNavigation(location.pathname);

  // Calculate derived values before any early returns
  const userRole = profile?.role || "player";

  const teamMembershipCount = (() => {
    const profileWithMemberships = profile as unknown as {
      team_memberships?: unknown[];
    };
    const profileWithCount = profile as unknown as { teams_count?: number };

    if (Array.isArray(profileWithMemberships?.team_memberships)) {
      return profileWithMemberships.team_memberships?.length || 0;
    }
    if (typeof profileWithCount?.teams_count === "number") {
      return profileWithCount.teams_count || 0;
    }
    return 0;
  })();

  const dashboardHeroTiles = useMemo(
    () =>
      createDashboardHeroTiles(
        profile?.display_name,
        profile?.full_name,
        teamMembershipCount,
        userRole
      ),
    [profile?.display_name, profile?.full_name, teamMembershipCount, userRole]
  );

  // Early returns for loading and error states AFTER hooks
  if (loading) {
    return <PageLoadingSkeleton />;
  }

  if (error) {
    return (
      <DashboardStatusScreen title="Authentication Error" message={error} />
    );
  }

  if (!user) {
    return (
      <DashboardStatusScreen
        title="Access Denied"
        message="Please log in to access the dashboard"
      />
    );
  }

  // Show loading while profile is being fetched, but with a timeout
  if (!profile && profileLoading) {
    return <ProfileLoadingScreen />;
  }

  // If we have a user but no profile after loading is complete, create a basic profile
  if (!profile && !loading) {
    return (
      <DashboardStatusScreen
        title="Welcome to BoxCall!"
        message="Your profile is being set up. Please refresh the page or contact support if this persists."
        variant="primary"
        action={
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
          >
            Refresh Page
          </button>
        }
      />
    );
  }

  const scrollToSection = (sectionId: string) => {
    if (typeof window === "undefined") return;
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

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

        {/* Mobile Hero Section - Phase 3 Mobile Design */}
        <div className="dashboard-mobile-hero-section mb-8 block md:hidden">
          <MobileHeroStatsCard
            userName={profile?.display_name || profile?.full_name || "Coach"}
            stats={{
              totalPlays: dashboardStats.totalPlays,
              thisWeekActivity: dashboardStats.thisWeekActivity,
              achievements: dashboardStats.achievements,
            }}
            onViewDetails={() => scrollToSection("dashboard-profile-section")}
          />
          <div className="mt-4">
            <MobileQuickActionGrid />
          </div>
        </div>

        {/* Aurora hero tiles - Desktop only */}
        <DesktopHeroSection
          displayName={profile?.display_name || profile?.full_name || "Coach"}
          tiles={dashboardHeroTiles}
          onTileClick={scrollToSection}
        />

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

            {/* Roster Quick Add */}
            <div className="roster-section">
              {isStepVisible(1) ? (
                <RosterQuickAdd />
              ) : (
                <DashboardCardSkeleton />
              )}
            </div>

            {/* Personal Feed */}
            <div className="personal-feed-section" id="dashboard-feed-section">
              {isStepVisible(2) ? <PersonalFeed /> : <DashboardCardSkeleton />}
            </div>
          </div>

          {/* Right Column (2/3) - Team Feeds and Calendar */}
          <div className="right-column">
            {/* Team Feeds */}
            <div className="feeds-section">
              {isStepVisible(3) ? <TeamFeeds /> : <DashboardCardSkeleton />}
            </div>

            {/* Calendar */}
            <div className="calendar-section" id="dashboard-calendar-section">
              {isStepVisible(4) ? (
                <PersonalCalendar userId={user.id} />
              ) : (
                <DashboardCardSkeleton />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation - Phase 4C */}
      <MobileBottomNavigation
        items={mobileNavItems}
        onNavigate={(href) => navigate(href)}
      />
    </>
  );
};

export default ResponsiveDashboardLayout;
