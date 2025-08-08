/**
 * CSV Play Converter Service
 *
 * Handles conversion between CSV data and Play objects
 */

import type { Play } from "../../types/play";
import type { CSVPlayPreview, CSVImportResult } from "./types";
import { UserPreferencesService } from "../userPreferencesService";

export class CSVPlayConverter {
  /**
   * Convert validated preview data to Play objects
   */
  static convertPreviewsToPlays(
    previews: CSVPlayPreview[],
    playbookId: string,
    forceImport: boolean = false
  ): CSVImportResult {
    const plays: Play[] = [];
    const errors: string[] = [];
    const warnings: string[] = [];

    const validPreviews = previews.filter((p) => p.isValid);
    let playsNeedingConfirmation = 0;
    let lowQualityPlays = 0;

    validPreviews.forEach((preview, index) => {
      try {
        const playData = preview.data;

        // Check for confirmation-requiring scenarios
        const missingFormation =
          !playData.formation || playData.formation.trim() === "";
        const missingPlayType =
          !playData.p_type || playData.p_type.trim() === "";

        if (missingFormation || missingPlayType) {
          playsNeedingConfirmation++;
        }

        // Count quality for warning
        const importantFields = [
          "formation",
          "play_name",
          "p_type",
          "personnel",
          "protection",
        ];
        const filledFields = importantFields.filter(
          (field) => playData[field] && playData[field].trim() !== ""
        );

        if (filledFields.length < 5) {
          lowQualityPlays++;
        }

        // Create the Play object
        const play = this.createPlayFromData(playData, playbookId, index);
        plays.push(play);

        // Collect warnings for this play
        if (preview.warnings.length > 0) {
          warnings.push(
            `Row ${preview.rowNumber}: ${preview.warnings.join(", ")}`
          );
        }
      } catch (error) {
        errors.push(
          `Row ${preview.rowNumber}: Failed to create play - ${error instanceof Error ? error.message : "Unknown error"}`
        );
      }
    });

    // Collect errors from invalid previews
    const invalidPreviews = previews.filter((p) => !p.isValid);
    invalidPreviews.forEach((preview) => {
      errors.push(`Row ${preview.rowNumber}: ${preview.errors.join(", ")}`);
    });

    // Generate confirmation message if needed and not forcing import
    let needsConfirmation = false;
    let confirmationMessage = "";

    if (
      playsNeedingConfirmation > 0 &&
      !forceImport &&
      !UserPreferencesService.shouldSkipCSVMissingFieldsConfirmation()
    ) {
      needsConfirmation = true;
      confirmationMessage = `I see ${playsNeedingConfirmation} play${playsNeedingConfirmation > 1 ? "s are" : " is"} missing formation and/or play type. Are you sure you wish to continue?`;
    }

    // Generate quality warning if needed
    let qualityWarning = "";
    const lowQualityThreshold = Math.ceil(validPreviews.length * 0.5); // 50% of plays

    if (
      lowQualityPlays >= lowQualityThreshold &&
      validPreviews.length >= 3 &&
      !UserPreferencesService.shouldSkipCSVQualityWarnings()
    ) {
      qualityWarning =
        "To get the best experience of BoxCall, it is recommended to fill out as much information about your plays as possible. For examples please visit the templates page.";
    }

    return {
      success: plays.length > 0,
      totalRows: previews.length,
      importedPlays: plays.length,
      errors,
      warnings,
      plays,
      parsedPlays: previews,
      needsConfirmation,
      confirmationMessage,
      qualityWarning,
    };
  }

  /**
   * Create a Play object from CSV data
   */
  private static createPlayFromData(
    playData: CSVPlayPreview["data"],
    playbookId: string,
    index: number
  ): Play {
    // Normalize play type with defaults
    const normalizedPlayType = this.normalizePlayType(playData.p_type);

    return {
      id: `csv-import-${Date.now()}-${index}`,
      playbook_id: playbookId,
      formation: playData.formation || "Unknown Formation",
      play_name: playData.play_name,
      one_word_play: playData.one_word_play || "",
      p_type: normalizedPlayType,
      personnel: playData.personnel || "",
      f_type: playData.f_type || "",
      protection: playData.protection || "",
      notes: playData.notes || "",
      // Set defaults for other required fields
      f_dir: playData.f_dir || "",
      ftag1: playData.ftag1 || "",
      ftag2: playData.ftag2 || "",
      back_align: playData.back_align || "",
      shift: playData.shift || "",
      motion: playData.motion || "",
      p_tag1: playData.p_tag1 || "",
      p_tag2: playData.p_tag2 || "",
      p_dir: playData.p_dir || "",
      key_player1: playData.key_player1 || "",
      key_player2: playData.key_player2 || "",
      pref_down: playData.pref_down || "",
      pref_dis: playData.pref_dis || "",
      pref_hash: playData.pref_hash || "",
      pref_cov: playData.pref_cov || "",
      pref_front: playData.pref_front || "",
      check_into: playData.check_into || "",
      r_str: playData.r_str || "",
      p_str: playData.p_str || "",
      confidence_base: 70,
      times_called: 0,
      times_successful: 0,
      created_by: "csv-import",
      created_at: new Date(),
      updated_at: new Date(),
    };
  }

  /**
   * Normalize play type to standard values
   */
  private static normalizePlayType(
    playType?: string
  ): "Pass" | "Run" | "RPO" | "Play Action" {
    if (!playType) return "Run"; // default

    const lowerType = playType.toLowerCase();
    if (lowerType.includes("pass")) return "Pass";
    if (lowerType.includes("rpo")) return "RPO";
    if (lowerType.includes("action") || lowerType.includes("pa"))
      return "Play Action";
    if (lowerType.includes("run")) return "Run";

    return "Run"; // default fallback
  }
}
