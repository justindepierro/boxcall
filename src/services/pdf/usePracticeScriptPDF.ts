/**
 * PDF Export Integration
 *
 * React hook and component for integrating PDF export functionality
 * with the practice planner components.
 *
 * PERFORMANCE OPTIMIZATION: PDF exports use dynamic imports to avoid
 * loading 1.49MB of PDF libraries on initial page load.
 */
import { useState, useCallback } from "react";

import type { PracticeScriptPDFData, PDFExportOptions } from "./types";

export interface UsePracticeScriptPDFReturn {
  isExporting: boolean;
  error: string | null;
  exportToPDF: (
    data: PracticeScriptPDFData,
    options?: PDFExportOptions
  ) => Promise<Blob | null>;
  downloadPDF: (
    data: PracticeScriptPDFData,
    filename?: string,
    options?: PDFExportOptions
  ) => Promise<void>;
  previewPDF: (
    data: PracticeScriptPDFData,
    options?: PDFExportOptions
  ) => Promise<string | null>;
  clearError: () => void;
}
/**
 * Hook for managing practice script PDF operations
 */
export const usePracticeScriptPDF = (): UsePracticeScriptPDFReturn => {
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const clearError = useCallback(() => {
    setError(null);
  }, []);
  const exportToPDF = useCallback(
    async (
      data: PracticeScriptPDFData,
      options: PDFExportOptions = {}
    ): Promise<Blob | null> => {
      try {
        setIsExporting(true);
        setError(null);

        // Lazy load PDF library (1.49MB) only when needed
        const { exportPracticeScriptToPDF } = await import("./index");

        const blob = await exportPracticeScriptToPDF(data, options);
        return blob;
      } catch (err) {
        // Handle both PDFError and dynamic import errors
        const errorMessage =
          err instanceof Error ? err.message : "Failed to export PDF";
        setError(errorMessage);
        return null;
      } finally {
        setIsExporting(false);
      }
    },
    []
  );
  const downloadPDF = useCallback(
    async (
      data: PracticeScriptPDFData,
      filename?: string,
      options: PDFExportOptions = {}
    ): Promise<void> => {
      try {
        setIsExporting(true);
        setError(null);

        // Lazy load PDF library (1.49MB) only when needed
        const { downloadPracticeScriptPDF } = await import("./index");

        await downloadPracticeScriptPDF(data, filename, options);
      } catch (err) {
        // Handle both PDFError and dynamic import errors
        const errorMessage =
          err instanceof Error ? err.message : "Failed to download PDF";
        setError(errorMessage);
      } finally {
        setIsExporting(false);
      }
    },
    []
  );
  const previewPDF = useCallback(
    async (
      data: PracticeScriptPDFData,
      options: PDFExportOptions = {}
    ): Promise<string | null> => {
      try {
        setIsExporting(true);
        setError(null);

        // Lazy load PDF library (1.49MB) only when needed
        const { previewPracticeScriptPDF } = await import("./index");

        const previewUrl = await previewPracticeScriptPDF(data, options);
        return previewUrl;
      } catch (err) {
        // Handle both PDFError and dynamic import errors
        const errorMessage =
          err instanceof Error ? err.message : "Failed to generate PDF preview";
        setError(errorMessage);
        return null;
      } finally {
        setIsExporting(false);
      }
    },
    []
  );
  return {
    isExporting,
    error,
    exportToPDF,
    downloadPDF,
    previewPDF,
    clearError,
  };
};
/**
 * Helper function to convert practice state to PDF data format
 */
export const convertPracticeStateToPDFData = (practiceState: {
  title?: string;
  date?: string;
  duration?: number;
  location?: string;
  weather?: string;
  blocks?: Array<{
    id: string;
    title: string;
    category: string;
    startTime: string;
    endTime: string;
    duration: number;
    location?: string;
    notes?: string;
    assignedCoach?: string;
    groups?: unknown[];
  }>;
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
  objectives?: string[];
  summary?: {
    totalMinutes: number;
    categoryBreakdown: Record<string, number>;
    coachUtilization?: Record<string, number>;
    objectives?: string[];
  };
}): PracticeScriptPDFData => {
  // This would be implemented based on your practice state structure
  // For now, returning a basic structure as an example
  return {
    title: practiceState.title || "Practice Session",
    date: practiceState.date || new Date().toISOString().split("T")[0],
    duration: practiceState.duration || 120, // Default 2 hours
    location: practiceState.location || "Practice Field",
    weather: practiceState.weather,
    practiceBlocks: (practiceState.blocks || []).map((block) => ({
      id: block.id,
      title: block.title,
      category: block.category,
      startTime: block.startTime,
      endTime: block.endTime,
      duration: block.duration,
      location: block.location,
      notes: block.notes,
      assignedCoach: block.assignedCoach,
      groups:
        (block.groups as Array<{ id: string; name: string; notes?: string }>) ||
        [],
    })),
    coaches: practiceState.coaches || [],
    equipment: practiceState.equipment || [],
    summary: practiceState.summary
      ? {
          totalMinutes: practiceState.summary.totalMinutes,
          categoryBreakdown: practiceState.summary.categoryBreakdown,
          coachUtilization: practiceState.summary.coachUtilization || {},
          objectives: practiceState.summary.objectives,
        }
      : undefined,
  };
};
/**
 * Default PDF export options for practice scripts
 */
export const getDefaultPracticeScriptPDFOptions = (): PDFExportOptions => ({
  includeHeader: true,
  includeFooter: true,
  includePageNumbers: true,
  format: "A4",
  orientation: "portrait",
});
/**
 * Generate a filename for practice script PDF
 */
export const generatePracticeScriptFilename = (
  title: string,
  date: string
): string => {
  const safeTitle = title.replace(/[^a-zA-Z0-9]/g, "_").substring(0, 30);
  const safeDate = date.replace(/[^0-9]/g, "_");
  return `practice_${safeTitle}_${safeDate}.pdf`;
};
