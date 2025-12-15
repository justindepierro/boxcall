/**
 * useGameSession Hook
 * Game-specific session management extending useSession
 *
 * Phase 14: Added score/timeout tracking + game urgency awareness
 * - Score tracking (teamScore, opponentScore)
 * - Timeout tracking (teamTimeouts, opponentTimeouts)
 * - Game urgency calculation for AI recommendations
 * - 2-point conversion decision support
 */

import { useState, useEffect, useCallback, useMemo } from "react";
import { useSession } from "./useSession";
import { GamePlanService } from "../services/gamePlanService";
import type {
  GameSession,
  ExecutionResult,
  CreateGameSessionData,
  HashMark,
  OpponentCoverage,
  GameUrgency,
} from "../types/session";
import type { GamePlan, GamePlanPlay } from "../types";
import { logError } from "../utils/logger";
import {
  calculateGameUrgency,
  shouldGoForTwo,
  shouldBeInHurryUp,
  getPlayTypeRecommendation,
} from "../utils/gameUrgencyCalculator";

interface GameSituation {
  quarter: number;
  timeRemaining: string;
  down: number;
  distance: number;
  yardLine: number;
  hashMark: HashMark;
  // Phase 14: Score tracking
  teamScore: number;
  opponentScore: number;
  // Phase 14: Timeout tracking
  teamTimeouts: number;
  opponentTimeouts: number;
  // Phase 14: Game urgency (calculated)
  gameUrgency: GameUrgency;
  isHurryUp: boolean;
}

interface UsageGameSessionOptions {
  gamePlanId: string;
  mode: "live" | "retroactive";
  gameDate?: Date;
  opponent: string;
  isHomeGame?: boolean;
}

interface UseGameSessionReturn {
  // Session state
  session: GameSession | null;
  isLoading: boolean;
  error: Error | null;

  // Game plan
  gamePlan: GamePlan | null;
  gamePlanPlays: GamePlanPlay[];

  // Current situation
  situation: GameSituation;
  updateSituation: (updates: Partial<GameSituation>) => void;

  // Phase 14: Score & timeout management
  updateScore: (team: "us" | "them", points: number) => void;
  useTimeout: (team: "us" | "them") => void;
  resetTimeouts: (forQuarter: 1 | 2 | 3 | 4) => void;

  // Phase 14: Game urgency helpers
  shouldGoForTwo: () => { shouldGoForTwo: boolean; reasoning: string };
  playTypeRecommendation: { type: "run" | "pass" | "balanced"; reason: string };

  // Filtered plays (based on situation)
  filteredPlays: GamePlanPlay[];
  recommendedPlays: GamePlanPlay[]; // AI-sorted by confidence (future Phase 11)

  // Current play tracking
  currentPlay: GamePlanPlay | null;
  selectPlay: (play: GamePlanPlay) => void;

  // Session controls
  startSession: () => Promise<void>;
  endSession: () => Promise<void>;
  pauseSession: () => void;
  resumeSession: () => void;

  // Play execution (Phase 12.1: added quickTags, Phase 13.2: added opponentCoverage)
  logPlay: (
    play: GamePlanPlay,
    result: ExecutionResult,
    yardsGained: number,
    options?: {
      wasTouchdown?: boolean;
      wasTurnover?: boolean;
      wasPenalty?: boolean;
      penaltyYards?: number;
      notes?: string;
      quickTags?: string[];
      opponentCoverage?: OpponentCoverage;
    }
  ) => Promise<void>;

  // Down/distance auto-advance
  advanceDown: () => void;
  resetDowns: () => void; // First down
  nextQuarter: () => void;

  // Drive tracking
  currentDrive: {
    plays: number;
    yards: number;
    touchdowns: number;
    turnovers: number;
  };

  // State flags
  isSessionActive: boolean;
  isPaused: boolean;
  hasPendingSync: boolean;
  isRedZone: boolean; // yardLine >= 80
  isGoalLine: boolean; // yardLine >= 95
}

// Helper: Filter plays by Billick situations (down, distance, field zone)
const filterPlaysBySituation = (
  gamePlanPlays: GamePlanPlay[],
  situation: GameSituation
): GamePlanPlay[] => {
  const { down, distance, yardLine } = situation;

  return gamePlanPlays.filter((planPlay) => {
    const play = planPlay.play;
    if (!play) return false;

    // Filter by down (if play has down restrictions)
    if (play.down && play.down !== down) return false;

    // Filter by distance (short: 1-3, medium: 4-7, long: 8+)
    if (play.distance) {
      if (distance <= 3 && play.distance !== "short") return false;
      if (distance >= 4 && distance <= 7 && play.distance !== "medium")
        return false;
      if (distance >= 8 && play.distance !== "long") return false;
    }

    // Filter by field zone
    if (play.field_zone) {
      if (yardLine < 50 && play.field_zone === "opponent") return false;
      if (yardLine >= 50 && yardLine < 80 && play.field_zone === "midfield")
        return false;
      if (yardLine >= 80 && yardLine < 95 && play.field_zone === "red_zone")
        return false;
      if (yardLine >= 95 && play.field_zone === "goal_line") return false;
    }

    return true;
  });
};

// Helper: Calculate new situation after play execution
const calculateNextSituation = (
  situation: GameSituation,
  yardsGained: number,
  options?: {
    wasTouchdown?: boolean;
    wasTurnover?: boolean;
  }
): GameSituation => {
  if (options?.wasTouchdown) {
    // Touchdown - reset to own 25 (simulating kickoff)
    return {
      ...situation,
      down: 1,
      distance: 10,
      yardLine: 25,
    };
  }

  if (options?.wasTurnover) {
    // Turnover - possession changes (handled externally)
    return situation;
  }

  // Normal play progression
  const newYardLine = Math.min(100, situation.yardLine + yardsGained);
  const yardsToFirstDown = situation.distance - yardsGained;

  if (yardsToFirstDown <= 0) {
    // First down!
    return {
      ...situation,
      down: 1,
      distance: 10,
      yardLine: newYardLine,
    };
  }

  if (situation.down < 4) {
    // Advance down
    return {
      ...situation,
      down: situation.down + 1,
      distance: yardsToFirstDown,
      yardLine: newYardLine,
    };
  }

  // 4th down - turnover on downs
  return {
    ...situation,
    down: 1,
    distance: 10,
    yardLine: newYardLine,
  };
};

// Load game plan and associated plays
async function loadGamePlanData(gamePlanId: string): Promise<{
  plan: GamePlan;
  plays: GamePlanPlay[];
}> {
  const plan = await GamePlanService.getGamePlan(gamePlanId);
  if (!plan) {
    throw new Error("Game plan not found");
  }

  const plays = await GamePlanService.getGamePlanPlays(gamePlanId);
  return { plan, plays };
}

/**
 * Hook for managing game session tracking
 * Extends base useSession with game-specific logic
 */
export function useGameSession({
  gamePlanId,
  mode,
  gameDate = new Date(),
  opponent,
  isHomeGame = true,
}: UsageGameSessionOptions): UseGameSessionReturn {
  const [gamePlan, setGamePlan] = useState<GamePlan | null>(null);
  const [gamePlanPlays, setGamePlanPlays] = useState<GamePlanPlay[]>([]);
  const [currentPlay, setCurrentPlay] = useState<GamePlanPlay | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Game situation state (Phase 14: added score/timeout/urgency)
  const [situation, setSituation] = useState<GameSituation>({
    quarter: 1,
    timeRemaining: "15:00",
    down: 1,
    distance: 10,
    yardLine: 25, // Start at own 25
    hashMark: "middle",
    // Phase 14: Score tracking
    teamScore: 0,
    opponentScore: 0,
    // Phase 14: Timeout tracking (3 per half)
    teamTimeouts: 3,
    opponentTimeouts: 3,
    // Phase 14: Game urgency (calculated)
    gameUrgency: "normal",
    isHurryUp: false,
  });

  // Drive tracking
  const [currentDrive, setCurrentDrive] = useState({
    plays: 0,
    yards: 0,
    touchdowns: 0,
    turnovers: 0,
  });

  const {
    state: sessionState,
    startSession: baseStartSession,
    endSession: baseEndSession,
    pauseSession,
    resumeSession,
    logExecution,
    hasPendingSync,
  } = useSession({
    sessionType: "game",
    sessionMode: mode,
    scriptOrPlanId: gamePlanId,
  });

  // Load game plan
  const loadGamePlan = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { plan, plays } = await loadGamePlanData(gamePlanId);
      setGamePlan(plan);
      setGamePlanPlays(plays);
    } catch (err) {
      logError("Error loading game plan:", err);
      setError(
        err instanceof Error ? err : new Error("Failed to load game plan")
      );
    } finally {
      setIsLoading(false);
    }
  }, [gamePlanId]);

  useEffect(() => {
    loadGamePlan();
  }, [gamePlanId, loadGamePlan]);

  // Start game session
  const startSession = useCallback(async () => {
    if (!gamePlan) {
      throw new Error("Game plan not loaded");
    }

    const sessionData: CreateGameSessionData = {
      gamePlanId: gamePlan.id,
      sessionMode: mode,
      gameDate,
      opponent,
      isHomeGame,
      notes: "",
      weather: "",
      fieldConditions: "",
    };

    await baseStartSession("game", sessionData);
  }, [gamePlan, mode, gameDate, opponent, isHomeGame, baseStartSession]);

  // End game session
  const endSession = useCallback(async () => {
    await baseEndSession();
  }, [baseEndSession]);

  // Update situation (recalculates urgency when relevant fields change)
  const updateSituation = useCallback((updates: Partial<GameSituation>) => {
    setSituation((prev) => {
      const next = { ...prev, ...updates };

      // Phase 14: Recalculate game urgency when score/time changes
      if (
        updates.quarter !== undefined ||
        updates.timeRemaining !== undefined ||
        updates.teamScore !== undefined ||
        updates.opponentScore !== undefined
      ) {
        next.gameUrgency = calculateGameUrgency(
          next.teamScore,
          next.opponentScore,
          next.quarter,
          next.timeRemaining,
          next.teamTimeouts
        );
        next.isHurryUp = shouldBeInHurryUp(
          next.quarter,
          next.timeRemaining,
          next.teamScore - next.opponentScore,
          next.teamTimeouts
        );
      }

      return next;
    });
  }, []);

  // Phase 14: Update score (handles touchdown/FG scoring)
  const updateScore = useCallback(
    (team: "us" | "them", points: number) => {
      setSituation((prev) => {
        const next =
          team === "us"
            ? { ...prev, teamScore: prev.teamScore + points }
            : { ...prev, opponentScore: prev.opponentScore + points };

        // Recalculate game urgency after score change
        next.gameUrgency = calculateGameUrgency(
          next.teamScore,
          next.opponentScore,
          next.quarter,
          next.timeRemaining,
          next.teamTimeouts
        );
        next.isHurryUp = shouldBeInHurryUp(
          next.quarter,
          next.timeRemaining,
          next.teamScore - next.opponentScore,
          next.teamTimeouts
        );

        return next;
      });
    },
    []
  );

  // Phase 14: Use a timeout
  const useTimeout = useCallback((team: "us" | "them") => {
    setSituation((prev) => {
      if (team === "us" && prev.teamTimeouts > 0) {
        return { ...prev, teamTimeouts: prev.teamTimeouts - 1 };
      }
      if (team === "them" && prev.opponentTimeouts > 0) {
        return { ...prev, opponentTimeouts: prev.opponentTimeouts - 1 };
      }
      return prev;
    });
  }, []);

  // Phase 14: Reset timeouts (at halftime, timeouts reset to 3)
  const resetTimeouts = useCallback((forQuarter: 1 | 2 | 3 | 4) => {
    // NFL rule: 3 timeouts per half
    if (forQuarter === 3) {
      // Reset both teams at halftime
      setSituation((prev) => ({
        ...prev,
        teamTimeouts: 3,
        opponentTimeouts: 3,
      }));
    }
  }, []);

  // Phase 14: Should go for 2-point conversion?
  const shouldGoForTwoDecision = useMemo(() => {
    return shouldGoForTwo(
      situation.teamScore,
      situation.opponentScore,
      situation.quarter,
      situation.timeRemaining
    );
  }, [
    situation.teamScore,
    situation.opponentScore,
    situation.quarter,
    situation.timeRemaining,
  ]);

  // Phase 14: Play type recommendation based on game urgency
  const playTypeRecommendation = useMemo(() => {
    return getPlayTypeRecommendation(
      situation.gameUrgency,
      situation.quarter,
      situation.timeRemaining
    );
  }, [situation.gameUrgency, situation.quarter, situation.timeRemaining]);

  // Filter plays by situation (Billick Situations)
  const filteredPlays = useMemo(
    () => filterPlaysBySituation(gamePlanPlays, situation),
    [gamePlanPlays, situation]
  );

  // Recommended plays (sorted by confidence - Phase 11 feature)
  const recommendedPlays = useMemo(() => {
    // For now, just return filtered plays
    // In Phase 11, we'll add AI confidence sorting
    return filteredPlays;
  }, [filteredPlays]);

  // Log a play execution
  const logPlay = useCallback(
    async (
      play: GamePlanPlay,
      result: ExecutionResult,
      yardsGained: number,
      options?: {
        wasTouchdown?: boolean;
        wasTurnover?: boolean;
        wasPenalty?: boolean;
        penaltyYards?: number;
        notes?: string;
        quickTags?: string[];
        opponentCoverage?: OpponentCoverage;
      }
    ) => {
      if (!sessionState.session) {
        throw new Error("No active session");
      }

      await logExecution({
        playId: play.play_id,
        formationId: play.play?.formation_id,
        result,
        yardsGained,
        quarter: situation.quarter,
        down: situation.down,
        distance: situation.distance,
        yardLine: situation.yardLine,
        hashMark: situation.hashMark,
        opponentCoverage: options?.opponentCoverage, // Phase 13.2
        wasTouchdown: options?.wasTouchdown || false,
        wasTurnover: options?.wasTurnover || false,
        wasPenalty: options?.wasPenalty || false,
        penaltyYards: options?.penaltyYards,
        notes: options?.notes,
        quickTags: options?.quickTags,
      });

      // Update drive tracking
      setCurrentDrive((prev) => ({
        plays: prev.plays + 1,
        yards: prev.yards + yardsGained,
        touchdowns: prev.touchdowns + (options?.wasTouchdown ? 1 : 0),
        turnovers: prev.turnovers + (options?.wasTurnover ? 1 : 0),
      }));

      // Calculate and apply next situation
      const nextSituation = calculateNextSituation(situation, yardsGained, {
        wasTouchdown: options?.wasTouchdown,
        wasTurnover: options?.wasTurnover,
      });
      setSituation(nextSituation);

      // Reset drive on scoring plays or turnovers
      if (options?.wasTouchdown || options?.wasTurnover) {
        setCurrentDrive({ plays: 0, yards: 0, touchdowns: 0, turnovers: 0 });
      }
    },
    [sessionState, situation, logExecution]
  );

  // Manual down advancement
  const advanceDown = useCallback(() => {
    if (situation.down < 4) {
      setSituation((prev) => ({
        ...prev,
        down: prev.down + 1,
      }));
    }
  }, [situation.down]);

  const resetDowns = useCallback(() => {
    setSituation((prev) => ({
      ...prev,
      down: 1,
      distance: 10,
    }));
  }, []);

  const nextQuarter = useCallback(() => {
    if (situation.quarter < 4) {
      setSituation((prev) => ({
        ...prev,
        quarter: prev.quarter + 1,
        timeRemaining: "15:00",
      }));
    }
  }, [situation.quarter]);

  // Select current play
  const selectPlay = useCallback((play: GamePlanPlay) => {
    setCurrentPlay(play);
  }, []);

  // Computed flags
  const isRedZone = situation.yardLine >= 80;
  const isGoalLine = situation.yardLine >= 95;
  const isSessionActive = sessionState.isActive && !sessionState.isPaused;
  const isPaused = sessionState.isPaused;

  return {
    // Session state
    session: sessionState.session as GameSession | null,
    isLoading,
    error,

    // Game plan
    gamePlan,
    gamePlanPlays,

    // Current situation
    situation,
    updateSituation,

    // Filtered plays
    filteredPlays,
    recommendedPlays,

    // Current play
    currentPlay,
    selectPlay,

    // Session controls
    startSession,
    endSession,
    pauseSession,
    resumeSession,

    // Play execution
    logPlay,

    // Down/distance
    advanceDown,
    resetDowns,
    nextQuarter,

    // Phase 14: Score & timeout management
    updateScore,
    useTimeout,
    resetTimeouts,

    // Phase 14: Game urgency helpers
    shouldGoForTwo: () => shouldGoForTwoDecision,
    playTypeRecommendation,

    // Drive tracking
    currentDrive,

    // State flags
    isSessionActive,
    isPaused,
    hasPendingSync,
    isRedZone,
    isGoalLine,
  };
}
