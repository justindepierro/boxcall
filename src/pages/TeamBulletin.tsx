import React, {
  useEffect,
  useState,
  useMemo,
  useCallback,
  lazy,
  Suspense,
} from "react";
import { useParams, useNavigate } from "react-router-dom";

import { useAuth } from "../app/auth-store";
import { useDevMode } from "../app/dev-mode-hooks";
import { Typography } from "../components/design-system";
import { TeamQuickActions } from "../components/team-dashboard/TeamQuickActions";
import { TeamCalendar } from "../components/team-dashboard/TeamCalendar";
import { AnnouncementsList } from "../components/team/AnnouncementsList";
import { PlayerRosterContainer } from "../components/team/PlayerRosterContainer";
import { Button, Card } from "../components/ui";
import { Icon } from "../components/ui/Icon/Icon";
import { LogoIcon } from "../components/ui/Logo";
import { usePermissions } from "../hooks/usePermissions";
import { useTeamMembershipRole } from "../hooks/useTeamMembershipRole";
import { useTeamActivity } from "../hooks/useTeamActivity";
import { supabase } from "../lib/supabase";
import { ROUTES } from "../routes/paths";
import { useRoles } from "../hooks/useRoles";
import { LoadingScreen } from "../components/ui/LoadingScreen";

// Collaboration components and provider
import { CollaborationProvider } from "../components/collaboration/CollaborationProvider";

// Modal components (lazy loaded)
const TeamTrophyCaseModal = lazy(() =>
  import("../components/team-dashboard/TeamTrophyCaseModal").then((m) => ({
    default: m.TeamTrophyCaseModal,
  }))
);
const SeasonStatsModal = lazy(() =>
  import("../components/team-dashboard/SeasonStatsModal").then((m) => ({
    default: m.SeasonStatsModal,
  }))
);
const TeamGoalsModal = lazy(() =>
  import("../components/collaboration/TeamGoalsModal").then((m) => ({
    default: m.TeamGoalsModal,
  }))
);
const TeamVotesModal = lazy(() =>
  import("../components/collaboration/TeamVotesModal").then((m) => ({
    default: m.TeamVotesModal,
  }))
);
import { colorTokens } from "../design-system/tokens";

// Team Bulletin Page (modular layout version)
const TeamBulletin: React.FC = React.memo(() => {
  const { teamId } = useParams<{ teamId: string }>();
  const { user, profile } = useAuth();
  const { roleContext } = useRoles();
  const { devMode } = useDevMode();
  const { isSuperAdmin, canCreateTeamUnlimited } = usePermissions();
  const navigate = useNavigate();
  const { data: membershipRole } = useTeamMembershipRole(teamId, profile?.id);
  const activityStats = useTeamActivity(teamId || "");

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
      colors: {
        primary: "colorTokens.jade[500]",
        secondary: colorTokens.blue[900],
      },
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
            colors: {
              primary: "colorTokens.jade[500]",
              secondary: colorTokens.blue[900],
            },
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
  const _teamHeaderProps = useMemo(
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

  // Note: collaborationProps prepared for future use in modals
  // const collaborationProps = useMemo(() => {
  //   if (!teamId) return null;
  //   return {
  //     widgetId: "team-bulletin-shared-goals",
  //     userRole:
  //       profile?.role === "admin"
  //         ? ("coach" as const)
  //         : (userRole as "coach" | "player" | "family") || ("player" as const),
  //     userId: user?.id || "anonymous",
  //     teamId: teamId,
  //   };
  // }, [profile?.role, userRole, user?.id, teamId]);

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
        <div className="min-h-screen bg-secondary p-4 md:p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-center min-h-96">
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
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-secondary p-4 md:p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex items-center justify-center min-h-96">
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
        </div>
      </div>
    );
  }

  if (!teamData) {
    return (
      <div className="min-h-screen bg-secondary p-4 md:p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="container-content text-center">
            <div className="bg-primary elevation-card border-muted rounded-lg p-8">
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
                    <Icon name="unlock" size="sm" className="text-primary" />
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
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Skip link for keyboard users */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 bg-jade-600 text-inverse px-4 py-2 rounded-lg z-50"
        >
          Skip to main content
        </a>
        {/* Clean Header Section */}
        <header className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <Typography variant="headline-lg" className="text-primary mb-1">
                {teamData.name} Bulletin
              </Typography>
              <Typography variant="body" className="text-secondary">
                Season {teamData.season} • {teamData.memberCount} members
              </Typography>
            </div>
          </div>

          {/* Compact Stats Bar */}
          <div className="flex items-center gap-4 text-sm flex-wrap">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-surface-card rounded-full shadow-sm">
              <Icon name="message" size="sm" className="text-jade-600" />
              <span className="font-semibold text-primary">
                {activityStats.loading ? "..." : activityStats.newPostsToday}{" "}
                <span className="font-normal text-secondary">posts today</span>
              </span>
            </div>
            {activityStats.onlineMembers > 0 && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-surface-card rounded-full shadow-sm">
                <div className="w-2 h-2 bg-[var(--color-accent-emerald-500)] rounded-full animate-pulse shadow-sm shadow-[var(--card-emerald-shadow)]" />
                <span className="font-semibold text-primary">
                  {activityStats.onlineMembers}{" "}
                  <span className="font-normal text-secondary">online</span>
                </span>
              </div>
            )}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-surface-card rounded-full shadow-sm">
              <Icon name="users" size="sm" className="card-blue-icon" />
              <span className="font-semibold text-primary">
                {teamData?.memberCount || 0}{" "}
                <span className="font-normal text-secondary">members</span>
              </span>
            </div>
            <button
              onClick={() => setIsSeasonStatsModalOpen(true)}
              className="ml-auto flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-full shadow-md shadow-purple-500/30 hover:shadow-lg hover:shadow-purple-500/40 hover:scale-105 transition-all duration-200"
            >
              <Icon name="trending-up" size="sm" className="text-white" />
              <span className="font-bold text-sm">
                {teamData.record.wins}-{teamData.record.losses}
              </span>
            </button>
          </div>
        </header>

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
          >
            {/* Main Social Feed Layout - Three Column */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Sidebar - Compact Widgets (Hidden on Mobile) */}
              <aside className="hidden lg:block lg:col-span-3 space-y-4">
                <Card className="p-4 shadow-md hover:shadow-lg transition-all duration-300">
                  <div className="flex items-center gap-2 mb-3">
                    <Icon name="zap" size="sm" className="text-jade-600" />
                    <Typography variant="headline-sm" className="font-semibold">
                      Quick Actions
                    </Typography>
                  </div>
                  <TeamQuickActions teamId={teamId || ""} userRole={userRole} />
                </Card>

                <Card className="p-4 shadow-md hover:shadow-lg transition-all duration-300">
                  <button
                    onClick={() => setIsTrophyCaseModalOpen(true)}
                    className="group w-full text-left hover:bg-gradient-to-r hover:from-orange-50 hover:to-orange-100 rounded-lg p-3 transition-all duration-200 hover:scale-[1.02]"
                  >
                    <div className="flex items-center gap-3">
                      <Icon
                        name="award"
                        size="md"
                        className="text-warning-600 group-hover:scale-110 transition-transform"
                      />
                      <div className="flex-1 min-w-0">
                        <Typography
                          variant="body-sm"
                          className="font-semibold truncate"
                        >
                          Trophy Case
                        </Typography>
                        <Typography
                          variant="body-xs"
                          color="muted"
                          className="truncate"
                        >
                          View achievements
                        </Typography>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => setIsTeamGoalsModalOpen(true)}
                    className="group w-full text-left hover:bg-[var(--card-emerald-bg-light)] rounded-lg p-3 transition-all duration-200 hover:scale-[1.02] mt-2"
                  >
                    <div className="flex items-center gap-3">
                      <Icon
                        name="target"
                        size="md"
                        className="card-emerald-icon group-hover:scale-110 transition-transform"
                      />
                      <div className="flex-1 min-w-0">
                        <Typography
                          variant="body-sm"
                          className="font-semibold truncate"
                        >
                          Team Goals
                        </Typography>
                        <Typography
                          variant="body-xs"
                          color="muted"
                          className="truncate"
                        >
                          Track progress
                        </Typography>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => setIsTeamVotesModalOpen(true)}
                    className="group w-full text-left hover:bg-[var(--card-indigo-bg-light)] rounded-lg p-3 transition-all duration-200 hover:scale-[1.02] mt-2"
                  >
                    <div className="flex items-center gap-3">
                      <Icon
                        name="message"
                        size="md"
                        className="card-indigo-icon group-hover:scale-110 transition-transform"
                      />
                      <div className="flex-1 min-w-0">
                        <Typography
                          variant="body-sm"
                          className="font-semibold truncate"
                        >
                          Team Votes
                        </Typography>
                        <Typography
                          variant="body-xs"
                          color="muted"
                          className="truncate"
                        >
                          Voice your opinion
                        </Typography>
                      </div>
                    </div>
                  </button>
                </Card>
              </aside>

              {/* Center Feed - PROMINENT POSITION */}
              <section className="lg:col-span-6 space-y-4">
                {/* Mobile Quick Actions Bar - Swipeable Icons */}
                <div className="lg:hidden flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
                  <button
                    onClick={() => setIsTrophyCaseModalOpen(true)}
                    className="flex-shrink-0 flex flex-col items-center gap-1 px-4 py-3 bg-primary rounded-xl shadow-md shadow-orange-500/10 hover:shadow-lg hover:shadow-orange-500/20 hover:scale-105 transition-all duration-200"
                  >
                    <Icon name="award" size="sm" className="text-warning-600" />
                    <span className="text-xs font-medium text-secondary">
                      Trophies
                    </span>
                  </button>
                  <button
                    onClick={() => setIsTeamGoalsModalOpen(true)}
                    className="flex-shrink-0 flex flex-col items-center gap-1 px-4 py-3 bg-primary rounded-xl shadow-md shadow-[var(--card-emerald-shadow)] hover:shadow-lg hover:shadow-[var(--card-emerald-shadow-hover)] hover:scale-105 transition-all duration-200"
                  >
                    <Icon
                      name="target"
                      size="sm"
                      className="card-emerald-icon"
                    />
                    <span className="text-xs font-medium text-secondary">
                      Goals
                    </span>
                  </button>
                  <button
                    onClick={() => setIsTeamVotesModalOpen(true)}
                    className="flex-shrink-0 flex flex-col items-center gap-1 px-4 py-3 bg-primary rounded-xl shadow-md hover:shadow-lg transition-all"
                  >
                    <Icon
                      name="message"
                      size="sm"
                      className="card-indigo-icon"
                    />
                    <span className="text-xs font-medium text-secondary">
                      Votes
                    </span>
                  </button>
                  <button
                    onClick={() => setIsSeasonStatsModalOpen(true)}
                    className="flex-shrink-0 flex flex-col items-center gap-1 px-4 py-3 bg-primary rounded-xl shadow-md hover:shadow-lg transition-all"
                  >
                    <Icon
                      name="trending-up"
                      size="sm"
                      className="card-purple-icon"
                    />
                    <span className="text-xs font-medium text-secondary">
                      Stats
                    </span>
                  </button>
                </div>

                {/* Feed takes center stage - No distractions */}
                <AnnouncementsList teamId={teamId || ""} />
              </section>

              {/* Right Sidebar - Calendar & Roster */}
              <aside className="lg:col-span-3 space-y-4">
                <div className="sticky top-6 space-y-4">
                  <TeamCalendar teamId={teamId || ""} />

                  <Card className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Icon
                          name="users"
                          size="sm"
                          className="card-blue-icon"
                        />
                        <Typography
                          variant="headline-sm"
                          className="font-semibold"
                        >
                          Roster
                        </Typography>
                      </div>
                      <div className="flex items-center gap-2">
                        <Typography variant="body-xs" color="muted">
                          {teamData?.memberCount || 0}
                        </Typography>
                        <Button
                          variant="ghost"
                          size="xs"
                          onClick={() => navigate(`/team/${teamId}/edit`)}
                          className="gap-1"
                        >
                          <Icon name="edit" size="xs" />
                          Edit
                        </Button>
                      </div>
                    </div>
                    <PlayerRosterContainer teamId={teamId || ""} compact />
                  </Card>
                </div>
              </aside>
            </div>
          </main>
        </CollaborationProvider>

        {/* Modal Components (lazy loaded with Suspense) */}
        <Suspense fallback={null}>
          <TeamTrophyCaseModal
            isOpen={isTrophyCaseModalOpen}
            onClose={() => setIsTrophyCaseModalOpen(false)}
            teamId={teamId || ""}
          />
        </Suspense>
        <Suspense fallback={null}>
          <SeasonStatsModal
            isOpen={isSeasonStatsModalOpen}
            onClose={() => setIsSeasonStatsModalOpen(false)}
            teamId={teamId || ""}
          />
        </Suspense>
        <Suspense fallback={null}>
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
        </Suspense>
        <Suspense fallback={null}>
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
        </Suspense>
      </div>
    </div>
  );
});

TeamBulletin.displayName = "TeamBulletin";

export { TeamBulletin };
export default TeamBulletin;
