/**
 * InlineEditField validation helpers
 */
import type { ValidatedInputType } from "../../playbook/ValidatedInput";
import {
  validateFormation,
  validatePlayName,
  validatePersonnel,
  validateFormationType,
  validateBackfieldAlignment,
  validateShift,
  validateMotion,
  validateRunStrength,
  validatePassStrength,
  validateProtection,
  validateOneWordPlay,
  validateWristbandNumber,
  type ValidationResult as DataValidationResult,
} from "../../../utils/dataValidation";

/** Validation result type for InlineEditField */
export interface ValidationResult {
  isValid: boolean;
  suggestions?: string[];
  error?: string;
  normalizedValue?: string;
}

/** Default validation result for unknown types */
const DEFAULT_RESULT: ValidationResult = { isValid: true, suggestions: [] };

/** Convert dataValidation result to InlineEditField result */
function convertValidationResult(
  result: DataValidationResult
): ValidationResult {
  // Valid states: idle (empty/waiting), typing (in progress), warning (with suggestions)
  // Error states: error (invalid)
  const isValid = result.state !== "error";
  return {
    isValid,
    suggestions: result.suggestions?.map((s) => s.value) || [],
    error: result.state === "error" ? result.message : undefined,
    normalizedValue: result.normalizedValue,
  };
}

/** Map of validation type to validator function */
const VALIDATORS: Record<
  ValidatedInputType,
  (value: string, existingValues: string[]) => DataValidationResult
> = {
  formation: validateFormation,
  playName: validatePlayName,
  personnel: validatePersonnel,
  formationType: validateFormationType,
  backfieldAlignment: validateBackfieldAlignment,
  shift: validateShift,
  motion: validateMotion,
  runStrength: validateRunStrength,
  passStrength: validatePassStrength,
  protection: validateProtection,
  oneWordPlay: validateOneWordPlay,
  wristbandNumber: validateWristbandNumber,
};

/**
 * Get validation result for a given type, value, and existing values
 */
export function getValidationResult(
  validationType: ValidatedInputType | undefined,
  value: string,
  existingValues: string[] | undefined
): ValidationResult {
  if (!validationType || !existingValues) {
    return DEFAULT_RESULT;
  }

  const validator = VALIDATORS[validationType];
  if (!validator) {
    return DEFAULT_RESULT;
  }

  return convertValidationResult(validator(value, existingValues));
}

/**
 * Levenshtein distance for fuzzy matching
 */
export function levenshteinDistance(a: string, b: string): number {
  const matrix = Array(b.length + 1)
    .fill(null)
    .map(() => Array(a.length + 1).fill(null));

  for (let i = 0; i <= a.length; i++) matrix[0][i] = i;
  for (let j = 0; j <= b.length; j++) matrix[j][0] = j;

  for (let j = 1; j <= b.length; j++) {
    for (let i = 1; i <= a.length; i++) {
      const indicator = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1,
        matrix[j - 1][i] + 1,
        matrix[j - 1][i - 1] + indicator
      );
    }
  }

  return matrix[b.length][a.length];
}

/**
 * Filter suggestions based on input using exact, fuzzy, and Levenshtein matching
 */
export function filterSuggestions(
  input: string,
  suggestions: string[]
): string[] {
  if (!suggestions.length) return [];

  const normalizedInput = input.toLowerCase().trim();
  if (!normalizedInput) return suggestions.slice(0, 5);

  // Exact matches first
  const exactMatches = suggestions.filter(
    (s) => s.toLowerCase() === normalizedInput
  );

  // Fuzzy matches (contains input)
  const fuzzyMatches = suggestions.filter(
    (s) =>
      s.toLowerCase().includes(normalizedInput) && !exactMatches.includes(s)
  );

  // Levenshtein distance for typos
  const levenshteinMatches = suggestions.filter((s) => {
    if (exactMatches.includes(s) || fuzzyMatches.includes(s)) return false;
    const distance = levenshteinDistance(normalizedInput, s.toLowerCase());
    return distance <= Math.max(2, Math.floor(normalizedInput.length * 0.3));
  });

  return [...exactMatches, ...fuzzyMatches, ...levenshteinMatches].slice(0, 5);
}

/**
 * Get CSS class for input border based on save status
 */
export function getInputBorderClass(
  saveStatus: "idle" | "saving" | "success" | "error"
): string {
  switch (saveStatus) {
    case "error":
      return "border-error-300 focus:border-error-500 focus:ring-error-500/20";
    case "success":
      return "border-success-300 focus:border-success-500 focus:ring-success-500/20";
    default:
      return "border focus:border-electric-500 focus:ring-electric-500/20";
  }
}
