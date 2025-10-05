import { useEffect, useRef, useCallback } from "react";

/**
 * Nudge batch tracking for telemetry
 */
interface NudgeBatchState {
  events: number;
  playersMoved: number;
  timer: number | null;
}

/**
 * Field Keyboard Hook
 *
 * Manages all keyboard interactions for the field canvas:
 * - Arrow key nudging (with Alt/Shift modifiers for granularity)
 * - Tool shortcuts (V=select, P=add-player, R=route, M=pan, G=grid)
 * - Zoom shortcuts (Cmd/Ctrl +/-)
 * - Spacebar hold-to-pan
 * - Undo/Redo (Cmd/Ctrl Z/Shift-Z)
 * - Alignment shortcuts (Cmd/Ctrl+Alt + arrows)
 * - Distribute shortcuts (Cmd/Ctrl+Alt+Shift + H/V)
 * - Escape to cancel drawing/annotation
 * - Enter to commit route/annotation
 * - Backspace/Delete for undo point or delete annotation
 * - Delete selected players (Backspace/Delete)
 * - Duplicate annotation (D or Cmd/Ctrl D)
 *
 * @param onNudge - Callback when arrow keys nudge selection
 * @param onToolShortcut - Callback for tool shortcuts
 * @param onZoom - Callback for zoom shortcuts
 * @param onSpacebarPan - Callback when spacebar pan starts/ends
 * @param onUndo - Callback for undo
 * @param onRedo - Callback for redo
 * @param onAlign - Callback for alignment shortcuts
 * @param onDistribute - Callback for distribute shortcuts
 * @param onEscape - Callback for escape key
 * @param onEnter - Callback for enter key
 * @param onBackspace - Callback for backspace/delete key
 * @param onDuplicate - Callback for duplicate shortcut
 * @param onDelete - Callback for delete shortcut
 * @param selectedIds - Array of selected player IDs
 * @param enabled - Whether keyboard handling is enabled
 *
 * @returns Object containing keyboard state
 */
export function useFieldKeyboard({
  onNudge,
  onToolShortcut,
  onZoom,
  onSpacebarPan,
  onUndo,
  onRedo,
  onAlign,
  onDistribute,
  onEscape,
  onEnter,
  onBackspace,
  onDuplicate,
  onDelete,
  onToggleGrid,
  selectedIds = [],
  enabled = true,
}: {
  onNudge?: (direction: "up" | "down" | "left" | "right", delta: number, patches: { id: string; x: number; y: number }[]) => void;
  onToolShortcut?: (tool: "select" | "add-player" | "route" | "pan") => void;
  onZoom?: (direction: "in" | "out") => void;
  onSpacebarPan?: (active: boolean, prevTool: string | null) => void;
  onUndo?: () => void;
  onRedo?: () => void;
  onAlign?: (axis: "x" | "y", align: "start" | "center" | "end") => void;
  onDistribute?: (axis: "x" | "y", fixedSpacing: boolean) => void;
  onEscape?: () => void;
  onEnter?: () => void;
  onBackspace?: () => void;
  onDuplicate?: () => void;
  onDelete?: () => void;
  onToggleGrid?: () => void;
  selectedIds?: string[];
  enabled?: boolean;
}) {
  // Spacebar hold-to-pan state
  const spaceHeldRef = useRef(false);
  const prevToolRef = useRef<string | null>(null);

  // Nudge batch tracking for telemetry
  const nudgeBatchRef = useRef<NudgeBatchState>({
    events: 0,
    playersMoved: 0,
    timer: null,
  });

  // Commit move timer for debounced commits
  const commitMoveTimer = useRef<number | null>(null);

  /**
   * Schedule a debounced commit move (for arrow nudging)
   */
  const scheduleCommitMove = useCallback(() => {
    if (commitMoveTimer.current) window.clearTimeout(commitMoveTimer.current);
    commitMoveTimer.current = window.setTimeout(() => {
      // Commit will be handled by the parent component
      commitMoveTimer.current = null;
    }, 300);
  }, []);

  /**
   * Check if user is typing in an input/textarea
   */
  const isTyping = useCallback(() => {
    const ae = document.activeElement as HTMLElement | null;
    const tag = (ae?.tagName || "").toLowerCase();
    return tag === "input" || tag === "textarea" || ae?.isContentEditable;
  }, []);

  /**
   * Keyboard event handler
   */
  useEffect(() => {
    if (!enabled) return;

    const keyHandler = (e: KeyboardEvent) => {
      const typing = isTyping();
      const meta = e.metaKey || e.ctrlKey;
      const alt = e.altKey;
      const shift = e.shiftKey;

      // Tool shortcuts (avoid when typing)
      if (!typing && !meta && !alt) {
        const k = e.key.toLowerCase();
        if (k === "v") {
          onToolShortcut?.("select");
          e.preventDefault();
          return;
        } else if (k === "p") {
          onToolShortcut?.("add-player");
          e.preventDefault();
          return;
        } else if (k === "r") {
          onToolShortcut?.("route");
          e.preventDefault();
          return;
        } else if (k === "m") {
          onToolShortcut?.("pan");
          e.preventDefault();
          return;
        }

        // Grid overlay toggle (G)
        if (k === "g") {
          onToggleGrid?.();
          e.preventDefault();
          return;
        }
      }

      // Zoom shortcuts: Cmd/Ctrl + '+' or '-' (and '=' for '+')
      if (meta && (e.key === "+" || e.key === "=")) {
        onZoom?.("in");
        e.preventDefault();
        return;
      }
      if (meta && e.key === "-") {
        onZoom?.("out");
        e.preventDefault();
        return;
      }

      // Escape key
      if (e.key === "Escape") {
        onEscape?.();
        e.preventDefault();
        return;
      }

      // Spacebar: temporary pan tool (hold-to-pan)
      const isSpace = e.code === "Space" || e.key === " ";
      if (isSpace && !typing && !spaceHeldRef.current) {
        spaceHeldRef.current = true;
        const prevTool = prevToolRef.current;
        onSpacebarPan?.(true, prevTool);
        e.preventDefault();
        return;
      }

      // Enter key
      if (e.key === "Enter") {
        onEnter?.();
        e.preventDefault();
        return;
      }

      // Backspace/Delete key
      if (e.key === "Backspace" || e.key === "Delete") {
        onBackspace?.();
        if (!typing) {
          e.preventDefault();
        }
        return;
      }

      // Duplicate annotation (D or Cmd/Ctrl D)
      if (
        (e.key.toLowerCase() === "d" && meta) ||
        (e.key.toLowerCase() === "d" && !typing)
      ) {
        onDuplicate?.();
        e.preventDefault();
        return;
      }

      // Undo / Redo
      if (meta && e.key.toLowerCase() === "z") {
        if (shift) onRedo?.();
        else onUndo?.();
        e.preventDefault();
        return;
      }

      // Arrow key nudging
      if (
        selectedIds.length &&
        ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)
      ) {
        e.preventDefault();
        // Nudge step granularity: Alt = 0.1%, Shift = 2%, default = 0.5%
        const delta = alt ? 0.1 : shift ? 2 : 0.5;
        
        let direction: "up" | "down" | "left" | "right";
        if (e.key === "ArrowUp") direction = "up";
        else if (e.key === "ArrowDown") direction = "down";
        else if (e.key === "ArrowLeft") direction = "left";
        else direction = "right";

        // Parent component will calculate patches based on current player positions
        onNudge?.(direction, delta, []);
        scheduleCommitMove();

        // Track nudge batch for telemetry
        nudgeBatchRef.current.events++;
        nudgeBatchRef.current.playersMoved = Math.max(
          nudgeBatchRef.current.playersMoved,
          selectedIds.length
        );
        if (!nudgeBatchRef.current.timer) {
          nudgeBatchRef.current.timer = window.setTimeout(() => {
            // Telemetry will be handled by parent component
            nudgeBatchRef.current = {
              events: 0,
              playersMoved: 0,
              timer: null,
            };
          }, 1500);
        }
        return;
      }

      // Alignment shortcuts (Meta+Alt + arrows/letters)
      if (selectedIds.length >= 1 && meta && alt) {
        if (e.key === "ArrowLeft") {
          onAlign?.("x", "start");
          e.preventDefault();
          return;
        } else if (e.key === "ArrowRight") {
          onAlign?.("x", "end");
          e.preventDefault();
          return;
        } else if (e.key === "ArrowUp") {
          onAlign?.("y", "start");
          e.preventDefault();
          return;
        } else if (e.key === "ArrowDown") {
          onAlign?.("y", "end");
          e.preventDefault();
          return;
        } else if (e.key.toLowerCase() === "c") {
          onAlign?.("x", "center");
          e.preventDefault();
          return;
        } else if (e.key.toLowerCase() === "m") {
          onAlign?.("y", "center");
          e.preventDefault();
          return;
        } else if (e.key.toLowerCase() === "h") {
          onDistribute?.("x", shift);
          e.preventDefault();
          return;
        } else if (e.key.toLowerCase() === "v") {
          onDistribute?.("y", shift);
          e.preventDefault();
          return;
        }
      }
    };

    const keyUpHandler = (e: KeyboardEvent) => {
      const isSpace = e.code === "Space" || e.key === " ";
      if (isSpace && spaceHeldRef.current) {
        spaceHeldRef.current = false;
        const prevTool = prevToolRef.current;
        prevToolRef.current = null;
        onSpacebarPan?.(false, prevTool);
      }
    };

    window.addEventListener("keydown", keyHandler);
    window.addEventListener("keyup", keyUpHandler);
    return () => {
      window.removeEventListener("keydown", keyHandler);
      window.removeEventListener("keyup", keyUpHandler);
    };
  }, [
    enabled,
    selectedIds,
    isTyping,
    scheduleCommitMove,
    onNudge,
    onToolShortcut,
    onZoom,
    onSpacebarPan,
    onUndo,
    onRedo,
    onAlign,
    onDistribute,
    onEscape,
    onEnter,
    onBackspace,
    onDuplicate,
    onDelete,
    onToggleGrid,
  ]);

  return {
    spaceHeldRef,
    prevToolRef,
    nudgeBatchRef,
  };
}
