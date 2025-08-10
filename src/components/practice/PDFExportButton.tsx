/**
 * PDF Export Button
 *
 * Standalone button component for exporting practice data to PDF.
 * Can be used in any practice component where PDF export is needed.
 */
import React from "react";
import { Tooltip } from "../ui/Tooltip/Tooltip";
import { Button } from "../ui";
import Icon from "../ui/Icon/Icon";
import { usePracticeScriptPDF } from "../../services/pdf/usePracticeScriptPDF";
import type { PracticeBlock } from "./types";
interface PDFExportButtonProps {
  practiceData: {
    title?: string;
    date?: string;
    duration?: number;
    location?: string;
    weather?: string;
    blocks?: PracticeBlock[];
    coaches?: Array<{
      id: string;
      name: string;
      role: string;
      assignments?: string[];
    }>;
    equipment?: Array<{
      item: string;
      quantity?: number;
      location?: string;
    }>;
  };
  variant?: "primary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  className?: string;
  disabled?: boolean;
}
export const PDFExportButton: React.FC<PDFExportButtonProps> = ({
  practiceData,
  variant = "outline",
  size = "sm",
  className = "",
  disabled = false,
}) => {
  const { downloadPDF, isExporting, error, clearError } =
    usePracticeScriptPDF();
  const handleExportPDF = async () => {
    if (error) clearError();
    // Convert practice data to PDF format
    const pdfData = {
      title: practiceData.title || "Practice Session",
      date: practiceData.date || new Date().toISOString().split("T")[0],
      duration: practiceData.duration || 120,
      location: practiceData.location || "Practice Field",
      weather: practiceData.weather,
      practiceBlocks: (practiceData.blocks || []).map((block) => ({
        id: block.id,
        title: block.title,
        category: block.category,
        startTime: block.startTime || "",
        endTime: block.endTime || "",
        duration: block.duration,
        location: block.location,
        notes: block.notes,
        assignedCoach: block.assignedCoach,
        groups: block.groups,
      })),
      coaches: practiceData.coaches || [],
      equipment: practiceData.equipment || [],
      summary: {
        totalMinutes: practiceData.duration || 120,
        categoryBreakdown: (practiceData.blocks || []).reduce(
          (acc, block) => {
            acc[block.category] = (acc[block.category] || 0) + block.duration;
            return acc;
          },
          {} as Record<string, number>
        ),
        coachUtilization: {},
        objectives: [],
      },
    };
    // Generate filename
    const safeTitle = (practiceData.title || "practice")
      .replace(/[^a-zA-Z0-9]/g, "_")
      .substring(0, 30);
    const safeDate = (
      practiceData.date || new Date().toISOString().split("T")[0]
    ).replace(/[^0-9]/g, "_");
    const filename = `${safeTitle}_${safeDate}.pdf`;
    await downloadPDF(pdfData, filename, {
      format: "A4",
      orientation: "portrait",
      includeHeader: true,
      includeFooter: true,
      includePageNumbers: true,
    });
  };
  const hasValidData = practiceData.blocks && practiceData.blocks.length > 0;
  return (
    <div className="relative">
      <Button
        variant={variant}
        size={size}
        onClick={handleExportPDF}
        disabled={disabled || isExporting || !hasValidData}
        className={`${className} ${!hasValidData ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        {isExporting ? (
          <>
            <svg
              className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Generating...
          </>
        ) : (
          <>
            <Icon name="pdf" size="sm" className="mr-2" />
            Export PDF
          </>
        )}
      </Button>
      {/* Error Tooltip */}
      {error && (
        <Tooltip
          content={
            <div className="flex items-start gap-2">
              <span className="text-red-300 font-medium">{error}</span>
              <Button
                variant="ghost"
                size="xs"
                onClick={clearError}
                className="text-red-300 hover:text-red-200 !h-auto !p-0"
                aria-label="Clear error"
              >
                ×
              </Button>
            </div>
          }
          placement="bottom"
          className="surface-inverse border-red-500/30 text-[11px]"
          maxWidth={240}
        >
          <span className="sr-only">Error</span>
        </Tooltip>
      )}
      {/* No Data Tooltip */}
      {!hasValidData && !isExporting && (
        <Tooltip
          content={
            <span className="text-gray-200">
              Add practice blocks to enable PDF export
            </span>
          }
          placement="bottom"
          className="surface-inverse text-[11px]"
          maxWidth={220}
        >
          <span className="sr-only">Info</span>
        </Tooltip>
      )}
    </div>
  );
};
