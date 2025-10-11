import { useEffect } from "react";

interface ShortcutHandlers {
  onSearch?: () => void;
  onToggleView?: () => void;
  onNewPlay?: () => void;
  onCommandPalette?: () => void;
  onFavorites?: () => void;
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
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      const isMod = e.metaKey || e.ctrlKey;

      // Cmd/Ctrl + K: Command palette
      if (isMod && e.key === "k") {
        e.preventDefault();
        handlers.onCommandPalette?.();
        return;
      }

      // Cmd/Ctrl + F: Focus search
      if (isMod && e.key === "f") {
        e.preventDefault();
        handlers.onSearch?.();
        return;
      }

      // Cmd/Ctrl + N: New play
      if (isMod && e.key === "n") {
        e.preventDefault();
        handlers.onNewPlay?.();
        return;
      }

      // V: Toggle view (without modifiers)
      if (e.key === "v" && !isMod && !e.shiftKey && !e.altKey) {
        e.preventDefault();
        handlers.onToggleView?.();
        return;
      }

      // F: Show favorites (without modifiers)
      if (e.key === "f" && !isMod && !e.shiftKey && !e.altKey) {
        e.preventDefault();
        handlers.onFavorites?.();
        return;
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [handlers]);
}
