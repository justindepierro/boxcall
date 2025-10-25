/**
 * useRosterStats Hook
 *
 * Computes roster statistics with memoization for performance
 * - Total player count
 * - Active player count
 * - Position breakdown
 * - Grade level distribution
 *
 * Performance:
 * - All calculations are memoized to prevent unnecessary recalculations
 * - Only recomputes when player data changes
 */

import { useMemo } from "react";
import type { RosterPlayerView } from "../../../services/rosterService";

/**
 * Return type for useRosterStats hook
 */
export interface UseRosterStatsReturn {
  /** Total number of players */
  totalPlayers: number;
  /** Number of active players */
  activePlayerCount: number;
  /** Number of inactive players */
  inactivePlayerCount: number;
  /** Breakdown of players by position */
  positionBreakdown: Record<string, number>;
  /** Breakdown of players by grade level */
  gradeLevelBreakdown: Record<string, number>;
}

/**
 * Hook for computing roster statistics with memoization
 *
 * @param players - Array of roster players
 * @returns Computed statistics
 *
 * @example
 * ```tsx
 * const { totalPlayers, activePlayerCount, positionBreakdown } = useRosterStats(players);
 * ```
 */
export const useRosterStats = (
  players: RosterPlayerView[]
): UseRosterStatsReturn => {
  // Total player count
  const totalPlayers = useMemo(() => players.length, [players]);

  // Active/inactive counts
  const activePlayerCount = useMemo(
    () => players.filter((p) => p.is_active === true).length,
    [players]
  );

  const inactivePlayerCount = useMemo(
    () => players.filter((p) => p.is_active === false).length,
    [players]
  );

  // Position breakdown
  const positionBreakdown = useMemo(() => {
    const breakdown: Record<string, number> = {};

    players.forEach((player) => {
      if (player.position) {
        // Handle multiple positions (comma-separated)
        const positions = player.position.split(",").map((p) => p.trim());
        positions.forEach((pos) => {
          breakdown[pos] = (breakdown[pos] || 0) + 1;
        });
      }
    });

    return breakdown;
  }, [players]);

  // Grade level breakdown
  const gradeLevelBreakdown = useMemo(() => {
    const breakdown: Record<string, number> = {};

    players.forEach((player) => {
      if (player.grade_level) {
        breakdown[player.grade_level] =
          (breakdown[player.grade_level] || 0) + 1;
      }
    });

    return breakdown;
  }, [players]);

  return {
    totalPlayers,
    activePlayerCount,
    inactivePlayerCount,
    positionBreakdown,
    gradeLevelBreakdown,
  };
};
