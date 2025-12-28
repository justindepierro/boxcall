/**
 * usePlaylistKeyboard Hook
 *
 * Provides keyboard navigation for the play list:
 * - J/K or Arrow Down/Up to navigate between plays
 * - Enter to expand/collapse selected play
 * - Escape to close expanded play
 */

import { useCallback, useEffect, useState } from "react";

interface UsePlaylistKeyboardOptions {
  /** Array of play IDs in display order */
  playIds: string[];
  /** Currently expanded play ID */
  expandedPlayId: string | null;
  /** Callback to toggle play expansion */
  onToggleExpand: (playId: string) => void;
  /** Whether keyboard navigation is enabled */
  enabled?: boolean;
}

interface UsePlaylistKeyboardResult {
  /** Currently focused play ID (for visual indicator) */
  focusedPlayId: string | null;
  /** Set focused play ID manually */
  setFocusedPlayId: (playId: string | null) => void;
  /** Props to spread on the list container for keyboard handling */
  containerProps: {
    tabIndex: number;
    onKeyDown: (e: React.KeyboardEvent) => void;
    role: string;
    "aria-label": string;
    "aria-activedescendant": string | undefined;
  };
}

/** Scroll a play card into view */
function scrollPlayIntoView(playId: string, block: ScrollLogicalPosition = "nearest") {
  const element = document.getElementById(`play-card-${playId}`);
  element?.scrollIntoView({ behavior: "smooth", block });
}

/** Navigate to next or previous play */
function getNavigatedIndex(
  currentIndex: number,
  direction: "next" | "prev",
  listLength: number
): number {
  if (direction === "next") {
    return currentIndex < listLength - 1 ? currentIndex + 1 : 0;
  }
  return currentIndex > 0 ? currentIndex - 1 : listLength - 1;
}

export function usePlaylistKeyboard({
  playIds,
  expandedPlayId,
  onToggleExpand,
  enabled = true,
}: UsePlaylistKeyboardOptions): UsePlaylistKeyboardResult {
  const [focusedPlayId, setFocusedPlayId] = useState<string | null>(null);

  // Reset focus when play list changes
  useEffect(() => {
    if (playIds.length > 0 && !playIds.includes(focusedPlayId ?? "")) {
      setFocusedPlayId(null);
    }
  }, [playIds, focusedPlayId]);

  const navigateToPlay = useCallback(
    (direction: "next" | "prev") => {
      const currentIndex = focusedPlayId ? playIds.indexOf(focusedPlayId) : -1;
      const newIndex = getNavigatedIndex(currentIndex, direction, playIds.length);
      const newPlayId = playIds[newIndex];
      setFocusedPlayId(newPlayId);
      scrollPlayIntoView(newPlayId);
    },
    [focusedPlayId, playIds]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!enabled || playIds.length === 0) return;

      const key = e.key;

      // Navigation keys
      if (key === "j" || key === "ArrowDown") {
        e.preventDefault();
        navigateToPlay("next");
        return;
      }
      if (key === "k" || key === "ArrowUp") {
        e.preventDefault();
        navigateToPlay("prev");
        return;
      }

      // Action keys
      if (key === "Enter" && focusedPlayId) {
        e.preventDefault();
        onToggleExpand(focusedPlayId);
        return;
      }
      if (key === "Escape") {
        e.preventDefault();
        if (expandedPlayId) onToggleExpand(expandedPlayId);
        setFocusedPlayId(null);
        return;
      }

      // Jump keys
      if (key === "Home" && playIds.length > 0) {
        e.preventDefault();
        setFocusedPlayId(playIds[0]);
        scrollPlayIntoView(playIds[0], "start");
        return;
      }
      if (key === "End" && playIds.length > 0) {
        e.preventDefault();
        const lastId = playIds[playIds.length - 1];
        setFocusedPlayId(lastId);
        scrollPlayIntoView(lastId, "end");
      }
    },
    [enabled, playIds, focusedPlayId, expandedPlayId, onToggleExpand, navigateToPlay]
  );

  const containerProps = {
    tabIndex: enabled ? 0 : -1,
    onKeyDown: handleKeyDown,
    role: "listbox" as const,
    "aria-label": "Play list - use J/K or arrow keys to navigate, Enter to expand",
    "aria-activedescendant": focusedPlayId ? `play-card-${focusedPlayId}` : undefined,
  };

  return {
    focusedPlayId,
    setFocusedPlayId,
    containerProps,
  };
}

export default usePlaylistKeyboard;
