import { useState, useEffect, useCallback, useRef } from "react";

import { useAuth } from "../app/auth-store";
import { useActiveTeamStore } from "../stores/activeTeamStore";
import { table } from "../data/supabase/db";
import { supabase } from "../lib/supabase";
import { NetworkResilience } from "../utils/networkResilience";
import { debug, warn, error as logError } from "../utils/logger";
import type { Formation } from "../types/formation";

type RlsPlayUpdateDiagnostics = {
  playId: string;
  authUserId: string | null;
  playbookId: string | null;
  teamId: string | null;
  profileRole: string | null;
  teamMember: { team_role?: string | null; status?: string | null } | null;
  coachingCheck: boolean | null;
  notes: string[];
};

// eslint-disable-next-line complexity
async function getPlayUpdateRlsDiagnostics(
  playId: string
): Promise<RlsPlayUpdateDiagnostics> {
  const notes: string[] = [];

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  const authUserId = user?.id ?? null;
  if (authError) notes.push(`auth.getUser error: ${authError.message}`);
  if (!authUserId) notes.push("No authenticated user");

  // Find playbookId (if readable)
  let playbookId: string | null = null;
  try {
    const { data, error } = await table("plays")
      .select("playbook_id")
      .eq("id", playId)
      .limit(1);

    if (error) notes.push(`plays select error: ${error.message}`);
    playbookId =
      Array.isArray(data) && data.length > 0 ? data[0]?.playbook_id : null;
    if (!playbookId) notes.push("Could not resolve playbook_id for play");
  } catch {
    notes.push("Exception while resolving playbook_id");
  }

  // Find teamId (if readable)
  let teamId: string | null = null;
  if (playbookId) {
    try {
      const { data, error } = await table("playbooks")
        .select("team_id")
        .eq("id", playbookId)
        .limit(1);

      if (error) notes.push(`playbooks select error: ${error.message}`);
      teamId = Array.isArray(data) && data.length > 0 ? data[0]?.team_id : null;
      if (!teamId) notes.push("Could not resolve team_id for playbook");
    } catch {
      notes.push("Exception while resolving team_id");
    }
  }

  // Read profile role (if permitted)
  let profileRole: string | null = null;
  if (authUserId) {
    try {
      const { data, error } = await table("profiles")
        .select("role")
        .eq("id", authUserId)
        .limit(1);
      if (error) notes.push(`profiles select error: ${error.message}`);
      profileRole =
        Array.isArray(data) && data.length > 0 ? data[0]?.role : null;
    } catch {
      notes.push("Exception while reading profiles.role");
    }
  }

  // Read team membership row (if permitted)
  let teamMember: RlsPlayUpdateDiagnostics["teamMember"] = null;
  if (authUserId && teamId) {
    try {
      const { data, error } = await table("team_members")
        .select("team_role,status")
        .eq("team_id", teamId)
        .eq("user_id", authUserId)
        .limit(1);
      if (error) notes.push(`team_members select error: ${error.message}`);
      teamMember =
        Array.isArray(data) && data.length > 0
          ? {
              team_role: data[0]?.team_role,
              status: data[0]?.status,
            }
          : null;
      if (!teamMember)
        notes.push("No team_members row found (or not readable)");
    } catch {
      notes.push("Exception while reading team_members row");
    }
  }

  // Ask DB helper directly
  let coachingCheck: boolean | null = null;
  if (authUserId && teamId) {
    try {
      const { data, error } = await supabase.rpc("is_coaching_team_member", {
        p_user_id: authUserId,
        p_team_id: teamId,
      });
      if (error)
        notes.push(`rpc is_coaching_team_member error: ${error.message}`);
      coachingCheck = typeof data === "boolean" ? data : null;
      if (coachingCheck === null)
        notes.push("is_coaching_team_member returned non-boolean result");
    } catch {
      notes.push("Exception while calling is_coaching_team_member RPC");
    }
  }

  return {
    playId,
    authUserId,
    playbookId,
    teamId,
    profileRole,
    teamMember,
    coachingCheck,
    notes,
  };
}

interface Team {
  id: string;
  name: string;
  school_name?: string;
  mascot?: string;
  season_year?: number;
  created_at: string;
  updated_at: string;
}

interface Playbook {
  id: string;
  team_id: string;
  name: string;
  description?: string;
  is_active: boolean;
  play_count: number;
  created_at: string;
  updated_at: string;
}

// Database play type (raw from Supabase)
interface DatabasePlay {
  id: string;
  playbook_id: string;
  formation: string;
  play_name: string;
  one_word_play?: string;
  p_type: string;
  personnel?: string;
  f_type?: string;
  f_dir?: string;
  protection?: string;
  p_dir?: string;
  r_str?: string;
  p_str?: string;
  pref_down?: string;
  pref_dis?: string;
  pref_hash?: string;
  pref_cov?: string;
  pref_front?: string;
  ftag1?: string;
  ftag2?: string;
  p_tag1?: string;
  p_tag2?: string;
  // NEW - Play metadata arrays
  tags?: string[] | null;
  key_positions?: string[] | null;
  key_players?: string[] | null;
  flags?: string[] | null;
  back_align?: string;
  back_left_of_qb?: boolean;
  back_right_of_qb?: boolean;
  shift?: string;
  motion?: string;
  key_player1?: string;
  key_player2?: string;
  check_into?: string;
  notes?: string;
  confidence_base?: number;
  times_called?: number;
  times_successful?: number;
  diagram_url?: string | null; // Matches DB schema - see src/types/supabase-schema.ts:840
  diagram_image_url?: string | null; // Uploaded diagram image URL
  diagram_data?: any | null; // JSONB field for Pixi.js diagram data
  formation_id?: string | null;
  formation_direction?: "base" | "left" | "right" | null;
  wristband_number?: string | null;
  created_at: string;
  updated_at: string;
}

const PAGE_SIZE = 50;
const TEAM_FIELDS =
  "id, name, school_name, mascot, season_year, created_at, updated_at";
const PLAYBOOK_FIELDS =
  "id, team_id, name, description, is_active, play_count, created_at, updated_at";
const PLAY_SELECT_FIELDS =
  "id, playbook_id, formation, play_name, one_word_play, p_type, personnel, f_type, f_dir, formation_id, formation_direction, p_dir, protection, r_str, p_str, pref_down, pref_dis, pref_hash, pref_cov, pref_front, ftag1, ftag2, p_tag1, p_tag2, tags, key_positions, key_players, flags, back_align, back_left_of_qb, back_right_of_qb, shift, motion, key_player1, key_player2, check_into, notes, diagram_url, diagram_image_url, wristband_number, confidence_base, times_called, times_successful, created_at, updated_at";

// eslint-disable-next-line max-lines-per-function -- Complex data fetching with multiple parallel queries
function useTeamsDataInitialLoadEffect({
  teamId,
  refreshTrigger,
  setTeams,
  setPlaybooks,
  setPlays,
  setFormations,
  setLoading,
  setError,
  setPlaysPage,
  setHasMorePlays,
  setTotalPlaysCount,
  setPlayTypeCounts,
  playbookId,
}: {
  teamId: string | null;
  refreshTrigger: number;
  setTeams: React.Dispatch<React.SetStateAction<Team[]>>;
  setPlaybooks: React.Dispatch<React.SetStateAction<Playbook[]>>;
  setPlays: React.Dispatch<React.SetStateAction<DatabasePlay[]>>;
  setFormations: React.Dispatch<React.SetStateAction<Formation[]>>;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
  setPlaysPage: React.Dispatch<React.SetStateAction<number>>;
  setHasMorePlays: React.Dispatch<React.SetStateAction<boolean>>;
  setTotalPlaysCount: React.Dispatch<React.SetStateAction<number | null>>;
  setPlayTypeCounts: React.Dispatch<
    React.SetStateAction<{
      pass: number;
      run: number;
      rpo: number;
      playAction: number;
    } | null>
  >;
  playbookId: string | null;
}) {
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;
    let isMounted = true;

    const resetScopedState = () => {
      setTeams([]);
      setPlaybooks([]);
      setPlays([]);
      setFormations([]);
      setTotalPlaysCount(null);
      setHasMorePlays(false);
      setPlaysPage(0);
    };

    if (!teamId) {
      resetScopedState();
      setLoading(false);
      setError(null);
      return () => {
        controller.abort();
        if (abortControllerRef.current === controller) {
          abortControllerRef.current = null;
        }
      };
    }

    const teamIdForQuery: string = teamId;

    // eslint-disable-next-line complexity -- Complex data fetching with multiple parallel queries
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);
        debug("[useTeamsData] Starting fetchData for teamId:", teamId);

        const [teamsResult, playbooksResult] = await Promise.all([
          table("teams")
            .select(TEAM_FIELDS)
            .eq("id", teamIdForQuery)
            .order("created_at", { ascending: false }),
          table("playbooks")
            .select(PLAYBOOK_FIELDS)
            .eq("team_id", teamIdForQuery)
            .order("created_at", { ascending: false }),
        ]);

        if (!isMounted || controller.signal.aborted) return;

        if (teamsResult.error) {
          logError("[useTeamsData] Error fetching teams:", teamsResult.error);
          setError(`Failed to fetch teams: ${teamsResult.error.message}`);
          setLoading(false);
          return;
        }
        setTeams(
          (teamsResult.data || []).map((t) => ({
            id: String((t as any).id),
            name: String((t as any).name),
            school_name: (t as any).school_name ?? undefined,
            mascot: (t as any).mascot ?? undefined,
            season_year: (t as any).season_year ?? undefined,
            created_at: String((t as any).created_at ?? ""),
            updated_at: String((t as any).updated_at ?? ""),
          }))
        );

        let scopedPlaybooks: any[] = [];
        if (playbooksResult.error) {
          warn("Playbooks table not available:", playbooksResult.error.message);
          setPlaybooks([]);
        } else {
          scopedPlaybooks = (playbooksResult.data || []).map((pb: any) => ({
            ...pb,
            play_count: 0,
          }));
          setPlaybooks(scopedPlaybooks);
        }

        const playbookIds = scopedPlaybooks.map((pb) => pb.id);
        if (playbookIds.length === 0 && !playbookId) {
          debug("[useTeamsData] No playbooks found");
          setFormations([]);
          setPlays([]);
          setTotalPlaysCount(0);
          setHasMorePlays(false);
          setPlaysPage(0);
          setLoading(false);
          return;
        }

        // If a playbookId is explicitly requested (e.g., PlayGrid scope), honor it
        // even if the playbook list hasn't populated yet.
        const scopedPlaybookIds = playbookId ? [playbookId] : playbookIds;

        const [
          formationsResult,
          playsResult,
          playsCountResult,
          passCountResult,
          runCountResult,
          rpoCountResult,
          playActionCountResult,
        ] = await Promise.all([
          table("formations")
            .select("*")
            .in("playbook_id", scopedPlaybookIds)
            .order("created_at", { ascending: false }),
          table("plays")
            .select(PLAY_SELECT_FIELDS)
            .in("playbook_id", scopedPlaybookIds)
            .order("created_at", { ascending: false })
            .limit(PAGE_SIZE),
          // Get actual total count from database
          table("plays")
            .select("id", { count: "exact", head: true })
            .in("playbook_id", scopedPlaybookIds),
          // Get play type counts
          table("plays")
            .select("id", { count: "exact", head: true })
            .in("playbook_id", scopedPlaybookIds)
            .ilike("p_type", "pass"),
          table("plays")
            .select("id", { count: "exact", head: true })
            .in("playbook_id", scopedPlaybookIds)
            .ilike("p_type", "run"),
          table("plays")
            .select("id", { count: "exact", head: true })
            .in("playbook_id", scopedPlaybookIds)
            .ilike("p_type", "rpo"),
          table("plays")
            .select("id", { count: "exact", head: true })
            .in("playbook_id", scopedPlaybookIds)
            .ilike("p_type", "%play action%"),
        ]);

        if (!isMounted || controller.signal.aborted) return;

        if (formationsResult.error) {
          warn(
            "Formations table not available:",
            formationsResult.error.message
          );
        } else {
          setFormations((formationsResult.data || []) as Formation[]);
        }

        if (playsResult.error) {
          warn("Plays table not available:", playsResult.error.message);
        } else {
          const playsData = (playsResult.data || []) as DatabasePlay[];
          if (import.meta.env.DEV) {
            debug("[useTeamsData] Plays fetched", {
              teamId: teamIdForQuery,
              requestedPlaybookId: playbookId,
              scopedPlaybookIds,
              playsCount: playsData.length,
              totalCount: playsCountResult.count,
              samplePlaybookIds: Array.from(
                new Set(
                  playsData.slice(0, 10).map((p) => (p as any).playbook_id)
                )
              ),
            });
          }
          debug(
            "[useTeamsData] Loaded",
            playsData.length,
            "plays, total:",
            playsCountResult.count
          );
          setHasMorePlays(playsData.length === PAGE_SIZE);
          setPlays(playsData);
          // Use actual count from database, fallback to loaded count
          setTotalPlaysCount(playsCountResult.count ?? playsData.length);
          // Set play type counts from database
          setPlayTypeCounts({
            pass: passCountResult.count ?? 0,
            run: runCountResult.count ?? 0,
            rpo: rpoCountResult.count ?? 0,
            playAction: playActionCountResult.count ?? 0,
          });
        }

        setPlaysPage(0);
        setLoading(false);
      } catch (err) {
        if (controller.signal.aborted || !isMounted) {
          return;
        }
        logError("Unexpected error in fetchData:", err);
        setError("An unexpected error occurred while fetching data");
        setLoading(false);
      }
    }

    fetchData();

    return () => {
      isMounted = false;
      controller.abort();
      if (abortControllerRef.current === controller) {
        abortControllerRef.current = null;
      }
    };
  }, [
    refreshTrigger,
    teamId,
    setTeams,
    setPlaybooks,
    setPlays,
    setFormations,
    setLoading,
    setError,
    setPlaysPage,
    setHasMorePlays,
    setTotalPlaysCount,
    setPlayTypeCounts,
    playbookId,
  ]);
}

export function useTeamsData(
  teamIdOverride?: string | null,
  options?: { playbookId?: string | null }
) {
  const [teams, setTeams] = useState<Team[]>([]);
  const [playbooks, setPlaybooks] = useState<Playbook[]>([]);
  const [plays, setPlays] = useState<DatabasePlay[]>([]);
  const [formations, setFormations] = useState<Formation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { user: _user } = useAuth(); // DEMO MODE: Not used during demo
  const activeTeamId = useActiveTeamStore((state) => state.activeTeamId);
  const teamId = teamIdOverride ?? activeTeamId;

  // Pagination state for plays
  const [playsPage, setPlaysPage] = useState(0);
  const [hasMorePlays, setHasMorePlays] = useState(true);
  const [loadingMorePlays, setLoadingMorePlays] = useState(false);
  const [totalPlaysCount, setTotalPlaysCount] = useState<number | null>(null);

  // Play type counts from database (for accurate stats)
  const [playTypeCounts, setPlayTypeCounts] = useState<{
    pass: number;
    run: number;
    rpo: number;
    playAction: number;
  } | null>(null);

  // Use main supabase client (now configured with service role key for demo)

  // Function to manually refresh data (resets pagination)
  const refreshData = useCallback(() => {
    setPlaysPage(0);
    setHasMorePlays(true);
    setPlays([]);
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  // Function to update a play
  const updatePlay = useCallback(
    async (playId: string, updates: Partial<DatabasePlay>) => {
      try {
        debug("[useTeamsData] Updating play:", { playId, updates });
        // NOTE: Avoid `.single()`/`.maybeSingle()` here.
        // When RLS blocks the update (0 rows), PostgREST can return 406 if
        // the client requests an object response. Returning an array avoids
        // 406 and lets us handle 0 updated rows explicitly.
        const { data, error } = await table("plays")
          .update(updates)
          .eq("id", playId)
          .select();

        if (error) {
          logError("[useTeamsData] Error updating play:", error);
          throw new Error(`Failed to update play: ${error.message}`);
        }

        const updated = Array.isArray(data) ? data[0] : null;

        // If no row returned, the play doesn't exist or RLS blocked it
        if (!updated) {
          // Try to distinguish not-found vs read-but-not-write (common with RLS)
          const { data: readable, error: readableError } = await table("plays")
            .select("id")
            .eq("id", playId)
            .limit(1);

          if (
            !readableError &&
            Array.isArray(readable) &&
            readable.length > 0
          ) {
            const diag = await getPlayUpdateRlsDiagnostics(playId);
            logError(
              "[useTeamsData] Play update blocked by permissions (RLS)",
              {
                playId,
                diagnostics: diag,
              }
            );

            const detail = {
              authUserId: diag.authUserId,
              teamId: diag.teamId,
              profileRole: diag.profileRole,
              teamMember: diag.teamMember,
              coachingCheck: diag.coachingCheck,
              notes: diag.notes,
            };

            throw new Error(
              `You can view this play, but UPDATE was blocked by RLS. Details: ${JSON.stringify(
                detail
              )}`
            );
          }

          logError("[useTeamsData] Play not found or access denied:", playId);
          throw new Error(
            "Play not found or you don't have permission to update it"
          );
        }

        debug("[useTeamsData] Database returned:", updated);
        setPlays((prevPlays) =>
          prevPlays.map((play) =>
            play.id === playId ? (updated as DatabasePlay) : play
          )
        );
        return updated;
      } catch (err) {
        logError("[useTeamsData] Error in updatePlay:", err);
        throw err;
      }
    },
    []
  );

  useTeamsDataInitialLoadEffect({
    teamId,
    refreshTrigger,
    setTeams,
    setPlaybooks,
    setPlays,
    setFormations,
    setLoading,
    setError,
    setPlaysPage,
    setHasMorePlays,
    setTotalPlaysCount,
    setPlayTypeCounts,
    playbookId: options?.playbookId ?? null,
  });

  // Function to load more plays (for infinite scroll)
  const loadMorePlays = useCallback(async () => {
    if (loadingMorePlays || !hasMorePlays || !teamId) {
      return;
    }

    const playbookIds = playbooks.map((pb) => pb.id);
    if (playbookIds.length === 0) {
      setHasMorePlays(false);
      return;
    }

    const requestedPlaybookId = options?.playbookId ?? null;
    const scopedPlaybookIds = requestedPlaybookId
      ? [requestedPlaybookId]
      : playbookIds;

    try {
      setLoadingMorePlays(true);
      const nextPage = playsPage + 1;
      const from = nextPage * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      // Query only essential fields for faster loading
      const { data, error } = await NetworkResilience.retryWithBackoff(
        async () =>
          (await table("plays")
            .select(PLAY_SELECT_FIELDS)
            .in("playbook_id", scopedPlaybookIds)
            .order("created_at", { ascending: false })
            .range(from, to)) as any
      );

      if (error) {
        logError("Error loading more plays:", error);
        setError(`Failed to load more plays: ${error.message}`);
        return;
      }

      const newPlays = (data || []) as DatabasePlay[];

      // Append new plays to existing ones
      setPlays((prevPlays) => [...prevPlays, ...newPlays]);
      setPlaysPage(nextPage);

      // Check if there are more plays to load
      setHasMorePlays(newPlays.length === PAGE_SIZE);
    } catch (err) {
      logError("Error in loadMorePlays:", err);
      setError("Failed to load more plays");
    } finally {
      setLoadingMorePlays(false);
    }
  }, [
    hasMorePlays,
    loadingMorePlays,
    options?.playbookId,
    playbooks,
    playsPage,
    teamId,
  ]);

  return {
    teams,
    playbooks,
    plays,
    formations,
    loading,
    error,
    refreshData,
    updatePlay,
    totalCount: teams.length + playbooks.length + plays.length,
    // Pagination state and functions
    hasMorePlays,
    loadingMorePlays,
    totalPlaysCount,
    loadMorePlays,
    // Play type counts from database
    playTypeCounts,
  };
}
