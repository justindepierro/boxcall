/**
 * Export Service
 *
 * Handles exporting plays to various formats (JSON, CSV)
 * Supports bulk export of selected plays
 *
 * Phase 3.5: Quick Win - Export Functionality
 */

import type { Play } from "../types/play";

// ========================================
// Export Formats
// ========================================

export type ExportFormat = "json" | "csv";

export interface ExportOptions {
  format: ExportFormat;
  filename?: string;
  includeMetadata?: boolean;
  prettyPrint?: boolean; // For JSON only
}

// ========================================
// JSON Export
// ========================================

/**
 * Export plays to JSON format
 */
export function exportToJSON(
  plays: Play[],
  options: { prettyPrint?: boolean; includeMetadata?: boolean } = {}
): string {
  const { prettyPrint = true, includeMetadata = true } = options;

  const data = {
    ...(includeMetadata && {
      metadata: {
        exportDate: new Date().toISOString(),
        playCount: plays.length,
        version: "1.0",
        application: "BoxCall",
      },
    }),
    plays: plays.map((play) => ({
      // Core fields
      id: play.id,
      play_name: play.play_name,
      formation: play.formation,
      formation_id: play.formation_id,
      p_type: play.p_type,
      personnel: play.personnel,

      // Formation details
      f_type: play.f_type,
      f_dir: play.f_dir,
      back_align: play.back_align,
      shift: play.shift,
      motion: play.motion,

      // Play details
      p_dir: play.p_dir,
      protection: play.protection,
      r_str: play.r_str,
      p_str: play.p_str,

      // Metadata
      tags: play.tags,
      key_positions: play.key_positions,
      key_players: play.key_players,
      flags: play.flags,
      notes: play.notes,

      // Preferences
      pref_down: play.pref_down,
      pref_dis: play.pref_dis,
      pref_hash: play.pref_hash,
      pref_cov: play.pref_cov,
      pref_front: play.pref_front,

      // Stats
      confidence_base: play.confidence_base,
      times_called: play.times_called,
      times_successful: play.times_successful,

      // Diagram
      diagram_data: play.diagram_data,
      diagram_version: play.diagram_version,
      diagram_url: play.diagram_url,

      // Timestamps
      created_at: play.created_at,
      updated_at: play.updated_at,
    })),
  };

  return prettyPrint ? JSON.stringify(data, null, 2) : JSON.stringify(data);
}

// ========================================
// CSV Export
// ========================================

/**
 * Escape CSV field
 */
function escapeCSVField(field: unknown): string {
  if (field === null || field === undefined) return "";

  const str = String(field);

  // If field contains comma, quote, or newline, wrap in quotes and escape quotes
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }

  return str;
}

/**
 * Convert array to comma-separated string
 */
function arrayToString(arr: unknown[] | null | undefined): string {
  if (!arr || arr.length === 0) return "";
  return arr.map((item) => String(item)).join("; ");
}

/**
 * Export plays to CSV format
 */
export function exportToCSV(plays: Play[]): string {
  // CSV Headers
  const headers = [
    "Play Name",
    "Formation",
    "Play Type",
    "Personnel",
    "Formation Type",
    "Formation Direction",
    "Back Alignment",
    "Shift",
    "Motion",
    "Play Direction",
    "Protection",
    "Run Strength",
    "Pass Strength",
    "Tags",
    "Key Positions",
    "Key Players",
    "Flags",
    "Notes",
    "Preferred Down",
    "Preferred Distance",
    "Preferred Hash",
    "Preferred Coverage",
    "Preferred Front",
    "Confidence",
    "Times Called",
    "Times Successful",
    "Success Rate %",
    "Has Diagram",
    "Created At",
  ];

  // Build CSV rows
  const rows = plays.map((play) => {
    const successRate =
      play.times_called && play.times_called > 0
        ? Math.round((play.times_successful! / play.times_called) * 100)
        : 0;

    return [
      play.play_name,
      play.formation,
      play.p_type,
      play.personnel,
      play.f_type,
      play.f_dir,
      play.back_align,
      play.shift,
      play.motion,
      play.p_dir,
      play.protection,
      play.r_str,
      play.p_str,
      arrayToString(play.tags),
      arrayToString(play.key_positions),
      arrayToString(play.key_players),
      arrayToString(play.flags),
      play.notes,
      play.pref_down,
      play.pref_dis,
      play.pref_hash,
      play.pref_cov,
      play.pref_front,
      play.confidence_base,
      play.times_called || 0,
      play.times_successful || 0,
      successRate,
      play.diagram_data ? "Yes" : "No",
      play.created_at ? new Date(play.created_at).toLocaleDateString() : "",
    ].map(escapeCSVField);
  });

  // Combine headers and rows
  const csvLines = [
    headers.map(escapeCSVField).join(","),
    ...rows.map((row) => row.join(",")),
  ];

  return csvLines.join("\n");
}

// ========================================
// Download File
// ========================================

/**
 * Trigger browser download for exported data
 */
export function downloadFile(
  content: string,
  filename: string,
  mimeType: string
): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// ========================================
// Main Export Function
// ========================================

/**
 * Export plays with specified options
 */
export function exportPlays(
  plays: Play[],
  options: ExportOptions = { format: "json" }
): void {
  const {
    format,
    filename,
    includeMetadata = true,
    prettyPrint = true,
  } = options;

  // Generate default filename
  const timestamp = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
  const defaultFilename = filename || `boxcall-plays-${timestamp}.${format}`;

  // Generate content based on format
  let content: string;
  let mimeType: string;

  switch (format) {
    case "json":
      content = exportToJSON(plays, { prettyPrint, includeMetadata });
      mimeType = "application/json";
      break;

    case "csv":
      content = exportToCSV(plays);
      mimeType = "text/csv";
      break;

    default:
      throw new Error(`Unsupported export format: ${format}`);
  }

  // Trigger download
  downloadFile(content, defaultFilename, mimeType);
}

// ========================================
// Export Summary
// ========================================

export interface ExportSummary {
  playCount: number;
  format: ExportFormat;
  filename: string;
  fileSize: string; // Human-readable (e.g., "45 KB")
}

/**
 * Get export summary without actually exporting
 */
export function getExportSummary(
  plays: Play[],
  format: ExportFormat
): ExportSummary {
  let content: string;

  switch (format) {
    case "json":
      content = exportToJSON(plays, { prettyPrint: true });
      break;
    case "csv":
      content = exportToCSV(plays);
      break;
    default:
      content = "";
  }

  const sizeInBytes = new Blob([content]).size;
  const sizeInKB = (sizeInBytes / 1024).toFixed(1);
  const fileSize = sizeInBytes < 1024 ? `${sizeInBytes} B` : `${sizeInKB} KB`;

  const timestamp = new Date().toISOString().split("T")[0];
  const filename = `boxcall-plays-${timestamp}.${format}`;

  return {
    playCount: plays.length,
    format,
    filename,
    fileSize,
  };
}
