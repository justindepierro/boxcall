/**
 * PDF Export Service for Game Plans
 * Generates professional PDF documents for game planning using Billick Situational Method
 * Lazy loads react-pdf library to avoid bundle bloat
 */

import type { GamePlan } from "../components/playbook/GamePlanModal/types";

export type GamePlanPDFFormat = "detailed" | "compact" | "call-sheet";

export class GamePlanPDFService {
  /**
   * Lazy load react-pdf and PDF component
   */
  private static async loadPDFDependencies() {
    const [{ pdf }, GamePlanPDFModule] = await Promise.all([
      import("@react-pdf/renderer"),
      // @ts-ignore - Dynamic import resolved at runtime
      import("../components/pdf/GamePlanPDF"),
    ]);
    return { pdf, GamePlanPDF: GamePlanPDFModule.GamePlanPDF };
  }

  /**
   * Generate and download a PDF for a game plan
   */
  static async exportGamePlan(
    gamePlan: GamePlan,
    format: GamePlanPDFFormat = "call-sheet"
  ): Promise<void> {
    try {
      const { pdf, GamePlanPDF } = await this.loadPDFDependencies();
      const blob = await pdf(
        <GamePlanPDF gamePlan={gamePlan} format={format} />
      ).toBlob();

      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;

      const formatSuffix = (() => {
        if (format === "call-sheet") return "_call_sheet";
        if (format === "compact") return "_compact";
        return "";
      })();

      const fileName = `${gamePlan.name.replace(/[^a-z0-9]/gi, "_").toLowerCase()}${formatSuffix}.pdf`;
      link.download = fileName;

      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error generating game plan PDF:", error);
      throw new Error("Failed to generate game plan PDF");
    }
  }

  /**
   * Generate PDF blob for a game plan (for preview or other uses)
   */
  static async generateGamePlanPDF(
    gamePlan: GamePlan,
    format: GamePlanPDFFormat = "call-sheet"
  ): Promise<Blob> {
    try {
      const { pdf, GamePlanPDF } = await this.loadPDFDependencies();
      return await pdf(
        <GamePlanPDF gamePlan={gamePlan} format={format} />
      ).toBlob();
    } catch (error) {
      console.error("Error generating game plan PDF:", error);
      throw new Error("Failed to generate game plan PDF");
    }
  }
}
