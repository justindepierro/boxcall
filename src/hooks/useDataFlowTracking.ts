export type PlayMaturityLevel =
  | "new"
  | "practice_tested"
  | "game_ready"
  | "proven";

export type PlayMaturity = {
  level: PlayMaturityLevel;
  score: number;
};

/**
 * Minimal stub for the (future) play data-flow tracking system.
 *
 * This hook is only used by `PlayMaturityBadge` today.
 */
export function useDataFlowTracking() {
  const getPlayMaturity = (_playId: string): PlayMaturity | null => {
    return null;
  };

  const getMaturityLevelLabel = (level: PlayMaturityLevel): string => {
    switch (level) {
      case "new":
        return "New";
      case "practice_tested":
        return "Practice Tested";
      case "game_ready":
        return "Game Ready";
      case "proven":
        return "Proven";
      default:
        return "New";
    }
  };

  return { getPlayMaturity, getMaturityLevelLabel };
}
