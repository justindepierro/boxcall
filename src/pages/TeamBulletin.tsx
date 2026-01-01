import React, { useState, useMemo, useCallback, lazy, Suspense } from "react";
import { useParams, useNavigate } from "react-router-dom";

import { useAuth } from "../app/auth-store";
import { useDevMode } from "../app/dev-mode-hooks";
import { AnnouncementsList } from "../components/team/AnnouncementsList";
import { usePermissions } from "../hooks/usePermissions";
import { useTeamMembershipRole } from "../hooks/useTeamMembershipRole";
import { useTeamActivity } from "../hooks/useTeamActivity";
import { ROUTES } from "../routes/paths";
import { useRoles } from "../hooks/useRoles";
import { LoadingScreen } from "../components/ui/LoadingScreen";

// Extracted components and hooks
import { useTeamBulletinData, type TeamData } from "./TeamBulletin/hooks";
import {
  NoTeamState,
  SelectTeamState,
  TeamNotFoundState,
  TeamBulletinHeader,
  LeftSidebar,
  RightSidebar,
  MobileQuickActions,
} from "./TeamBulletin/components";

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

function getLoadingSubtitle(flags: {
  isRoleContextLoading: boolean;
  isMembershipLoading: boolean;
  isTeamDataLoading: boolean;
  loadingInitial: boolean;
}): string {
  return (
    [
      flags.isRoleContextLoading && "Checking team access...",
      flags.isMembershipLoading && "Validating membership...",
      flags.isTeamDataLoading && "Loading team information...",
      flags.loadingInitial && "Initializing...",
    ].filter(Boolean)[0] || "Please wait..."
  );
}

function getModalUserRole(
  profileRole: string | null | undefined,
  userRole: string
): "coach" | "player" | "family" {
  if (profileRole === "admin") return "coach";
  if (userRole === "coach" || userRole === "player" || userRole === "family") {
    return userRole;
  }
  return "player";
}

type TeamBulletinView =
  | "loading"
  | "noTeam"
  | "selectTeam"
  | "teamNotFound"
  | "ready";

function getTeamBulletinView(params: {
  isLoading: boolean;
  teamId: string | undefined;
  hasAnyTeam: boolean;
  teamData: unknown;
}): TeamBulletinView {
  if (params.isLoading) return "loading";
  if (!params.teamId) return params.hasAnyTeam ? "selectTeam" : "noTeam";
  if (!params.teamData) return "teamNotFound";
  return "ready";
}

function TeamBulletinReady({
  teamId,
  teamData,
  activityStats,
  user,
  profile,
  userRole,
  isCoach: _isCoach,
  openSeasonStats,
  openTrophyCase,
  openTeamGoals,
  openTeamVotes,
  isTrophyCaseModalOpen,
  setIsTrophyCaseModalOpen,
  isSeasonStatsModalOpen,
  setIsSeasonStatsModalOpen,
  isTeamGoalsModalOpen,
  setIsTeamGoalsModalOpen,
  isTeamVotesModalOpen,
  setIsTeamVotesModalOpen,
}: {
  teamId: string;
  teamData: TeamData;
  activityStats: ReturnType<typeof useTeamActivity>;
  user: { id?: string } | null | undefined;
  profile:
    | {
        role?: string | null;
        display_name?: string | null;
        full_name?: string | null;
      }
    | null
    | undefined;
  userRole: string;
  isCoach: boolean;
  openSeasonStats: () => void;
  openTrophyCase: () => void;
  openTeamGoals: () => void;
  openTeamVotes: () => void;
  isTrophyCaseModalOpen: boolean;
  setIsTrophyCaseModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isSeasonStatsModalOpen: boolean;
  setIsSeasonStatsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isTeamGoalsModalOpen: boolean;
  setIsTeamGoalsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isTeamVotesModalOpen: boolean;
  setIsTeamVotesModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
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

        <TeamBulletinHeader
          teamData={teamData}
          activityStats={activityStats}
          onOpenSeasonStats={openSeasonStats}
        />

        <main
          id="main-content"
          role="main"
          aria-labelledby="team-dashboard-heading"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <LeftSidebar
              teamId={teamId}
              userRole={userRole}
              onOpenTrophyCase={openTrophyCase}
              onOpenTeamGoals={openTeamGoals}
              onOpenTeamVotes={openTeamVotes}
            />

            <section className="lg:col-span-6 space-y-4">
              <MobileQuickActions
                onOpenTrophyCase={openTrophyCase}
                onOpenTeamGoals={openTeamGoals}
                onOpenTeamVotes={openTeamVotes}
                onOpenSeasonStats={openSeasonStats}
              />
              <AnnouncementsList teamId={teamId} />
            </section>

            <RightSidebar
              teamId={teamId}
              memberCount={teamData?.memberCount || 0}
            />
          </div>
        </main>

        {/* Modal Components (lazy loaded with Suspense) */}
        <Suspense fallback={null}>
          <TeamTrophyCaseModal
            isOpen={isTrophyCaseModalOpen}
            onClose={() => setIsTrophyCaseModalOpen(false)}
            teamId={teamId}
          />
        </Suspense>
        <Suspense fallback={null}>
          <SeasonStatsModal
            isOpen={isSeasonStatsModalOpen}
            onClose={() => setIsSeasonStatsModalOpen(false)}
            teamId={teamId}
          />
        </Suspense>
        <Suspense fallback={null}>
          <TeamGoalsModal
            isOpen={isTeamGoalsModalOpen}
            onClose={() => setIsTeamGoalsModalOpen(false)}
            widgetId="team-bulletin-team-goals-modal"
            userRole={getModalUserRole(profile?.role, userRole)}
            userId={user?.id || "anonymous"}
            teamId={teamId}
          />
        </Suspense>
        <Suspense fallback={null}>
          <TeamVotesModal
            isOpen={isTeamVotesModalOpen}
            onClose={() => setIsTeamVotesModalOpen(false)}
            widgetId="team-bulletin-team-votes-modal"
            userRole={getModalUserRole(profile?.role, userRole)}
            userId={user?.id || "anonymous"}
            userName={
              profile?.display_name || profile?.full_name || "Team Member"
            }
          />
        </Suspense>
      </div>
    </div>
  );
}

const TeamBulletin: React.FC = React.memo(() => {
  const { teamId } = useParams<{ teamId: string }>();
  const { user, profile } = useAuth();
  const { roleContext } = useRoles();
  const { devMode } = useDevMode();
  const { isSuperAdmin } = usePermissions();
  const navigate = useNavigate();
  const membership = useTeamMembershipRole(teamId, profile?.id);
  const membershipRole = membership.data;
  const activityStats = useTeamActivity(teamId || "");

  // Team data from extracted hook
  const { teamData, isTeamDataLoading } = useTeamBulletinData({
    teamId,
    devMode,
  });

  // Modal states
  const [isTrophyCaseModalOpen, setIsTrophyCaseModalOpen] = useState(false);
  const [isSeasonStatsModalOpen, setIsSeasonStatsModalOpen] = useState(false);
  const [isTeamGoalsModalOpen, setIsTeamGoalsModalOpen] = useState(false);
  const [isTeamVotesModalOpen, setIsTeamVotesModalOpen] = useState(false);

  // Loading states
  const loadingInitial = useMemo(
    () => !user || !profile || !teamId,
    [user, profile, teamId]
  );
  const isRoleContextLoading = !roleContext && Boolean(user && profile);
  const isMembershipLoading = membership.isLoading;
  const isLoading =
    loadingInitial ||
    isRoleContextLoading ||
    isMembershipLoading ||
    isTeamDataLoading;

  // Navigation handlers
  const handleCreateTeam = useCallback(() => {
    navigate(ROUTES.CREATE_TEAM);
  }, [navigate]);

  const handleJoinTeam = useCallback(() => {
    navigate(ROUTES.JOIN_TEAM);
  }, [navigate]);

  // Computed values
  const hasAnyTeam = useMemo(
    () => (roleContext?.teamMemberships.length ?? 0) > 0,
    [roleContext?.teamMemberships.length]
  );
  const userRole = membershipRole ?? profile?.role ?? "player";
  const isCoach = userRole === "coach" || userRole === "head_coach";

  const view = getTeamBulletinView({
    isLoading,
    teamId,
    hasAnyTeam,
    teamData,
  });

  // Modal handlers
  const openTrophyCase = useCallback(() => setIsTrophyCaseModalOpen(true), []);
  const openSeasonStats = useCallback(
    () => setIsSeasonStatsModalOpen(true),
    []
  );
  const openTeamGoals = useCallback(() => setIsTeamGoalsModalOpen(true), []);
  const openTeamVotes = useCallback(() => setIsTeamVotesModalOpen(true), []);

  if (view !== "ready") {
    if (view === "loading") {
      const subtitle = getLoadingSubtitle({
        isRoleContextLoading,
        isMembershipLoading,
        isTeamDataLoading,
        loadingInitial,
      });

      return (
        <LoadingScreen title="Loading Team Dashboard" subtitle={subtitle} />
      );
    }

    if (view === "noTeam") {
      return (
        <NoTeamState
          onCreateTeam={handleCreateTeam}
          onJoinTeam={handleJoinTeam}
        />
      );
    }

    if (view === "selectTeam") {
      return <SelectTeamState />;
    }

    return (
      <TeamNotFoundState
        devMode={devMode}
        isSuperAdmin={isSuperAdmin}
        onCreateTeam={handleCreateTeam}
        onJoinTeam={handleJoinTeam}
      />
    );
  }

  return (
    <TeamBulletinReady
      teamId={teamId as string}
      teamData={teamData as TeamData}
      activityStats={activityStats}
      user={user}
      profile={profile}
      userRole={userRole}
      isCoach={isCoach}
      openSeasonStats={openSeasonStats}
      openTrophyCase={openTrophyCase}
      openTeamGoals={openTeamGoals}
      openTeamVotes={openTeamVotes}
      isTrophyCaseModalOpen={isTrophyCaseModalOpen}
      setIsTrophyCaseModalOpen={setIsTrophyCaseModalOpen}
      isSeasonStatsModalOpen={isSeasonStatsModalOpen}
      setIsSeasonStatsModalOpen={setIsSeasonStatsModalOpen}
      isTeamGoalsModalOpen={isTeamGoalsModalOpen}
      setIsTeamGoalsModalOpen={setIsTeamGoalsModalOpen}
      isTeamVotesModalOpen={isTeamVotesModalOpen}
      setIsTeamVotesModalOpen={setIsTeamVotesModalOpen}
    />
  );
});

TeamBulletin.displayName = "TeamBulletin";

export { TeamBulletin };
export default TeamBulletin;
