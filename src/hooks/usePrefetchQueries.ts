/**
 * Prefetch Queries Hook
 * 
 * Provides utilities for prefetching data on hover to achieve zero perceived load time.
 * Uses React Query's prefetchQuery to preload data before navigation.
 * 
 * Features:
 * - Playbook prefetching on team hover
 * - Play details prefetching on play hover
 * - Debounced prefetch to avoid excessive requests
 * - Network-aware prefetching (only on good connections)
 */

import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useRef } from "react";
import { supabase } from "../lib/supabase";

// Prefetch delay in milliseconds (wait for stable hover)
const PREFETCH_DELAY = 300;

/**
 * Hook for prefetching queries on hover
 */
export function usePrefetchQueries() {
  const queryClient = useQueryClient();
  const prefetchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Check if network conditions are good for prefetching
   * Only prefetch on fast connections to avoid wasting bandwidth
   */
  const isGoodNetwork = useCallback((): boolean => {
    if (typeof navigator === "undefined" || !("connection" in navigator)) {
      return true; // Assume good if unsupported
    }

    const connection = (navigator as any).connection;
    if (!connection) return true;

    // Don't prefetch on slow or metered connections
    if (connection.saveData) return false;
    if (connection.effectiveType === "slow-2g") return false;
    if (connection.effectiveType === "2g") return false;

    return true;
  }, []);

  /**
   * Prefetch playbook data for a team
   * Called on team card/link hover
   */
  const prefetchPlaybook = useCallback(
    (teamId: string) => {
      if (!isGoodNetwork()) return;

      // Clear any pending prefetch
      if (prefetchTimeoutRef.current) {
        clearTimeout(prefetchTimeoutRef.current);
      }

      // Debounce prefetch
      prefetchTimeoutRef.current = setTimeout(() => {
        // Prefetch playbooks for team
        queryClient.prefetchQuery({
          queryKey: ["playbooks", teamId],
          queryFn: async () => {
            const { data, error } = await supabase
              .from("playbooks")
              .select("*")
              .eq("team_id", teamId)
              .eq("is_active", true)
              .order("created_at", { ascending: false });

            if (error) throw error;
            return data || [];
          },
          staleTime: 5 * 60 * 1000, // 5 minutes
        });

        // Prefetch plays count for team
        queryClient.prefetchQuery({
          queryKey: ["plays-count", teamId],
          queryFn: async () => {
            const { count, error } = await supabase
              .from("plays")
              .select("id", { count: "exact", head: true })
              .in(
                "playbook_id",
                // Get playbook IDs first
                (
                  await supabase
                    .from("playbooks")
                    .select("id")
                    .eq("team_id", teamId)
                    .eq("is_active", true)
                ).data?.map((pb: { id: string }) => pb.id) || []
              );

            if (error) throw error;
            return count || 0;
          },
          staleTime: 5 * 60 * 1000,
        });
      }, PREFETCH_DELAY);
    },
    [queryClient, isGoodNetwork]
  );

  /**
   * Prefetch play details
   * Called on play card hover
   */
  const prefetchPlayDetails = useCallback(
    (playId: string) => {
      if (!isGoodNetwork()) return;

      if (prefetchTimeoutRef.current) {
        clearTimeout(prefetchTimeoutRef.current);
      }

      prefetchTimeoutRef.current = setTimeout(() => {
        queryClient.prefetchQuery({
          queryKey: ["play", playId],
          queryFn: async () => {
            const { data, error } = await supabase
              .from("plays")
              .select("*")
              .eq("id", playId)
              .single();

            if (error) throw error;
            return data;
          },
          staleTime: 10 * 60 * 1000, // 10 minutes (plays change less frequently)
        });
      }, PREFETCH_DELAY);
    },
    [queryClient, isGoodNetwork]
  );

  /**
   * Prefetch formation details
   * Called on formation card hover
   */
  const prefetchFormation = useCallback(
    (formationId: string) => {
      if (!isGoodNetwork()) return;

      if (prefetchTimeoutRef.current) {
        clearTimeout(prefetchTimeoutRef.current);
      }

      prefetchTimeoutRef.current = setTimeout(() => {
        queryClient.prefetchQuery({
          queryKey: ["formation", formationId],
          queryFn: async () => {
            const { data, error } = await supabase
              .from("formations")
              .select("*")
              .eq("id", formationId)
              .single();

            if (error) throw error;
            return data;
          },
          staleTime: 10 * 60 * 1000,
        });
      }, PREFETCH_DELAY);
    },
    [queryClient, isGoodNetwork]
  );

  /**
   * Prefetch team dashboard data
   * Called on team switcher/navigation hover
   */
  const prefetchTeamDashboard = useCallback(
    (teamId: string) => {
      if (!isGoodNetwork()) return;

      if (prefetchTimeoutRef.current) {
        clearTimeout(prefetchTimeoutRef.current);
      }

      prefetchTimeoutRef.current = setTimeout(() => {
        // Prefetch team data
        queryClient.prefetchQuery({
          queryKey: ["team", teamId],
          queryFn: async () => {
            const { data, error } = await supabase
              .from("teams")
              .select("*")
              .eq("id", teamId)
              .single();

            if (error) throw error;
            return data;
          },
          staleTime: 10 * 60 * 1000,
        });

        // Prefetch team members count
        queryClient.prefetchQuery({
          queryKey: ["team-members-count", teamId],
          queryFn: async () => {
            const { count, error } = await supabase
              .from("team_members")
              .select("id", { count: "exact", head: true })
              .eq("team_id", teamId)
              .eq("status", "active");

            if (error) throw error;
            return count || 0;
          },
          staleTime: 5 * 60 * 1000,
        });

        // Also prefetch playbooks for the dashboard
        prefetchPlaybook(teamId);
      }, PREFETCH_DELAY);
    },
    [queryClient, isGoodNetwork, prefetchPlaybook]
  );

  /**
   * Cancel any pending prefetch
   */
  const cancelPrefetch = useCallback(() => {
    if (prefetchTimeoutRef.current) {
      clearTimeout(prefetchTimeoutRef.current);
      prefetchTimeoutRef.current = null;
    }
  }, []);

  return {
    prefetchPlaybook,
    prefetchPlayDetails,
    prefetchFormation,
    prefetchTeamDashboard,
    cancelPrefetch,
  };
}
