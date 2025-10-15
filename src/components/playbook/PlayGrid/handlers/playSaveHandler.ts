/**
 * Play Save Handler
 * Handles saving play updates to the database with field mapping
 */

import type { Play } from "../../../../types/play";
import { info } from "../../../../utils/logger";

interface CreatePlaySaveHandlerProps {
  updatePlay: (playId: string, updates: any) => Promise<void>;
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
    console.log("[PlayGrid] 🔷 handlePlaySave START:", { playId, updates });

    // Start global save indicator
    startSaving();

    try {
      // Convert Play type updates to DatabasePlay type updates
      const dbUpdates: any = {};

      // Map all possible editable fields
      if (updates.formation !== undefined)
        dbUpdates.formation = updates.formation;
      if (updates.play_name !== undefined)
        dbUpdates.play_name = updates.play_name;
      if (updates.one_word_play !== undefined)
        dbUpdates.one_word_play = updates.one_word_play;
      if (updates.p_type !== undefined) dbUpdates.p_type = updates.p_type;
      if (updates.personnel !== undefined)
        dbUpdates.personnel = updates.personnel;
      if (updates.f_type !== undefined) dbUpdates.f_type = updates.f_type;
      if (updates.f_dir !== undefined) dbUpdates.f_dir = updates.f_dir;
      if (updates.protection !== undefined)
        dbUpdates.protection = updates.protection;
      if (updates.p_dir !== undefined) dbUpdates.p_dir = updates.p_dir;
      if (updates.r_str !== undefined) dbUpdates.r_str = updates.r_str;
      if (updates.p_str !== undefined) dbUpdates.p_str = updates.p_str;
      if (updates.pref_down !== undefined)
        dbUpdates.pref_down = updates.pref_down;
      if (updates.pref_dis !== undefined) dbUpdates.pref_dis = updates.pref_dis;
      if (updates.pref_hash !== undefined)
        dbUpdates.pref_hash = updates.pref_hash;
      if (updates.pref_cov !== undefined) dbUpdates.pref_cov = updates.pref_cov;
      if (updates.pref_front !== undefined)
        dbUpdates.pref_front = updates.pref_front;
      if (updates.ftag1 !== undefined) dbUpdates.ftag1 = updates.ftag1;
      if (updates.ftag2 !== undefined) dbUpdates.ftag2 = updates.ftag2;
      if (updates.p_tag1 !== undefined) dbUpdates.p_tag1 = updates.p_tag1;
      if (updates.p_tag2 !== undefined) dbUpdates.p_tag2 = updates.p_tag2;
      if (updates.back_align !== undefined)
        dbUpdates.back_align = updates.back_align;
      if (updates.back_left_of_qb !== undefined)
        dbUpdates.back_left_of_qb = Boolean(updates.back_left_of_qb);
      if (updates.back_right_of_qb !== undefined)
        dbUpdates.back_right_of_qb = Boolean(updates.back_right_of_qb);
      if (updates.shift !== undefined) dbUpdates.shift = updates.shift;
      if (updates.motion !== undefined) dbUpdates.motion = updates.motion;
      if (updates.key_player1 !== undefined)
        dbUpdates.key_player1 = updates.key_player1;
      if (updates.key_player2 !== undefined)
        dbUpdates.key_player2 = updates.key_player2;
      if (updates.check_into !== undefined)
        dbUpdates.check_into = updates.check_into;
      if (updates.notes !== undefined) dbUpdates.notes = updates.notes;

      console.log("[PlayGrid] 🔷 Mapped updates:", {
        playId,
        updates,
        dbUpdates,
        "dbUpdates.f_dir": dbUpdates.f_dir,
        "dbUpdates.p_dir": dbUpdates.p_dir,
      });
      console.log("[PlayGrid] 🔷 Calling updatePlay...");

      await updatePlay(playId, dbUpdates);

      console.log("[PlayGrid] 🟢 updatePlay completed successfully");
      info(`Play ${playId} updated successfully`);

      // Finish save with success status
      finishSaving("success");
    } catch (error) {
      console.error("[PlayGrid] 🔴 Failed to save play:", error);

      // Finish save with error status
      finishSaving("error");

      throw error; // Re-throw so PlayCard can handle the error
    }
  };
}
