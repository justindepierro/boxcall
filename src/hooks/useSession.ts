/**
 * useSession Hook
 * Central state management for BoxCall Live Sessions
 * Handles practice and game sessions with offline support
 */

// TODO: Fix types when integrating Stage 3 (Session Management)

import { useState, useEffect, useCallback } from "react";
import type {
  SessionState,
  SessionType,
  SessionMode,
  CreatePlayExecutionData,
  PlayExecution,
  // ExecutionResult, // Unused - removed
} from "../types/session";
import { useActiveTeamStore } from "../stores/activeTeamStore";
import { ExecutionTrackingService } from "../services/executionTrackingService";
import { OfflineExecutionQueue } from "../utils/offlineExecutionQueue";
import { debug, error as logError } from "../utils/logger";

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

function calculateStats(executions: PlayExecution[]) {
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
    successRate: Math.round(successRate * 10) / 10,
  };
}

function useSessionLocalStoragePersistence(params: {
  state: SessionState;
  setState: React.Dispatch<React.SetStateAction<SessionState>>;
}) {
  const { state, setState } = params;

  useEffect(() => {
    const savedSession = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!savedSession) return;

    try {
      const parsed = JSON.parse(savedSession);
      setState((prev) => ({ ...prev, ...parsed, isActive: false }));
    } catch (err) {
      logError("Failed to restore session:", err);
    }
  }, [setState]);

  useEffect(() => {
    if (!state.isActive) return;
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(state));
  }, [state]);
}

function usePendingOfflineSyncFlag(params: {
  executions: PlayExecution[];
  setHasPendingSync: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const { executions, setHasPendingSync } = params;

  useEffect(() => {
    const pendingCount = OfflineExecutionQueue.getPendingCount();
    setHasPendingSync(pendingCount > 0);
  }, [executions, setHasPendingSync]);
}

function useSessionOfflineSync(params: {
  setHasPendingSync: React.Dispatch<React.SetStateAction<boolean>>;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
}) {
  const { setHasPendingSync, setError } = params;

  const syncOfflineExecutions = useCallback(async () => {
    try {
      const synced = await OfflineExecutionQueue.syncQueue();
      if (synced > 0) {
        debug(`Synced ${synced} offline executions`);
        setHasPendingSync(false);
      }
    } catch (err) {
      logError("Sync error:", err);
      setError("Failed to sync offline data");
    }
  }, [setError, setHasPendingSync]);

  return { syncOfflineExecutions };
}

function useSessionControls(params: {
  activeTeamId: string | null;
  sessionType: SessionType;
  sessionMode: SessionMode;
  scriptOrPlanId?: string;
  setState: React.Dispatch<React.SetStateAction<SessionState>>;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
  autoSaveIntervalId: NodeJS.Timeout | null;
  setAutoSaveIntervalId: React.Dispatch<
    React.SetStateAction<NodeJS.Timeout | null>
  >;
  syncOfflineExecutions: () => Promise<void>;
  stateSessionId?: string;
}) {
  const {
    activeTeamId,
    sessionType,
    sessionMode,
    scriptOrPlanId,
    setState,
    setIsLoading,
    setError,
    autoSaveIntervalId,
    setAutoSaveIntervalId,
    syncOfflineExecutions,
    stateSessionId,
  } = params;

  const startSession = useCallback(async () => {
    if (!activeTeamId) {
      setError("No active team selected");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      let loadedContent: Partial<SessionState> = {};
      if (sessionType === "practice" && scriptOrPlanId) {
        loadedContent = { practiceScript: undefined };
      } else if (sessionType === "game" && scriptOrPlanId) {
        loadedContent = { gamePlan: undefined };
      }

      const sessionId = crypto.randomUUID();

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

      setAutoSaveIntervalId(
        setInterval(() => {
          debug("Auto-saving session...");
        }, AUTO_SAVE_INTERVAL)
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start session");
      logError("Start session error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [
    activeTeamId,
    setAutoSaveIntervalId,
    scriptOrPlanId,
    sessionMode,
    sessionType,
    setError,
    setIsLoading,
    setState,
  ]);

  const endSession = useCallback(async () => {
    if (!stateSessionId) return;

    setIsLoading(true);

    try {
      if (autoSaveIntervalId) {
        clearInterval(autoSaveIntervalId);
        setAutoSaveIntervalId(null);
      }

      await syncOfflineExecutions();

      setState((prev) => ({
        ...prev,
        isActive: false,
        endedAt: new Date(),
      }));

      localStorage.removeItem(SESSION_STORAGE_KEY);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to end session");
      logError("End session error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [
    autoSaveIntervalId,
    setAutoSaveIntervalId,
    setError,
    setIsLoading,
    setState,
    stateSessionId,
    syncOfflineExecutions,
  ]);

  const pauseSession = useCallback(() => {
    setState((prev) => ({ ...prev, isPaused: true }));

    if (autoSaveIntervalId) {
      clearInterval(autoSaveIntervalId);
      setAutoSaveIntervalId(null);
    }
  }, [autoSaveIntervalId, setAutoSaveIntervalId, setState]);

  const resumeSession = useCallback(() => {
    setState((prev) => ({ ...prev, isPaused: false }));

    setAutoSaveIntervalId(
      setInterval(() => {
        debug("Auto-saving session...");
      }, AUTO_SAVE_INTERVAL)
    );
  }, [setAutoSaveIntervalId, setState]);

  return { startSession, endSession, pauseSession, resumeSession };
}

function useSessionExecutionTracking(params: {
  activeTeamId: string | null;
  sessionId?: string;
  sessionMode: SessionMode;
  sessionType: SessionType;
  currentRepNumber: number;
  currentQuarter?: number;
  currentDown?: number;
  currentDistance?: number;
  setState: React.Dispatch<React.SetStateAction<SessionState>>;
  setHasPendingSync: React.Dispatch<React.SetStateAction<boolean>>;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
}) {
  const {
    activeTeamId,
    sessionId,
    sessionMode,
    sessionType,
    currentRepNumber,
    currentQuarter,
    currentDown,
    currentDistance,
    setState,
    setHasPendingSync,
    setError,
  } = params;

  const logExecution = useCallback(
    async (execution: Partial<CreatePlayExecutionData>) => {
      if (!activeTeamId || !sessionId) return;

      const fullExecution: CreatePlayExecutionData = {
        ...execution,
        playId: execution.playId!,
        teamId: activeTeamId,
        recordedMode: sessionMode,
        executedAt: new Date(),
        result: execution.result || "neutral",
        ...(sessionType === "practice"
          ? {
              practiceSessionId: sessionId,
              repNumber: currentRepNumber,
            }
          : {
              gameSessionId: sessionId,
              quarter: currentQuarter || 1,
              down: currentDown || 1,
              distance: currentDistance || 10,
            }),
      };

      try {
        const isOnline = navigator.onLine;

        if (isOnline) {
          const savedExecution =
            await ExecutionTrackingService.logExecution(fullExecution);

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
          OfflineExecutionQueue.add(fullExecution);

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
        logError("Log execution error:", err);
        OfflineExecutionQueue.add(fullExecution);
        setHasPendingSync(true);
      }
    },
    [
      activeTeamId,
      currentDistance,
      currentDown,
      currentQuarter,
      currentRepNumber,
      sessionId,
      sessionMode,
      sessionType,
      setHasPendingSync,
      setState,
    ]
  );

  const updateExecution = useCallback(
    async (executionId: string, updates: Partial<PlayExecution>) => {
      try {
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
        logError("Update execution error:", err);
        setError("Failed to update execution");
      }
    },
    [setError, setState]
  );

  const deleteExecution = useCallback(
    async (executionId: string) => {
      try {
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
        logError("Delete execution error:", err);
        setError("Failed to delete execution");
      }
    },
    [setError, setState]
  );

  return { logExecution, updateExecution, deleteExecution };
}

function useSessionNavigation(params: {
  setState: React.Dispatch<React.SetStateAction<SessionState>>;
}) {
  const { setState } = params;

  const nextPlay = useCallback(() => {
    setState((prev) => ({
      ...prev,
      currentPlayIndex: prev.currentPlayIndex + 1,
      currentRepNumber: 1,
    }));
  }, [setState]);

  const previousPlay = useCallback(() => {
    setState((prev) => ({
      ...prev,
      currentPlayIndex: Math.max(0, prev.currentPlayIndex - 1),
      currentRepNumber: 1,
    }));
  }, [setState]);

  const goToPlay = useCallback(
    (index: number) => {
      setState((prev) => ({
        ...prev,
        currentPlayIndex: index,
        currentRepNumber: 1,
      }));
    },
    [setState]
  );

  const nextRep = useCallback(() => {
    setState((prev) => ({
      ...prev,
      currentRepNumber: prev.currentRepNumber + 1,
    }));
  }, [setState]);

  return { nextPlay, previousPlay, goToPlay, nextRep };
}

export function useSession({
  sessionType,
  sessionMode,
  scriptOrPlanId,
}: UseSessionProps): UseSessionReturn {
  const { activeTeamId } = useActiveTeamStore();
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

  // Auto-save
  const [autoSaveIntervalId, setAutoSaveIntervalId] =
    useState<NodeJS.Timeout | null>(null);

  useSessionLocalStoragePersistence({ state, setState });
  usePendingOfflineSyncFlag({
    executions: state.executions,
    setHasPendingSync,
  });
  useEffect(() => {
    return () => {
      if (autoSaveIntervalId) {
        clearInterval(autoSaveIntervalId);
      }
    };
  }, [autoSaveIntervalId]);

  const { syncOfflineExecutions } = useSessionOfflineSync({
    setHasPendingSync,
    setError,
  });

  const { startSession, endSession, pauseSession, resumeSession } =
    useSessionControls({
      activeTeamId,
      sessionType,
      sessionMode,
      scriptOrPlanId,
      setState,
      setIsLoading,
      setError,
      autoSaveIntervalId,
      setAutoSaveIntervalId,
      syncOfflineExecutions,
      stateSessionId: state.sessionId,
    });

  const { logExecution, updateExecution, deleteExecution } =
    useSessionExecutionTracking({
      activeTeamId,
      sessionId: state.sessionId,
      sessionMode,
      sessionType,
      currentRepNumber: state.currentRepNumber,
      currentQuarter: state.currentQuarter,
      currentDown: state.currentDown,
      currentDistance: state.currentDistance,
      setState,
      setHasPendingSync,
      setError,
    });

  const { nextPlay, previousPlay, goToPlay, nextRep } = useSessionNavigation({
    setState,
  });

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
