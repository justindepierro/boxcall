import { useState, useCallback } from "react";
import { toast } from "sonner";
import type { Play } from "../types/play";
import { error as logError } from "../utils/logger";
import { SecurePlaysService } from "../services/securePlaysService";

/**
 * Custom hook for optimistic play updates (Facebook-fast pattern)
 *
 * Provides instant UI feedback while syncing with database in background.
 * Automatically handles rollback on errors.
 *
 * @param activePlaybookId - Current playbook ID
 * @param onRefresh - Callback to trigger full data refresh
 * @returns Object with optimistic plays state and CRUD operations
 */
export function useOptimisticPlays(
  activePlaybookId: string | null,
  onRefresh: () => void
) {
  const [optimisticPlays, setOptimisticPlays] = useState<Play[]>([]);

  /**
   * Create new play with instant feedback
   */
  const handleCreatePlay = useCallback(
    async (playData: Partial<Play>): Promise<Play | void> => {
      if (!activePlaybookId) {
        toast.error("No active playbook");
        return;
      }

      try {
        // ⚡ OPTIMISTIC: Create temporary play with fake ID for instant feedback
        const tempId = `temp-${Date.now()}`;
        const optimisticPlay: Play = {
          ...playData,
          id: tempId,
          playbook_id: activePlaybookId,
          formation: playData.formation || "",
          play_name: playData.play_name || "",
          p_type: playData.p_type || "",
          confidence_base: playData.confidence_base || 70,
          times_called: 0,
          times_successful: 0,
          created_at: new Date(),
          updated_at: new Date(),
        } as Play;

        setOptimisticPlays((prev) => [optimisticPlay, ...prev]);

        // ⚡ INSTANT FEEDBACK: Show success immediately
        toast.success("Play created!");

        // Background: Create in database
        const createdPlay = await SecurePlaysService.createPlay({
          ...playData,
          playbook_id: activePlaybookId,
        });

        // Replace temp play with real play from database
        setOptimisticPlays((prev) =>
          prev.map((p) => (p.id === tempId ? createdPlay : p))
        );

        // Trigger refresh to sync with database
        onRefresh();

        return createdPlay;
      } catch (error) {
        logError("Failed to create play:", error);
        toast.error("Failed to create play");

        // Remove optimistic play on error
        setOptimisticPlays((prev) =>
          prev.filter((p) => !p.id.startsWith("temp-"))
        );
        throw error;
      }
    },
    [activePlaybookId, onRefresh]
  );

  /**
   * Update existing play with instant feedback
   */
  const handleUpdatePlay = useCallback(
    async (playId: string, updates: Partial<Play>) => {
      // Store previous state for rollback
      let previousPlay: Play | undefined;

      try {
        // 🚀 OPTIMISTIC UPDATE: Show changes immediately (Facebook-style!)
        setOptimisticPlays((prev) => {
          const existingPlay = prev.find((p) => p.id === playId);
          if (existingPlay) {
            previousPlay = existingPlay; // Save for rollback
            return prev.map((p) =>
              p.id === playId ? { ...p, ...updates } : p
            );
          }
          // If not in optimistic state, create an optimistic entry
          // (This handles edits from plays that came from database)
          return [
            {
              ...updates,
              id: playId,
              playbook_id: activePlaybookId,
              formation: updates.formation || "",
              play_name: updates.play_name || "",
              p_type: updates.p_type || "",
              confidence_base: updates.confidence_base || 70,
              times_called: updates.times_called || 0,
              times_successful: updates.times_successful || 0,
              created_by: updates.created_by || "",
              created_at: updates.created_at || new Date(),
              updated_at: new Date(),
            } as Play,
            ...prev,
          ];
        });

        // ⚡ INSTANT FEEDBACK: Show success immediately (user never waits!)
        toast.success("Play updated!");

        // Background: Update in database
        await SecurePlaysService.updatePlay(playId, updates);

        // Remove from optimistic state after database confirms
        setTimeout(() => {
          setOptimisticPlays((prev) => prev.filter((p) => p.id !== playId));
        }, 100);

        // ✅ NO MORE FULL REFRESH - optimistic updates handle UI
        // Old: onRefresh(); // 500ms full reload

        return Promise.resolve();
      } catch (error) {
        // 🔄 REVERT: Restore previous state on error
        if (previousPlay) {
          setOptimisticPlays((prev) =>
            prev.map((p) => (p.id === playId ? previousPlay! : p))
          );
        } else {
          setOptimisticPlays((prev) => prev.filter((p) => p.id !== playId));
        }

        logError("Failed to save play:", error);
        toast.error("Failed to save play. Changes reverted.");
        throw error; // Re-throw so the UI can show the error
      }
    },
    [activePlaybookId]
  );

  /**
   * Wrapper for components that expect (play: Play) signature
   */
  const handleSavePlay = useCallback(
    async (play: Play) => {
      await handleUpdatePlay(play.id, play);
    },
    [handleUpdatePlay]
  );

  return {
    optimisticPlays,
    handleCreatePlay,
    handleUpdatePlay,
    handleSavePlay,
  };
}
