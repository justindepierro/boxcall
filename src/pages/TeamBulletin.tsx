import React, { useEffect, useState, useMemo, useCallback } from "react";
import { PageLayout } from "../components/layout/PageLayout";
import { useParams, useNavigate } from "react-router-dom";

import { useAuth } from "../app/auth-store";
import { useDevMode } from "../app/dev-mode-hooks";
import { Typography } from "../components/design-system";
import { TeamBulletinFeedPanel } from "../components/team-dashboard/layout/TeamBulletinFeedPanel";
import { TeamBulletinHeader } from "../components/team-dashboard/layout/TeamBulletinHeader";
import { TeamBulletinLeftPanel } from "../components/team-dashboard/layout/TeamBulletinLeftPanel";
import { TeamBulletinRightPanel } from "../components/team-dashboard/layout/TeamBulletinRightPanel";
import { SeasonStatsCard } from "../components/team-dashboard/SeasonStatsCard";
import { TeamTrophyCase } from "../components/team-dashboard/TeamTrophyCase";
import { TeamQuickActions } from "../components/team-dashboard/TeamQuickActions";
import { TeamCalendar } from "../components/team-dashboard/TeamCalendar";
import { TeamFeed } from "../components/team-dashboard/TeamFeed";
import { PlayerRosterContainer } from "../components/team/PlayerRosterContainer";
import { OnboardingHint } from "../components/onboarding/OnboardingHint";
import { Button, Card } from "../components/ui";
import { Icon } from "../components/ui/Icon/Icon";
import { LogoIcon } from "../components/ui/Logo";
import { usePermissions } from "../hooks/usePermissions";
import { useTeamMembershipRole } from "../hooks/useTeamMembershipRole";
import { supabase } from "../lib/supabase";
import { ROUTES } from "../routes/paths";
import { useRoles } from "../hooks/useRoles";

import { LoadingScreen } from "../components/ui/LoadingScreen";

// Collaboration components and provider
import { SharedGoalTracker } from "../components/collaboration/SharedGoalTracker";
import { TeamVoteWidget } from "../components/collaboration/TeamVoteWidget";
import { ProgressSharing } from "../components/collaboration/ProgressSharing";
import { CollaborationProvider } from "../components/collaboration/CollaborationProvider";

// Loading skeleton for collaboration widgets
import { DashboardCardSkeleton } from "../components/ui/Skeleton";

// Team Bulletin Page (modular layout version)
const TeamBulletin: React.FC = React.memo(() => {
  const { teamId } = useParams<{ teamId: string }>();
  const { user, profile } = useAuth();
  const { roleContext } = useRoles();
  const { devMode } = useDevMode();
  const { isSuperAdmin, canCreateTeamUnlimited } = usePermissions();
  const navigate = useNavigate();
  const { data: membershipRole } = useTeamMembershipRole(teamId, profile?.id);

  const computeAcademicYearDisplay = useCallback((baseYear?: number) => {
    if (typeof baseYear === "number" && !isNaN(baseYear)) {
      return `${baseYear}-${baseYear + 1}`;
    }
    const now = new Date();
    const startYear =
      now.getMonth() >= 6 ? now.getFullYear() : now.getFullYear() - 1;
    return `${startYear}-${startYear + 1}`;
  }, []);

  interface TeamData {
    id: string;
    name: string;
    season: string;
    colors: { primary: string; secondary: string };
    logo: string;
    record: { wins: number; losses: number };
    nextGame: string;
    memberCount: number;
    mascot?: string | null;
    school_name?: string | null;
    logo_url?: string | null;
  }

  const [teamData, setTeamData] = useState<TeamData | null>(() => {
    if (devMode === "blank_slate") return null;
    // Create initial mock team data
    return {
      id: teamId || "unknown",
      name: "BoxCall Dev Team",
      season: "2025-2026", // Default season
      colors: { primary: "#00A86B", secondary: "#1E3A8A" },
      logo: "eagle",
      record: { wins: 8, losses: 2 },
      nextGame: "Friday vs. Central Lions",
      memberCount: 35,
    };
  });

  const [isTeamDataLoading, setIsTeamDataLoading] = useState(true);

  const loadingInitial = useMemo(
    () => !user || !profile || !teamId,
    [user, profile, teamId]
  );

  // Check if we're still loading role context or team membership
  const isRoleContextLoading = !roleContext && user && profile;
  const { isLoading: isMembershipLoading } = useTeamMembershipRole(
    teamId,
    profile?.id
  );

  // Comprehensive loading state
  const isLoading =
    loadingInitial ||
    isRoleContextLoading ||
    isMembershipLoading ||
    isTeamDataLoading;

  const handleCreateTeam = useCallback(() => {
    console.info("team.create.attempt", {
      isSuperAdmin,
      canCreateTeamUnlimited,
    });
    navigate(ROUTES.CREATE_TEAM);
  }, [isSuperAdmin, canCreateTeamUnlimited, navigate]);

  const handleJoinTeam = useCallback(() => {
    console.info("team.join.attempt");
    navigate(ROUTES.JOIN_TEAM);
  }, [navigate]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!teamId) {
        setIsTeamDataLoading(false);
        return;
      }

      setIsTeamDataLoading(true);

      try {
        type TeamRow = {
          id: string;
          name: string;
          season_year: number | string | null;
          school_name: string | null;
          mascot: string | null;
        };
        const { data, error } = await supabase
          .from("teams")
          .select("id, name, season_year, school_name, mascot")
          .eq("id", teamId)
          .single<TeamRow>();
        if (error) {
          console.warn("team.fetch.error", error);
          setIsTeamDataLoading(false);
          return;
        }
        let memberCount = 0;
        try {
          const { count } = await supabase
            .from("team_members")
            .select("id", { head: true, count: "exact" })
            .eq("team_id", teamId);
          memberCount = count || 0;
        } catch {
          // ignore member count fetch failure
        }
        if (!cancelled && data) {
          const syRaw = data.season_year;
          const seasonBase =
            typeof syRaw === "number"
              ? syRaw
              : syRaw
                ? parseInt(syRaw, 10)
                : undefined;
          const seasonDisplay = computeAcademicYearDisplay(seasonBase);
          setTeamData({
            id: data.id,
            name: data.name,
            season: seasonDisplay,
            colors: { primary: "#00A86B", secondary: "#1E3A8A" },
            logo: "generic",
            record: { wins: 0, losses: 0 },
            nextGame: "TBD",
            memberCount,
            mascot: data.mascot,
            school_name: data.school_name,
          });
        }
      } catch {
        // ignore team fetch failure
      } finally {
        if (!cancelled) {
          setIsTeamDataLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [teamId, computeAcademicYearDisplay]);

  const hasAnyTeam = useMemo(
    () => (roleContext?.teamMemberships.length ?? 0) > 0,
    [roleContext?.teamMemberships.length]
  );

  // Memoize computed values that are used in multiple places
  const userRole = membershipRole || profile?.role || "player";
  const isCoach = userRole === "coach" || userRole === "head_coach";

  // Memoized props to prevent child re-renders
  const teamHeaderProps = useMemo(
    () => ({
      headingId: "team-dashboard-heading",
      teamId,
      teamName: teamData?.name || "",
      seasonDisplay: teamData?.season || "",
      record: teamData?.record || { wins: 0, losses: 0 },
      memberCount: teamData?.memberCount || 0,
      nextGame: teamData?.nextGame || "",
      schoolName: teamData?.school_name,
      mascot: teamData?.mascot,
      isCoach,
      logoUrl: teamData?.logo_url || undefined,
      userRole,
    }),
    [teamId, teamData, isCoach, userRole]
  );

  const collaborationProps = useMemo(() => {
    if (!teamId) return null;
    return {
      widgetId: "team-bulletin-shared-goals",
      userRole:
        profile?.role === "admin"
          ? ("coach" as const)
          : (userRole as "coach" | "player" | "family") || ("player" as const),
      userId: user?.id || "anonymous",
      teamId: teamId,
    };
  }, [profile?.role, userRole, user?.id, teamId]);

  // Show loading screen while any data is loading
  if (isLoading) {
    const subtitle =
      [
        isRoleContextLoading && "Checking team access...",
        isMembershipLoading && "Validating membership...",
        isTeamDataLoading && "Loading team information...",
        loadingInitial && "Initializing...",
      ].filter(Boolean)[0] || "Please wait...";

    return <LoadingScreen title="Loading Team Dashboard" subtitle={subtitle} />;
  }

  if (!teamId) {
    if (!hasAnyTeam) {
      return (
        <PageLayout
          title="Team Bulletin"
          subtitle="Create or join a team to unlock your bulletin."
        >
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center max-w-md px-4">
              <Typography variant="headline-lg" className="mb-3">
                Welcome to BoxCall
              </Typography>
              <Typography variant="body-lg" color="muted" className="mb-6">
                You haven’t joined a team yet. Create one or request access to
                start collaborating with your staff and players.
              </Typography>
              <div className="flex gap-3 justify-center">
                <Button onClick={handleCreateTeam}>
                  <Icon name="plus" size="sm" className="mr-2" /> Create Team
                </Button>
                <Button variant="outline" onClick={handleJoinTeam}>
                  <Icon name="search" size="sm" className="mr-2" /> Find a Team
                </Button>
              </div>
            </div>
          </div>
        </PageLayout>
      );
    }

    return (
      <PageLayout
        title="Team Bulletin"
        subtitle="Choose a team from the switcher to view its bulletin."
      >
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center max-w-md px-4">
            <Typography variant="headline-lg" className="mb-4">
              Select a Team
            </Typography>
            <Typography variant="body-lg" color="muted">
              Use the team switcher in the header to choose which team’s
              bulletin you’d like to view.
            </Typography>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (!teamData) {
    return (
      <div className="py-6">
        <div className="max-w-2xl mx-auto text-center">
          <div className="surface-card elevation-card border-subtle rounded-lg p-8">
            <LogoIcon size="xl" color="brand" className="mx-auto mb-4" />
            <Typography variant="headline-lg" className="mb-2">
              No Team Found
            </Typography>
            <Typography variant="body-lg" color="muted" className="mb-6">
              {devMode === "blank_slate"
                ? "Create your first team or join an existing one to get started."
                : "This team doesn't exist or you don't have access to it."}
            </Typography>
            <div className="flex gap-3 justify-center">
              <Button
                onClick={handleCreateTeam}
                variant="primary"
                className="px-6 py-2 rounded-lg font-medium flex items-center gap-2"
              >
                Create Team
                {isSuperAdmin && (
                  <Icon name="unlock" size="sm" className="text-text-primary" />
                )}
              </Button>
              <Button
                onClick={handleJoinTeam}
                variant="ghost"
                className="px-6 py-2 rounded-lg font-medium"
              >
                Join Team
              </Button>
            </div>
            {isSuperAdmin && (
              <div className="mt-2 text-xs text-jade-600 dark:text-jade-400">
                Super Admin: Unlimited team creation access
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <PageLayout
      title={`${teamData.name} Bulletin`}
      subtitle={`Season ${teamData.season} • ${teamData.memberCount} members`}
      variant="dashboard"
    >
      {/* Skip link for keyboard users */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 bg-jade-600 text-text-inverse px-4 py-2 rounded-md z-50"
      >
        Skip to main content
      </a>
      <CollaborationProvider
        teamId={teamId}
        dashboardId="team-bulletin"
        user={{
          id: user?.id || "anonymous",
          name: profile?.display_name || profile?.full_name || "Team Member",
          role:
            profile?.role === "admin" || isCoach
              ? "coach"
              : userRole === "family"
                ? "parent"
                : "player",
        }}
      >
        <main
          id="main-content"
          role="main"
          aria-labelledby="team-dashboard-heading"
          className="py-2"
        >
          <div className="px-3 sm:px-4 lg:px-6">
            <TeamBulletinHeader {...teamHeaderProps} />

            {/* Enhanced Team Dashboard Layout */}
            <div className="team-dashboard-container">
              {/* Hero Stats Row */}
              <div className="dashboard-hero-section mb-8">
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  <div className="md:col-span-1">
                    <TeamTrophyCase teamId={teamId || ""} />
                  </div>
                  <div className="md:col-span-2 lg:col-span-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 h-full">
                      {/* Collaboration Widgets */}
                      <div
                        className="collaboration-goals h-full"
                        role="region"
                        aria-label="Team Goals"
                      >
                        <React.Suspense fallback={<DashboardCardSkeleton />}>
                          {collaborationProps && (
                            <SharedGoalTracker {...collaborationProps} />
                          )}
                        </React.Suspense>
                      </div>
                      <div
                        className="collaboration-vote h-full"
                        role="region"
                        aria-label="Team Decisions"
                      >
                        <React.Suspense fallback={<DashboardCardSkeleton />}>
                          <TeamVoteWidget
                            widgetId="team-bulletin-team-vote"
                            userRole={
                              profile?.role === "admin"
                                ? "coach"
                                : (userRole as "coach" | "player" | "family") ||
                                  "player"
                            }
                            userId={user?.id || "anonymous"}
                            userName={
                              profile?.display_name ||
                              profile?.full_name ||
                              "Team Member"
                            }
                          />
                        </React.Suspense>
                      </div>
                    </div>
                  </div>
                  <div className="md:col-span-3 lg:col-span-1">
                    <SeasonStatsCard
                      teamId={teamId || ""}
                      userRole={userRole}
                    />
                  </div>
                </div>
              </div>

              {/* Main Content Area */}
              <div className="dashboard-main-content">
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                  {/* Left Sidebar - Quick Actions & Tools */}
                  <aside className="xl:col-span-3 order-2 xl:order-1">
                    <div className="sticky top-6 space-y-6">
                      <Card className="bc-card-padding quick-actions-card border-slate-200 shadow-sm">
                        <Typography
                          as="h2"
                          variant="headline-md"
                          className="mb-4 text-text-primary flex items-center gap-2"
                        >
                          <div className="p-1.5 bg-jade-100 rounded-lg">
                            <Icon
                              name="zap"
                              size="sm"
                              className="text-jade-600"
                            />
                          </div>
                          Quick Actions
                        </Typography>
                        <TeamQuickActions
                          teamId={teamId || ""}
                          userRole={userRole}
                        />
                      </Card>

                      <div className="collaboration-section rounded-xl">
                        <div
                          className="collaboration-progress p-1"
                          role="region"
                          aria-label="Team Progress"
                        >
                          <React.Suspense fallback={<DashboardCardSkeleton />}>
                            <ProgressSharing
                              widgetId="team-bulletin-progress-sharing"
                              userRole={
                                profile?.role === "admin"
                                  ? "coach"
                                  : (userRole as
                                      | "coach"
                                      | "player"
                                      | "family") || "player"
                              }
                              userId={user?.id || "anonymous"}
                              userName={
                                profile?.display_name ||
                                profile?.full_name ||
                                "Team Member"
                              }
                            />
                          </React.Suspense>
                        </div>
                      </div>
                    </div>
                  </aside>

                  {/* Center - Team Activity Feed */}
                  <main className="xl:col-span-6 order-1 xl:order-2">
                    <div className="space-y-6">
                      <div className="team-activity-header bg-gradient-to-r from-jade-50 to-emerald-50 rounded-xl p-6 border border-jade-100">
                        <div className="text-center lg:text-left">
                          <Typography
                            variant="headline-lg"
                            className="text-text-primary mb-2 flex items-center justify-center lg:justify-start gap-3"
                          >
                            <div className="p-2 bg-jade-100 rounded-lg">
                              <Icon
                                name="users"
                                size="lg"
                                className="text-jade-600"
                              />
                            </div>
                            Team Hub
                          </Typography>
                          <Typography
                            variant="body-lg"
                            color="muted"
                            className="mb-4"
                          >
                            Stay connected with your team's latest updates,
                            achievements, and announcements
                          </Typography>

                          {/* Team engagement stats */}
                          <div className="flex flex-wrap justify-center lg:justify-start gap-4 text-sm">
                            <div className="flex items-center gap-2 px-3 py-1 bg-white rounded-full border border-jade-200">
                              <Icon
                                name="message"
                                size="xs"
                                className="text-jade-500"
                              />
                              <span className="text-text-secondary">
                                12 new posts
                              </span>
                            </div>
                            <div className="flex items-center gap-2 px-3 py-1 bg-white rounded-full border border-emerald-200">
                              <Icon
                                name="award"
                                size="xs"
                                className="text-emerald-500"
                              />
                              <span className="text-text-secondary">
                                3 achievements
                              </span>
                            </div>
                            <div className="flex items-center gap-2 px-3 py-1 bg-white rounded-full border border-blue-200">
                              <Icon
                                name="calendar"
                                size="xs"
                                className="text-blue-500"
                              />
                              <span className="text-text-secondary">
                                2 upcoming events
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="team-activity-feed">
                        <Card className="p-4 shadow-sm hover:shadow-md transition-shadow duration-200">
                          <TeamFeed teamId={teamId || ""} userRole={userRole} />
                        </Card>
                      </div>
                    </div>
                  </main>

                  {/* Right Sidebar - Calendar & Roster */}
                  <aside className="xl:col-span-3 order-3">
                    <div className="sticky top-6 space-y-6">
                      <div className="calendar-widget">
                        <TeamCalendar teamId={teamId || ""} />
                      </div>

                      <Card className="bc-card-padding roster-card border-slate-200 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                          <Typography
                            as="h2"
                            variant="headline-md"
                            className="text-text-primary flex items-center gap-2"
                          >
                            <div className="p-1.5 bg-blue-100 rounded-lg">
                              <Icon
                                name="users"
                                size="sm"
                                className="text-blue-600"
                              />
                            </div>
                            Team Roster
                          </Typography>
                          <div className="text-xs text-text-secondary bg-slate-100 px-2 py-1 rounded-full">
                            {teamData?.memberCount || 0} members
                          </div>
                        </div>
                        <div className="max-h-64 overflow-y-auto">
                          <PlayerRosterContainer teamId={teamId || ""} />
                        </div>
                      </Card>

                      <Card className="p-4 border-orange-200 bg-gradient-to-br from-orange-50 to-yellow-50">
                        <OnboardingHint
                          icon="calendar"
                          title="Upcoming Events"
                          message="Once you add games, practices, and meetings they will be summarized here for quick reference."
                          actions={[
                            {
                              label: "Open Calendar",
                              variant: "primary",
                              onClick: () =>
                                console.info(
                                  "onboarding.upcoming.open_calendar"
                                ),
                            },
                          ]}
                        />
                      </Card>
                    </div>
                  </aside>
                </div>
              </div>
            </div>
          </div>
        </main>
      </CollaborationProvider>
    </PageLayout>
  );
});

TeamBulletin.displayName = "TeamBulletin";

export { TeamBulletin };
export default TeamBulletin;
