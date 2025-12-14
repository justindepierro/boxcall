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

// Collaboration components and provider
import { CollaborationProvider } from "../components/collaboration/CollaborationProvider";

// Extracted components and hooks
import { useTeamBulletinData } from "./TeamBulletin/hooks";
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

const TeamBulletin: React.FC = React.memo(() => {
  const { teamId } = useParams<{ teamId: string }>();
  const { user, profile } = useAuth();
  const { roleContext } = useRoles();
  const { devMode } = useDevMode();
  const { isSuperAdmin } = usePermissions();
  const navigate = useNavigate();
  const { data: membershipRole } = useTeamMembershipRole(teamId, profile?.id);
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
  const isRoleContextLoading = !roleContext && user && profile;
  const { isLoading: isMembershipLoading } = useTeamMembershipRole(
    teamId,
    profile?.id
  );
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
  const userRole = membershipRole || profile?.role || "player";
  const isCoach = userRole === "coach" || userRole === "head_coach";

  // Modal handlers
  const openTrophyCase = useCallback(() => setIsTrophyCaseModalOpen(true), []);
  const openSeasonStats = useCallback(
    () => setIsSeasonStatsModalOpen(true),
    []
  );
  const openTeamGoals = useCallback(() => setIsTeamGoalsModalOpen(true), []);
  const openTeamVotes = useCallback(() => setIsTeamVotesModalOpen(true), []);

  // Loading state
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

  // Empty states
  if (!teamId) {
    if (!hasAnyTeam) {
      return (
        <NoTeamState
          onCreateTeam={handleCreateTeam}
          onJoinTeam={handleJoinTeam}
        />
      );
    }
    return <SelectTeamState />;
  }

  if (!teamData) {
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

        <CollaborationProvider
          teamId={teamId}
          dashboardId="team-bulletin"
          user={{
            id: user?.id || "anonymous",
            name: profile?.display_name || profile?.full_name || "Team Member",
            role: (() => {
              if (profile?.role === "admin" || isCoach) return "coach";
              if (userRole === "family") return "parent";
              return "player";
            })(),
          }}
        >
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
        </CollaborationProvider>

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
            userRole={
              profile?.role === "admin"
                ? "coach"
                : (userRole as "coach" | "player" | "family") || "player"
            }
            userId={user?.id || "anonymous"}
            teamId={teamId}
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
