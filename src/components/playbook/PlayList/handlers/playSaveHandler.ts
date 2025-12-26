/**
 * Play Save Handler
 * Handles saving play updates to the database with field mapping
 */

import type { Play } from "../../../../types/play";
import type { Database } from "../../../../types/database";
import { debug, error as logError, info } from "../../../../utils/logger";

type DatabasePlay = Database["public"]["Tables"]["plays"]["Row"];

interface CreatePlaySaveHandlerProps {
  updatePlay: (playId: string, updates: any) => Promise<boolean>;
  startSaving: () => void;
  finishSaving: (status: "success" | "error") => void;
}

function applyIfDefined<T>(
  value: T | undefined,
  apply: (value: T) => void
): void {
  if (value !== undefined) apply(value);
}

function mapPlayUpdatesToDbUpdates(
  updates: Partial<Play>
): Partial<DatabasePlay> {
  const dbUpdates: any = {};

  applyIfDefined(updates.formation, (v) => (dbUpdates.formation = v));
  applyIfDefined(updates.play_name, (v) => (dbUpdates.play_name = v));
  applyIfDefined(updates.one_word_play, (v) => (dbUpdates.one_word_play = v));
  applyIfDefined(updates.p_type, (v) => (dbUpdates.p_type = v));
  applyIfDefined(updates.personnel, (v) => (dbUpdates.personnel = v));
  applyIfDefined(updates.f_type, (v) => (dbUpdates.f_type = v));
  applyIfDefined(updates.f_dir, (v) => (dbUpdates.f_dir = v));
  applyIfDefined(updates.protection, (v) => (dbUpdates.protection = v));
  applyIfDefined(updates.p_dir, (v) => (dbUpdates.p_dir = v));
  applyIfDefined(updates.r_str, (v) => (dbUpdates.r_str = v));
  applyIfDefined(updates.p_str, (v) => (dbUpdates.p_str = v));
  applyIfDefined(updates.pref_down, (v) => (dbUpdates.pref_down = v));
  applyIfDefined(updates.pref_dis, (v) => (dbUpdates.pref_dis = v));
  applyIfDefined(updates.pref_hash, (v) => (dbUpdates.pref_hash = v));
  applyIfDefined(updates.pref_cov, (v) => (dbUpdates.pref_cov = v));
  applyIfDefined(updates.pref_front, (v) => (dbUpdates.pref_front = v));
  applyIfDefined(updates.pref_field_pos, (v) => (dbUpdates.pref_field_pos = v));
  applyIfDefined(updates.pref_situation, (v) => (dbUpdates.pref_situation = v));
  applyIfDefined(updates.ftag1, (v) => (dbUpdates.ftag1 = v));
  applyIfDefined(updates.ftag2, (v) => (dbUpdates.ftag2 = v));
  applyIfDefined(updates.p_tag1, (v) => (dbUpdates.p_tag1 = v));
  applyIfDefined(updates.p_tag2, (v) => (dbUpdates.p_tag2 = v));
  applyIfDefined(updates.tags, (v) => (dbUpdates.tags = v));
  applyIfDefined(updates.back_align, (v) => (dbUpdates.back_align = v));
  applyIfDefined(
    updates.back_left_of_qb,
    (v) => (dbUpdates.back_left_of_qb = Boolean(v))
  );
  applyIfDefined(
    updates.back_right_of_qb,
    (v) => (dbUpdates.back_right_of_qb = Boolean(v))
  );
  applyIfDefined(updates.shift, (v) => (dbUpdates.shift = v));
  applyIfDefined(updates.motion, (v) => (dbUpdates.motion = v));
  applyIfDefined(updates.key_player1, (v) => (dbUpdates.key_player1 = v));
  applyIfDefined(updates.key_player2, (v) => (dbUpdates.key_player2 = v));
  applyIfDefined(updates.check_into, (v) => (dbUpdates.check_into = v));
  applyIfDefined(updates.notes, (v) => (dbUpdates.notes = v));
  applyIfDefined(
    updates.diagram_image_url,
    (v) => (dbUpdates.diagram_image_url = v)
  );

  return dbUpdates;
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
      const dbUpdates = mapPlayUpdatesToDbUpdates(updates);

      debug("[PlayList] 🔷 Mapped updates:", {
        playId,
        updates,
        dbUpdates,
        "dbUpdates.f_dir": dbUpdates.f_dir,
        "dbUpdates.p_dir": dbUpdates.p_dir,
      });
      debug("[PlayList] 🔷 Calling updatePlay...");

      const success = await updatePlay(playId, dbUpdates);

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
