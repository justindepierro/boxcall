/**
 * CSV Export Service
 *
 * Handles exporting plays and practice scripts to CSV format
 */

import type { CSVExportOptions } from "./types";
import type { Play } from "../../types/play";

// Import the PracticeScript type locally to avoid circular dependencies
interface PracticeScript {
  plays: Array<{
    order: number;
    play: Play;
    repetitions: number;
    estimatedTime: number;
    notes?: string;
  }>;
}

export class CSVExporter {
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
      const escapedRow = row.map((value) => this.escapeCSVValue(value));
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
      const escapedRow = row.map((value) => this.escapeCSVValue(value));
      csvLines.push(escapedRow.join(","));
    });

    return csvLines.join("\n");
  }

  // ...existing code...

  /**
   * Escape CSV values that contain commas or quotes
   */
  private static escapeCSVValue(value: string): string {
    if (value.includes(",") || value.includes('"')) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
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
}
