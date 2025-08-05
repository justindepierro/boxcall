/**
 * CSV Service - Handles import/export of plays and practice scripts
 *
 * Part of the enhanced create play workflow with import/export capabilities
 */

import type { Play } from "../types/play";
import type { PracticeScript } from "./practiceScriptService";

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
  parsedPlays: CSVPlayPreview[]; // Add parsed plays for preview
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
      formation: ["formation", "form", "format", "alignment"],
      play_name: [
        "play_name",
        "play name",
        "playname",
        "name",
        "play",
        "title",
      ],
      one_word_play: [
        "one_word_play",
        "audible",
        "call",
        "quick_call",
        "signal",
        "code",
      ],
      p_type: ["p_type", "play_type", "type", "category", "kind"],
      personnel: ["personnel", "package", "grouping", "formation_personnel"],
      f_type: ["f_type", "formation_type", "form_type"],
      protection: ["protection", "prot", "pass_pro", "pass_protection"],
      p_dir: ["p_dir", "play_direction", "direction", "dir"],
      pref_down: ["pref_down", "preferred_down", "down", "situation"],
      pref_dis: ["pref_dis", "preferred_distance", "distance", "yardage"],
      notes: ["notes", "description", "details", "comments"],
      r_str: ["r_str", "route_strength", "route", "receiver_strength"],
      p_str: ["p_str", "protection_strength", "blocking"],
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
      const cleanHeader = header
        .toLowerCase()
        .trim()
        .replace(/[_\s-]+/g, "_");

      // Look for exact matches first
      for (const [fieldName, variants] of Object.entries(mappings)) {
        if (
          variants.some(
            (variant) =>
              cleanHeader === variant.replace(/[_\s-]+/g, "_") ||
              cleanHeader.includes(variant.replace(/[_\s-]+/g, "_"))
          )
        ) {
          detected[header] = fieldName;
          break;
        }
      }

      // If no exact match, try partial matches
      if (!detected[header]) {
        for (const [fieldName, variants] of Object.entries(mappings)) {
          if (
            variants.some(
              (variant) =>
                cleanHeader.includes(variant.split("_")[0]) ||
                variant.split("_")[0].includes(cleanHeader)
            )
          ) {
            detected[header] = fieldName;
            break;
          }
        }
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
    const requiredFields = ["formation", "play_name", "p_type"];

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

      // Validate required fields
      requiredFields.forEach((field) => {
        if (!rowData[field]) {
          errors.push(`Missing required field: ${field}`);
        }
      });

      // Smart validation and suggestions
      this.validateAndWarn(rowData, warnings);

      previews.push({
        rowNumber: i + 1,
        isValid: errors.length === 0,
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

    return {
      previews,
      summary: {
        totalRows: previews.length,
        validPlays,
        invalidPlays: previews.length - validPlays,
        warnings: totalWarnings,
        detectedColumns: rawHeaders,
        suggestedMappings: columnMapping,
      },
    };
  }

  /**
   * Enhanced CSV line parsing that handles quotes and commas properly
   */
  private static parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === "," && !inQuotes) {
        result.push(current);
        current = "";
      } else {
        current += char;
      }
    }

    result.push(current);
    return result.map((field) => field.replace(/^"(.*)"$/, "$1").trim());
  }

  /**
   * Smart validation with helpful warnings
   */
  private static validateAndWarn(
    rowData: Record<string, string>,
    warnings: string[]
  ): void {
    // Play type validation
    const validPlayTypes = [
      "Pass",
      "Run",
      "RPO",
      "Play Action",
      "Special",
      "Punt",
      "FG",
      "PAT",
    ];
    if (
      rowData.p_type &&
      !validPlayTypes.some(
        (type) => type.toLowerCase() === rowData.p_type.toLowerCase()
      )
    ) {
      warnings.push(
        `Play type "${rowData.p_type}" may not be recognized. Suggested: ${validPlayTypes.join(", ")}`
      );
    }

    // Formation validation
    if (rowData.formation && rowData.formation.length < 2) {
      warnings.push(
        "Formation name seems very short. Consider using more descriptive names."
      );
    }

    // Personnel validation
    if (rowData.personnel && !/^\d+/.test(rowData.personnel)) {
      warnings.push(
        "Personnel should typically start with numbers (e.g., '11', '12', '21')"
      );
    }

    // Play name validation
    if (rowData.play_name && rowData.play_name.length < 3) {
      warnings.push(
        "Play name seems very short. Consider using more descriptive names."
      );
    }
  }

  /**
   * Convert validated preview data to Play objects
   */
  static convertPreviewsToPlays(
    previews: CSVPlayPreview[],
    playbookId: string
  ): CSVImportResult {
    const plays: Play[] = [];
    const errors: string[] = [];
    const warnings: string[] = [];

    const validPreviews = previews.filter((p) => p.isValid);

    validPreviews.forEach((preview, index) => {
      try {
        const playData = preview.data;

        // Normalize play type
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
          formation: playData.formation,
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

    return {
      success: plays.length > 0,
      totalRows: previews.length,
      importedPlays: plays.length,
      errors,
      warnings,
      plays,
      parsedPlays: previews,
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
