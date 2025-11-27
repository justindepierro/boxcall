/**
 * Roster React Query Hooks
 *
 * Provides caching, optimistic updates, and automatic refetching for roster data.
 * Replaces manual state management with React Query's sophisticated caching.
 *
 * Features:
 * - Automatic background refetching
 * - Optimistic updates for instant UI feedback
 * - Automatic rollback on errors
 * - Multi-tab synchronization
 * - Stale-while-revalidate pattern
 *
 * @version 1.0.0
 */

import {
  useQuery,
  useMutation,
  useQueryClient,
  type QueryClient,
} from "@tanstack/react-query";
import { rosterService } from "../services";
import type {
  RosterPlayerView,
  PlayerRosterInsert,
  PlayerRosterUpdate,
} from "../services/rosterService";
import { info, error as logError } from "../utils/logger";
import { useSaveState } from "./useSaveState";

// ============================================
// QUERY KEYS
// ============================================

export const rosterKeys = {
  all: ["roster"] as const,
  team: (teamId: string) => ["roster", teamId] as const,
  player: (playerId: string) => ["roster", "player", playerId] as const,
};

// ============================================
// QUERIES
// ============================================

/**
 * Fetch roster with React Query caching
 *
 * Features:
 * - 5 minute stale time (shows cached data while revalidating)
 * - Automatic refetch on window focus
 * - Automatic refetch on reconnect
 * - Retry on failures (3 attempts with exponential backoff)
 */
export function useRosterQuery(teamId: string | null) {
  return useQuery({
    queryKey: rosterKeys.team(teamId || ""),
    queryFn: async () => {
      if (!teamId) throw new Error("No team ID provided");
      info("[useRosterQuery] Fetching roster for team:", teamId);
      const roster = await rosterService.listByTeam(teamId);
      info(`[useRosterQuery] Fetched ${roster.length} players`);
      return roster;
    },
    enabled: !!teamId, // Only run if teamId exists
    staleTime: 5 * 60 * 1000, // 5 minutes - data is "fresh" for this long
    gcTime: 10 * 60 * 1000, // 10 minutes - cache persists for this long (formerly cacheTime)
    refetchOnWindowFocus: true, // Refetch when user returns to tab
    refetchOnReconnect: true, // Refetch when network reconnects
  });
}

// ============================================
// MUTATIONS
// ============================================

/**
 * Add player mutation with optimistic update
 *
 * Optimistic update flow:
 * 1. Immediately add player to cache (instant UI update)
 * 2. Make API call
 * 3. If success: Update cache with real data from server
 * 4. If error: Rollback to previous state
 */
export function useAddPlayerMutation(teamId: string | null) {
  const queryClient = useQueryClient();
  const { startSaving, finishSaving } = useSaveState();

  return useMutation({
    mutationFn: async (playerData: PlayerRosterInsert) => {
      if (!teamId) throw new Error("No team ID provided");
      info("[useAddPlayerMutation] Adding player");
      const newPlayer = await rosterService.createPlayer(playerData);
      return newPlayer;
    },

    // Optimistic update: Add player to cache immediately
    onMutate: async (newPlayer) => {
      startSaving();

      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({
        queryKey: rosterKeys.team(teamId || ""),
      });

      // Snapshot the previous value
      const previousRoster = queryClient.getQueryData<RosterPlayerView[]>(
        rosterKeys.team(teamId || "")
      );

      // Optimistically update to the new value
      queryClient.setQueryData<RosterPlayerView[]>(
        rosterKeys.team(teamId || ""),
        (old) => {
          if (!old) return old;
          // Create temporary player with placeholder ID
          const tempPlayer: RosterPlayerView = {
            ...newPlayer,
            id: `temp-${Date.now()}`, // Temporary ID until server responds
            team_id: teamId || "",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          } as RosterPlayerView;
          return [...old, tempPlayer];
        }
      );

      // Return context with the previous data
      return { previousRoster };
    },

    // On success: Replace temp player with real player from server
    onSuccess: (newPlayer) => {
      info("[useAddPlayerMutation] Player added successfully");

      // Update cache with real data from server
      queryClient.setQueryData<RosterPlayerView[]>(
        rosterKeys.team(teamId || ""),
        (old) => {
          if (!old) return [newPlayer];
          // Remove temp player and add real player
          return old.filter((p) => !p.id.startsWith("temp-")).concat(newPlayer);
        }
      );

      finishSaving("success");
    },

    // On error: Rollback to previous state
    onError: (err, _newPlayer, context) => {
      logError("[useAddPlayerMutation] Failed to add player:", err);

      // Rollback to previous state
      if (context?.previousRoster) {
        queryClient.setQueryData(
          rosterKeys.team(teamId || ""),
          context.previousRoster
        );
      }

      finishSaving("error");
    },

    // Always refetch after mutation completes (success or error)
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: rosterKeys.team(teamId || ""),
      });
    },
  });
}

/**
 * Update player mutation with optimistic update
 */
export function useUpdatePlayerMutation(teamId: string | null) {
  const queryClient = useQueryClient();
  const { startSaving, finishSaving } = useSaveState();

  return useMutation({
    mutationFn: async ({
      playerId,
      updates,
    }: {
      playerId: string;
      updates: PlayerRosterUpdate;
    }) => {
      info("[useUpdatePlayerMutation] Updating player:", playerId);
      await rosterService.updatePlayer(playerId, updates);
      return { playerId, updates };
    },

    // Optimistic update: Update player in cache immediately
    onMutate: async ({ playerId, updates }) => {
      startSaving();

      await queryClient.cancelQueries({
        queryKey: rosterKeys.team(teamId || ""),
      });

      const previousRoster = queryClient.getQueryData<RosterPlayerView[]>(
        rosterKeys.team(teamId || "")
      );

      // Optimistically update the player
      queryClient.setQueryData<RosterPlayerView[]>(
        rosterKeys.team(teamId || ""),
        (old) => {
          if (!old) return old;
          return old.map((p) => (p.id === playerId ? { ...p, ...updates } : p));
        }
      );

      return { previousRoster };
    },

    onSuccess: () => {
      info("[useUpdatePlayerMutation] Player updated successfully");
      finishSaving("success");
    },

    onError: (err, _variables, context) => {
      logError("[useUpdatePlayerMutation] Failed to update player:", err);

      if (context?.previousRoster) {
        queryClient.setQueryData(
          rosterKeys.team(teamId || ""),
          context.previousRoster
        );
      }

      finishSaving("error");
    },

    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: rosterKeys.team(teamId || ""),
      });
    },
  });
}

/**
 * Delete player mutation with optimistic update
 */
export function useDeletePlayerMutation(teamId: string | null) {
  const queryClient = useQueryClient();
  const { startSaving, finishSaving } = useSaveState();

  return useMutation({
    mutationFn: async (playerId: string) => {
      info("[useDeletePlayerMutation] Deleting player:", playerId);
      await rosterService.deletePlayer(playerId);
      return playerId;
    },

    onMutate: async (playerId) => {
      startSaving();

      await queryClient.cancelQueries({
        queryKey: rosterKeys.team(teamId || ""),
      });

      const previousRoster = queryClient.getQueryData<RosterPlayerView[]>(
        rosterKeys.team(teamId || "")
      );

      // Optimistically remove player from cache
      queryClient.setQueryData<RosterPlayerView[]>(
        rosterKeys.team(teamId || ""),
        (old) => {
          if (!old) return old;
          return old.filter((p) => p.id !== playerId);
        }
      );

      return { previousRoster };
    },

    onSuccess: () => {
      info("[useDeletePlayerMutation] Player deleted successfully");
      finishSaving("success");
    },

    onError: (err, _playerId, context) => {
      logError("[useDeletePlayerMutation] Failed to delete player:", err);

      if (context?.previousRoster) {
        queryClient.setQueryData(
          rosterKeys.team(teamId || ""),
          context.previousRoster
        );
      }

      finishSaving("error");
    },

    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: rosterKeys.team(teamId || ""),
      });
    },
  });
}

/**
 * Bulk update players mutation with optimistic update
 */
export function useBulkUpdatePlayersMutation(teamId: string | null) {
  const queryClient = useQueryClient();
  const { startSaving, finishSaving } = useSaveState();

  return useMutation({
    mutationFn: async ({
      playerIds,
      updates,
    }: {
      playerIds: string[];
      updates: PlayerRosterUpdate;
    }) => {
      info(
        "[useBulkUpdatePlayersMutation] Updating players:",
        playerIds.length
      );
      const result = await rosterService.updateMultiplePlayers(
        playerIds,
        updates
      );
      return { playerIds, updates, result };
    },

    onMutate: async ({ playerIds, updates }) => {
      startSaving();

      await queryClient.cancelQueries({
        queryKey: rosterKeys.team(teamId || ""),
      });

      const previousRoster = queryClient.getQueryData<RosterPlayerView[]>(
        rosterKeys.team(teamId || "")
      );

      // Optimistically update multiple players
      queryClient.setQueryData<RosterPlayerView[]>(
        rosterKeys.team(teamId || ""),
        (old) => {
          if (!old) return old;
          return old.map((p) =>
            playerIds.includes(p.id) ? { ...p, ...updates } : p
          );
        }
      );

      return { previousRoster };
    },

    onSuccess: () => {
      info("[useBulkUpdatePlayersMutation] Players updated successfully");
      finishSaving("success");
    },

    onError: (err, _variables, context) => {
      logError("[useBulkUpdatePlayersMutation] Failed to update players:", err);

      if (context?.previousRoster) {
        queryClient.setQueryData(
          rosterKeys.team(teamId || ""),
          context.previousRoster
        );
      }

      finishSaving("error");
    },

    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: rosterKeys.team(teamId || ""),
      });
    },
  });
}

/**
 * Helper function to manually invalidate roster cache
 * Useful when you know the data has changed externally
 */
export function invalidateRosterCache(
  queryClient: QueryClient,
  teamId: string | null
) {
  queryClient.invalidateQueries({ queryKey: rosterKeys.team(teamId || "") });
}

/**
 * Helper function to prefetch roster data
 * Useful for improving perceived performance
 */
export async function prefetchRoster(queryClient: QueryClient, teamId: string) {
  await queryClient.prefetchQuery({
    queryKey: rosterKeys.team(teamId),
    queryFn: () => rosterService.listByTeam(teamId),
    staleTime: 5 * 60 * 1000,
  });
}
