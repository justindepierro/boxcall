/**
 * BoxCall Select Component Types
 *
 * TypeScript definitions for the Select component
 */

import type { ReactNode } from "react";

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
  group?: string;
  icon?: ReactNode;
  description?: string;
}

export interface SelectProps {
  // Core functionality
  options: SelectOption[];
  value?: string | number | (string | number)[];
  defaultValue?: string | number | (string | number)[];
  onChange?: (value: string | number | (string | number)[]) => void;
  onSearch?: (searchTerm: string) => void;

  // Component configuration
  placeholder?: string;
  multiple?: boolean;
  searchable?: boolean;
  clearable?: boolean;
  disabled?: boolean;
  loading?: boolean;

  // Validation and status
  status?: "default" | "error" | "success" | "warning";
  required?: boolean;

  // Layout and styling
  size?: "sm" | "md" | "lg";
  variant?: "default" | "filled" | "outlined";
  fullWidth?: boolean;

  // Labels and messages
  label?: string;
  helperText?: string;
  errorMessage?: string;
  successMessage?: string;
  warningMessage?: string;

  // Dropdown behavior
  maxHeight?: number;
  position?: "auto" | "top" | "bottom";

  // Advanced features
  createOption?: boolean;
  onCreateOption?: (inputValue: string) => void;
  noOptionsMessage?: string;
  maxMenuHeight?: number;
  menuPortalTarget?: HTMLElement;

  // Accessibility
  id?: string;
  name?: string;
  "aria-label"?: string;
  "aria-describedby"?: string;

  // Custom styling
  className?: string;
  containerClassName?: string;
  labelClassName?: string;
  menuClassName?: string;
  optionClassName?: string;
}

export interface SelectStylesConfig {
  container: {
    base: string;
    sizes: {
      sm: string;
      md: string;
      lg: string;
    };
    fullWidth: string;
  };

  trigger: {
    base: string;
    variants: {
      default: string;
      filled: string;
      outlined: string;
    };
    sizes: {
      sm: string;
      md: string;
      lg: string;
    };
    statuses: {
      default: string;
      error: string;
      success: string;
      warning: string;
    };
    states: {
      disabled: string;
      loading: string;
      open: string;
    };
  };

  menu: {
    base: string;
    positions: {
      top: string;
      bottom: string;
    };
    maxHeight: string;
  };

  option: {
    base: string;
    states: {
      default: string;
      highlighted: string;
      selected: string;
      disabled: string;
    };
    withIcon: string;
  };

  input: {
    base: string;
    sizes: {
      sm: string;
      md: string;
      lg: string;
    };
  };

  placeholder: string;
  noOptions: string;
  loading: string;
}
