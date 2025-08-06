/**
 * CSV Service - Main Orchestrator
 * 
 * Handles import/export of plays and practice scripts with modular architecture
 */

import { CSVImportProcessor } from './csv/CSVImportProcessor';
import { CSVExporter } from './csv/CSVExporter';
import { CSVPlayConverter } from './csv/CSVPlayConverter';
import type { 
  CSVParseResult, 
  CSVImportResult, 
  CSVExportOptions 
} from './csv/types';
import type { Play } from "../types/play";

// Local interface to avoid circular dependency
interface PracticeScript {
  plays: Array<{
    order: number;
    play: Play;
    repetitions: number;
    estimatedTime: number;
    notes?: string;
  }>;
}

export class CSVService {
  /**
   * Enhanced CSV parsing with intelligence and validation
   */
  static parseCSVForPreview(csvContent: string): CSVParseResult {
    return CSVImportProcessor.parseCSVForPreview(csvContent);
  }

  /**
   * Convert validated preview data to Play objects
   */
  static convertPreviewsToPlays(
    previews: CSVParseResult['previews'],
    playbookId: string,
    forceImport: boolean = false
  ): CSVImportResult {
    return CSVPlayConverter.convertPreviewsToPlays(previews, playbookId, forceImport);
  }

  /**
   * Export plays to CSV format
   */
  static exportPlaysToCSV(
    plays: Play[],
    options: CSVExportOptions = {}
  ): string {
    return CSVExporter.exportPlaysToCSV(plays, options);
  }

  /**
   * Export practice script to CSV format
   */
  static exportPracticeScriptToCSV(script: PracticeScript): string {
    return CSVExporter.exportPracticeScriptToCSV(script);
  }

  /**
   * Download CSV file
   */
  static downloadCSV(content: string, filename: string): void {
    return CSVExporter.downloadCSV(content, filename);
  }

  /**
   * Generate sample CSV template
   */
  static generateSampleCSV(): string {
    return CSVExporter.generateSampleCSV();
  }
}

// Export types for external use
export type {
  CSVPlayData,
  CSVImportResult,
  CSVPlayPreview,
  CSVParseResult,
  CSVExportOptions
} from './csv/types';
