/**
 * usePracticeSession Hook
 * Practice-specific session management for BoxCall Live
 * Manages practice script loading, session state, and rep tracking
 */

import { useState, useEffect, useCallback, useMemo } from "react";
import { PracticeService } from "../services/practiceService";
import { ExecutionTrackingService } from "../services/executionTrackingService";
import { useActiveTeamStore } from "../stores/activeTeamStore";
import type {
  PracticeSession,
  ExecutionResult,
  CreatePracticeSessionData,
} from "../types/session";
import type { PracticeScript, PracticeScriptPlay } from "../types/practice";
import { debug, error as logError } from "../utils/logger";

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

/**
 * Hook for managing practice session tracking
 * Self-contained - handles script loading, session creation, and rep tracking
 */
export function usePracticeSession({
  practiceScriptId,
  mode,
  sessionDate = new Date(),
}: UsePracticeSessionOptions): UsePracticeSessionReturn {
  const { activeTeamId } = useActiveTeamStore();

  // Practice script state
  const [practiceScript, setPracticeScript] = useState<PracticeScript | null>(
    null
  );
  const [scriptPlays, setScriptPlays] = useState<PracticeScriptPlay[]>([]);

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

  // UI state
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [hasPendingSync] = useState(false); // TODO: Implement offline sync

  // Load practice script on mount
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
          await PracticeService.getPracticeScript(practiceScriptId);
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

  // Computed values
  const currentPlay = scriptPlays[currentPlayIndex] || null;
  const totalRepsForCurrentPlay = currentPlay?.repetitions || 10;
  const playProgress =
    totalRepsForCurrentPlay > 0
      ? (currentRepNumber / totalRepsForCurrentPlay) * 100
      : 0;

  // Get rep history for current play
  const repHistory = playRepHistory.get(currentPlayIndex) || new Map();

  // Compute real-time stats from repHistory
  const computedStats = useMemo(() => {
    let totalCompleted = 0;
    let successCount = 0;
    let failureCount = 0;
    let neutralCount = 0;
    let skippedCount = 0;

    // Iterate through all plays' history
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
  }, [playRepHistory, scriptPlays]);

  // Start practice session - creates in database
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
  }, [activeTeamId, practiceScript, mode, sessionDate]);

  // End practice session
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
  }, [session]);

  // Pause/Resume session
  const pauseSession = useCallback(() => {
    setIsPaused(true);
  }, []);

  const resumeSession = useCallback(() => {
    setIsPaused(false);
  }, []);

  // Play navigation
  const nextPlay = useCallback(() => {
    if (currentPlayIndex < scriptPlays.length - 1) {
      setCurrentPlayIndex((prev) => prev + 1);
      setCurrentRepNumber(1);
    }
  }, [currentPlayIndex, scriptPlays.length]);

  const previousPlay = useCallback(() => {
    if (currentPlayIndex > 0) {
      setCurrentPlayIndex((prev) => prev - 1);
      setCurrentRepNumber(1);
    }
  }, [currentPlayIndex]);

  const goToPlay = useCallback(
    (index: number) => {
      if (index >= 0 && index < scriptPlays.length) {
        setCurrentPlayIndex(index);
        setCurrentRepNumber(1);
      }
    },
    [scriptPlays.length]
  );

  // Log a rep execution
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
          formationId: currentPlay.play?.formation_id,
          result,
          repNumber: currentRepNumber,
          notes,
          quickTags: tags,
          recordedMode: mode,
        });

        // Track rep result in history
        setPlayRepHistory((prev) => {
          const newHistory = new Map(prev);
          const playHistory = new Map(
            newHistory.get(currentPlayIndex) || new Map()
          );
          playHistory.set(currentRepNumber, { result, notes });
          newHistory.set(currentPlayIndex, playHistory);
          return newHistory;
        });

        // Auto-advance to next rep
        if (currentRepNumber < totalRepsForCurrentPlay) {
          setCurrentRepNumber((prev) => prev + 1);
        } else {
          // Move to next play
          nextPlay();
        }
      } catch (err) {
        logError("[usePracticeSession] Error logging rep:", err);
        throw err;
      }
    },
    [
      session,
      currentPlay,
      activeTeamId,
      currentRepNumber,
      totalRepsForCurrentPlay,
      nextPlay,
      mode,
      currentPlayIndex,
    ]
  );

  // Skip a rep (mark as skipped but still count it)
  const skipRep = useCallback(
    async (notes?: string) => {
      await logRep("skipped", notes || "Rep skipped");
    },
    [logRep]
  );

  // Manual rep navigation
  const nextRep = useCallback(() => {
    if (currentRepNumber < totalRepsForCurrentPlay) {
      setCurrentRepNumber((prev) => prev + 1);
    }
  }, [currentRepNumber, totalRepsForCurrentPlay]);

  // Jump to specific rep (for editing)
  const goToRep = useCallback(
    (repNumber: number) => {
      if (repNumber >= 1 && repNumber <= totalRepsForCurrentPlay) {
        setCurrentRepNumber(repNumber);
      }
    },
    [totalRepsForCurrentPlay]
  );

  // Additional computed values
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
