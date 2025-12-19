import { useEffect } from "react";

interface ShortcutHandlers {
  onSearch?: () => void;
  onToggleView?: () => void;
  onNewPlay?: () => void;
  onCommandPalette?: () => void;
  onFavorites?: () => void;
}

type ShortcutHandlerKey = keyof ShortcutHandlers;

const MOD_SHORTCUTS: Record<string, ShortcutHandlerKey> = {
  k: "onCommandPalette",
  f: "onSearch",
  n: "onNewPlay",
};

const PLAIN_SHORTCUTS: Record<string, ShortcutHandlerKey> = {
  v: "onToggleView",
  f: "onFavorites",
};

function isTypingInInput(target: EventTarget | null): boolean {
  return (
    target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement
  );
}

function invokeHandler(handlers: ShortcutHandlers, key?: ShortcutHandlerKey) {
  if (!key) return;
  handlers[key]?.();
}

/**
 * Hook for registering playbook keyboard shortcuts
 * Cmd/Ctrl + K: Open command palette
 * Cmd/Ctrl + F: Focus search
 * Cmd/Ctrl + N: New play
 * V: Toggle view mode
 * F: Show favorites
 */
export function usePlaybookShortcuts(handlers: ShortcutHandlers) {
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in input fields
      if (isTypingInInput(e.target)) {
        return;
      }

      const isMod = e.metaKey || e.ctrlKey;
      const key = e.key.toLowerCase();

      const modShortcut = isMod ? MOD_SHORTCUTS[key] : undefined;
      if (modShortcut) {
        e.preventDefault();
        invokeHandler(handlers, modShortcut);
        return;
      }

      if (!isMod && !e.shiftKey && !e.altKey) {
        const plainShortcut = PLAIN_SHORTCUTS[key];
        if (plainShortcut) {
          e.preventDefault();
          invokeHandler(handlers, plainShortcut);
        }
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [handlers]);
}
