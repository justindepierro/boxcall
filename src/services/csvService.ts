/**
 * CSV Service - Main Orchestrator
 *
 * Handles import/export of plays and practice scripts with modular architecture
 */

import { CSVExporter } from "./csv/CSVExporter";
import { CSVImportProcessor } from "./csv/CSVImportProcessor";
import { CSVPlayConverter } from "./csv/CSVPlayConverter";

import type {
  CSVParseResult,
  CSVImportResult,
  CSVExportOptions,
} from "./csv/types";
import type { Play } from "../types/play";

// Local interface to avoid circular dependency
interface PracticeScript {
  plays: Array<{
    order: number;
    play: Play;
    repetitions: number;
    estimatedTime: number;
    notes?: string;
  }>;
}

export class CSVService {
  /**
   * Enhanced CSV parsing with intelligence and validation
   */
  static parseCSVForPreview(csvContent: string): CSVParseResult {
    return CSVImportProcessor.parseCSVForPreview(csvContent);
  }

  /**
   * Convert validated preview data to Play objects
   */
  static convertPreviewsToPlays(
    previews: CSVParseResult["previews"],
    playbookId: string,
    forceImport: boolean = false
  ): CSVImportResult {
    return CSVPlayConverter.convertPreviewsToPlays(
      previews,
      playbookId,
      forceImport
    );
  }

  /**
   * Export plays to CSV format
   */
  static exportPlaysToCSV(
    plays: Play[],
    options: CSVExportOptions = {}
  ): string {
    return CSVExporter.exportPlaysToCSV(plays, options);
  }

  /**
   * Export practice script to CSV format
   */
  static exportPracticeScriptToCSV(script: PracticeScript): string {
    return CSVExporter.exportPracticeScriptToCSV(script);
  }

  /**
   * Download CSV file
   */
  static downloadCSV(content: string, filename: string): void {
    return CSVExporter.downloadCSV(content, filename);
  }

  /**
   * Generate a sample CSV template users can download
   * Matches the headers expected by the importer/exporter
   */
  static generateSampleCSV(): string {
    const headers = [
      "formation",
      "play_name",
      "one_word_play",
      "p_type",
      "personnel",
      "f_type",
      "f_dir",
      "formation_direction",
      "ftag1",
      "ftag2",
      "p_dir",
      "protection",
      "check_into",
      "pref_down",
      "pref_dis",
      "pref_hash",
      "pref_cov",
      "pref_front",
      "pref_field_pos",
      "pref_situation",
      "r_str",
      "p_str",
      "key_player1",
      "key_player2",
      "p_tag1",
      "p_tag2",
      "back_align",
      "shift",
      "motion",
      "notes",
    ];

    const sampleRows = [
      [
        "Shotgun",
        "Mesh",
        "Mesh",
        "Pass",
        "11",
        "Spread",
        "Right",
        "base",
        "Trips",
        "Open",
        "Right",
        "Slide Left",
        "Check: Stick",
        "2nd",
        "Medium",
        "Left",
        "Cover 3",
        "Over",
        "Midfield",
        "3rd Down",
        "Right",
        "Right",
        "X",
        "QB",
        "Man Beater",
        "Zone Beater",
        "Pistol",
        "Zip",
        "Orbit",
        "RB option vs pressure",
      ],
      [
        "I-Formation",
        "Power O",
        "Power",
        "Run",
        "21",
        "Power",
        "Left",
        "base",
        "Tight",
        "Heavy",
        "Left",
        "N/A",
        "",
        "1st",
        "Short",
        "Right",
        "",
        "",
        "Goal Line",
        "Red Zone",
        "Left",
        "Left",
        "RB",
        "FB",
        "Base",
        "",
        "Strong",
        "",
        "",
        "Downhill power run",
      ],
    ];

    const escape = (v: string) =>
      v.includes(",") || v.includes('"') ? `"${v.replace(/"/g, '""')}"` : v;

    const lines = [headers.join(",")];
    for (const row of sampleRows) {
      lines.push(row.map(escape).join(","));
    }
    return lines.join("\n");
  }

  // ...existing code...
}

// Export types for external use
export type {
  CSVPlayData,
  CSVImportResult,
  CSVPlayPreview,
  CSVParseResult,
  CSVExportOptions,
} from "./csv/types";
