/**
 * BoxCall TextArea Component Types
 */
import type { TextareaHTMLAttributes } from "react";
export type TextAreaSize =
  | "sm" // Small textarea
  | "md" // Medium textarea (default)
  | "lg"; // Large textarea
export type TextAreaStatus =
  | "default" // Normal state
  | "error" // Error state
  | "success" // Success state
  | "warning"; // Warning state
export interface TextAreaProps
  extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "size"> {
  /** TextArea size */
  size?: TextAreaSize;
  /** TextArea status for validation states */
  status?: TextAreaStatus;
  /** TextArea label */
  label?: string;
  /** Helper text below textarea */
  helperText?: string;
  /** Error message */
  errorMessage?: string;
  /** Success message */
  successMessage?: string;
  /** Warning message */
  warningMessage?: string;
  /** Additional CSS classes for the container */
  containerClassName?: string;
  /** Additional CSS classes for the label */
  labelClassName?: string;
  /** Whether the textarea is required */
  required?: boolean;
  /** Auto-resize based on content */
  autoResize?: boolean;
  /** Maximum number of characters */
  maxLength?: number;
  /** Show character count */
  showCharacterCount?: boolean;
  /** Full width textarea */
  fullWidth?: boolean;
}
