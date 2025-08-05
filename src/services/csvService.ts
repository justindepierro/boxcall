/**
 * CSV Service - Handles import/export of plays and practice scripts
 *
 * Part of the enhanced create play workflow with import/export capabilities
 */

import type { Play } from "../types/play";
import type { PracticeScript } from "./practiceScriptService";
import { UserPreferencesService } from "./userPreferencesService";

export interface CSVPlayData {
  formation: string;
  play_name: string;
  one_word_play?: string;
  p_type: string;
  personnel?: string;
  f_type?: string;
  pref_down?: string;
  pref_dis?: string;
  protection?: string;
  r_str?: string;
  p_str?: string;
  notes?: string;
}

export interface CSVImportResult {
  success: boolean;
  totalRows: number;
  importedPlays: number;
  errors: string[];
  warnings: string[];
  plays: Play[];
  parsedPlays: CSVPlayPreview[];
  needsConfirmation?: boolean;
  confirmationMessage?: string;
  qualityWarning?: string;
}

export interface CSVPlayPreview {
  rowNumber: number;
  isValid: boolean;
  errors: string[];
  warnings: string[];
  data: {
    formation: string;
    play_name: string;
    p_type: string;
    personnel?: string;
    one_word_play?: string;
    protection?: string;
    notes?: string;
    [key: string]: string | undefined;
  };
}

export interface CSVParseResult {
  previews: CSVPlayPreview[];
  summary: {
    totalRows: number;
    validPlays: number;
    invalidPlays: number;
    warnings: number;
    detectedColumns: string[];
    suggestedMappings: Record<string, string>;
    needsConfirmation?: boolean;
    confirmationMessage?: string;
    qualityWarning?: string;
  };
}

export interface CSVExportOptions {
  includeComplexity?: boolean;
  includePrivateNotes?: boolean;
  formatForCoach?: boolean;
}

export class CSVService {
  /**
   * Intelligent column mapping - maps various column names to our standard fields
   */
  private static getColumnMappings(): Record<string, string[]> {
    return {
      // Core required fields
      formation: [
        "formation",
        "form",
        "format",
        "alignment",
        "formation_name",
        "formation name",
      ],
      play_name: [
        "play_name",
        "play name",
        "playname",
        "name",
        "play",
        "title",
      ],
      p_type: [
        "p_type",
        "p_Type",
        "play_type",
        "type",
        "category",
        "kind",
        "play type",
        "playtype",
      ],

      // Personnel and formation details
      personnel: [
        "personnel",
        "package",
        "grouping",
        "formation_personnel",
        "personnel group",
        "personnel_group",
      ],
      f_type: ["f_type", "formation_type", "form_type", "formtype", "formType"],
      f_dir: ["f_dir", "formation_direction", "form_dir", "direction"],

      // Tags and alignment
      ftag1: ["ftag1", "formation_tag1", "form_tag1"],
      ftag2: ["ftag2", "formation_tag2", "form_tag2"],
      ftag3: ["ftag3", "fTag3", "formation_tag3", "form_tag3"],
      back_align: ["back_align", "backfield_alignment", "back_alignment"],
      shift: ["shift", "formation_shift"],
      motion: ["motion", "pre_snap_motion"],

      // Play details
      one_word_play: [
        "one_word_play",
        "audible",
        "call",
        "quick_call",
        "signal",
        "code",
        "one word",
      ],
      p_tag1: ["p_tag1", "play_tag1"],
      p_tag2: ["p_tag2", "play_tag2"],
      play_dir: ["play_dir", "p_dir", "play_direction", "direction", "dir"],

      // Protection and blocking
      protection: ["protection", "prot", "pass_pro", "pass_protection"],
      p_str: [
        "p_str",
        "protection_strength",
        "blocking",
        "passStr",
        "pass_str",
      ],
      r_str: [
        "r_str",
        "route_strength",
        "route",
        "receiver_strength",
        "runStr",
        "run_str",
      ],

      // Key players
      key_player1: [
        "key_player1",
        "keyPlayer1",
        "key_player_1",
        "primary_player",
      ],
      key_player2: [
        "key_player2",
        "keyPlayer2",
        "key_player_2",
        "secondary_player",
      ],

      // Alignment details
      h_align: ["h_align", "hAlign", "h_alignment", "hot_receiver_align"],
      z_align: ["z_align", "zAlign", "z_alignment", "z_receiver_align"],

      // Route and concept details
      back_route: ["back_route", "backRoute", "running_back_route"],
      check_into: ["check_into", "check", "audible_to", "hot_route"],

      // Preferences
      pref_down: [
        "pref_down",
        "preferred_down",
        "down",
        "situation",
        "preferred down",
        "prefDown",
      ],
      pref_dis: [
        "pref_dis",
        "preferred_distance",
        "distance",
        "yardage",
        "preferred distance",
        "prefDis",
      ],
      pref_hash: [
        "pref_hash",
        "preferred_hash",
        "hash",
        "field_position",
        "prefHash",
      ],
      pref_cov: [
        "pref_cov",
        "preferred_coverage",
        "coverage",
        "prefDCov",
        "prefCov",
      ],
      pref_front: [
        "pref_front",
        "preferred_front",
        "front",
        "prefDFront",
        "prefFront",
      ],
      pref_blitz: [
        "pref_blitz",
        "preferred_blitz",
        "blitz",
        "PrefDBlitz",
        "prefBlitz",
      ],
      pref_situation: [
        "pref_situation",
        "preferred_situation",
        "prefSituation",
      ],
      pref_field_pos: [
        "pref_field_pos",
        "preferred_field_position",
        "prefFieldPos",
      ],

      // Success metrics
      confidence_base: ["confidence_base", "confidence", "base_confidence"],
      success_rate: ["success_rate", "success", "completion_rate"],
      times_called: ["times_called", "called", "usage_count"],
      times_successful: ["times_successful", "successful", "success_count"],

      // Media and metadata
      diagram_url: ["diagram_url", "diagram", "play_diagram"],
      video_url: ["video_url", "video", "play_video"],
      tags: ["tags", "labels", "categories"],

      // General notes
      notes: ["notes", "description", "details", "comments"],
    };
  }

  /**
   * Smart column detection - finds the best match for each column
   */
  private static detectColumnMapping(
    headers: string[]
  ): Record<string, string> {
    const mappings = this.getColumnMappings();
    const detected: Record<string, string> = {};

    headers.forEach((header) => {
      const originalHeader = header.trim();
      const cleanHeader = header
        .toLowerCase()
        .trim()
        .replace(/[_\s-]+/g, "_");

      let bestMatch = null;
      let bestScore = 0;

      // First, check for exact case-sensitive matches (for database field names)
      for (const [fieldName, variants] of Object.entries(mappings)) {
        if (variants.includes(originalHeader)) {
          detected[header] = fieldName;
          return; // Perfect match, no need to continue
        }
      }

      // Then find the best match based on specificity
      for (const [fieldName, variants] of Object.entries(mappings)) {
        for (const variant of variants) {
          const cleanVariant = variant.toLowerCase().replace(/[_\s-]+/g, "_");
          let score = 0;

          // Exact case-insensitive match gets highest score
          if (cleanHeader === cleanVariant) {
            score = 100;
          }
          // Exact substring match
          else if (cleanHeader.includes(cleanVariant)) {
            score = 80 - (cleanHeader.length - cleanVariant.length);
          }
          // Variant is substring of header
          else if (cleanVariant.includes(cleanHeader)) {
            score = 60 - (cleanVariant.length - cleanHeader.length);
          }
          // Partial word match
          else if (
            cleanHeader
              .split("_")
              .some(
                (part) =>
                  cleanVariant.split("_").includes(part) && part.length > 2
              )
          ) {
            score = 40;
          }

          if (score > bestScore) {
            bestScore = score;
            bestMatch = fieldName;
          }
        }
      }

      if (bestMatch && bestScore >= 40) {
        detected[header] = bestMatch;
      }
    });

    return detected;
  }

  /**
   * Enhanced CSV parsing with intelligence and validation
   */
  static parseCSVForPreview(csvContent: string): CSVParseResult {
    const lines = csvContent
      .trim()
      .split("\n")
      .filter((line) => line.trim());

    if (lines.length < 2) {
      return {
        previews: [],
        summary: {
          totalRows: 0,
          validPlays: 0,
          invalidPlays: 0,
          warnings: 0,
          detectedColumns: [],
          suggestedMappings: {},
        },
      };
    }

    // Parse headers with intelligent mapping
    const rawHeaders = this.parseCSVLine(lines[0]);
    const columnMapping = this.detectColumnMapping(rawHeaders);

    const previews: CSVPlayPreview[] = [];
    let playsNeedingConfirmation = 0;
    let lowQualityPlays = 0;

    // Process each data row
    for (let i = 1; i < lines.length; i++) {
      const values = this.parseCSVLine(lines[i]);
      const rowData: Record<string, string> = {};
      const errors: string[] = [];
      const warnings: string[] = [];

      // Map values to fields
      rawHeaders.forEach((header, index) => {
        const fieldName = columnMapping[header] || header.toLowerCase().trim();
        const value = values[index]?.trim() || "";
        rowData[fieldName] = value;
      });

      // Check for required fields (only play_name causes error)
      if (!rowData.play_name || rowData.play_name.trim() === "") {
        errors.push("Missing required field: play_name");
      }

      // Check for confirmation-requiring scenarios
      const missingFormation =
        !rowData.formation || rowData.formation.trim() === "";
      const missingPlayType = !rowData.p_type || rowData.p_type.trim() === "";

      if (missingFormation || missingPlayType) {
        playsNeedingConfirmation++;
        const missingFields = [];
        if (missingFormation) missingFields.push("formation");
        if (missingPlayType) missingFields.push("play type");
        warnings.push(`Missing ${missingFields.join(" and ")}`);
      }

      // Count fields filled for quality assessment
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

      if (filledFields.length < 5) {
        lowQualityPlays++;
      }

      // Smart validation and suggestions
      this.validateAndWarn(rowData, warnings);

      previews.push({
        rowNumber: i + 1,
        isValid: errors.length === 0, // Only fails if missing play_name
        errors,
        warnings,
        data: {
          formation: rowData.formation || "",
          play_name: rowData.play_name || "",
          p_type: rowData.p_type || "",
          personnel: rowData.personnel,
          one_word_play: rowData.one_word_play,
          protection: rowData.protection,
          notes: rowData.notes,
          ...rowData,
        },
      });
    }

    const validPlays = previews.filter((p) => p.isValid).length;
    const totalWarnings = previews.reduce(
      (sum, p) => sum + p.warnings.length,
      0
    );

    // Generate confirmation message if needed
    let needsConfirmation = false;
    let confirmationMessage = "";

    if (
      playsNeedingConfirmation > 0 &&
      !UserPreferencesService.shouldSkipCSVMissingFieldsConfirmation()
    ) {
      needsConfirmation = true;
      confirmationMessage = `I see ${playsNeedingConfirmation} play${playsNeedingConfirmation > 1 ? "s are" : " is"} missing formation and/or play type. Are you sure you wish to continue?`;
    }

    // Generate quality warning if needed
    let qualityWarning = "";
    const lowQualityThreshold = Math.ceil(previews.length * 0.5); // 50% of plays

    if (
      lowQualityPlays >= lowQualityThreshold &&
      previews.length >= 3 &&
      !UserPreferencesService.shouldSkipCSVQualityWarnings()
    ) {
      qualityWarning =
        "To get the best experience of BoxCall, it is recommended to fill out as much information about your plays as possible. For examples please visit the templates page.";
    }

    return {
      previews,
      summary: {
        totalRows: previews.length,
        validPlays,
        invalidPlays: previews.length - validPlays,
        warnings: totalWarnings,
        detectedColumns: rawHeaders,
        suggestedMappings: columnMapping,
        needsConfirmation,
        confirmationMessage,
        qualityWarning,
      },
    };
  }

  /**
   * Enhanced CSV line parsing that handles quotes and commas properly
   * Supports: "value with, comma", unquoted values, mixed quotes
   */
  private static parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = "";
    let inQuotes = false;
    let i = 0;

    while (i < line.length) {
      const char = line[i];
      const nextChar = line[i + 1];

      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          // Handle escaped quotes ""
          current += '"';
          i += 2;
          continue;
        } else {
          // Toggle quote state
          inQuotes = !inQuotes;
        }
      } else if (char === "," && !inQuotes) {
        // Field separator outside quotes
        result.push(current.trim());
        current = "";
      } else {
        current += char;
      }
      i++;
    }

    // Add the last field
    result.push(current.trim());

    // Clean up quotes from field values
    return result.map((field) => {
      // Remove surrounding quotes and trim
      let cleaned = field.trim();
      if (cleaned.startsWith('"') && cleaned.endsWith('"')) {
        cleaned = cleaned.slice(1, -1);
      }
      return cleaned.trim();
    });
  }

  /**
   * Smart validation with helpful warnings and auto-corrections
   */
  private static validateAndWarn(
    rowData: Record<string, string>,
    warnings: string[]
  ): void {
    // Play type validation and auto-correction
    const validPlayTypes = [
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

    // Formation validation
    if (rowData.formation) {
      if (rowData.formation.length < 2) {
        warnings.push(
          "Formation name seems very short. Consider using more descriptive names."
        );
      }
      // Common formation corrections
      const formationCorrections: Record<string, string> = {
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

    // Personnel validation and correction
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

    // Play name validation
    if (rowData.play_name) {
      if (rowData.play_name.length < 2) {
        warnings.push(
          "Play name seems very short. Consider using more descriptive names."
        );
      }
      // Auto-capitalize common play names
      const commonPlays: Record<string, string> = {
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

    // One word play validation
    if (rowData.one_word_play && rowData.one_word_play.length > 8) {
      warnings.push(
        "Audible/one-word play should be short and easy to call (8 characters or less)"
      );
    }
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

        // Normalize play type with defaults
        let normalizedPlayType = "Run"; // default
        if (playData.p_type) {
          const lowerType = playData.p_type.toLowerCase();
          if (lowerType.includes("pass")) normalizedPlayType = "Pass";
          else if (lowerType.includes("rpo")) normalizedPlayType = "RPO";
          else if (lowerType.includes("action") || lowerType.includes("pa"))
            normalizedPlayType = "Play Action";
          else if (lowerType.includes("run")) normalizedPlayType = "Run";
        }

        const play: Play = {
          id: `csv-import-${Date.now()}-${index}`,
          playbook_id: playbookId,
          formation: playData.formation || "Unknown Formation",
          play_name: playData.play_name,
          one_word_play: playData.one_word_play || "",
          p_type: normalizedPlayType as "Pass" | "Run" | "RPO" | "Play Action",
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
   * Export plays to CSV format
   */
  static exportPlaysToCSV(
    plays: Play[],
    options: CSVExportOptions = {}
  ): string {
    const headers = [
      "formation",
      "play_name",
      "one_word_play",
      "p_type",
      "personnel",
      "f_type",
      "protection",
      "pref_down",
      "pref_dis",
      "r_str",
      "p_str",
    ];

    if (options.includePrivateNotes) {
      headers.push("notes");
    }

    const csvLines = [headers.join(",")];

    plays.forEach((play) => {
      const row = [
        play.formation || "",
        play.play_name || "",
        play.one_word_play || "",
        play.p_type || "",
        play.personnel || "",
        play.f_type || "",
        play.protection || "",
        play.pref_down || "",
        play.pref_dis || "",
        play.r_str || "",
        play.p_str || "",
      ];

      if (options.includePrivateNotes) {
        row.push(play.notes || "");
      }

      // Escape commas and quotes in values
      const escapedRow = row.map((value) => {
        if (value.includes(",") || value.includes('"')) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      });

      csvLines.push(escapedRow.join(","));
    });

    return csvLines.join("\n");
  }

  /**
   * Export practice script to CSV format
   */
  static exportPracticeScriptToCSV(script: PracticeScript): string {
    const headers = [
      "order",
      "play_name",
      "formation",
      "p_type",
      "repetitions",
      "estimated_time",
      "notes",
    ];

    const csvLines = [headers.join(",")];

    script.plays.forEach((scriptPlay) => {
      const row = [
        scriptPlay.order.toString(),
        scriptPlay.play.play_name || "",
        scriptPlay.play.formation || "",
        scriptPlay.play.p_type || "",
        scriptPlay.repetitions.toString(),
        scriptPlay.estimatedTime.toString(),
        scriptPlay.notes || "",
      ];

      // Escape commas and quotes in values
      const escapedRow = row.map((value) => {
        if (value.includes(",") || value.includes('"')) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      });

      csvLines.push(escapedRow.join(","));
    });

    return csvLines.join("\n");
  }

  /**
   * Download CSV file
   */
  static downloadCSV(content: string, filename: string): void {
    const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  /**
   * Generate sample CSV template
   */
  static generateSampleCSV(): string {
    const samplePlays: CSVPlayData[] = [
      {
        formation: "I-Formation",
        play_name: "Power O",
        one_word_play: "Thunder",
        p_type: "run",
        personnel: "21",
        f_type: "11P",
        pref_down: "1st",
        pref_dis: "10",
        protection: "BOB",
        r_str: "strong",
        p_str: "",
        notes: "Good short yardage play",
      },
      {
        formation: "Shotgun",
        play_name: "Four Verticals",
        one_word_play: "Smash",
        p_type: "pass",
        personnel: "11",
        f_type: "11P",
        pref_down: "3rd",
        pref_dis: "7+",
        protection: "6-man",
        r_str: "",
        p_str: "vertical",
        notes: "Great vs Cover 3",
      },
    ];

    return this.exportSamplePlaysToCSV(samplePlays);
  }

  private static exportSamplePlaysToCSV(plays: CSVPlayData[]): string {
    const headers = Object.keys(plays[0]) as (keyof CSVPlayData)[];
    const csvLines = [headers.join(",")];

    plays.forEach((play) => {
      const row = headers.map((header) => play[header] || "");
      const escapedRow = row.map((value) => {
        if (value.includes(",") || value.includes('"')) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      });
      csvLines.push(escapedRow.join(","));
    });

    return csvLines.join("\n");
  }
}
