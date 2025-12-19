/**
 * CSV Import Processor Service
 *
 * Orchestrates the CSV import process with intelligent parsing and validation
 */

import { UserPreferencesService } from "../userPreferencesService";

import { CSVColumnMapper } from "./CSVColumnMapper";
import { CSVDataValidator } from "./CSVDataValidator";
import { CSVParser } from "./CSVParser";
import { CSVPlayConverter } from "./CSVPlayConverter";

import type { CSVParseResult, CSVPlayPreview, CSVImportResult } from "./types";

export class CSVImportProcessor {
  private static emptyParseResult(): CSVParseResult {
    return {
      previews: [],
      summary: {
        totalRows: 0,
        validPlays: 0,
        invalidPlays: 0,
        warnings: 0,
        detectedColumns: [],
        suggestedMappings: {},
      },
    };
  }

  private static detectStartRow(lines: string[]): number {
    const firstDataRow = CSVParser.parseCSVLine(lines[1]);
    return CSVParser.isHeaderRow(firstDataRow) ? 2 : 1;
  }

  private static buildConfirmationMessage(params: {
    playsNeedingConfirmation: number;
    skippedRows: number;
  }): { needsConfirmation: boolean; confirmationMessage: string } {
    const { playsNeedingConfirmation, skippedRows } = params;

    let needsConfirmation = false;
    let confirmationMessage = "";

    if (
      playsNeedingConfirmation > 0 &&
      !UserPreferencesService.shouldSkipCSVMissingFieldsConfirmation()
    ) {
      needsConfirmation = true;
      confirmationMessage = `I see ${playsNeedingConfirmation} play${playsNeedingConfirmation > 1 ? "s are" : " is"} missing formation and/or play type. Are you sure you wish to continue?`;
    }

    if (skippedRows > 0) {
      const skippedMessage = `${skippedRows} row${skippedRows > 1 ? "s were" : " was"} skipped due to missing required fields (play_name).`;
      confirmationMessage = confirmationMessage
        ? `${confirmationMessage}\n\n${skippedMessage}`
        : skippedMessage;
    }

    return { needsConfirmation, confirmationMessage };
  }

  private static buildQualityWarning(params: {
    lowQualityPlays: number;
    totalPlays: number;
  }): string {
    const { lowQualityPlays, totalPlays } = params;
    const lowQualityThreshold = Math.ceil(totalPlays * 0.5);
    const showWarning =
      lowQualityPlays >= lowQualityThreshold &&
      totalPlays >= 3 &&
      !UserPreferencesService.shouldSkipCSVQualityWarnings();

    if (!showWarning) return "";
    return "To get the best experience of BoxCall, it is recommended to fill out as much information about your plays as possible. For examples please visit the templates page.";
  }

  private static buildPreviews(params: {
    lines: string[];
    startRow: number;
    rawHeaders: string[];
    columnMapping: Record<string, string>;
  }): {
    previews: CSVPlayPreview[];
    playsNeedingConfirmation: number;
    lowQualityPlays: number;
    skippedRows: number;
  } {
    const { lines, startRow, rawHeaders, columnMapping } = params;

    const previews: CSVPlayPreview[] = [];
    let playsNeedingConfirmation = 0;
    let lowQualityPlays = 0;
    let skippedRows = 0;

    for (let i = startRow; i < lines.length; i++) {
      const values = CSVParser.parseCSVLine(lines[i]);
      const rowData = CSVParser.mapRowToFields(
        values,
        rawHeaders,
        columnMapping
      );

      if (!CSVDataValidator.isValidRow(rowData)) {
        skippedRows++;
        continue;
      }

      const errors: string[] = [];
      const { warnings, correctedData } =
        CSVDataValidator.validateAndCorrect(rowData);

      if (CSVDataValidator.requiresConfirmation(correctedData)) {
        playsNeedingConfirmation++;
        const missingFields = [];
        if (!correctedData.formation || correctedData.formation.trim() === "") {
          missingFields.push("formation");
        }
        if (!correctedData.p_type || correctedData.p_type.trim() === "") {
          missingFields.push("play type");
        }
        warnings.push(`Missing ${missingFields.join(" and ")}`);
      }

      if (!CSVDataValidator.assessPlayQuality(correctedData)) {
        lowQualityPlays++;
      }

      previews.push({
        rowNumber: i + 1,
        isValid: true,
        errors,
        warnings,
        data: {
          formation: correctedData.formation || "",
          play_name: correctedData.play_name || "",
          p_type: correctedData.p_type || "",
          personnel: correctedData.personnel,
          one_word_play: correctedData.one_word_play,
          protection: correctedData.protection,
          notes: correctedData.notes,
          ...correctedData,
        },
      });
    }

    return { previews, playsNeedingConfirmation, lowQualityPlays, skippedRows };
  }

  /**
   * Enhanced CSV parsing with intelligence and validation
   */
  static parseCSVForPreview(csvContent: string): CSVParseResult {
    const lines = CSVParser.parseCSVContent(csvContent);

    if (lines.length < 2) {
      return this.emptyParseResult();
    }

    // Parse headers with intelligent mapping
    const rawHeaders = CSVParser.extractHeaders(lines);
    const columnMapping = CSVColumnMapper.detectColumnMapping(rawHeaders);

    // Determine starting row - skip first row if it's detected as a header
    const startRow = this.detectStartRow(lines);
    const { previews, playsNeedingConfirmation, lowQualityPlays, skippedRows } =
      this.buildPreviews({
        lines,
        startRow,
        rawHeaders,
        columnMapping,
      });

    const validPlays = previews.length; // All previews are valid (invalid rows were filtered)
    const totalWarnings = previews.reduce(
      (sum, p) => sum + p.warnings.length,
      0
    );

    const { needsConfirmation, confirmationMessage } =
      this.buildConfirmationMessage({
        playsNeedingConfirmation,
        skippedRows,
      });

    const qualityWarning = this.buildQualityWarning({
      lowQualityPlays,
      totalPlays: previews.length,
    });

    return {
      previews,
      summary: {
        totalRows: previews.length,
        validPlays,
        invalidPlays: 0, // No invalid plays in preview (they were filtered)
        warnings: totalWarnings,
        detectedColumns: rawHeaders,
        suggestedMappings: columnMapping,
        needsConfirmation,
        confirmationMessage,
        qualityWarning,
        skippedRows, // Add skipped rows count to summary
      },
    };
  }

  /**
   * Process CSV import with full validation and conversion
   */
  static processCSVImport(
    csvContent: string,
    playbookId: string,
    forceImport: boolean = false
  ): CSVImportResult {
    const parseResult = this.parseCSVForPreview(csvContent);
    return CSVPlayConverter.convertPreviewsToPlays(
      parseResult.previews,
      playbookId,
      forceImport
    );
  }
}
