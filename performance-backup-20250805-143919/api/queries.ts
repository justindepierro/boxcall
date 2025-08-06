import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { footballAPI, type PlayerResponse } from "./football";
// Query keys for consistent cache management
export const queryKeys = {
  teams: ["teams"] as const,
  team: (id: string) => ["teams", id] as const,
  players: (teamId: string) => ["players", teamId] as const,
  player: (id: string) => ["players", "detail", id] as const,
  games: (teamId: string) => ["games", teamId] as const,
  game: (id: string) => ["games", "detail", id] as const,
};
// Team Queries
export const useTeams = () => {
  return useQuery({
    queryKey: queryKeys.teams,
    queryFn: footballAPI.getTeams,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
  });
};
export const useTeam = (teamId: string) => {
  return useQuery({
    queryKey: queryKeys.team(teamId),
    queryFn: () => footballAPI.getTeam(teamId),
    enabled: !!teamId,
    staleTime: 5 * 60 * 1000,
  });
};
// Player Queries
export const usePlayers = (teamId: string) => {
  return useQuery({
    queryKey: queryKeys.players(teamId),
    queryFn: () => footballAPI.getPlayers(teamId),
    enabled: !!teamId,
    staleTime: 2 * 60 * 1000, // 2 minutes (player data changes more frequently)
  });
};
export const usePlayer = (playerId: string) => {
  return useQuery({
    queryKey: queryKeys.player(playerId),
    queryFn: () => footballAPI.getPlayer(playerId),
    enabled: !!playerId,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};
// Game Queries
export const useGames = (teamId: string) => {
  return useQuery({
    queryKey: queryKeys.games(teamId),
    queryFn: () => footballAPI.getGames(teamId),
    enabled: !!teamId,
    staleTime: 10 * 60 * 1000, // 10 minutes (game schedule doesn't change often)
  });
};
export const useGame = (gameId: string) => {
  return useQuery({
    queryKey: queryKeys.game(gameId),
    queryFn: () => footballAPI.getGame(gameId),
    enabled: !!gameId,
    staleTime: 30 * 1000, // 30 seconds (game data updates frequently)
  });
};
// Mutations
export const useUpdatePlayerStats = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      playerId,
      stats,
    }: {
      playerId: string;
      stats: Partial<PlayerResponse["stats"]>;
    }) => footballAPI.updatePlayerStats(playerId, stats),
    onSuccess: (updatedPlayer) => {
      // Update the player detail cache
      queryClient.setQueryData(
        queryKeys.player(updatedPlayer.id),
        updatedPlayer
      );
      // Invalidate players list to trigger refetch
      queryClient.invalidateQueries({ queryKey: ["players"] });
    },
    onError: (error) => {
      console.error("Failed to update player stats:", error);
    },
  });
};
// Prefetch utilities for better UX
export const usePrefetchTeam = () => {
  const queryClient = useQueryClient();
  return (teamId: string) => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.team(teamId),
      queryFn: () => footballAPI.getTeam(teamId),
      staleTime: 5 * 60 * 1000,
    });
  };
};
export const usePrefetchPlayers = () => {
  const queryClient = useQueryClient();
  return (teamId: string) => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.players(teamId),
      queryFn: () => footballAPI.getPlayers(teamId),
      staleTime: 2 * 60 * 1000,
    });
  };
};
// Football-specific data transformations
export const useTeamStats = (teamId: string) => {
  const { data: team } = useTeam(teamId);
  const { data: players } = usePlayers(teamId);
  const { data: games } = useGames(teamId);
  // Transform raw data into useful stats
  return {
    team,
    totalPlayers: players?.length ?? 0,
    totalTouchdowns:
      players?.reduce((sum, player) => sum + player.stats.touchdowns, 0) ?? 0,
    totalYards:
      players?.reduce((sum, player) => sum + player.stats.yards, 0) ?? 0,
    totalTackles:
      players?.reduce((sum, player) => sum + player.stats.tackles, 0) ?? 0,
    record: team ? `${team.recordWins}-${team.recordLosses}` : "N/A",
    upcomingGames: games?.filter((game) => !game.result) ?? [],
    recentGames: games?.filter((game) => !!game.result).slice(-3) ?? [],
  };
};
