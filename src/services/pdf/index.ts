/**
 * PDF Services
 *
 * Main entry point for all PDF generation functionality.
 * Provides easy access to PDF services and utilities.
 */

// Core services and utilities
export { BasePDFService, PDFServiceFactory, PDFUtils } from "./BasePDFService";
export { PracticeScriptPDFService } from "./PracticeScriptPDFService";

// Types
export type {
  PDFDocument,
  PDFBranding,
  PDFTemplate,
  PDFExportOptions,
  PracticeScriptPDFData,
  PlaybookPDFData,
  GamePlanPDFData,
} from "./types";
export { PDFError } from "./types";

// Styles and utilities
export {
  PDFBaseStyles,
  PDFColors,
  PDFFonts,
  getCategoryColor,
  formatTimeForPDF,
} from "./styles";

/**
 * Quick access functions for common PDF operations
 */

import { PDFServiceFactory } from "./BasePDFService";
import { PracticeScriptPDFService } from "./PracticeScriptPDFService";
import type {
  PracticeScriptPDFData,
  PDFExportOptions,
  PDFTemplate,
  PDFBranding,
} from "./types";

// Initialize services
PDFServiceFactory.registerService("practice-script", PracticeScriptPDFService);

/**
 * Quick export function for practice scripts
 */
export const exportPracticeScriptToPDF = async (
  data: PracticeScriptPDFData,
  options: PDFExportOptions = {}
): Promise<Blob> => {
  const service = PDFServiceFactory.createService(
    "practice-script"
  ) as PracticeScriptPDFService;
  return await service.exportToPDF(data, options);
};

/**
 * Quick download function for practice scripts
 */
export const downloadPracticeScriptPDF = async (
  data: PracticeScriptPDFData,
  filename?: string,
  options: PDFExportOptions = {}
): Promise<void> => {
  const service = PDFServiceFactory.createService(
    "practice-script"
  ) as PracticeScriptPDFService;
  return await service.downloadPDF(data, filename || "", options);
};

/**
 * Quick preview function for practice scripts
 */
export const previewPracticeScriptPDF = async (
  data: PracticeScriptPDFData,
  options: PDFExportOptions = {}
): Promise<string> => {
  const service = PDFServiceFactory.createService(
    "practice-script"
  ) as PracticeScriptPDFService;
  return await service.previewPDF(data, options);
};

/**
 * Get available PDF service types
 */
export const getAvailablePDFServices = (): string[] => {
  return PDFServiceFactory.getRegisteredTypes();
};

/**
 * Create a PDF service for a specific document type
 */
export const createPDFService = (
  documentType: string,
  template?: PDFTemplate,
  branding?: PDFBranding
) => {
  return PDFServiceFactory.createService(documentType, template, branding);
};
