/**
 * usePracticeSession Hook
 * Practice-specific session management extending useSession
 */

// @ts-nocheck
// TODO: Fix types when integrating Stage 3 (Session Management)

import { useState, useEffect, useCallback } from "react";
import { useSession } from "./useSession";
import { PracticeService } from "../services/practiceService";
import type { 
  PracticeSession, 
  ExecutionResult,
  CreatePracticeSessionData 
} from "../types/session";
import type { PracticeScript, PracticeScriptPlay } from "../types/practice";

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
  
  // Progress
  playProgress: number; // Percentage (0-100)
  overallProgress: number; // Percentage (0-100)
  
  // Session controls
  startSession: () => Promise<void>;
  endSession: () => Promise<void>;
  pauseSession: () => void;
  resumeSession: () => void;
  
  // Rep tracking (Phase 12.1: added tags)
  logRep: (result: ExecutionResult, notes?: string, tags?: string[]) => Promise<void>;
  skipRep: (notes?: string) => Promise<void>;
  nextRep: () => void;
  
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
 * Extends base useSession with practice-specific logic
 */
export function usePracticeSession({
  practiceScriptId,
  mode,
  sessionDate = new Date(),
}: UsePracticeSessionOptions): UsePracticeSessionReturn {
  const [practiceScript, setPracticeScript] = useState<PracticeScript | null>(null);
  const [scriptPlays, setScriptPlays] = useState<PracticeScriptPlay[]>([]);
  const [currentPlayIndex, setCurrentPlayIndex] = useState(0);
  const [currentRepNumber, setCurrentRepNumber] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const {
    state: sessionState,
    startSession: baseStartSession,
    endSession: baseEndSession,
    pauseSession,
    resumeSession,
    logExecution,
    nextPlay: baseNextPlay,
    previousPlay: basePreviousPlay,
    goToPlay: baseGoToPlay,
    hasPendingSync,
  } = useSession({
    sessionType: "practice",
    sessionMode: mode,
    scriptOrPlanId: practiceScriptId,
  });

  // Load practice script
  useEffect(() => {
    loadPracticeScript();
  }, [practiceScriptId]);

  const loadPracticeScript = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const script = await PracticeService.getPracticeScript(practiceScriptId);
      if (!script) {
        throw new Error("Practice script not found");
      }

      setPracticeScript(script);

      // Load script plays with full play details
      const plays = await PracticeService.getScriptPlays(practiceScriptId);
      setScriptPlays(plays);
    } catch (err) {
      console.error("Error loading practice script:", err);
      setError(err instanceof Error ? err : new Error("Failed to load practice script"));
    } finally {
      setIsLoading(false);
    }
  };

  // Start practice session
  const startSession = useCallback(async () => {
    if (!practiceScript) {
      throw new Error("Practice script not loaded");
    }

    const sessionData: CreatePracticeSessionData = {
      practiceScriptId: practiceScript.id,
      sessionMode: mode,
      sessionDate,
      notes: "",
      weather: "",
      fieldConditions: "",
    };

    await baseStartSession("practice", sessionData);
  }, [practiceScript, mode, sessionDate, baseStartSession]);

  // Computed values (must be before callbacks that use them)
  const currentPlay = scriptPlays[currentPlayIndex] || null;
  const totalRepsForCurrentPlay = currentPlay?.reps || 10; // Default to 10 if not specified
  
  const playProgress = totalRepsForCurrentPlay > 0
    ? (currentRepNumber / totalRepsForCurrentPlay) * 100
    : 0;

  // End practice session
  const endSession = useCallback(async () => {
    await baseEndSession();
  }, [baseEndSession]);

  // Log a rep execution (Phase 12.1: added tags support)
  const logRep = useCallback(
    async (result: ExecutionResult, notes?: string, tags?: string[]) => {
      if (!sessionState.session || !currentPlay) {
        throw new Error("No active session or current play");
      }

      await logExecution({
        playId: currentPlay.play_id,
        formationId: currentPlay.play?.formation_id,
        result,
        repNumber: currentRepNumber,
        notes,
        quickTags: tags,
      });

      // Auto-advance to next rep
      if (currentRepNumber < totalRepsForCurrentPlay) {
        setCurrentRepNumber(currentRepNumber + 1);
      } else {
        // Move to next play
        nextPlay();
      }
    },
    [sessionState, currentPlay, currentRepNumber, logExecution, totalRepsForCurrentPlay, nextPlay]
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
      setCurrentRepNumber(currentRepNumber + 1);
    }
  }, [currentRepNumber, totalRepsForCurrentPlay]);

  // Play navigation
  const nextPlay = useCallback(() => {
    if (currentPlayIndex < scriptPlays.length - 1) {
      setCurrentPlayIndex(currentPlayIndex + 1);
      setCurrentRepNumber(1);
      baseNextPlay();
    }
  }, [currentPlayIndex, scriptPlays.length, baseNextPlay]);

  const previousPlay = useCallback(() => {
    if (currentPlayIndex > 0) {
      setCurrentPlayIndex(currentPlayIndex - 1);
      setCurrentRepNumber(1);
      basePreviousPlay();
    }
  }, [currentPlayIndex, basePreviousPlay]);

  const goToPlay = useCallback(
    (index: number) => {
      if (index >= 0 && index < scriptPlays.length) {
        setCurrentPlayIndex(index);
        setCurrentRepNumber(1);
        baseGoToPlay(index);
      }
    },
    [scriptPlays.length, baseGoToPlay]
  );

  // Additional computed values
  const totalReps = scriptPlays.reduce((sum, play) => sum + (play.reps || 10), 0);
  const completedReps = scriptPlays
    .slice(0, currentPlayIndex)
    .reduce((sum, play) => sum + (play.reps || 10), 0) + currentRepNumber - 1;
  const overallProgress = totalReps > 0 ? (completedReps / totalReps) * 100 : 0;

  const isLastRep = currentRepNumber === totalRepsForCurrentPlay;
  const isLastPlay = currentPlayIndex === scriptPlays.length - 1;
  const isSessionActive = sessionState.isActive && !sessionState.isPaused;
  const isPaused = sessionState.isPaused;

  return {
    // Session state
    session: sessionState.session as PracticeSession | null,
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
