/**
 * Play Data Builders
 *
 * Helper functions to build play data objects for database operations
 */

import { normalizePlayName, normalizeText } from "../utils/textNormalization";
import type { Play } from "../types/play";

/**
 * Build a new play object for database insertion
 */
export function buildNewPlayData(
  playData: Partial<Play>,
  playId: string,
  playbookId: string,
  userId: string
): Record<string, unknown> {
  return {
    id: playId,
    playbook_id: playbookId,

    // Core required fields
    play_name: normalizePlayName(playData.play_name || "Untitled Play"),
    p_type: playData.p_type || "Pass",
    formation: normalizeText(playData.formation || ""),
    formation_id: playData.formation_id || null,

    // Optional text fields
    ...buildTextFields(playData),

    // Tags
    ...buildTagFields(playData),

    // Play details
    ...buildPlayDetailFields(playData),

    // Performance fields
    ...buildPerformanceFields(playData),

    // Metadata
    is_archived: playData.is_archived || false,
    created_by: userId,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    duplicate_key: extractDuplicateKey(playData),

    // Diagram data
    ...buildDiagramFields(playData),
  };
}

function buildTextFields(playData: Partial<Play>): Record<string, string> {
  return {
    one_word_play: playData.one_word_play
      ? normalizeText(playData.one_word_play)
      : "",
    notes: playData.notes || "",
    personnel: playData.personnel || "",
    f_type: playData.f_type || "",
    f_dir: playData.f_dir || "",
    protection: playData.protection || "",
    p_dir: playData.p_dir || "",
    r_str: playData.r_str || "",
    p_str: playData.p_str || "",
  };
}

function buildTagFields(playData: Partial<Play>): Record<string, string> {
  return {
    ftag1: playData.ftag1 || "",
    ftag2: playData.ftag2 || "",
    p_tag1: playData.p_tag1 || "",
    p_tag2: playData.p_tag2 || "",
  };
}

function buildPlayDetailFields(
  playData: Partial<Play>
): Record<string, string> {
  return {
    back_align: playData.back_align || "",
    shift: playData.shift || "",
    motion: playData.motion || "",
    key_player1: playData.key_player1 || "",
    key_player2: playData.key_player2 || "",
    check_into: playData.check_into || "",
    pref_down: playData.pref_down || "",
    pref_dis: playData.pref_dis || "",
    pref_hash: playData.pref_hash || "",
    pref_cov: playData.pref_cov || "",
    pref_front: playData.pref_front || "",
  };
}

function buildPerformanceFields(
  playData: Partial<Play>
): Record<string, number> {
  return {
    confidence_base: playData.confidence_base || 70,
    times_called: playData.times_called || 0,
    times_successful: playData.times_successful || 0,
    complexity_score: playData.complexity_score || 1,
  };
}

function buildDiagramFields(playData: Partial<Play>): Record<string, unknown> {
  return {
    diagram_data: playData.diagram_data || null,
    diagram_version: playData.diagram_version || null,
    diagram_url: playData.diagram_url || null,
  };
}

function extractDuplicateKey(playData: Partial<Play>): string | undefined {
  const data = playData as unknown as { duplicate_key?: string };
  return typeof data.duplicate_key === "string"
    ? data.duplicate_key
    : undefined;
}

/**
 * Build update data for an existing play
 */
export function buildPlayUpdateData(
  updates: Partial<Play>
): Record<string, unknown> {
  const updateData: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  // Only include fields that are explicitly provided
  if (updates.play_name !== undefined) {
    updateData.play_name = normalizePlayName(updates.play_name);
  }
  if (updates.p_type !== undefined) updateData.p_type = updates.p_type;
  if (updates.formation !== undefined) {
    updateData.formation = normalizeText(updates.formation);
  }
  if (updates.formation_id !== undefined) {
    updateData.formation_id = updates.formation_id;
  }
  if (updates.one_word_play !== undefined) {
    updateData.one_word_play = normalizeText(updates.one_word_play);
  }
  if (updates.notes !== undefined) updateData.notes = updates.notes;
  if (updates.personnel !== undefined) updateData.personnel = updates.personnel;
  if (updates.f_type !== undefined) updateData.f_type = updates.f_type;
  if (updates.f_dir !== undefined) updateData.f_dir = updates.f_dir;
  if (updates.protection !== undefined)
    updateData.protection = updates.protection;
  if (updates.p_dir !== undefined) updateData.p_dir = updates.p_dir;
  if (updates.r_str !== undefined) updateData.r_str = updates.r_str;
  if (updates.p_str !== undefined) updateData.p_str = updates.p_str;
  if (updates.ftag1 !== undefined) updateData.ftag1 = updates.ftag1;
  if (updates.ftag2 !== undefined) updateData.ftag2 = updates.ftag2;
  if (updates.p_tag1 !== undefined) updateData.p_tag1 = updates.p_tag1;
  if (updates.p_tag2 !== undefined) updateData.p_tag2 = updates.p_tag2;
  if (updates.back_align !== undefined)
    updateData.back_align = updates.back_align;
  if (updates.shift !== undefined) updateData.shift = updates.shift;
  if (updates.motion !== undefined) updateData.motion = updates.motion;
  if (updates.key_player1 !== undefined)
    updateData.key_player1 = updates.key_player1;
  if (updates.key_player2 !== undefined)
    updateData.key_player2 = updates.key_player2;
  if (updates.check_into !== undefined)
    updateData.check_into = updates.check_into;
  if (updates.pref_down !== undefined) updateData.pref_down = updates.pref_down;
  if (updates.pref_dis !== undefined) updateData.pref_dis = updates.pref_dis;
  if (updates.pref_hash !== undefined) updateData.pref_hash = updates.pref_hash;
  if (updates.pref_cov !== undefined) updateData.pref_cov = updates.pref_cov;
  if (updates.pref_front !== undefined)
    updateData.pref_front = updates.pref_front;
  if (updates.confidence_base !== undefined) {
    updateData.confidence_base = updates.confidence_base;
  }
  if (updates.is_archived !== undefined)
    updateData.is_archived = updates.is_archived;
  if (updates.diagram_data !== undefined)
    updateData.diagram_data = updates.diagram_data;
  if (updates.diagram_version !== undefined) {
    updateData.diagram_version = updates.diagram_version;
  }
  if (updates.diagram_url !== undefined)
    updateData.diagram_url = updates.diagram_url;

  return updateData;
}
