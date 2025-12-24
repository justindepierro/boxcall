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
  f_dir?: string;
  formation_direction?: string;
  ftag1?: string;
  ftag2?: string;
  back_align?: string;
  shift?: string;
  motion?: string;
  p_tag1?: string;
  p_tag2?: string;
  p_dir?: string;
  pref_down?: string;
  pref_dis?: string;
  pref_hash?: string;
  pref_cov?: string;
  pref_front?: string;
  pref_field_pos?: string;
  pref_situation?: string;
  protection?: string;
  check_into?: string;
  key_player1?: string;
  key_player2?: string;
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
  /** Convenience mapping for row-level actions (create/update) */
  playsByRowNumber?: Record<number, Play>;
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
    [key: string]: string | number | boolean | undefined;
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
    skippedRows?: number;
  };
  /** Optional: Existing plays for validation suggestions */
  existingPlays?: Array<{
    id?: string;
    formation?: string | null;
    play_name?: string | null;
    p_type?: string | null;
    personnel?: string | null;
  }>;
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
