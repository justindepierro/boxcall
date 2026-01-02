/**
 * Submit Helpers for AddNewPlayModal
 *
 * Extracted validation and transformation logic to reduce complexity
 */

import { TeamSituationDefinitionsService } from "../../../../services/teamSituationDefinitionsService";
import { getFieldZoneDefinitions } from "../../../../utils/situationBucketing";
import {
  validateFormationName,
  validatePersonnelValue,
} from "../../../../utils/playFieldValidation";
import {
  parseLeftRight,
  leftRightToLegacyValue,
} from "../../../../utils/leftRight";

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

/**
 * Validate basic form fields (formation, play name)
 */
export function validateBasicFields(
  formation: string,
  playName: string
): {
  isValid: boolean;
  error?: string;
} {
  if (!formation.trim() || !playName.trim()) {
    return { isValid: false, error: "Please enter formation and play name" };
  }

  const formationValidation = validateFormationName(formation.trim());
  if (!formationValidation.isValid) {
    return {
      isValid: false,
      error: formationValidation.error || "Invalid formation name",
    };
  }

  return { isValid: true };
}

/**
 * Validate personnel value if provided
 */
export function validatePersonnel(personnel: string): {
  isValid: boolean;
  error?: string;
} {
  if (!personnel.trim()) {
    return { isValid: true }; // Optional field
  }

  const validation = validatePersonnelValue(personnel.trim());
  if (!validation.isValid) {
    return {
      isValid: false,
      error: validation.error || "Invalid personnel value",
    };
  }

  return { isValid: true };
}

/**
 * Validate field position against team settings
 */
export async function validateFieldPosition(
  fieldPos: string,
  activeTeamId: string
): Promise<{ isValid: boolean; error?: string }> {
  if (!fieldPos.trim()) {
    return { isValid: true }; // Optional field
  }

  try {
    const defs = await TeamSituationDefinitionsService.get(activeTeamId);
    const fieldZoneLabels = getFieldZoneDefinitions(defs).map(
      (z: any) => z.label
    );

    if (
      fieldZoneLabels.length > 0 &&
      !fieldZoneLabels.some(
        (l: string) => l.toLowerCase() === fieldPos.toLowerCase()
      )
    ) {
      return {
        isValid: false,
        error: "Preferred field position must match Team Settings",
      };
    }
  } catch {
    // Don't block play creation if definitions fail to load
  }

  return { isValid: true };
}

/**
 * Validate situation against team settings
 */
export async function validateSituation(
  situation: string,
  activeTeamId: string
): Promise<{ isValid: boolean; error?: string }> {
  if (!situation.trim()) {
    return { isValid: true }; // Optional field
  }

  try {
    const defs = await TeamSituationDefinitionsService.get(activeTeamId);
    const customSituationLabels = Array.isArray(defs.custom_situations)
      ? defs.custom_situations
          .map((s: any) => String(s?.label ?? "").trim())
          .filter(Boolean)
      : [];

    if (
      customSituationLabels.length > 0 &&
      !customSituationLabels.some(
        (l: string) => l.toLowerCase() === situation.toLowerCase()
      )
    ) {
      return {
        isValid: false,
        error: "Preferred situation must match Team Settings",
      };
    }
  } catch {
    // Don't block play creation if definitions fail to load
  }

  return { isValid: true };
}

// ============================================================================
// DATA TRANSFORMATION FUNCTIONS
// ============================================================================

/**
 * Parse comma-separated tags into array
 */
export function parseTags(tagsString: string): string[] {
  return tagsString
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}

/**
 * Transform form data into play data object for API
 */
// eslint-disable-next-line complexity
export function transformFormDataToPlayData(formData: any): any {
  // Parse tags
  const fTags = parseTags(formData.formationTags);
  const pTags = parseTags(formData.playTags);

  // Handle direction
  const formationDirToken = parseLeftRight(
    String(formData.formation_direction ?? formData.formationDir)
  );
  const canonicalLegacyFDir = leftRightToLegacyValue(formationDirToken);

  return {
    formation: formData.formation.trim(),
    play_name: formData.playName.trim(),
    p_type: formData.playType?.trim() || undefined,
    personnel: formData.personnel.trim() || undefined,

    // Formation fields
    f_type: formData.formationType.trim() || undefined,
    f_dir: canonicalLegacyFDir || formData.formationDir.trim() || undefined,
    formation_direction: formationDirToken,
    back_align: formData.backAlign.trim() || undefined,
    back_left_of_qb: formData.backLeftOfQb || undefined,
    back_right_of_qb: formData.backRightOfQb || undefined,
    shift: formData.shift.trim() || undefined,
    motion: formData.motion.trim() || undefined,
    ftag1: fTags[0] || undefined,
    ftag2: fTags[1] || undefined,
    r_str: formData.runStrength.trim() || undefined,
    p_str: formData.passStrength.trim() || undefined,

    // Play details
    p_dir: formData.playDir || undefined,
    protection: formData.protection.trim() || undefined,
    check_into: formData.checkInto.trim() || undefined,
    p_tag1: pTags[0] || undefined,
    p_tag2: pTags[1] || undefined,

    // Preferences
    pref_down: formData.prefDown || undefined,
    pref_dis: formData.prefDistance || undefined,
    pref_hash: formData.prefHash || undefined,
    pref_cov: formData.prefCoverage.trim() || undefined,
    pref_front: formData.prefFront.trim() || undefined,
    pref_field_pos: formData.prefFieldPos.trim() || undefined,
    pref_situation: formData.prefSituation.trim() || undefined,

    // Other
    confidence_base: formData.confidence,
    one_word_play: formData.oneWordPlay.trim() || undefined,
    wristband_number: formData.wristbandNumber.trim() || undefined,
    notes: formData.description.trim() || undefined,
    diagram_image_url: formData.diagram_image_url || undefined,

    // Metadata arrays
    tags: formData.tags.length > 0 ? formData.tags : undefined,
    key_positions:
      formData.key_positions.length > 0 ? formData.key_positions : undefined,
    key_players:
      formData.key_players.length > 0 ? formData.key_players : undefined,
    flags: formData.flags.length > 0 ? formData.flags : undefined,
  };
}
