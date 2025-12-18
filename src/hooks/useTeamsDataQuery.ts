/**
 * React Query wrapper for useTeamsData
 * Provides automatic caching, background refetching, and stale-while-revalidate behavior
 *
 * Performance improvements:
 * - Initial load: Same as useTeamsData
 * - Subsequent loads: Instant from cache (<200ms)
 * - Background refetch: Fresh data without blocking UI
 * - Smart invalidation: Only refetch when needed
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";

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
  play_count?: number;
  created_at: string;
  updated_at: string;
}

// Database play type (raw from Supabase) - only essential fields
interface DatabasePlay {
  id: string;
  playbook_id: string | null;
  formation: string;
  play_name: string;
  one_word_play?: string | null;
  p_type: string;
  personnel?: string | null;
  f_type?: string | null;
  f_dir?: string | null;
  p_dir?: string | null;
  protection?: string | null;
  r_str?: string | null;
  p_str?: string | null;
  pref_down?: string | null;
  pref_dis?: string | null;
  pref_hash?: string | null;
  confidence_base?: number;
  times_called?: number;
  times_successful?: number;
  wristband_number?: string | null;
  created_at: string;
  updated_at: string;
}

const PAGE_SIZE = 100;

// Query keys for cache invalidation
export const teamsDataKeys = {
  all: ["teamsData"] as const,
  teams: () => [...teamsDataKeys.all, "teams"] as const,
  playbooks: () => [...teamsDataKeys.all, "playbooks"] as const,
  plays: () => [...teamsDataKeys.all, "plays"] as const,
  playsPage: (page: number) =>
    [...teamsDataKeys.plays(), "page", page] as const,
  totalCount: () => [...teamsDataKeys.plays(), "totalCount"] as const,
};

// Fetch teams
async function fetchTeams(): Promise<Team[]> {
  const { data, error } = await supabase
    .from("teams")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data || []).map((t: any) => ({
    id: String(t.id),
    name: String(t.name),
    school_name: t.school_name ?? undefined,
    mascot: t.mascot ?? undefined,
    season_year: t.season_year ?? undefined,
    created_at: String(t.created_at ?? ""),
    updated_at: String(t.updated_at ?? ""),
  }));
}

// Fetch playbooks
async function fetchPlaybooks(): Promise<Playbook[]> {
  const { data, error } = await supabase
    .from("playbooks")
    .select(
      `
      *,
      plays:plays(count)
    `
    )
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (data || []).map((pb: any) => ({
    ...pb,
    play_count: pb.plays?.[0]?.count || 0,
    plays: undefined,
  }));
}

// Fetch total play count
async function fetchTotalPlaysCount(): Promise<number> {
  const { count, error } = await supabase
    .from("plays")
    .select("*", { count: "exact", head: true });

  if (error) throw error;
  return count ?? 0;
}

// Fetch plays page
async function fetchPlaysPage(page: number): Promise<DatabasePlay[]> {
  const from = page * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const { data, error } = await supabase
    .from("plays")
    .select(
      `
      id,
      playbook_id,
      formation,
      play_name,
      one_word_play,
      p_type,
      personnel,
      f_type,
      f_dir,
      p_dir,
      protection,
      r_str,
      p_str,
      pref_down,
      pref_dis,
      pref_hash,
      confidence_base,
      times_called,
      times_successful,
      wristband_number,
      diagram_image_url,
      created_at,
      updated_at
    `
    )
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) throw error;

  return (data || []).map(
    (p: any): DatabasePlay => ({
      id: String(p.id),
      playbook_id: p.playbook_id ?? null,
      formation: String(p.formation ?? ""),
      play_name: String(p.play_name ?? ""),
      one_word_play: p.one_word_play ?? null,
      p_type: String(p.p_type ?? ""),
      personnel: p.personnel ?? null,
      f_type: p.f_type ?? null,
      f_dir: p.f_dir ?? null,
      p_dir: p.p_dir ?? null,
      protection: p.protection ?? null,
      r_str: p.r_str ?? null,
      p_str: p.p_str ?? null,
      pref_down: p.pref_down ?? null,
      pref_dis: p.pref_dis ?? null,
      pref_hash: p.pref_hash ?? null,
      confidence_base: p.confidence_base ?? undefined,
      times_called: p.times_called ?? undefined,
      times_successful: p.times_successful ?? undefined,
      wristband_number: p.wristband_number ?? null,
      created_at: String(p.created_at ?? ""),
      updated_at: String(p.updated_at ?? ""),
    })
  );
}

// Update a play
async function updatePlayInDB(
  playId: string,
  updates: Partial<DatabasePlay>
): Promise<DatabasePlay> {
  const { data, error } = await supabase
    .from("plays")
    .update(updates)
    .eq("id", playId)
    .select()
    .maybeSingle(); // Use maybeSingle() to avoid 406 error when RLS blocks or row missing

  if (error) throw error;

  // If no data returned, the play doesn't exist or RLS blocked it
  if (!data) {
    throw new Error("Play not found or you don't have permission to update it");
  }

  return data as DatabasePlay;
}

/**
 * React Query hook for teams data with automatic caching
 *
 * Features:
 * - Caches data for 5 minutes (staleTime)
 * - Refetches in background after cache goes stale
 * - Retries failed requests 3 times
 * - Shows cached data while refetching
 */
export function useTeamsDataQuery() {
  const queryClient = useQueryClient();

  // Teams query
  const teamsQuery = useQuery({
    queryKey: teamsDataKeys.teams(),
    queryFn: fetchTeams,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
  });

  // Playbooks query
  const playbooksQuery = useQuery({
    queryKey: teamsDataKeys.playbooks(),
    queryFn: fetchPlaybooks,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  // Total plays count query
  const totalCountQuery = useQuery({
    queryKey: teamsDataKeys.totalCount(),
    queryFn: fetchTotalPlaysCount,
    staleTime: 2 * 60 * 1000, // 2 minutes (count changes more frequently)
    gcTime: 5 * 60 * 1000,
  });

  // Plays query (first page)
  const playsQuery = useQuery({
    queryKey: teamsDataKeys.playsPage(0),
    queryFn: () => fetchPlaysPage(0),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000,
  });

  // Update play mutation with optimistic updates
  const updatePlayMutation = useMutation({
    mutationFn: ({
      playId,
      updates,
    }: {
      playId: string;
      updates: Partial<DatabasePlay>;
    }) => updatePlayInDB(playId, updates),
    onMutate: async ({ playId, updates }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: teamsDataKeys.plays() });

      // Snapshot the previous value
      const previousPlays = queryClient.getQueryData(
        teamsDataKeys.playsPage(0)
      );

      // Optimistically update the cache
      queryClient.setQueryData(
        teamsDataKeys.playsPage(0),
        (old: DatabasePlay[] | undefined) => {
          if (!old) return old;
          return old.map((play) =>
            play.id === playId ? { ...play, ...updates } : play
          );
        }
      );

      return { previousPlays };
    },
    onError: (_err, _variables, context) => {
      // Rollback on error
      if (context?.previousPlays) {
        queryClient.setQueryData(
          teamsDataKeys.playsPage(0),
          context.previousPlays
        );
      }
    },
    onSuccess: () => {
      // Invalidate and refetch on success
      queryClient.invalidateQueries({ queryKey: teamsDataKeys.plays() });
    },
  });

  // Refresh all data
  const refreshData = () => {
    queryClient.invalidateQueries({ queryKey: teamsDataKeys.all });
  };

  // Combined loading state
  const loading =
    teamsQuery.isLoading ||
    playbooksQuery.isLoading ||
    playsQuery.isLoading ||
    totalCountQuery.isLoading;

  // Combined error state
  const error =
    teamsQuery.error ||
    playbooksQuery.error ||
    playsQuery.error ||
    totalCountQuery.error;

  return {
    teams: teamsQuery.data || [],
    playbooks: playbooksQuery.data || [],
    plays: playsQuery.data || [],
    totalPlaysCount: totalCountQuery.data ?? null,
    loading,
    error: error ? String(error) : null,
    refreshData,
    updatePlay: (playId: string, updates: Partial<DatabasePlay>) =>
      updatePlayMutation.mutateAsync({ playId, updates }),
    // Pagination support
    hasMorePlays: (playsQuery.data?.length || 0) === PAGE_SIZE,
    loadingMorePlays: false, // TODO: Implement infinite query
    totalCount:
      (teamsQuery.data?.length || 0) +
      (playbooksQuery.data?.length || 0) +
      (playsQuery.data?.length || 0),
    loadMorePlays: async () => {
      console.warn("Infinite scroll with React Query not yet implemented");
    },
  };
}
