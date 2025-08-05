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
  plays: Play[];
}

export interface CSVExportOptions {
  includeComplexity?: boolean;
  includePrivateNotes?: boolean;
  formatForCoach?: boolean;
}

export class CSVService {
  /**
   * Parse CSV content and convert to play data
   */
  static parsePlaysFromCSV(csvContent: string): CSVImportResult {
    const lines = csvContent.trim().split("\n");
    const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());

    const plays: Play[] = [];
    const errors: string[] = [];

    // Required fields for a valid play
    const requiredFields = ["formation", "play_name", "p_type"];

    for (let i = 1; i < lines.length; i++) {
      try {
        const values = lines[i].split(",").map((v) => v.trim());
        const playData: Record<string, string> = {};

        // Map CSV columns to play fields
        headers.forEach((header, index) => {
          const value = values[index] || "";
          switch (header) {
            case "formation":
              playData.formation = value;
              break;
            case "play_name":
            case "play name":
            case "playname":
              playData.play_name = value;
              break;
            case "one_word_play":
            case "audible":
            case "call":
              playData.one_word_play = value;
              break;
            case "p_type":
            case "play_type":
            case "type":
              playData.p_type = value;
              break;
            case "personnel":
              playData.personnel = value;
              break;
            case "f_type":
            case "formation_type":
              playData.f_type = value;
              break;
            case "protection":
              playData.protection = value;
              break;
            case "notes":
              playData.notes = value;
              break;
            default:
              // Store any additional fields
              playData[header] = value;
          }
        });

        // Validate required fields
        const missingFields = requiredFields.filter(
          (field) => !playData[field]
        );
        if (missingFields.length > 0) {
          errors.push(
            `Row ${i + 1}: Missing required fields: ${missingFields.join(", ")}`
          );
          continue;
        }

        // Create play object
        const play: Play = {
          id: `imported-${Date.now()}-${i}`,
          playbook_id: "default-playbook", // Replace with actual playbook ID
          formation: playData.formation,
          play_name: playData.play_name,
          one_word_play: playData.one_word_play,
          p_type: playData.p_type as "Pass" | "Run" | "RPO" | "Play Action", // Will be validated by the importing system
          personnel: playData.personnel,
          f_type: playData.f_type,
          protection: playData.protection,
          notes: playData.notes,
          // Set default values for other fields
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
          // Required fields with defaults
          confidence_base: 70,
          times_called: 0,
          times_successful: 0,
          created_by: "csv-import",
          created_at: new Date(),
          updated_at: new Date(),
        };

        plays.push(play);
      } catch (error) {
        errors.push(
          `Row ${i + 1}: ${error instanceof Error ? error.message : "Unknown error"}`
        );
      }
    }

    return {
      success: errors.length === 0,
      totalRows: lines.length - 1,
      importedPlays: plays.length,
      errors,
      plays,
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
