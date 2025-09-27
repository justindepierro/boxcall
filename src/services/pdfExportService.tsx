/**
 * PDF Export Service for Practice Scripts
 * Generates professional PDF documents for practice planning
 */

import { pdf } from "@react-pdf/renderer";
import type { PracticeScript } from "./practiceScriptService";
import { PracticeScriptPDF } from "../components/pdf/PracticeScriptPDF";

export class PDFExportService {
  /**
   * Generate and download a PDF for a practice script
   */
  static async exportPracticeScript(script: PracticeScript): Promise<void> {
    try {
      const blob = await pdf(<PracticeScriptPDF script={script} />).toBlob();

      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${script.name.replace(/[^a-z0-9]/gi, "_").toLowerCase()}_practice_script.pdf`;

      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error generating PDF:", error);
      throw new Error("Failed to generate PDF");
    }
  }

  /**
   * Generate PDF blob for a practice script (for preview or other uses)
   */
  static async generatePracticeScriptPDF(
    script: PracticeScript
  ): Promise<Blob> {
    try {
      return await pdf(<PracticeScriptPDF script={script} />).toBlob();
    } catch (error) {
      console.error("Error generating PDF:", error);
      throw new Error("Failed to generate PDF");
    }
  }
}
