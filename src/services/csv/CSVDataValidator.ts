/**
 * CSV Data Validator Service
 *
 * Handles validation, auto-correction, and quality assessment of CSV data
 */

import type {
  ValidationResult,
  PlayTypeMapping,
  FormationCorrection,
  CommonPlayCorrection,
} from "./types";

export class CSVDataValidator {
  /**
   * Smart validation with helpful warnings and auto-corrections
   */
  static validateAndCorrect(rowData: Record<string, string>): ValidationResult {
    const warnings: string[] = [];
    const correctedData = { ...rowData };

    // Play type validation and auto-correction
    this.validateAndCorrectPlayType(correctedData, warnings);

    // Formation validation
    this.validateAndCorrectFormation(correctedData, warnings);

    // Personnel validation and correction
    this.validateAndCorrectPersonnel(correctedData, warnings);

    // Play name validation
    this.validateAndCorrectPlayName(correctedData, warnings);

    // One word play validation
    this.validateOneWordPlay(correctedData, warnings);

    return {
      warnings,
      correctedData,
    };
  }

  /**
   * Validate and auto-correct play types
   */
  private static validateAndCorrectPlayType(
    rowData: Record<string, string>,
    warnings: string[]
  ): void {
    const validPlayTypes: PlayTypeMapping[] = [
      { canonical: "Pass", variants: ["pass", "passing", "throw"] },
      { canonical: "Run", variants: ["run", "running", "rush", "rushing"] },
      {
        canonical: "RPO",
        variants: ["rpo", "run-pass-option", "run pass option"],
      },
      {
        canonical: "Play Action",
        variants: ["play action", "playaction", "pa", "play-action"],
      },
      { canonical: "Special", variants: ["special", "special teams", "st"] },
      { canonical: "Punt", variants: ["punt", "punting"] },
      { canonical: "FG", variants: ["fg", "field goal", "fieldgoal", "kick"] },
      { canonical: "PAT", variants: ["pat", "extra point", "xp"] },
    ];

    if (rowData.p_type) {
      const lowerType = rowData.p_type.toLowerCase().trim();
      const matchedType = validPlayTypes.find(
        (type) =>
          type.canonical.toLowerCase() === lowerType ||
          type.variants.some((variant) => variant === lowerType)
      );

      if (!matchedType) {
        warnings.push(
          `Play type "${rowData.p_type}" may not be recognized. Suggested: Pass, Run, RPO, Play Action`
        );
      } else if (matchedType.canonical.toLowerCase() !== lowerType) {
        // Auto-correct the play type
        rowData.p_type = matchedType.canonical;
        warnings.push(`Auto-corrected play type to "${matchedType.canonical}"`);
      }
    }
  }

  /**
   * Validate and auto-correct formation names
   */
  private static validateAndCorrectFormation(
    rowData: Record<string, string>,
    warnings: string[]
  ): void {
    if (rowData.formation) {
      if (rowData.formation.length < 2) {
        warnings.push(
          "Formation name seems very short. Consider using more descriptive names."
        );
      }

      // Common formation corrections
      const formationCorrections: FormationCorrection = {
        gun: "Shotgun",
        "i-form": "I-Formation",
        i: "I-Formation",
        pistol: "Pistol",
        "wing-t": "Wing-T",
        spread: "Spread",
      };

      const lowerFormation = rowData.formation.toLowerCase();
      if (formationCorrections[lowerFormation]) {
        rowData.formation = formationCorrections[lowerFormation];
        warnings.push(
          `Auto-corrected formation to "${formationCorrections[lowerFormation]}"`
        );
      }
    }
  }

  /**
   * Validate and auto-correct personnel packages
   */
  private static validateAndCorrectPersonnel(
    rowData: Record<string, string>,
    warnings: string[]
  ): void {
    if (rowData.personnel) {
      const personnel = rowData.personnel.trim();
      if (!/^\d/.test(personnel)) {
        warnings.push(
          "Personnel should typically start with numbers (e.g., '11', '12', '21')"
        );
      } else if (personnel.length === 1) {
        // Auto-correct single digit personnel
        const corrected = personnel + "1";
        rowData.personnel = corrected;
        warnings.push(
          `Auto-corrected personnel "${personnel}" to "${corrected}"`
        );
      }
    }
  }

  /**
   * Validate and auto-correct play names
   */
  private static validateAndCorrectPlayName(
    rowData: Record<string, string>,
    warnings: string[]
  ): void {
    if (rowData.play_name) {
      if (rowData.play_name.length < 2) {
        warnings.push(
          "Play name seems very short. Consider using more descriptive names."
        );
      }

      // Auto-capitalize common play names
      const commonPlays: CommonPlayCorrection = {
        dive: "Dive",
        sweep: "Sweep",
        slant: "Slant",
        out: "Out",
        comeback: "Comeback",
        post: "Post",
        go: "Go Route",
        bubble: "Bubble Screen",
      };

      const lowerPlay = rowData.play_name.toLowerCase();
      if (commonPlays[lowerPlay]) {
        rowData.play_name = commonPlays[lowerPlay];
        warnings.push(
          `Auto-corrected play name to "${commonPlays[lowerPlay]}"`
        );
      }
    }
  }

  /**
   * Validate one word play (audibles)
   */
  private static validateOneWordPlay(
    rowData: Record<string, string>,
    warnings: string[]
  ): void {
    if (rowData.one_word_play && rowData.one_word_play.length > 8) {
      warnings.push(
        "Audible/one-word play should be short and easy to call (8 characters or less)"
      );
    }
  }

  /**
   * Check if play requires confirmation due to missing critical fields
   */
  static requiresConfirmation(rowData: Record<string, string>): boolean {
    const missingFormation =
      !rowData.formation || rowData.formation.trim() === "";
    const missingPlayType = !rowData.p_type || rowData.p_type.trim() === "";
    return missingFormation || missingPlayType;
  }

  /**
   * Assess play quality based on filled important fields
   */
  static assessPlayQuality(rowData: Record<string, string>): boolean {
    const importantFields = [
      "formation",
      "play_name",
      "p_type",
      "personnel",
      "protection",
    ];

    const filledFields = importantFields.filter(
      (field) => rowData[field] && rowData[field].trim() !== ""
    );

    return filledFields.length >= 4; // High quality if 4/5 important fields filled
  }

  /**
   * Check if row has required fields for validity
   */
  static isValidRow(rowData: Record<string, string>): boolean {
    return !(!rowData.play_name || rowData.play_name.trim() === "");
  }
}
