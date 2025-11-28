/**
 * Formation History Hook - Undo/Redo for player movements
 *
 * Provides undo/redo functionality for formation editing.
 * Stores last 10 states in memory for coaches to revert mistakes.
 */

import { useState, useCallback, useRef } from "react";
import type { Player } from "../diagram-editor/types/Player";

interface HistoryState {
  players: Player[];
  timestamp: number;
}

const MAX_HISTORY_SIZE = 10;

export function useFormationHistory() {
  const [history, setHistory] = useState<HistoryState[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const isApplyingHistory = useRef(false); // Prevent circular updates

  /**
   * Save current state to history
   */
  const saveState = useCallback(
    (players: Player[]) => {
      // Don't save if we're applying history (circular update)
      if (isApplyingHistory.current) return;

      setHistory((prev) => {
        // Remove any "future" states if we're in the middle of history
        const newHistory = prev.slice(0, currentIndex + 1);

        // Add new state
        const newState: HistoryState = {
          players: JSON.parse(JSON.stringify(players)), // Deep clone
          timestamp: Date.now(),
        };

        // Keep only last N states
        const updatedHistory = [...newHistory, newState].slice(
          -MAX_HISTORY_SIZE
        );

        setCurrentIndex(updatedHistory.length - 1);
        return updatedHistory;
      });
    },
    [currentIndex]
  );

  /**
   * Undo to previous state
   */
  const undo = useCallback((): Player[] | null => {
    if (currentIndex <= 0) return null;

    const newIndex = currentIndex - 1;
    setCurrentIndex(newIndex);
    isApplyingHistory.current = true;

    const state = history[newIndex];

    // Reset flag after a tick
    setTimeout(() => {
      isApplyingHistory.current = false;
    }, 0);

    return state.players;
  }, [currentIndex, history]);

  /**
   * Redo to next state
   */
  const redo = useCallback((): Player[] | null => {
    if (currentIndex >= history.length - 1) return null;

    const newIndex = currentIndex + 1;
    setCurrentIndex(newIndex);
    isApplyingHistory.current = true;

    const state = history[newIndex];

    // Reset flag after a tick
    setTimeout(() => {
      isApplyingHistory.current = false;
    }, 0);

    return state.players;
  }, [currentIndex, history]);

  /**
   * Clear all history
   */
  const clearHistory = useCallback(() => {
    setHistory([]);
    setCurrentIndex(-1);
  }, []);

  return {
    saveState,
    undo,
    redo,
    clearHistory,
    canUndo: currentIndex > 0,
    canRedo: currentIndex < history.length - 1,
    historySize: history.length,
  };
}
