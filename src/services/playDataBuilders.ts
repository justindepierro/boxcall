/**
 * Play Data Builders
 *
 * Helper functions to build play data objects for database operations
 */

import { normalizePlayName, normalizeText } from "../utils/textNormalization";
import type { Play } from "../types/play";

function applyIfDefined<T>(value: T | undefined, apply: (v: T) => void): void {
  if (value !== undefined) {
    apply(value);
  }
}

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
    formation_direction: playData.formation_direction ?? null,

    // Optional text fields
    ...buildTextFields(playData),

    // Tags
    ...buildTagFields(playData),

    // Play details
    ...buildPlayDetailFields(playData),

    // Array fields (tags, key players, positions, flags)
    ...buildArrayFields(playData),

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
    wristband_number: playData.wristband_number || "",
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
): Record<string, unknown> {
  return {
    back_align: playData.back_align || "",
    back_left_of_qb: playData.back_left_of_qb ?? null,
    back_right_of_qb: playData.back_right_of_qb ?? null,
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
    pref_field_pos: playData.pref_field_pos || "",
    pref_situation: playData.pref_situation || "",
  };
}

function buildArrayFields(playData: Partial<Play>): Record<string, unknown> {
  return {
    tags: playData.tags || null,
    key_players: playData.key_players || null,
    key_positions: playData.key_positions || null,
    flags: playData.flags || null,
  };
}

function buildPerformanceFields(
  playData: Partial<Play>
): Record<string, number> {
  return {
    confidence_base: playData.confidence_base || 70,
    // Derived from play_executions (single source of truth)
    times_called: 0,
    times_successful: 0,
    complexity_score: playData.complexity_score || 1,
  };
}

function buildDiagramFields(playData: Partial<Play>): Record<string, unknown> {
  return {
    diagram_data: playData.diagram_data || null,
    diagram_version: playData.diagram_version || null,
    diagram_url: playData.diagram_url || null,
    diagram_image_url: playData.diagram_image_url || null,
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
  applyIfDefined(updates.play_name, (value) => {
    updateData.play_name = normalizePlayName(value);
  });
  applyIfDefined(updates.p_type, (value) => {
    updateData.p_type = value;
  });
  applyIfDefined(updates.formation, (value) => {
    updateData.formation = normalizeText(value);
  });
  applyIfDefined(updates.formation_id, (value) => {
    updateData.formation_id = value;
  });
  applyIfDefined(updates.formation_direction, (value) => {
    updateData.formation_direction = value;
  });
  applyIfDefined(updates.one_word_play, (value) => {
    updateData.one_word_play = normalizeText(value);
  });
  applyIfDefined(updates.wristband_number, (value) => {
    updateData.wristband_number = value;
  });
  applyIfDefined(updates.notes, (value) => {
    updateData.notes = value;
  });
  applyIfDefined(updates.personnel, (value) => {
    updateData.personnel = value;
  });
  applyIfDefined(updates.f_type, (value) => {
    updateData.f_type = value;
  });
  applyIfDefined(updates.f_dir, (value) => {
    updateData.f_dir = value;
  });
  applyIfDefined(updates.protection, (value) => {
    updateData.protection = value;
  });
  applyIfDefined(updates.p_dir, (value) => {
    updateData.p_dir = value;
  });
  applyIfDefined(updates.r_str, (value) => {
    updateData.r_str = value;
  });
  applyIfDefined(updates.p_str, (value) => {
    updateData.p_str = value;
  });
  applyIfDefined(updates.ftag1, (value) => {
    updateData.ftag1 = value;
  });
  applyIfDefined(updates.ftag2, (value) => {
    updateData.ftag2 = value;
  });
  applyIfDefined(updates.p_tag1, (value) => {
    updateData.p_tag1 = value;
  });
  applyIfDefined(updates.p_tag2, (value) => {
    updateData.p_tag2 = value;
  });
  applyIfDefined(updates.back_align, (value) => {
    updateData.back_align = value;
  });
  applyIfDefined(updates.back_left_of_qb, (value) => {
    updateData.back_left_of_qb = value;
  });
  applyIfDefined(updates.back_right_of_qb, (value) => {
    updateData.back_right_of_qb = value;
  });
  applyIfDefined(updates.shift, (value) => {
    updateData.shift = value;
  });
  applyIfDefined(updates.motion, (value) => {
    updateData.motion = value;
  });
  applyIfDefined(updates.key_player1, (value) => {
    updateData.key_player1 = value;
  });
  applyIfDefined(updates.key_player2, (value) => {
    updateData.key_player2 = value;
  });
  applyIfDefined(updates.check_into, (value) => {
    updateData.check_into = value;
  });
  applyIfDefined(updates.pref_down, (value) => {
    updateData.pref_down = value;
  });
  applyIfDefined(updates.pref_dis, (value) => {
    updateData.pref_dis = value;
  });
  applyIfDefined(updates.pref_hash, (value) => {
    updateData.pref_hash = value;
  });
  applyIfDefined(updates.pref_cov, (value) => {
    updateData.pref_cov = value;
  });
  applyIfDefined(updates.pref_front, (value) => {
    updateData.pref_front = value;
  });
  applyIfDefined(updates.pref_field_pos, (value) => {
    updateData.pref_field_pos = value;
  });
  applyIfDefined(updates.pref_situation, (value) => {
    updateData.pref_situation = value;
  });
  applyIfDefined(updates.confidence_base, (value) => {
    updateData.confidence_base = value;
  });
  applyIfDefined(updates.is_archived, (value) => {
    updateData.is_archived = value;
  });

  // Array fields
  applyIfDefined(updates.tags, (value) => {
    updateData.tags = value;
  });
  applyIfDefined(updates.key_players, (value) => {
    updateData.key_players = value;
  });
  applyIfDefined(updates.key_positions, (value) => {
    updateData.key_positions = value;
  });
  applyIfDefined(updates.flags, (value) => {
    updateData.flags = value;
  });

  // Diagram fields
  applyIfDefined(updates.diagram_data, (value) => {
    updateData.diagram_data = value;
  });
  applyIfDefined(updates.diagram_version, (value) => {
    updateData.diagram_version = value;
  });
  applyIfDefined(updates.diagram_url, (value) => {
    updateData.diagram_url = value;
  });
  applyIfDefined(updates.diagram_image_url, (value) => {
    updateData.diagram_image_url = value;
  });

  return updateData;
}
