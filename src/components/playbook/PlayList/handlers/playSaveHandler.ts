/**
 * Play Save Handler
 * Handles saving play updates to the database with field mapping
 */

import type { Play } from "../../../../types/play";
import { debug, error as logError, info } from "../../../../utils/logger";

interface CreatePlaySaveHandlerProps {
  updatePlay: (playId: string, updates: Partial<Play>) => Promise<boolean>;
  startSaving: () => void;
  finishSaving: (status: "success" | "error") => void;
}

/**
 * Creates a play save handler with database field mapping
 */
export function createPlaySaveHandler({
  updatePlay,
  startSaving,
  finishSaving,
}: CreatePlaySaveHandlerProps) {
  return async (playId: string, updates: Partial<Play>) => {
    debug("[PlayList] 🔷 handlePlaySave START:", { playId, updates });

    // Start global save indicator
    startSaving();

    try {
      // Pass updates directly to updatePlay - the underlying service handles
      // any necessary field mapping between Play and database types
      debug("[PlayList] 🔷 Calling updatePlay with:", {
        playId,
        updates,
      });
      debug("[PlayList] 🔷 Calling updatePlay...");

      const success = await updatePlay(playId, updates);

      if (!success) {
        throw new Error("Failed to update play - check logs for details");
      }

      debug("[PlayList] 🟢 updatePlay completed successfully");
      info(`Play ${playId} updated successfully`);

      // Finish save with success status
      finishSaving("success");
    } catch (error) {
      logError("[PlayList] 🔴 Failed to save play", error);

      // Finish save with error status
      finishSaving("error");

      throw error; // Re-throw so PlayCard can handle the error
    }
  };
}
