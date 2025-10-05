import React, { useEffect, useState, useMemo, useCallback } from "react";
import { PageLayout } from "../components/layout/PageLayout";
import { useParams, useNavigate } from "react-router-dom";

import { useAuth } from "../app/auth-store";
import { useDevMode } from "../app/dev-mode-hooks";
import { Typography } from "../components/design-system";
import { TeamBulletinHeader } from "../components/team-dashboard/layout/TeamBulletinHeader";
import { SeasonStatsCard } from "../components/team-dashboard/SeasonStatsCard";
import { TeamTrophyCase } from "../components/team-dashboard/TeamTrophyCase";
import { TeamQuickActions } from "../components/team-dashboard/TeamQuickActions";
import { TeamCalendar } from "../components/team-dashboard/TeamCalendar";
import { TeamFeed } from "../components/team-dashboard/TeamFeed";
import { PlayerRosterContainer } from "../components/team/PlayerRosterContainer";
import { OnboardingHint } from "../components/onboarding/OnboardingHint";
import { Button, Card } from "../components/ui";
import { Icon } from "../components/ui/Icon/Icon";
import { AuroraTile } from "../components/ui/AuroraTile";
import { LogoIcon } from "../components/ui/Logo";
import { usePermissions } from "../hooks/usePermissions";
import { useTeamMembershipRole } from "../hooks/useTeamMembershipRole";
import { supabase } from "../lib/supabase";
import { ROUTES } from "../routes/paths";
import { useRoles } from "../hooks/useRoles";
import { Aurora } from "../components/ui/Aurora";

import { LoadingScreen } from "../components/ui/LoadingScreen";

// Collaboration components and provider
import { SharedGoalTracker } from "../components/collaboration/SharedGoalTracker";
import { TeamVoteWidget } from "../components/collaboration/TeamVoteWidget";
import { ProgressSharing } from "../components/collaboration/ProgressSharing";
import { CollaborationProvider } from "../components/collaboration/CollaborationProvider";

// Modal components
import { TeamTrophyCaseModal } from "../components/team-dashboard/TeamTrophyCaseModal";
import { SeasonStatsModal } from "../components/team-dashboard/SeasonStatsModal";
import { TeamGoalsModal } from "../components/collaboration/TeamGoalsModal";
import { colorTokens } from "../design-system/tokens";
import { TeamVotesModal } from "../components/collaboration/TeamVotesModal";

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
      colors: { primary: "#00A86B", secondary: colorTokens.blue[900] },
      logo: "eagle",
      record: { wins: 8, losses: 2 },
      nextGame: "Friday vs. Central Lions",
      memberCount: 35,
    };
  });

  const [isTeamDataLoading, setIsTeamDataLoading] = useState(true);

  // Modal states
  const [isTrophyCaseModalOpen, setIsTrophyCaseModalOpen] = useState(false);
  const [isSeasonStatsModalOpen, setIsSeasonStatsModalOpen] = useState(false);
  const [isTeamGoalsModalOpen, setIsTeamGoalsModalOpen] = useState(false);
  const [isTeamVotesModalOpen, setIsTeamVotesModalOpen] = useState(false);

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
            colors: { primary: "#00A86B", secondary: colorTokens.blue[900] },
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
        <Aurora variant="shell" fullHeight>
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
                    <Icon name="search" size="sm" className="mr-2" /> Find a
                    Team
                  </Button>
                </div>
              </div>
            </div>
          </PageLayout>
        </Aurora>
      );
    }

    return (
      <Aurora variant="shell" fullHeight>
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
      </Aurora>
    );
  }

  if (!teamData) {
    return (
      <Aurora variant="shell" fullHeight>
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
                    <Icon
                      name="unlock"
                      size="sm"
                      className="text-text-primary"
                    />
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
      </Aurora>
    );
  }

  return (
    <Aurora variant="shell" fullHeight>
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
            <div className="px-4 sm:px-6 lg:px-8">
              <TeamBulletinHeader {...teamHeaderProps} />

              {/* Enhanced Team Dashboard Layout */}
              <div className="team-dashboard-container">
                {/* Hero Stats Row */}
                <div className="dashboard-hero-section mb-12">
                  <div className="rounded-[36px] border border-slate-200/40 bg-aurora-shell p-5 shadow-md shadow-slate-200/40 backdrop-blur-sm dark:border-slate-700/60 dark:bg-slate-900/80 dark:shadow-slate-900/40 sm:p-6 xl:p-7">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 xl:gap-5">
                      <AuroraTile
                        title="Trophy Case"
                        description="Celebrate helmet stickers, medals, and season milestones together."
                        icon="award"
                        iconClassName="text-amber-600"
                        accentOverlayClass="bg-aurora-amber"
                        glowClassName="glow-aurora-amber"
                        statusBadge="Recognition"
                        footnote="Badges & stickers"
                        onOpen={() => setIsTrophyCaseModalOpen(true)}
                      >
                        <TeamTrophyCase teamId={teamId || ""} compact />
                      </AuroraTile>

                      <AuroraTile
                        title="Goals & Progress"
                        description="Plan season goals, track momentum, and keep everyone aligned."
                        icon="target"
                        iconClassName="text-emerald-600"
                        accentOverlayClass="bg-aurora-emerald"
                        glowClassName="glow-aurora-emerald"
                        statusBadge="Collaboration"
                        footnote="Shared goals"
                        onOpen={() => setIsTeamGoalsModalOpen(true)}
                      >
                        <React.Suspense fallback={<DashboardCardSkeleton />}>
                          {collaborationProps ? (
                            <SharedGoalTracker
                              {...collaborationProps}
                              compact
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center text-sm font-medium text-text-secondary opacity-70">
                              Set up your team to start tracking goals.
                            </div>
                          )}
                        </React.Suspense>
                      </AuroraTile>

                      <AuroraTile
                        title="Team Decisions"
                        description="Launch quick votes and gather feedback without the group chat chaos."
                        icon="message"
                        iconClassName="text-indigo-600"
                        accentOverlayClass="bg-aurora-indigo"
                        glowClassName="glow-aurora-indigo"
                        statusBadge="Alignment"
                        footnote="Live voting"
                        onOpen={() => setIsTeamVotesModalOpen(true)}
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
                            compact
                          />
                        </React.Suspense>
                      </AuroraTile>

                      <AuroraTile
                        title="Season Stats"
                        description="See the win column climb and log new results in seconds."
                        icon="trending-up"
                        iconClassName="text-purple-600"
                        accentOverlayClass="bg-aurora-violet"
                        glowClassName="glow-aurora-violet"
                        statusBadge="Performance"
                        footnote="Tap for details"
                        onOpen={() => setIsSeasonStatsModalOpen(true)}
                      >
                        <SeasonStatsCard
                          teamId={teamId || ""}
                          userRole={userRole}
                          compact
                        />
                      </AuroraTile>
                    </div>
                  </div>
                </div>

                {/* Main Content Area */}
                <div className="dashboard-main-content bg-aurora-shell rounded-aurora p-5 border border-slate-200/40 shadow-sm xl:p-6">
                  <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 xl:gap-5">
                    {/* Left Sidebar - Quick Actions & Tools */}
                    <aside className="xl:col-span-3 order-2 xl:order-1">
                      <div className="sticky top-6 space-y-6">
                        <Card className="bc-card-padding quick-actions-card shadow-lg hover:shadow-xl transition-all duration-300 card-overflow-safe">
                          <Typography
                            as="h2"
                            variant="headline-md"
                            className="mb-4 text-text-primary flex items-center gap-3 icon-text-safe"
                          >
                            <div className="p-2 bg-aurora-emerald rounded-lg flex-shrink-0 shadow-sm">
                              <Icon
                                name="zap"
                                size="sm"
                                className="text-jade-600"
                              />
                            </div>
                            <span className="text-truncate font-semibold">
                              Quick Actions
                            </span>
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
                            <React.Suspense
                              fallback={<DashboardCardSkeleton />}
                            >
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
                        <div className="team-activity-header bg-aurora-emerald rounded-aurora p-8 border border-jade-100/50 shadow-lg hover:shadow-xl transition-all duration-300 card-overflow-safe">
                          <div className="text-center lg:text-left">
                            <Typography
                              variant="headline-lg"
                              className="text-text-primary mb-3 flex items-center justify-center lg:justify-start gap-4 icon-text-safe"
                            >
                              <div className="p-3 bg-aurora-emerald rounded-xl flex-shrink-0 shadow-sm">
                                <Icon
                                  name="users"
                                  size="lg"
                                  className="text-jade-600"
                                />
                              </div>
                              <span className="text-truncate font-bold">
                                Team Hub
                              </span>
                            </Typography>
                            <Typography
                              variant="body-lg"
                              color="muted"
                              className="mb-6 text-truncate-2 leading-relaxed"
                            >
                              Stay connected with your team's latest updates,
                              achievements, and announcements
                            </Typography>

                            {/* Team engagement stats */}
                            <div className="flex flex-wrap justify-center lg:justify-start gap-3 text-sm">
                              <div className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-jade-200/50 shadow-sm hover:shadow-md transition-shadow badge-safe">
                                <Icon
                                  name="message"
                                  size="xs"
                                  className="text-jade-500 flex-shrink-0"
                                />
                                <span className="text-text-secondary text-truncate font-medium">
                                  12 new posts
                                </span>
                              </div>
                              <div className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-emerald-200/50 shadow-sm hover:shadow-md transition-shadow badge-safe">
                                <Icon
                                  name="award"
                                  size="xs"
                                  className="text-emerald-500 flex-shrink-0"
                                />
                                <span className="text-text-secondary text-truncate font-medium">
                                  3 achievements
                                </span>
                              </div>
                              <div className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-blue-200/50 shadow-sm hover:shadow-md transition-shadow badge-safe">
                                <Icon
                                  name="calendar"
                                  size="xs"
                                  className="text-blue-500 flex-shrink-0"
                                />
                                <span className="text-text-secondary text-truncate font-medium">
                                  2 upcoming events
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="team-activity-feed">
                          <Card className="p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                            <TeamFeed
                              teamId={teamId || ""}
                              userRole={userRole}
                            />
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

                        <Card className="bc-card-padding roster-card shadow-lg hover:shadow-xl transition-all duration-300 card-overflow-safe">
                          <div className="flex items-center justify-between mb-4 icon-text-safe">
                            <Typography
                              as="h2"
                              variant="headline-md"
                              className="text-text-primary flex items-center gap-3 icon-text-safe flex-1 min-w-0"
                            >
                              <div className="p-2 bg-aurora-indigo rounded-lg flex-shrink-0 shadow-sm">
                                <Icon
                                  name="users"
                                  size="sm"
                                  className="text-blue-600"
                                />
                              </div>
                              <span className="text-truncate font-semibold">
                                Team Roster
                              </span>
                            </Typography>
                            <div className="text-xs text-text-secondary bg-slate-100/80 px-3 py-1.5 rounded-full flex-shrink-0 badge-safe shadow-sm">
                              <span className="text-truncate font-medium">
                                {teamData?.memberCount || 0} members
                              </span>
                            </div>
                          </div>
                          <div className="max-h-64 overflow-y-auto">
                            <PlayerRosterContainer teamId={teamId || ""} />
                          </div>
                        </Card>

                        <Card className="p-6 border-orange-200/60 shadow-lg hover:shadow-xl transition-all duration-300">
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

        {/* Modal Components */}
        <TeamTrophyCaseModal
          isOpen={isTrophyCaseModalOpen}
          onClose={() => setIsTrophyCaseModalOpen(false)}
          teamId={teamId || ""}
        />
        <SeasonStatsModal
          isOpen={isSeasonStatsModalOpen}
          onClose={() => setIsSeasonStatsModalOpen(false)}
          teamId={teamId || ""}
        />
        <TeamGoalsModal
          isOpen={isTeamGoalsModalOpen}
          onClose={() => setIsTeamGoalsModalOpen(false)}
          widgetId="team-bulletin-team-goals-modal"
          userRole={
            profile?.role === "admin"
              ? "coach"
              : (userRole as "coach" | "player" | "family") || "player"
          }
          userId={user?.id || "anonymous"}
          teamId={teamId || ""}
        />
        <TeamVotesModal
          isOpen={isTeamVotesModalOpen}
          onClose={() => setIsTeamVotesModalOpen(false)}
          widgetId="team-bulletin-team-votes-modal"
          userRole={
            profile?.role === "admin"
              ? "coach"
              : (userRole as "coach" | "player" | "family") || "player"
          }
          userId={user?.id || "anonymous"}
          userName={
            profile?.display_name || profile?.full_name || "Team Member"
          }
        />
      </PageLayout>
    </Aurora>
  );
});

TeamBulletin.displayName = "TeamBulletin";

export { TeamBulletin };
export default TeamBulletin;
