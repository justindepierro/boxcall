/**
 * CSV Service Type Definitions
 *
 * Centralized type definitions for CSV import/export functionality
 */

import type { Play } from "../../types/play";

export interface CSVPlayData {
  formation: string;
  play_name: string;
  one_word_play?: string;
  p_type: string;
  personnel?: string;
  f_type?: string;
  pref_down?: string;
  pref_dis?: string;
  protection?: string;
  r_str?: string;
  p_str?: string;
  notes?: string;
}

export interface CSVImportResult {
  success: boolean;
  totalRows: number;
  importedPlays: number;
  errors: string[];
  warnings: string[];
  plays: Play[];
  parsedPlays: CSVPlayPreview[];
  needsConfirmation?: boolean;
  confirmationMessage?: string;
  qualityWarning?: string;
}

export interface CSVPlayPreview {
  rowNumber: number;
  isValid: boolean;
  errors: string[];
  warnings: string[];
  data: {
    formation: string;
    play_name: string;
    p_type: string;
    personnel?: string;
    one_word_play?: string;
    protection?: string;
    notes?: string;
    [key: string]: string | undefined;
  };
}

export interface CSVParseResult {
  previews: CSVPlayPreview[];
  summary: {
    totalRows: number;
    validPlays: number;
    invalidPlays: number;
    warnings: number;
    detectedColumns: string[];
    suggestedMappings: Record<string, string>;
    needsConfirmation?: boolean;
    confirmationMessage?: string;
    qualityWarning?: string;
  };
}

export interface CSVExportOptions {
  includeComplexity?: boolean;
  includePrivateNotes?: boolean;
  formatForCoach?: boolean;
}

export interface ColumnMappings {
  [fieldName: string]: string[];
}

export interface ValidationResult {
  warnings: string[];
  correctedData: Record<string, string>;
}

export interface PlayTypeMapping {
  canonical: string;
  variants: string[];
}

export interface FormationCorrection {
  [key: string]: string;
}

export interface CommonPlayCorrection {
  [key: string]: string;
}
