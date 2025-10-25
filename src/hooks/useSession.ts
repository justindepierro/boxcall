// @ts-nocheck - Stage 3: Session management refactoring in progress
/**
 * useSession Hook
 * Central state management for BoxCall Live Sessions
 * Handles practice and game sessions with offline support
 */

// @ts-nocheck
// TODO: Fix types when integrating Stage 3 (Session Management)

import { useState, useEffect, useCallback, useRef } from "react";
import type {
  SessionState,
  SessionType,
  SessionMode,
  CreatePlayExecutionData,
  PlayExecution,
  // ExecutionResult, // Unused - removed
} from "../types/session";
import { useAuth } from "../app/auth-store";
import { ExecutionTrackingService } from "../services/executionTrackingService";
import { OfflineExecutionQueue } from "../utils/offlineExecutionQueue";

const AUTO_SAVE_INTERVAL = 30000; // 30 seconds
const SESSION_STORAGE_KEY = "boxcall_active_session";

interface UseSessionProps {
  sessionType: SessionType;
  sessionMode: SessionMode;
  scriptOrPlanId?: string;
}

interface UseSessionReturn {
  // State
  state: SessionState;
  isLoading: boolean;
  error: string | null;

  // Session control
  startSession: () => Promise<void>;
  endSession: () => Promise<void>;
  pauseSession: () => void;
  resumeSession: () => void;

  // Execution tracking
  logExecution: (execution: Partial<CreatePlayExecutionData>) => Promise<void>;
  updateExecution: (
    executionId: string,
    updates: Partial<PlayExecution>
  ) => Promise<void>;
  deleteExecution: (executionId: string) => Promise<void>;

  // Navigation
  nextPlay: () => void;
  previousPlay: () => void;
  goToPlay: (index: number) => void;
  nextRep: () => void;

  // Sync
  syncOfflineExecutions: () => Promise<void>;
  hasPendingSync: boolean;
}

export function useSession({
  sessionType,
  sessionMode,
  scriptOrPlanId,
}: UseSessionProps): UseSessionReturn {
  const { activeTeamId } = useAuth();
  // const { userId } = useAuth(); // Unused - removed

  // Core state
  const [state, setState] = useState<SessionState>({
    sessionMode,
    isActive: false,
    isPaused: false,
    currentPlayIndex: 0,
    currentRepNumber: 1,
    executions: [],
    totalExecutions: 0,
    successfulExecutions: 0,
    failedExecutions: 0,
    neutralExecutions: 0,
    skippedExecutions: 0,
    successRate: 0,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasPendingSync, setHasPendingSync] = useState(false);

  // Refs for auto-save and persistence
  const autoSaveIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const offlineQueue = useRef(new OfflineExecutionQueue());

  // ================================================
  // PERSISTENCE
  // ================================================

  // Load session from localStorage on mount
  useEffect(() => {
    const savedSession = localStorage.getItem(SESSION_STORAGE_KEY);
    if (savedSession) {
      try {
        const parsed = JSON.parse(savedSession);
        setState((prev) => ({ ...prev, ...parsed, isActive: false }));
      } catch (err) {
        console.error("Failed to restore session:", err);
      }
    }
  }, []);

  // Save session to localStorage whenever state changes
  useEffect(() => {
    if (state.isActive) {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(state));
    }
  }, [state]);

  // Check for pending offline executions
  useEffect(() => {
    const checkPending = async () => {
      const queue = await offlineQueue.current.getQueue();
      setHasPendingSync(queue.pendingCount > 0);
    };
    checkPending();
  }, [state.executions]);

  // ================================================
  // CALCULATE STATS
  // ================================================

  const calculateStats = useCallback((executions: PlayExecution[]) => {
    const total = executions.length;
    const successful = executions.filter((e) => e.result === "success").length;
    const failed = executions.filter((e) => e.result === "failure").length;
    const neutral = executions.filter((e) => e.result === "neutral").length;
    const skipped = executions.filter((e) => e.result === "skipped").length;
    const successRate = total > 0 ? (successful / (total - skipped)) * 100 : 0;

    return {
      totalExecutions: total,
      successfulExecutions: successful,
      failedExecutions: failed,
      neutralExecutions: neutral,
      skippedExecutions: skipped,
      successRate: Math.round(successRate * 10) / 10, // Round to 1 decimal
    };
  }, []);

  // ================================================
  // SESSION CONTROL
  // ================================================

  const startSession = useCallback(async () => {
    if (!activeTeamId) {
      setError("No active team selected");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Load practice script or game plan
      let loadedContent;
      if (sessionType === "practice" && scriptOrPlanId) {
        // TODO: Load practice script from PracticeService
        loadedContent = { practiceScript: undefined };
      } else if (sessionType === "game" && scriptOrPlanId) {
        // TODO: Load game plan from GamePlanService
        loadedContent = { gamePlan: undefined };
      }

      // Create session in database (TODO: implement when database schema ready)
      // const sessionData = {
      //   teamId: activeTeamId,
      //   sessionMode,
      //   startedAt: new Date(),
      //   ...(sessionType === "practice"
      //     ? {
      //         type: "practice" as const,
      //         practiceScriptId: scriptOrPlanId,
      //         sessionDate: new Date(),
      //       }
      //     : {
      //         type: "game" as const,
      //         gamePlanId: scriptOrPlanId,
      //         gameDate: new Date(),
      //         opponent: "", // TODO: Get from game plan
      //         isHomeGame: true,
      //       }),
      // };

      // TODO: Create session via ExecutionTrackingService
      const sessionId = crypto.randomUUID(); // Temporary

      setState((prev) => ({
        ...prev,
        sessionId,
        sessionType,
        sessionMode,
        isActive: true,
        isPaused: false,
        startedAt: new Date(),
        ...loadedContent,
      }));

      // Start auto-save
      autoSaveIntervalRef.current = setInterval(() => {
        // Auto-save logic here
        console.log("Auto-saving session...");
      }, AUTO_SAVE_INTERVAL);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start session");
      console.error("Start session error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [activeTeamId, sessionType, sessionMode, scriptOrPlanId]);

  const endSession = useCallback(async () => {
    if (!state.sessionId) return;

    setIsLoading(true);

    try {
      // Stop auto-save
      if (autoSaveIntervalRef.current) {
        clearInterval(autoSaveIntervalRef.current);
        autoSaveIntervalRef.current = null;
      }

      // Sync any pending offline executions
      await syncOfflineExecutions();

      // Update session in database
      // TODO: Call ExecutionTrackingService.endSession()

      setState((prev) => ({
        ...prev,
        isActive: false,
        endedAt: new Date(),
      }));

      // Clear localStorage
      localStorage.removeItem(SESSION_STORAGE_KEY);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to end session");
      console.error("End session error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [state.sessionId]); // syncOfflineExecutions is internal, doesn't need to be in deps

  const pauseSession = useCallback(() => {
    setState((prev) => ({ ...prev, isPaused: true }));

    // Pause auto-save
    if (autoSaveIntervalRef.current) {
      clearInterval(autoSaveIntervalRef.current);
      autoSaveIntervalRef.current = null;
    }
  }, []);

  const resumeSession = useCallback(() => {
    setState((prev) => ({ ...prev, isPaused: false }));

    // Resume auto-save
    autoSaveIntervalRef.current = setInterval(() => {
      console.log("Auto-saving session...");
    }, AUTO_SAVE_INTERVAL);
  }, []);

  // ================================================
  // EXECUTION TRACKING
  // ================================================

  const logExecution = useCallback(
    async (execution: Partial<CreatePlayExecutionData>) => {
      if (!activeTeamId || !state.sessionId) return;

      const fullExecution: CreatePlayExecutionData = {
        ...execution,
        playId: execution.playId!,
        teamId: activeTeamId,
        recordedMode: sessionMode,
        executedAt: new Date(),
        result: execution.result || "neutral",
        ...(sessionType === "practice"
          ? {
              practiceSessionId: state.sessionId,
              repNumber: state.currentRepNumber,
            }
          : {
              gameSessionId: state.sessionId,
              quarter: state.currentQuarter || 1,
              down: state.currentDown || 1,
              distance: state.currentDistance || 10,
            }),
      };

      try {
        // Check if online
        const isOnline = navigator.onLine;

        if (isOnline) {
          // Save directly to database
          const savedExecution =
            await ExecutionTrackingService.logExecution(fullExecution);

          // Add to state
          setState((prev) => {
            const newExecutions = [...prev.executions, savedExecution];
            return {
              ...prev,
              executions: newExecutions,
              ...calculateStats(newExecutions),
              lastSavedAt: new Date(),
            };
          });
        } else {
          // Add to offline queue
          await offlineQueue.current.addExecution(fullExecution);

          // Add to state with temporary ID
          const tempExecution: PlayExecution = {
            id: crypto.randomUUID(),
            ...fullExecution,
            createdAt: new Date(),
            executedAt: fullExecution.executedAt || new Date(),
            wasTouchdown: fullExecution.wasTouchdown || false,
            wasTurnover: fullExecution.wasTurnover || false,
            wasPenalty: fullExecution.wasPenalty || false,
          };

          setState((prev) => {
            const newExecutions = [...prev.executions, tempExecution];
            return {
              ...prev,
              executions: newExecutions,
              ...calculateStats(newExecutions),
            };
          });

          setHasPendingSync(true);
        }
      } catch (err) {
        console.error("Log execution error:", err);
        // On error, add to offline queue as fallback
        await offlineQueue.current.addExecution(fullExecution);
        setHasPendingSync(true);
      }
    },
    [
      activeTeamId,
      state.sessionId,
      sessionMode,
      sessionType,
      state.currentRepNumber,
      state.currentQuarter,
      state.currentDown,
      state.currentDistance,
      calculateStats,
    ]
  );

  const updateExecution = useCallback(
    async (executionId: string, updates: Partial<PlayExecution>) => {
      try {
        // TODO: Call ExecutionTrackingService.updateExecution()

        setState((prev) => {
          const newExecutions = prev.executions.map((e) =>
            e.id === executionId ? { ...e, ...updates } : e
          );
          return {
            ...prev,
            executions: newExecutions,
            ...calculateStats(newExecutions),
          };
        });
      } catch (err) {
        console.error("Update execution error:", err);
        setError("Failed to update execution");
      }
    },
    [calculateStats]
  );

  const deleteExecution = useCallback(
    async (executionId: string) => {
      try {
        // TODO: Call ExecutionTrackingService.deleteExecution()

        setState((prev) => {
          const newExecutions = prev.executions.filter(
            (e) => e.id !== executionId
          );
          return {
            ...prev,
            executions: newExecutions,
            ...calculateStats(newExecutions),
          };
        });
      } catch (err) {
        console.error("Delete execution error:", err);
        setError("Failed to delete execution");
      }
    },
    [calculateStats]
  );

  // ================================================
  // NAVIGATION
  // ================================================

  const nextPlay = useCallback(() => {
    setState((prev) => ({
      ...prev,
      currentPlayIndex: prev.currentPlayIndex + 1,
      currentRepNumber: 1, // Reset rep counter
    }));
  }, []);

  const previousPlay = useCallback(() => {
    setState((prev) => ({
      ...prev,
      currentPlayIndex: Math.max(0, prev.currentPlayIndex - 1),
      currentRepNumber: 1,
    }));
  }, []);

  const goToPlay = useCallback((index: number) => {
    setState((prev) => ({
      ...prev,
      currentPlayIndex: index,
      currentRepNumber: 1,
    }));
  }, []);

  const nextRep = useCallback(() => {
    setState((prev) => ({
      ...prev,
      currentRepNumber: prev.currentRepNumber + 1,
    }));
  }, []);

  // ================================================
  // OFFLINE SYNC
  // ================================================

  const syncOfflineExecutions = useCallback(async () => {
    try {
      const synced = await offlineQueue.current.syncQueue();
      if (synced > 0) {
        console.log(`Synced ${synced} offline executions`);
        setHasPendingSync(false);
      }
    } catch (err) {
      console.error("Sync error:", err);
      setError("Failed to sync offline data");
    }
  }, []);

  // ================================================
  // CLEANUP
  // ================================================

  useEffect(() => {
    return () => {
      if (autoSaveIntervalRef.current) {
        clearInterval(autoSaveIntervalRef.current);
      }
    };
  }, []);

  // ================================================
  // RETURN
  // ================================================

  return {
    state,
    isLoading,
    error,
    startSession,
    endSession,
    pauseSession,
    resumeSession,
    logExecution,
    updateExecution,
    deleteExecution,
    nextPlay,
    previousPlay,
    goToPlay,
    nextRep,
    syncOfflineExecutions,
    hasPendingSync,
  };
}
