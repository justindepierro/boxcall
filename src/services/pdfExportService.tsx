/**
 * PDF Export Service for Practice Scripts
 * Generates professional PDF documents for practice planning
 * Now with lazy loading for react-pdf library (saves ~1.5MB from initial bundle)
 */

import type { PracticeScript } from "@services";

export class PDFExportService {
  /**
   * Lazy load react-pdf and PDF component
   */
  private static async loadPDFDependencies() {
    const [{ pdf }, { PracticeScriptPDF }] = await Promise.all([
      import("@react-pdf/renderer"),
      import("../components/pdf/PracticeScriptPDF"),
    ]);
    return { pdf, PracticeScriptPDF };
  }

  /**
   * Generate and download a PDF for a practice script
   */
  static async exportPracticeScript(script: PracticeScript): Promise<void> {
    try {
      const { pdf, PracticeScriptPDF } = await this.loadPDFDependencies();
      const blob = await pdf(<PracticeScriptPDF script={script} />).toBlob();

      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${(script.name ?? "practice_script").replace(/[^a-z0-9]/gi, "_").toLowerCase()}_practice_script.pdf`;

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
      const { pdf, PracticeScriptPDF } = await this.loadPDFDependencies();
      return await pdf(<PracticeScriptPDF script={script} />).toBlob();
    } catch (error) {
      console.error("Error generating PDF:", error);
      throw new Error("Failed to generate PDF");
    }
  }
}
