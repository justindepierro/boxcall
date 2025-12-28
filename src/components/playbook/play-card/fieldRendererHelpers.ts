/**
 * FieldRenderer Constants
 * 
 * Extracted from FieldRenderer.tsx for Fast Refresh compatibility.
 * Components should only export React components, not mixed exports.
 */

import type { FieldRenderOptions } from "./FieldRenderer";
import {
  FORMATION_OPTIONS,
  PLAY_TYPE_OPTIONS,
} from "./constants";
import {
  validateFormationName,
  validatePersonnelValue,
} from "../../../utils/playFieldValidation";

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

export const getValidationFn = (
  validationKey: "formation" | "personnel" | "playName" | "confidence"
): ((value: string) => string | null) | undefined => {
  switch (validationKey) {
    case "formation": {
      return (value: string) => {
        const result = validateFormationName(value);
        return result.isValid ? null : result.error || "Invalid formation";
      };
    }
    case "personnel": {
      return (value: string) => {
        const result = validatePersonnelValue(value);
        return result.isValid ? null : result.error || "Invalid personnel";
      };
    }
    case "playName": {
      return (value: string) => {
        if (!value.trim()) return "Play name is required";
        return null;
      };
    }
    case "confidence": {
      return (value: string) => {
        if (!value.trim()) return null;
        const num = parseInt(value, 10);
        if (isNaN(num) || num < 0 || num > 100) {
          return "Must be 0-100";
        }
        return null;
      };
    }
    default:
      return undefined;
  }
};

export const getSuggestions = (
  suggestionsKey:
    | "formation"
    | "personnel"
    | "playName"
    | "playType"
    | undefined,
  options: FieldRenderOptions
): string[] => {
  switch (suggestionsKey) {
    case "formation":
      return [
        ...FORMATION_OPTIONS.map((opt) => opt.label),
        ...options.formationSuggestions,
      ];
    case "personnel":
      return options.personnelSuggestions;
    case "playName":
      return options.playNameSuggestions;
    case "playType":
      return [
        ...PLAY_TYPE_OPTIONS.map((opt) => opt.label),
        ...options.playTypeSuggestions,
      ];
    default:
      return [];
  }
};

export const getExistingValues = (
  key: string | undefined,
  options: FieldRenderOptions
): string[] => {
  if (!key) return [];
  return (options[key as keyof FieldRenderOptions] as string[]) || [];
};
