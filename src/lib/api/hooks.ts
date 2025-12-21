/**
 * BoxCall Data Hooks - React Query Integration
 *
 * Professional, type-safe data fetching hooks using:
 * - React Query for caching & state management
 * - Supabase client for consistent auth handling
 * - Proper error boundaries and loading states
 */

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { table } from "../../data/supabase/db";
import { queryKeys } from "../queryKeys";

export { queryKeys } from "../queryKeys";

/**
 * Hook to fetch team data
 */
export function useTeam(teamId: string | null) {
  return useQuery({
    queryKey: queryKeys.team(teamId || ""),
    queryFn: async () => {
      if (!teamId) return null;
      const { data, error } = await table("teams")
        .select("*")
        .eq("id", teamId)
        .single();
      if (error) throw new Error(error.message);
      return data;
    },
    enabled: !!teamId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook to fetch playbooks for a team
 */
export function usePlaybooks(teamId: string | null) {
  return useQuery({
    queryKey: queryKeys.playbooks(teamId || ""),
    queryFn: async () => {
      if (!teamId) return [];
      const { data, error } = await table("playbooks")
        .select("*")
        .eq("team_id", teamId)
        .order("created_at", { ascending: false });
      if (error) throw new Error(error.message);
      return data || [];
    },
    enabled: !!teamId,
    staleTime: 10 * 60 * 1000,
  });
}

/**
 * Hook to fetch plays for playbooks
 */
export function usePlays(playbookIds: string[], options?: { limit?: number }) {
  return useQuery({
    queryKey: queryKeys.plays(playbookIds),
    queryFn: async () => {
      if (playbookIds.length === 0) return [];

      let query = table("plays")
        .select("*")
        .in("playbook_id", playbookIds)
        .order("created_at", { ascending: false });

      if (options?.limit) {
        query = query.limit(options.limit);
      }

      const { data, error } = await query;
      if (error) throw new Error(error.message);
      return data || [];
    },
    enabled: playbookIds.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes for plays
  });
}

/**
 * Hook to fetch formations for playbooks
 */
export function useFormations(playbookIds: string[]) {
  return useQuery({
    queryKey: queryKeys.formations(playbookIds),
    queryFn: async () => {
      if (playbookIds.length === 0) return [];
      const { data, error } = await table("formations")
        .select("*")
        .in("playbook_id", playbookIds)
        .order("created_at", { ascending: false });
      if (error) throw new Error(error.message);
      return data || [];
    },
    enabled: playbookIds.length > 0,
    staleTime: 10 * 60 * 1000,
  });
}

/**
 * Hook to fetch user's team memberships
 */
export function useUserTeamMemberships(userId: string | null) {
  return useQuery({
    queryKey: queryKeys.userTeams(userId || ""),
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await table("team_members")
        .select("team_id, team_role, capabilities, status, assigned_at")
        .eq("user_id", userId)
        .eq("status", "active");
      if (error) throw new Error(error.message);
      return data || [];
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to fetch user profile
 */
export function useProfile(userId: string | null) {
  return useQuery({
    queryKey: queryKeys.profile(userId || ""),
    queryFn: async () => {
      if (!userId) return null;
      const { data, error } = await table("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();
      if (error) throw new Error(error.message);
      return data;
    },
    enabled: !!userId,
    staleTime: 10 * 60 * 1000,
  });
}

/**
 * Hook to fetch game plans for a team
 */
export function useGamePlans(teamId: string | null) {
  return useQuery({
    queryKey: queryKeys.gamePlans(teamId || ""),
    queryFn: async () => {
      if (!teamId) return [];
      const { data, error } = await table("game_plans")
        .select("*")
        .eq("team_id", teamId)
        .order("created_at", { ascending: false });
      if (error) throw new Error(error.message);
      return data || [];
    },
    enabled: !!teamId,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to fetch practice scripts for a team
 */
export function usePracticeScripts(teamId: string | null) {
  return useQuery({
    queryKey: queryKeys.practiceScripts(teamId || ""),
    queryFn: async () => {
      if (!teamId) return [];
      const { data, error } = await table("practice_scripts")
        .select("*")
        .eq("team_id", teamId)
        .order("created_at", { ascending: false });
      if (error) throw new Error(error.message);
      return data || [];
    },
    enabled: !!teamId,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Combined hook for playbook page data
 * Fetches playbooks, plays, and formations in parallel
 */
export function usePlaybookData(teamId: string | null) {
  const playbooksQuery = usePlaybooks(teamId);
  const playbookIds = playbooksQuery.data?.map((p) => p.id) || [];

  const playsQuery = usePlays(playbookIds);
  const formationsQuery = useFormations(playbookIds);

  return {
    playbooks: playbooksQuery.data || [],
    plays: playsQuery.data || [],
    formations: formationsQuery.data || [],

    isLoading:
      playbooksQuery.isLoading ||
      (playbookIds.length > 0 &&
        (playsQuery.isLoading || formationsQuery.isLoading)),

    error: playbooksQuery.error || playsQuery.error || formationsQuery.error,

    refetch: async () => {
      await Promise.all([
        playbooksQuery.refetch(),
        playsQuery.refetch(),
        formationsQuery.refetch(),
      ]);
    },

    // Computed stats
    playbooksCount: playbooksQuery.data?.length || 0,
    playsCount: playsQuery.data?.length || 0,
    formationsCount: formationsQuery.data?.length || 0,
  };
}

/**
 * Hook to invalidate all team-related data
 */
export function useInvalidateTeamData() {
  const queryClient = useQueryClient();

  return (teamId: string) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.team(teamId) });
  };
}

/**
 * Hook to prefetch team data
 */
export function usePrefetchTeamData() {
  const queryClient = useQueryClient();

  return async (teamId: string) => {
    await Promise.all([
      queryClient.prefetchQuery({
        queryKey: queryKeys.team(teamId),
        queryFn: async () => {
          const { data, error } = await table("teams")
            .select("*")
            .eq("id", teamId)
            .single();
          if (error) throw new Error(error.message);
          return data;
        },
      }),
      queryClient.prefetchQuery({
        queryKey: queryKeys.playbooks(teamId),
        queryFn: async () => {
          const { data, error } = await table("playbooks")
            .select("*")
            .eq("team_id", teamId);
          if (error) throw new Error(error.message);
          return data || [];
        },
      }),
    ]);
  };
}
