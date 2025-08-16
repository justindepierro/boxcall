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
  /**
   * Enhanced CSV parsing with intelligence and validation
   */
  static parseCSVForPreview(csvContent: string): CSVParseResult {
    const lines = CSVParser.parseCSVContent(csvContent);

    if (lines.length < 2) {
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

    // Parse headers with intelligent mapping
    const rawHeaders = CSVParser.extractHeaders(lines);
    const columnMapping = CSVColumnMapper.detectColumnMapping(rawHeaders);

    const previews: CSVPlayPreview[] = [];
    let playsNeedingConfirmation = 0;
    let lowQualityPlays = 0;

    // Process each data row
    for (let i = 1; i < lines.length; i++) {
      const values = CSVParser.parseCSVLine(lines[i]);
      const rowData = CSVParser.mapRowToFields(
        values,
        rawHeaders,
        columnMapping
      );

      const errors: string[] = [];

      // Check for required fields (only play_name causes error)
      if (!CSVDataValidator.isValidRow(rowData)) {
        errors.push("Missing required field: play_name");
      }

      // Validate and correct data
      const { warnings, correctedData } =
        CSVDataValidator.validateAndCorrect(rowData);

      // Check for confirmation-requiring scenarios
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

      // Count low quality plays
      if (!CSVDataValidator.assessPlayQuality(correctedData)) {
        lowQualityPlays++;
      }

      previews.push({
        rowNumber: i + 1,
        isValid: errors.length === 0, // Only fails if missing play_name
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

    const validPlays = previews.filter((p) => p.isValid).length;
    const totalWarnings = previews.reduce(
      (sum, p) => sum + p.warnings.length,
      0
    );

    // Generate confirmation message if needed
    let needsConfirmation = false;
    let confirmationMessage = "";

    if (
      playsNeedingConfirmation > 0 &&
      !UserPreferencesService.shouldSkipCSVMissingFieldsConfirmation()
    ) {
      needsConfirmation = true;
      confirmationMessage = `I see ${playsNeedingConfirmation} play${playsNeedingConfirmation > 1 ? "s are" : " is"} missing formation and/or play type. Are you sure you wish to continue?`;
    }

    // Generate quality warning if needed
    let qualityWarning = "";
    const lowQualityThreshold = Math.ceil(previews.length * 0.5); // 50% of plays

    if (
      lowQualityPlays >= lowQualityThreshold &&
      previews.length >= 3 &&
      !UserPreferencesService.shouldSkipCSVQualityWarnings()
    ) {
      qualityWarning =
        "To get the best experience of BoxCall, it is recommended to fill out as much information about your plays as possible. For examples please visit the templates page.";
    }

    return {
      previews,
      summary: {
        totalRows: previews.length,
        validPlays,
        invalidPlays: previews.length - validPlays,
        warnings: totalWarnings,
        detectedColumns: rawHeaders,
        suggestedMappings: columnMapping,
        needsConfirmation,
        confirmationMessage,
        qualityWarning,
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
