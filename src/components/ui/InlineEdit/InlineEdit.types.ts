import type { InputHTMLAttributes, ReactNode } from "react";
import type { InputSize } from "../Input/Input.types";

export type ValidationState = "default" | "valid" | "invalid";

export interface InlineEditProps {
  /** The current value to display and edit */
  value: string;
  /** Callback when the value changes */
  onChange: (value: string) => void;
  /** Placeholder text when the value is empty */
  placeholder?: string;
  /** Whether the field is currently editable */
  disabled?: boolean;
  /** Size variant for the input */
  size?: InputSize;
  /** Custom className for the container */
  className?: string;
  /** Custom className for the display text */
  displayClassName?: string;
  /** Custom className for the input */
  inputClassName?: string;
  /** Whether to show confirm/cancel buttons when editing */
  showButtons?: boolean;
  /** Custom confirm button content */
  confirmButton?: ReactNode;
  /** Custom cancel button content */
  cancelButton?: ReactNode;
  /** Callback when editing starts */
  onEditStart?: () => void;
  /** Callback when editing ends (either saved or cancelled) */
  onEditEnd?: () => void;
  /** Whether to start editing on single click (default: true) */
  startOnClick?: boolean;
  /** Whether to save on blur (default: false) */
  saveOnBlur?: boolean;
  /** Input props to pass through to the input element */
  inputProps?: Omit<
    InputHTMLAttributes<HTMLInputElement>,
    "value" | "onChange" | "onBlur" | "onKeyDown"
  >;
  /** Validation function to check if the current value is valid */
  validate?: (value: string) => boolean;
  /** Whether to show mobile background highlighting */
  showMobileHighlight?: boolean;
  /** Callback when validation state changes */
  onValidationChange?: (isValid: boolean) => void;
}
