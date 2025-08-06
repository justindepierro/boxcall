/**
 * BoxCall Input Component Types
 *
 * TypeScript definitions for the Input component system
 */
import type { InputHTMLAttributes, ReactNode } from "react";
export type InputVariant =
  | "text" // Standard text input
  | "email" // Email input with validation
  | "password" // Password input with toggle
  | "number" // Numeric input
  | "tel" // Telephone input
  | "url" // URL input
  | "search"; // Search input with clear button
export type InputSize =
  | "sm" // Small input
  | "md" // Medium input (default)
  | "lg"; // Large input
export type InputStatus =
  | "default" // Normal state
  | "error" // Error state
  | "success" // Success state
  | "warning"; // Warning state
export interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  /** Input variant for different input types */
  variant?: InputVariant;
  /** Input size */
  size?: InputSize;
  /** Input status for validation states */
  status?: InputStatus;
  /** Input label */
  label?: string;
  /** Helper text below input */
  helperText?: string;
  /** Error message (overrides helperText when status is error) */
  errorMessage?: string;
  /** Success message (overrides helperText when status is success) */
  successMessage?: string;
  /** Warning message (overrides helperText when status is warning) */
  warningMessage?: string;
  /** Icon to display on the left side */
  leftIcon?: ReactNode;
  /** Icon to display on the right side */
  rightIcon?: ReactNode;
  /** Additional CSS classes for the input container */
  containerClassName?: string;
  /** Additional CSS classes for the label */
  labelClassName?: string;
  /** Whether the input is required */
  required?: boolean;
  /** Whether to show password toggle for password inputs */
  showPasswordToggle?: boolean;
  /** Loading state */
  loading?: boolean;
  /** Full width input */
  fullWidth?: boolean;
}
export interface InputStylesConfig {
  base: string;
  sizes: Record<InputSize, string>;
  variants: Record<InputVariant, string>;
  statuses: Record<InputStatus, string>;
  focus: string;
  disabled: string;
}
export interface InputSizeConfig {
  container: string;
  input: string;
  label: string;
  helper: string;
  icon: string;
}
