/**
 * usePlaybookData Hook
 *
 * SINGLE SOURCE OF TRUTH for playbook plays and counts.
 *
 * This hook consolidates:
 * - Play fetching (scoped to playbookId)
 * - Accurate database counts (not limited by pagination)
 * - Pagination support
 * - Loading/error states
 *
 * Replaces the dual useTeamsData() + manual count fetching pattern.
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { table } from "../data/supabase/db";
import { debug, warn, error as logError } from "../utils/logger";
import type { Play } from "../types/play";

const PAGE_SIZE = 50;

const PLAY_SELECT_FIELDS =
  "id, playbook_id, formation, play_name, one_word_play, p_type, personnel, f_type, f_dir, formation_id, formation_direction, p_dir, protection, r_str, p_str, pref_down, pref_dis, pref_hash, pref_cov, pref_front, ftag1, ftag2, p_tag1, p_tag2, tags, key_positions, key_players, flags, back_align, back_left_of_qb, back_right_of_qb, shift, motion, key_player1, key_player2, check_into, notes, diagram_url, diagram_image_url, wristband_number, confidence_base, times_called, times_successful, created_at, updated_at";

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
  diagram_url?: string | null;
  diagram_image_url?: string | null;
  diagram_data?: any | null;
  formation_id?: string | null;
  formation_direction?: "base" | "left" | "right" | null;
  wristband_number?: string | null;
  created_at: string;
  updated_at: string;
}

export interface PlayTypeCounts {
  pass: number;
  run: number;
  rpo: number;
  playAction: number;
}

export interface PlaybookDataResult {
  // Plays (already scoped to playbookId)
  plays: Play[];
  loading: boolean;
  error: string | null;

  // Accurate counts from database (not limited by pagination)
  totalCount: number;
  playTypeCounts: PlayTypeCounts;

  // Pagination
  hasMorePlays: boolean;
  loadingMorePlays: boolean;
  loadMorePlays: () => Promise<void>;

  // Actions
  refreshData: () => void;
  updatePlay: (playId: string, updates: Partial<Play>) => Promise<boolean>;
}

/**
 * Maps database play to full Play type
 * Uses same approach as playDataUtils.ts - spread all fields and add defaults
 */
function mapDatabasePlayToPlay(dbPlay: DatabasePlay): Play {
  // Spread all database fields, TypeScript will handle the type conversion
  // The Play interface uses optional ? for nullable fields so this works
  return {
    ...dbPlay,
    // Cast p_type to expected union type
    p_type: dbPlay.p_type as "Pass" | "Run" | "RPO" | "Play Action",
    // Provide defaults for nullable number fields
    confidence_base: dbPlay.confidence_base ?? 70,
    times_called: dbPlay.times_called ?? 0,
    times_successful: dbPlay.times_successful ?? 0,
    // Default created_by
    created_by: "system",
    // Convert string timestamps to Date objects
    created_at: new Date(dbPlay.created_at),
    updated_at: new Date(dbPlay.updated_at),
    // Convert null to undefined for optional fields
    wristband_number: dbPlay.wristband_number ?? undefined,
  } as Play;
}

/**
 * Fetches accurate counts from database using count queries
 */
async function fetchPlayTypeCounts(
  playbookId: string
): Promise<{ total: number; counts: PlayTypeCounts }> {
  const [totalResult, passResult, runResult, rpoResult, paResult] =
    await Promise.all([
      table("plays")
        .select("id", { count: "exact", head: true })
        .eq("playbook_id", playbookId),
      table("plays")
        .select("id", { count: "exact", head: true })
        .eq("playbook_id", playbookId)
        .ilike("p_type", "pass"),
      table("plays")
        .select("id", { count: "exact", head: true })
        .eq("playbook_id", playbookId)
        .ilike("p_type", "run"),
      table("plays")
        .select("id", { count: "exact", head: true })
        .eq("playbook_id", playbookId)
        .ilike("p_type", "rpo"),
      table("plays")
        .select("id", { count: "exact", head: true })
        .eq("playbook_id", playbookId)
        .ilike("p_type", "%play action%"),
    ]);

  return {
    total: totalResult.count ?? 0,
    counts: {
      pass: passResult.count ?? 0,
      run: runResult.count ?? 0,
      rpo: rpoResult.count ?? 0,
      playAction: paResult.count ?? 0,
    },
  };
}

/**
 * Single source of truth for playbook data
 *
 * @param playbookId - The playbook to fetch plays for (null = no fetch)
 * @returns PlaybookDataResult with plays, counts, pagination, and actions
 */
export function usePlaybookData(playbookId: string | null): PlaybookDataResult {
  // Core state
  const [plays, setPlays] = useState<Play[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Database counts (accurate, not limited by pagination)
  const [totalCount, setTotalCount] = useState(0);
  const [playTypeCounts, setPlayTypeCounts] = useState<PlayTypeCounts>({
    pass: 0,
    run: 0,
    rpo: 0,
    playAction: 0,
  });

  // Pagination
  const [page, setPage] = useState(0);
  const [hasMorePlays, setHasMorePlays] = useState(true);
  const [loadingMorePlays, setLoadingMorePlays] = useState(false);

  // Refresh trigger
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Abort controller for cleanup
  const abortControllerRef = useRef<AbortController | null>(null);

  // Fetch plays and counts
  useEffect(() => {
    // Set loading FIRST to prevent empty state flash
    setLoading(true);

    // Reset state when playbookId changes
    setPlays([]);
    setPage(0);
    setHasMorePlays(true);
    setTotalCount(0);
    setPlayTypeCounts({ pass: 0, run: 0, rpo: 0, playAction: 0 });

    if (!playbookId) {
      setLoading(false);
      return;
    }

    // Abort previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    let isMounted = true;
    setError(null);

    const fetchData = async () => {
      try {
        debug("[usePlaybookData] Fetching data for playbook:", playbookId);

        // Fetch plays (first page) and counts in parallel
        const [playsResult, countsResult] = await Promise.all([
          table("plays")
            .select(PLAY_SELECT_FIELDS)
            .eq("playbook_id", playbookId)
            .order("created_at", { ascending: false })
            .range(0, PAGE_SIZE - 1),
          fetchPlayTypeCounts(playbookId),
        ]);

        if (!isMounted) return;

        if (playsResult.error) {
          throw new Error(playsResult.error.message);
        }

        const fetchedPlays = (playsResult.data || []) as DatabasePlay[];
        const mappedPlays = fetchedPlays.map(mapDatabasePlayToPlay);

        debug("[usePlaybookData] Fetched:", {
          playsCount: mappedPlays.length,
          totalCount: countsResult.total,
          playTypeCounts: countsResult.counts,
        });

        setPlays(mappedPlays);
        setTotalCount(countsResult.total);
        setPlayTypeCounts(countsResult.counts);
        setHasMorePlays(mappedPlays.length === PAGE_SIZE);
        setPage(0);
        setLoading(false);
      } catch (err) {
        if (!isMounted) return;
        const message =
          err instanceof Error ? err.message : "Failed to fetch plays";
        logError("[usePlaybookData] Error:", message);
        setError(message);
        setLoading(false);
      }
    };

    fetchData();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [playbookId, refreshTrigger]);

  // Load more plays (pagination)
  const loadMorePlays = useCallback(async () => {
    if (!playbookId || loadingMorePlays || !hasMorePlays) return;

    setLoadingMorePlays(true);
    const nextPage = page + 1;
    const from = nextPage * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    try {
      debug("[usePlaybookData] Loading more plays:", {
        page: nextPage,
        from,
        to,
      });

      const { data, error: fetchError } = await table("plays")
        .select(PLAY_SELECT_FIELDS)
        .eq("playbook_id", playbookId)
        .order("created_at", { ascending: false })
        .range(from, to);

      if (fetchError) throw new Error(fetchError.message);

      const fetchedPlays = (data || []) as DatabasePlay[];
      const mappedPlays = fetchedPlays.map(mapDatabasePlayToPlay);

      setPlays((prev) => [...prev, ...mappedPlays]);
      setPage(nextPage);
      setHasMorePlays(mappedPlays.length === PAGE_SIZE);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load more plays";
      warn("[usePlaybookData] Load more error:", message);
    } finally {
      setLoadingMorePlays(false);
    }
  }, [playbookId, page, loadingMorePlays, hasMorePlays]);

  // Refresh data (resets pagination)
  const refreshData = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  // Update a play
  const updatePlay = useCallback(
    async (playId: string, updates: Partial<Play>): Promise<boolean> => {
      try {
        debug("[usePlaybookData] Updating play:", { playId, updates });

        // Convert Play updates to database format
        // Exclude computed/readonly fields that shouldn't be sent to DB
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const {
          created_at,
          updated_at,
          created_by,
          creation_context,
          ...dbUpdates
        } = updates as Partial<Play> & {
          created_at?: Date;
          updated_at?: Date;
          created_by?: string;
          creation_context?: unknown;
        };

        const { data, error: updateError } = await table("plays")
          .update(dbUpdates as Record<string, unknown>)
          .eq("id", playId)
          .select();

        if (updateError) {
          logError("[usePlaybookData] Update error:", updateError.message);
          return false;
        }

        // Update local state optimistically
        if (data && data.length > 0) {
          const updatedPlay = mapDatabasePlayToPlay(data[0] as DatabasePlay);
          setPlays((prev) =>
            prev.map((p) => (p.id === playId ? updatedPlay : p))
          );
        }

        return true;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to update play";
        logError("[usePlaybookData] Update exception:", message);
        return false;
      }
    },
    []
  );

  return {
    plays,
    loading,
    error,
    totalCount,
    playTypeCounts,
    hasMorePlays,
    loadingMorePlays,
    loadMorePlays,
    refreshData,
    updatePlay,
  };
}
