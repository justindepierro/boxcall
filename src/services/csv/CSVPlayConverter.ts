/**
 * CSV Play Converter Service
 *
 * Handles conversion between CSV data and Play objects
 */

import { UserPreferencesService } from "../userPreferencesService";

import type { CSVPlayPreview, CSVImportResult } from "./types";
import type { Play } from "../../types/play";

export class CSVPlayConverter {
  private static asString(value: unknown): string {
    if (value === null || value === undefined) return "";
    if (typeof value === "string") return value;
    return String(value);
  }

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
          this.asString(playData.formation).trim() === "";
        const missingPlayType = this.asString(playData.p_type).trim() === "";

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
          (field) => this.asString(playData[field]).trim() !== ""
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
    const normalizedPlayType = this.normalizePlayType(
      this.asString(playData.p_type)
    );

    const formation = this.asString(playData.formation).trim();
    const playName = this.asString(playData.play_name).trim();

    return {
      id: `csv-import-${Date.now()}-${index}`,
      playbook_id: playbookId,
      formation: formation === "" ? "Unknown Formation" : formation,
      play_name: playName,
      one_word_play: this.asString(playData.one_word_play),
      p_type: normalizedPlayType,
      personnel: this.asString(playData.personnel),
      f_type: this.asString(playData.f_type),
      protection: this.asString(playData.protection),
      notes: this.asString(playData.notes),
      // Set defaults for other required fields
      f_dir: this.asString(playData.f_dir),
      ftag1: this.asString(playData.ftag1),
      ftag2: this.asString(playData.ftag2),
      back_align: this.asString(playData.back_align),
      shift: this.asString(playData.shift),
      motion: this.asString(playData.motion),
      p_tag1: this.asString(playData.p_tag1),
      p_tag2: this.asString(playData.p_tag2),
      p_dir: this.asString(playData.p_dir),
      key_player1: this.asString(playData.key_player1),
      key_player2: this.asString(playData.key_player2),
      pref_down: this.asString(playData.pref_down),
      pref_dis: this.asString(playData.pref_dis),
      pref_hash: this.asString(playData.pref_hash),
      pref_cov: this.asString(playData.pref_cov),
      pref_front: this.asString(playData.pref_front),
      check_into: this.asString(playData.check_into),
      r_str: this.asString(playData.r_str),
      p_str: this.asString(playData.p_str),
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
