/**
 * usePracticeSession Hook
 * Practice-specific session management for BoxCall Live
 * Manages practice script loading, session state, and rep tracking
 */

import { useState, useEffect, useCallback, useMemo } from "react";
import { PracticeScriptService } from "../services/practice";
import { ExecutionTrackingService } from "../services/executionTrackingService";
import { useActiveTeamStore } from "../stores/activeTeamStore";
import type {
  PracticeSession,
  ExecutionResult,
  CreatePracticeSessionData,
} from "../types/session";
import type { PracticeScript, PracticeScriptPlay } from "../services/practice";
import { debug, error as logError } from "../utils/logger";

/**
 * Rep log entry for tracking individual rep results
 */
export interface RepLog {
  repNumber: number;
  result: ExecutionResult;
  notes?: string;
}

/**
 * Session stats computed from rep history
 */
export interface SessionStats {
  totalReps: number;
  completedReps: number;
  successfulReps: number;
  failedReps: number;
  neutralReps: number;
  skippedReps: number;
  successRate: number;
}

interface UsePracticeSessionOptions {
  practiceScriptId: string;
  mode: "live" | "retroactive";
  sessionDate?: Date;
}

interface UsePracticeSessionReturn {
  // Session state
  session: PracticeSession | null;
  isLoading: boolean;
  error: Error | null;

  // Practice script
  practiceScript: PracticeScript | null;
  scriptPlays: PracticeScriptPlay[];

  // Current play tracking
  currentPlayIndex: number;
  currentPlay: PracticeScriptPlay | null;
  currentRepNumber: number;
  totalRepsForCurrentPlay: number;

  // Rep history for current play (to show which reps were logged)
  repHistory: Map<number, { result: ExecutionResult; notes?: string }>;

  // Real-time computed stats
  computedStats: {
    totalReps: number;
    completedReps: number;
    successfulReps: number;
    failedReps: number;
    neutralReps: number;
    skippedReps: number;
    successRate: number;
  };

  // Progress
  playProgress: number; // Percentage (0-100)
  overallProgress: number; // Percentage (0-100)

  // Session controls
  startSession: () => Promise<void>;
  endSession: () => Promise<void>;
  pauseSession: () => void;
  resumeSession: () => void;

  // Rep tracking (Phase 12.1: added tags)
  logRep: (
    result: ExecutionResult,
    notes?: string,
    tags?: string[]
  ) => Promise<void>;
  skipRep: (notes?: string) => Promise<void>;
  nextRep: () => void;
  goToRep: (repNumber: number) => void; // New: jump to specific rep

  // Play navigation
  nextPlay: () => void;
  previousPlay: () => void;
  goToPlay: (index: number) => void;

  // State flags
  isSessionActive: boolean;
  isPaused: boolean;
  isLastRep: boolean;
  isLastPlay: boolean;
  hasPendingSync: boolean;
}

function usePracticeScriptLoader(practiceScriptId: string) {
  const [practiceScript, setPracticeScript] = useState<PracticeScript | null>(
    null
  );
  const [scriptPlays, setScriptPlays] = useState<PracticeScriptPlay[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadScript = async () => {
      if (!practiceScriptId) {
        debug("[usePracticeSession] No scriptId provided, skipping load");
        setIsLoading(false);
        setError(
          new Error(
            "No practice script ID provided. Please select a script from BoxCall."
          )
        );
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        debug(`[usePracticeSession] Loading script: ${practiceScriptId}`);

        const script =
          await PracticeScriptService.getPracticeScript(practiceScriptId);
        if (!script) {
          debug(
            `[usePracticeSession] Script not found for ID: ${practiceScriptId}`
          );
          throw new Error(
            `Practice script not found (ID: ${practiceScriptId}). It may have been deleted or you may not have access.`
          );
        }

        setPracticeScript(script);
        setScriptPlays(script.plays || []);
        debug(
          `[usePracticeSession] Loaded script "${script.name}" with ${script.plays?.length || 0} plays`
        );
      } catch (err) {
        logError("[usePracticeSession] Error loading script:", err);
        setError(
          err instanceof Error
            ? err
            : new Error("Failed to load practice script")
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadScript();
  }, [practiceScriptId]);

  return { practiceScript, scriptPlays, isLoading, error };
}

function computePracticeSessionStats(
  playRepHistory: Map<
    number,
    Map<number, { result: ExecutionResult; notes?: string }>
  >,
  scriptPlays: PracticeScriptPlay[]
) {
  let totalCompleted = 0;
  let successCount = 0;
  let failureCount = 0;
  let neutralCount = 0;
  let skippedCount = 0;

  playRepHistory.forEach((playHistory) => {
    playHistory.forEach((entry) => {
      totalCompleted++;
      switch (entry.result) {
        case "success":
          successCount++;
          break;
        case "failure":
          failureCount++;
          break;
        case "neutral":
          neutralCount++;
          break;
        case "skipped":
          skippedCount++;
          break;
      }
    });
  });

  const totalRepsAllPlays = scriptPlays.reduce(
    (sum, play) => sum + (play.repetitions || 10),
    0
  );
  const successRate =
    totalCompleted > 0 ? (successCount / totalCompleted) * 100 : 0;

  return {
    totalReps: totalRepsAllPlays,
    completedReps: totalCompleted,
    successfulReps: successCount,
    failedReps: failureCount,
    neutralReps: neutralCount,
    skippedReps: skippedCount,
    successRate,
  };
}

function computeOverallProgress(params: {
  scriptPlays: PracticeScriptPlay[];
  currentPlayIndex: number;
  currentRepNumber: number;
}) {
  const { scriptPlays, currentPlayIndex, currentRepNumber } = params;

  const totalReps = scriptPlays.reduce(
    (sum, play) => sum + (play.repetitions || 10),
    0
  );
  const completedReps =
    scriptPlays
      .slice(0, currentPlayIndex)
      .reduce((sum, play) => sum + (play.repetitions || 10), 0) +
    currentRepNumber -
    1;
  const overallProgress = totalReps > 0 ? (completedReps / totalReps) * 100 : 0;

  return { totalReps, completedReps, overallProgress };
}

function usePracticeSessionControls(params: {
  activeTeamId: string | null;
  practiceScript: PracticeScript | null;
  mode: "live" | "retroactive";
  sessionDate: Date;
  session: PracticeSession | null;
  setSession: React.Dispatch<React.SetStateAction<PracticeSession | null>>;
  setIsSessionActive: React.Dispatch<React.SetStateAction<boolean>>;
  setCurrentPlayIndex: React.Dispatch<React.SetStateAction<number>>;
  setCurrentRepNumber: React.Dispatch<React.SetStateAction<number>>;
  setIsPaused: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const {
    activeTeamId,
    practiceScript,
    mode,
    sessionDate,
    session,
    setSession,
    setIsSessionActive,
    setCurrentPlayIndex,
    setCurrentRepNumber,
    setIsPaused,
  } = params;

  const startSession = useCallback(async () => {
    if (!activeTeamId) {
      throw new Error("No active team selected");
    }
    if (!practiceScript) {
      throw new Error("Practice script not loaded");
    }

    try {
      debug(
        `[usePracticeSession] Starting session for script: ${practiceScript.id}`
      );

      const sessionData: CreatePracticeSessionData = {
        teamId: activeTeamId,
        name: `${practiceScript.name || "Practice"} - ${new Date().toLocaleDateString()}`,
        practiceScriptId: practiceScript.id,
        sessionMode: mode,
        sessionDate,
        startedAt: new Date(),
        notes: "",
        weather: "",
        fieldConditions: "",
      };

      const newSession =
        await ExecutionTrackingService.createPracticeSession(sessionData);
      setSession(newSession);
      setIsSessionActive(true);
      setCurrentPlayIndex(0);
      setCurrentRepNumber(1);

      debug(`[usePracticeSession] Session started: ${newSession.id}`);
    } catch (err) {
      logError("[usePracticeSession] Error starting session:", err);
      throw err;
    }
  }, [
    activeTeamId,
    mode,
    practiceScript,
    sessionDate,
    setCurrentPlayIndex,
    setCurrentRepNumber,
    setIsSessionActive,
    setSession,
  ]);

  const endSession = useCallback(async () => {
    if (!session) return;

    try {
      debug(`[usePracticeSession] Ending session: ${session.id}`);
      await ExecutionTrackingService.updatePracticeSession(session.id, {
        endedAt: new Date(),
      });
      setIsSessionActive(false);
      setSession(null);
    } catch (err) {
      logError("[usePracticeSession] Error ending session:", err);
      throw err;
    }
  }, [session, setIsSessionActive, setSession]);

  const pauseSession = useCallback(() => {
    setIsPaused(true);
  }, [setIsPaused]);

  const resumeSession = useCallback(() => {
    setIsPaused(false);
  }, [setIsPaused]);

  return { startSession, endSession, pauseSession, resumeSession };
}

function usePracticeSessionNavigation(params: {
  scriptPlaysCount: number;
  currentPlayIndex: number;
  setCurrentPlayIndex: React.Dispatch<React.SetStateAction<number>>;
  setCurrentRepNumber: React.Dispatch<React.SetStateAction<number>>;
}) {
  const {
    scriptPlaysCount,
    currentPlayIndex,
    setCurrentPlayIndex,
    setCurrentRepNumber,
  } = params;

  const nextPlay = useCallback(() => {
    if (currentPlayIndex < scriptPlaysCount - 1) {
      setCurrentPlayIndex((prev) => prev + 1);
      setCurrentRepNumber(1);
    }
  }, [
    currentPlayIndex,
    scriptPlaysCount,
    setCurrentPlayIndex,
    setCurrentRepNumber,
  ]);

  const previousPlay = useCallback(() => {
    if (currentPlayIndex > 0) {
      setCurrentPlayIndex((prev) => prev - 1);
      setCurrentRepNumber(1);
    }
  }, [currentPlayIndex, setCurrentPlayIndex, setCurrentRepNumber]);

  const goToPlay = useCallback(
    (index: number) => {
      if (index >= 0 && index < scriptPlaysCount) {
        setCurrentPlayIndex(index);
        setCurrentRepNumber(1);
      }
    },
    [scriptPlaysCount, setCurrentPlayIndex, setCurrentRepNumber]
  );

  return { nextPlay, previousPlay, goToPlay };
}

function usePracticeSessionRepTracking(params: {
  session: PracticeSession | null;
  currentPlay: PracticeScriptPlay | null;
  activeTeamId: string | null;
  currentRepNumber: number;
  totalRepsForCurrentPlay: number;
  currentPlayIndex: number;
  mode: "live" | "retroactive";
  nextPlay: () => void;
  setCurrentRepNumber: React.Dispatch<React.SetStateAction<number>>;
  setPlayRepHistory: React.Dispatch<
    React.SetStateAction<
      Map<number, Map<number, { result: ExecutionResult; notes?: string }>>
    >
  >;
}) {
  const {
    session,
    currentPlay,
    activeTeamId,
    currentRepNumber,
    totalRepsForCurrentPlay,
    currentPlayIndex,
    mode,
    nextPlay,
    setCurrentRepNumber,
    setPlayRepHistory,
  } = params;

  const logRep = useCallback(
    async (result: ExecutionResult, notes?: string, tags?: string[]) => {
      if (!session || !currentPlay || !activeTeamId) {
        throw new Error("No active session or current play");
      }

      try {
        await ExecutionTrackingService.logExecution({
          practiceSessionId: session.id,
          teamId: activeTeamId,
          playId: currentPlay.playId,
          formationId: currentPlay.play?.formation_id ?? undefined,
          result,
          repNumber: currentRepNumber,
          notes,
          quickTags: tags,
          recordedMode: mode,
        });

        setPlayRepHistory((prev) => {
          const newHistory = new Map(prev);
          const playHistory = new Map(
            newHistory.get(currentPlayIndex) || new Map()
          );
          playHistory.set(currentRepNumber, { result, notes });
          newHistory.set(currentPlayIndex, playHistory);
          return newHistory;
        });

        if (currentRepNumber < totalRepsForCurrentPlay) {
          setCurrentRepNumber((prev) => prev + 1);
        } else {
          nextPlay();
        }
      } catch (err) {
        logError("[usePracticeSession] Error logging rep:", err);
        throw err;
      }
    },
    [
      activeTeamId,
      currentPlay,
      currentPlayIndex,
      currentRepNumber,
      mode,
      nextPlay,
      session,
      setCurrentRepNumber,
      setPlayRepHistory,
      totalRepsForCurrentPlay,
    ]
  );

  const skipRep = useCallback(
    async (notes?: string) => {
      await logRep("skipped", notes || "Rep skipped");
    },
    [logRep]
  );

  const nextRep = useCallback(() => {
    if (currentRepNumber < totalRepsForCurrentPlay) {
      setCurrentRepNumber((prev) => prev + 1);
    }
  }, [currentRepNumber, setCurrentRepNumber, totalRepsForCurrentPlay]);

  const goToRep = useCallback(
    (repNumber: number) => {
      if (repNumber >= 1 && repNumber <= totalRepsForCurrentPlay) {
        setCurrentRepNumber(repNumber);
      }
    },
    [setCurrentRepNumber, totalRepsForCurrentPlay]
  );

  return { logRep, skipRep, nextRep, goToRep };
}

/**
 * Hook for managing practice session tracking
 * Self-contained - handles script loading, session creation, and rep tracking
 */
export function usePracticeSession({
  practiceScriptId,
  mode,
  sessionDate = new Date(),
}: UsePracticeSessionOptions): UsePracticeSessionReturn {
  const activeTeamId = useActiveTeamStore((state) => state.activeTeamId);

  const { practiceScript, scriptPlays, isLoading, error } =
    usePracticeScriptLoader(practiceScriptId);

  // Session state
  const [session, setSession] = useState<PracticeSession | null>(null);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // Tracking state
  const [currentPlayIndex, setCurrentPlayIndex] = useState(0);
  const [currentRepNumber, setCurrentRepNumber] = useState(1);

  // Rep history per play (playIndex -> Map of repNumber -> result)
  const [playRepHistory, setPlayRepHistory] = useState<
    Map<number, Map<number, { result: ExecutionResult; notes?: string }>>
  >(new Map());
  const [hasPendingSync] = useState(false); // TODO: Implement offline sync

  // Computed values
  const currentPlay = scriptPlays[currentPlayIndex] || null;
  const totalRepsForCurrentPlay = currentPlay?.repetitions || 10;
  const playProgress =
    totalRepsForCurrentPlay > 0
      ? (currentRepNumber / totalRepsForCurrentPlay) * 100
      : 0;

  // Get rep history for current play
  const repHistory = playRepHistory.get(currentPlayIndex) || new Map();

  const computedStats = useMemo(
    () => computePracticeSessionStats(playRepHistory, scriptPlays),
    [playRepHistory, scriptPlays]
  );

  const { startSession, endSession, pauseSession, resumeSession } =
    usePracticeSessionControls({
      activeTeamId,
      practiceScript,
      mode,
      sessionDate,
      session,
      setSession,
      setIsSessionActive,
      setCurrentPlayIndex,
      setCurrentRepNumber,
      setIsPaused,
    });

  const { nextPlay, previousPlay, goToPlay } = usePracticeSessionNavigation({
    scriptPlaysCount: scriptPlays.length,
    currentPlayIndex,
    setCurrentPlayIndex,
    setCurrentRepNumber,
  });

  const { logRep, skipRep, nextRep, goToRep } = usePracticeSessionRepTracking({
    session,
    currentPlay,
    activeTeamId,
    currentRepNumber,
    totalRepsForCurrentPlay,
    currentPlayIndex,
    mode,
    nextPlay,
    setCurrentRepNumber,
    setPlayRepHistory,
  });

  const { overallProgress } = computeOverallProgress({
    scriptPlays,
    currentPlayIndex,
    currentRepNumber,
  });

  const isLastRep = currentRepNumber === totalRepsForCurrentPlay;
  const isLastPlay = currentPlayIndex === scriptPlays.length - 1;

  return {
    // Session state
    session,
    isLoading,
    error,

    // Practice script
    practiceScript,
    scriptPlays,

    // Current play tracking
    currentPlayIndex,
    currentPlay,
    currentRepNumber,
    totalRepsForCurrentPlay,

    // Rep history for current play
    repHistory,

    // Real-time computed stats
    computedStats,

    // Progress
    playProgress,
    overallProgress,

    // Session controls
    startSession,
    endSession,
    pauseSession,
    resumeSession,

    // Rep tracking
    logRep,
    skipRep,
    nextRep,
    goToRep,

    // Play navigation
    nextPlay,
    previousPlay,
    goToPlay,

    // State flags
    isSessionActive,
    isPaused,
    isLastRep,
    isLastPlay,
    hasPendingSync,
  };
}
