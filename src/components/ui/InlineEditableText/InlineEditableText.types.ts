/**
 * InlineEditableText Component Types
 *
 * TypeScript definitions for the InlineEditableText component
 */
import type { ReactNode } from "react";

export type ValidationRule = {
  /** Validation function that returns true if valid */
  validate: (value: string) => boolean;
  /** Error message to display when validation fails */
  message: string;
  /** Warning level - 'error' prevents saving, 'warning' allows saving but shows warning */
  level: "error" | "warning";
};

export type InlineEditableTextProps = {
  /** The current value of the text */
  value: string;
  /** Callback when value changes */
  onChange: (value: string) => void;
  /** Callback when editing starts */
  onEditStart?: () => void;
  /** Callback when editing ends (with final value) */
  onEditEnd?: (value: string) => void;
  /** Placeholder text when value is empty */
  placeholder?: string;
  /** Maximum length allowed */
  maxLength?: number;
  /** Minimum length required */
  minLength?: number;
  /** Whether symbols are allowed in the text */
  allowSymbols?: boolean;
  /** Custom validation rules */
  validationRules?: ValidationRule[];
  /** Whether to show length warnings */
  showLengthWarnings?: boolean;
  /** Maximum recommended length before warning (defaults to 2 for diagram compatibility) */
  maxRecommendedLength?: number;
  /** Additional CSS classes */
  className?: string;
  /** Whether the field is disabled */
  disabled?: boolean;
  /** Whether to show validation feedback */
  showValidation?: boolean;
  /** Custom validation function */
  customValidator?: (value: string) => {
    isValid: boolean;
    message?: string;
    level?: "error" | "warning";
  };
  /** Icon to show when not editing */
  icon?: ReactNode;
  /** Size variant */
  size?: "sm" | "md" | "lg";
  /** Whether to auto-focus when editing starts */
  autoFocus?: boolean;
  /** Whether to select all text when editing starts */
  selectAllOnFocus?: boolean;
};
