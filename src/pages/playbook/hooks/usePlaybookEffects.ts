import { useEffect } from "react";
import { debug } from "../../../utils/logger";

interface UsePlaybookEffectsProps {
  handleOpenBuilder: () => void;
  handleQuickNewPracticeScript: () => void;
  handleQuickNewGamePlan: () => void;
  closeAllModals: () => void;
}

export function usePlaybookEffects({
  handleOpenBuilder,
  handleQuickNewPracticeScript,
  handleQuickNewGamePlan,
  closeAllModals,
}: UsePlaybookEffectsProps) {
  // 🚀 PRELOAD HEAVY MODALS: Load during idle time for instant open (Facebook pattern!)
  useEffect(() => {
    const preloadTimer = setTimeout(() => {
      debug("[PlaybookPage] Preloading heavy modals during idle time...");

      // Preload AddNewPlayModal
      import("../../../components/playbook/AddNewPlayModal").catch(() => {
        // Silent fail
      });

      // Preload PracticeScriptBuilder
      import("../../../components/playbook/PracticeScriptBuilder").catch(() => {
        // Silent fail
      });

      // Preload PlaybookSettingsModal
      import("../../../components/playbook/PlaybookSettingsModal").catch(() => {
        // Silent fail
      });

      debug("[PlaybookPage] Modal preload complete! (3 heavy components)");
    }, 2000);

    return () => clearTimeout(preloadTimer);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K: Quick search
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        const searchInput = document.querySelector(
          "[data-search-input]"
        ) as HTMLInputElement;
        searchInput?.focus();
        return;
      }

      // Cmd/Ctrl + N: New play
      if ((e.metaKey || e.ctrlKey) && e.key === "n") {
        e.preventDefault();
        handleOpenBuilder();
        return;
      }

      // Escape: Close all modals
      if (e.key === "Escape") {
        closeAllModals();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleOpenBuilder, closeAllModals]);

  // Keyboard shortcuts for practice/game plan
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl/Cmd + P for new practice script
      if (
        (event.ctrlKey || event.metaKey) &&
        event.key === "p" &&
        !event.shiftKey
      ) {
        event.preventDefault();
        handleQuickNewPracticeScript();
      }
      // Ctrl/Cmd + G for new game plan
      if ((event.ctrlKey || event.metaKey) && event.key === "g") {
        event.preventDefault();
        handleQuickNewGamePlan();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleQuickNewPracticeScript, handleQuickNewGamePlan]);
}
