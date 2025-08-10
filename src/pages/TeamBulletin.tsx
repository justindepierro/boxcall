import React, { useEffect, useState } from "react";
import { Button } from "../components/ui";
import { useTeamMembershipRole } from "../hooks/useTeamMembershipRole";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../app/auth-store";
import { useDevMode } from "../app/dev-mode-hooks";
import { usePermissions } from "../hooks/usePermissions";
import { Typography } from "../components/design-system";
import { Icon } from "../components/ui/Icon/Icon";
import { LogoIcon } from "../components/ui/Logo";
import { supabase } from "../lib/supabase";
import { TeamBulletinHeader } from "../components/team-dashboard/layout/TeamBulletinHeader";
import { TeamBulletinLeftPanel } from "../components/team-dashboard/layout/TeamBulletinLeftPanel";
import { TeamBulletinFeedPanel } from "../components/team-dashboard/layout/TeamBulletinFeedPanel";
import { TeamBulletinRightPanel } from "../components/team-dashboard/layout/TeamBulletinRightPanel";

// Team Bulletin Page (modular layout version)
export const TeamBulletin: React.FC = () => {
  const { teamId } = useParams<{ teamId: string }>();
  const { user, profile } = useAuth();
  const { devMode } = useDevMode();
  const { isSuperAdmin, canCreateTeamUnlimited } = usePermissions();
  const navigate = useNavigate();
  // Resolve authoritative team membership role ASAP (must be before early returns to satisfy Rules of Hooks)
  const { data: membershipRole } = useTeamMembershipRole(teamId, profile?.id);

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

  function computeAcademicYearDisplay(baseYear?: number) {
    if (typeof baseYear === "number" && !isNaN(baseYear)) {
      return `${baseYear}-${baseYear + 1}`;
    }
    const now = new Date();
    const startYear =
      now.getMonth() >= 6 ? now.getFullYear() : now.getFullYear() - 1;
    return `${startYear}-${startYear + 1}`;
  }

  const buildMockTeam = (): TeamData => ({
    id: teamId || "unknown",
    name: "BoxCall Dev Team",
    season: computeAcademicYearDisplay(),
    colors: { primary: "#00A86B", secondary: "#1E3A8A" },
    logo: "eagle",
    record: { wins: 8, losses: 2 },
    nextGame: "Friday vs. Central Lions",
    memberCount: 35,
  });

  const [teamData, setTeamData] = useState<TeamData | null>(
    devMode === "blank_slate" ? null : buildMockTeam()
  );
  const loadingInitial = !user || !profile || !teamId;

  const handleCreateTeam = () => {
    console.log("team.create.attempt", {
      isSuperAdmin,
      canCreateTeamUnlimited,
    });
    navigate("/create-team");
  };
  const handleJoinTeam = () => {
    console.log("team.join.attempt");
    navigate("/join-team");
  };

  // Fetch real team if exists
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!teamId) return;
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
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [teamId]);

  if (loadingInitial) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Typography variant="headline-lg" color="muted">
            Loading team dashboard...
          </Typography>
        </div>
      </div>
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

  const userRole = membershipRole || profile.role || "player";
  const isCoach = userRole === "coach" || userRole === "head_coach";

  return (
    <>
      {/* Skip link for keyboard users */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 bg-jade-600 text-text-inverse px-4 py-2 rounded-md z-50"
      >
        Skip to main content
      </a>
      <main
        id="main-content"
        role="main"
        aria-labelledby="team-dashboard-heading"
        className="py-4"
      >
        <div className="px-4 sm:px-6 lg:px-8">
          <TeamBulletinHeader
            headingId="team-dashboard-heading"
            teamId={teamId}
            teamName={teamData.name}
            seasonDisplay={teamData.season}
            record={teamData.record}
            memberCount={teamData.memberCount}
            nextGame={teamData.nextGame}
            schoolName={teamData.school_name}
            mascot={teamData.mascot}
            isCoach={isCoach}
            logoUrl={teamData.logo_url || undefined}
          />
          <div className="grid grid-cols-1 lg:grid-cols-4 bc-grid-gap">
            <TeamBulletinLeftPanel teamId={teamId} userRole={userRole} />
            <TeamBulletinFeedPanel teamId={teamId} userRole={userRole} />
            <TeamBulletinRightPanel teamId={teamId} />
          </div>
        </div>
      </main>
    </>
  );
};
export default TeamBulletin;
