/**
 * Base PDF Service
 *
 * Abstract base class for all PDF generation services.
 * Provides common functionality and consistent interface.
 */
import { PDFColors, PDFFonts } from "./styles";
import { PDFError } from "./types";

import type { PDFExportOptions, PDFTemplate, PDFBranding } from "./types";

export abstract class BasePDFService {
  protected template: PDFTemplate;
  protected branding?: PDFBranding;
  constructor(template?: PDFTemplate, branding?: PDFBranding) {
    this.template = template || this.getDefaultTemplate();
    this.branding = branding;
  }
  /**
   * Generate PDF blob from document
   */
  protected async generateBlob(document: React.ReactElement): Promise<Blob> {
    try {
      const { pdf } = await import("@react-pdf/renderer");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const instance = pdf(document as any);
      return await instance.toBlob();
    } catch (error) {
      throw new PDFError(
        "Failed to generate PDF blob",
        "GENERATION_ERROR",
        error instanceof Error ? error.message : "Unknown error"
      );
    }
  }
  /**
   * Download PDF file
   */
  protected downloadBlob(blob: Blob, filename: string): void {
    try {
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      throw new PDFError(
        "Failed to download PDF",
        "DOWNLOAD_ERROR",
        error instanceof Error ? error.message : "Unknown error"
      );
    }
  }
  /**
   * Generate filename with timestamp
   */
  protected generateFilename(
    prefix: string,
    extension: string = "pdf"
  ): string {
    const timestamp = new Date()
      .toISOString()
      .replace(/[:.]/g, "-")
      .replace("T", "_")
      .split(".")[0];
    return `${prefix}_${timestamp}.${extension}`;
  }
  /**
   * Validate export options and set defaults
   */
  protected validateOptions(options: PDFExportOptions): void {
    // Set default format if not provided
    if (!options.format) {
      options.format = "Letter";
    }
    if (!["A4", "Letter", "Legal"].includes(options.format)) {
      throw new PDFError(
        "Invalid page format",
        "VALIDATION_ERROR",
        `Format must be one of: A4, Letter, Legal. Got: ${options.format}`
      );
    }
    // Set default orientation if not provided
    if (!options.orientation) {
      options.orientation = "portrait";
    }
    if (!["portrait", "landscape"].includes(options.orientation)) {
      throw new PDFError(
        "Invalid page orientation",
        "VALIDATION_ERROR",
        `Orientation must be portrait or landscape. Got: ${options.orientation}`
      );
    }
    if (options.quality && (options.quality < 0.1 || options.quality > 1.0)) {
      throw new PDFError(
        "Invalid quality setting",
        "VALIDATION_ERROR",
        `Quality must be between 0.1 and 1.0. Got: ${options.quality}`
      );
    }
  }
  /**
   * Get default template settings
   */
  protected getDefaultTemplate(): PDFTemplate {
    return {
      pageFormat: "A4",
      pageOrientation: "portrait",
      margins: {
        top: 40,
        right: 40,
        bottom: 40,
        left: 40,
      },
      colors: {
        primary: PDFColors.primary,
        secondary: PDFColors.secondary,
        accent: PDFColors.accent,
        text: PDFColors.gray[800],
        background: PDFColors.white,
      },
      fonts: {
        primary: PDFFonts.primary,
        secondary: PDFFonts.secondary,
        monospace: PDFFonts.monospace,
      },
      header: {
        enabled: true,
        height: 60,
        includeDate: true,
        includePageNumbers: true,
      },
      footer: {
        enabled: true,
        height: 40,
        includePageNumbers: true,
        includeGeneratedTime: true,
      },
    };
  }
  /**
   * Get branding with fallbacks
   */
  protected getBranding(): PDFBranding {
    return (
      this.branding || {
        teamName: "",
        colors: {
          primary: PDFColors.primary,
          secondary: PDFColors.secondary,
        },
        fonts: {
          primary: PDFFonts.primary,
          secondary: PDFFonts.secondary,
        },
      }
    );
  }
  /**
   * Format date for PDF display
   */
  protected formatDate(date: Date, includeTime: boolean = false): string {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    if (includeTime) {
      options.hour = "2-digit";
      options.minute = "2-digit";
    }
    return date.toLocaleDateString("en-US", options);
  }
  /**
   * Format time duration in minutes to readable string
   */
  protected formatDuration(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) {
      return `${mins} min`;
    } else if (mins === 0) {
      return `${hours} hr`;
    } else {
      return `${hours}:${mins.toString().padStart(2, "0")}`;
    }
  }
  /**
   * Abstract methods that must be implemented by subclasses
   */
  abstract exportToPDF(data: unknown, options: PDFExportOptions): Promise<Blob>;
  abstract downloadPDF(
    data: unknown,
    filename: string,
    options: PDFExportOptions
  ): Promise<void>;
  abstract previewPDF(
    data: unknown,
    options: PDFExportOptions
  ): Promise<string>;
}
/**
 * PDF Service Factory
 *
 * Creates appropriate PDF service based on document type
 */
export class PDFServiceFactory {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private static services: Map<string, new (...args: any[]) => BasePDFService> =
    new Map();
  /**
   * Register a PDF service for a specific document type
   */
  static registerService(
    documentType: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    serviceClass: new (...args: any[]) => BasePDFService
  ): void {
    this.services.set(documentType, serviceClass);
  }
  /**
   * Create PDF service instance for document type
   */
  static createService(
    documentType: string,
    template?: PDFTemplate,
    branding?: PDFBranding
  ): BasePDFService {
    const ServiceClass = this.services.get(documentType);
    if (!ServiceClass) {
      throw new PDFError(
        `No PDF service registered for document type: ${documentType}`,
        "SERVICE_NOT_FOUND",
        `Available types: ${Array.from(this.services.keys()).join(", ")}`
      );
    }
    return new ServiceClass(template, branding);
  }
  /**
   * Get all registered document types
   */
  static getRegisteredTypes(): string[] {
    return Array.from(this.services.keys());
  }
}
/**
 * PDF Utility Functions
 */
export class PDFUtils {
  /**
   * Convert blob to base64 data URL
   */
  static async blobToDataURL(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }
  /**
   * Calculate optimal page margins based on content
   */
  static calculateMargins(
    contentWidth: number,
    contentHeight: number,
    pageFormat: string
  ): { top: number; right: number; bottom: number; left: number } {
    // Standard page dimensions in points (72 DPI)
    const pageDimensions = {
      A4: { width: 595, height: 842 },
      Letter: { width: 612, height: 792 },
      Legal: { width: 612, height: 1008 },
    };
    const page =
      pageDimensions[pageFormat as keyof typeof pageDimensions] ||
      pageDimensions.A4;
    // Calculate margins to center content with minimum padding
    const minMargin = 40;
    const horizontalMargin = Math.max(
      minMargin,
      (page.width - contentWidth) / 2
    );
    const verticalMargin = Math.max(
      minMargin,
      (page.height - contentHeight) / 2
    );
    return {
      top: verticalMargin,
      right: horizontalMargin,
      bottom: verticalMargin,
      left: horizontalMargin,
    };
  }
  /**
   * Estimate page count based on content length
   */
  static estimatePageCount(
    contentBlocks: number,
    averageBlockHeight: number,
    pageHeight: number,
    margins: { top: number; bottom: number }
  ): number {
    const usableHeight = pageHeight - margins.top - margins.bottom;
    const totalContentHeight = contentBlocks * averageBlockHeight;
    return Math.ceil(totalContentHeight / usableHeight);
  }
  /**
   * Generate PDF metadata
   */
  static generateMetadata(
    title: string,
    author?: string
  ): {
    title: string;
    author: string;
    subject: string;
    creator: string;
    producer: string;
    creationDate: Date;
  } {
    return {
      title,
      author: author || "Practice Planner",
      subject: "Generated Practice Document",
      creator: "Practice Planner App",
      producer: "React-PDF",
      creationDate: new Date(),
    };
  }
}
