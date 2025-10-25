import type { RosterPlayerView } from "../services/rosterService";

/**
 * Export utilities for roster data
 * Supports CSV and PDF formats
 */

/**
 * Export players to CSV format
 * @param players - Array of players to export
 * @param filename - Base filename (without extension)
 */
export function exportToCSV(
  players: RosterPlayerView[],
  filename: string
): void {
  const headers = [
    "First Name",
    "Last Name",
    "Jersey #",
    "Position",
    "Grade",
    "Height",
    "Weight (lbs)",
    "Status",
    "Active",
  ];

  const rows = players.map((p) => {
    // Format height
    const height = p.height_inches
      ? `${Math.floor(p.height_inches / 12)}'${p.height_inches % 12}"`
      : "";

    // Format status
    const status = p.roster_status || (p.is_active ? "active" : "inactive");
    const active = p.is_active ? "Yes" : "No";

    return [
      p.first_name || "",
      p.last_name || "",
      p.jersey_number?.toString() || "",
      p.position || "",
      p.grade_level || "",
      height,
      p.weight_lbs?.toString() || "",
      status,
      active,
    ];
  });

  // Build CSV content
  const csvContent = [
    headers.join(","),
    ...rows.map((row) =>
      row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(",")
    ),
  ].join("\n");

  // Create and download file
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}.csv`);
  link.style.visibility = "hidden";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

/**
 * Export players to PDF format using jsPDF
 * Note: This requires jsPDF to be installed: npm install jspdf
 * @param players - Array of players to export
 * @param teamName - Name of the team
 * @param filename - Base filename (without extension)
 */
export async function exportToPDF(
  _players: RosterPlayerView[],
  _teamName: string,
  _filename: string
): Promise<void> {
  // TODO: Install jsPDF and jspdf-autotable packages
  // npm install jspdf jspdf-autotable
  // npm install --save-dev @types/jspdf

  throw new Error(
    "PDF export is not yet implemented. Please use CSV export instead."
  );
}

/**
 * Generate a filename with current date
 * @param baseName - Base name for the file
 * @returns Formatted filename string
 */
export function generateExportFilename(baseName: string): string {
  const date = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
  const sanitized = baseName.replace(/[^a-z0-9]/gi, "-").toLowerCase();
  return `${sanitized}-roster-${date}`;
}
