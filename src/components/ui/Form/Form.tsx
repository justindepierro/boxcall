import { Typography } from "../../design-system";

import type { FormEvent, ReactNode } from "react";

export interface FormProps {
  /** Form children - FormField components */
  children: ReactNode;
  /** Form submission handler */
  onSubmit?: (event: FormEvent<HTMLFormElement>) => void;
  /** Form title */
  title?: string;
  /** Form description */
  description?: string;
  /** Form variant for different use cases */
  variant?: "default" | "card" | "inline" | "modal";
  /** Form size */
  size?: "sm" | "md" | "lg";
  /** Whether form is disabled */
  disabled?: boolean;
  /** Whether form has loading state */
  loading?: boolean;
  /** Form footer content (buttons, actions) */
  footer?: ReactNode;
  /** Additional CSS classes */
  className?: string;
  /** Form validation mode */
  mode?: "onChange" | "onBlur" | "onSubmit";
  /** Whether to show required field indicators */
  showRequiredIndicator?: boolean;
}
export interface FormFieldProps {
  /** Field children - Input, TextArea, Select components */
  children: ReactNode;
  /** Field label */
  label?: string;
  /** Field description/help text */
  description?: string;
  /** Whether field is required */
  required?: boolean;
  /** Field error message */
  error?: string;
  /** Field success message */
  success?: string;
  /** Field warning message */
  warning?: string;
  /** Additional CSS classes */
  className?: string;
  /** Field layout orientation */
  orientation?: "vertical" | "horizontal";
}
export interface FormGroupProps {
  /** Group children - FormField components */
  children: ReactNode;
  /** Group title */
  title?: string;
  /** Group description */
  description?: string;
  /** Group layout */
  layout?: "vertical" | "horizontal" | "grid";
  /** Number of columns for grid layout */
  columns?: 1 | 2 | 3 | 4;
  /** Additional CSS classes */
  className?: string;
}
export interface FormActionsProps {
  /** Action children - Button components */
  children: ReactNode;
  /** Actions alignment */
  align?: "left" | "center" | "right" | "between";
  /** Actions spacing */
  spacing?: "sm" | "md" | "lg";
  /** Additional CSS classes */
  className?: string;
}
/**
 * Form - Professional form container with validation support
 */
export function Form({
  children,
  onSubmit,
  title,
  description,
  variant = "default",
  size = "md",
  disabled = false,
  loading = false,
  footer,
  className = "",
  showRequiredIndicator = true,
  ...props
}: FormProps) {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!disabled && !loading && onSubmit) {
      onSubmit(event);
    }
  };
  const sizeClasses = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
  };
  const variantClasses = {
    default: "space-y-6",
    card: "surface-card elevation-card rounded-lg border-subtle bc-card-padding space-y-6",
    inline: "space-y-4",
    modal: "space-y-4",
  };
  return (
    <form
      onSubmit={handleSubmit}
      className={`
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${disabled || loading ? "opacity-50 pointer-events-none" : ""}
        ${className}
      `}
      {...props}
    >
      {/* Form Header */}
      {(title || description) && (
        <div className="space-y-2">
          {title && (
            <Typography
              variant="headline-md"
              as="h2"
              className="text-text-primary"
            >
              {title}
              {showRequiredIndicator && (
                <Typography variant="caption" color="muted" className="ml-2">
                  * Required fields
                </Typography>
              )}
            </Typography>
          )}
          {description && (
            <Typography variant="body-sm" color="muted">
              {description}
            </Typography>
          )}
        </div>
      )}
      {/* Form Content */}
      <div className={loading ? "relative" : ""}>
        {loading && (
          <div className="absolute inset-0 surface-card/50 dark:bg-surface-primary/50 backdrop-blur-sm rounded-lg z-10 flex items-center justify-center">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-jade-600"></div>
              <Typography variant="body-sm" color="muted">
                Processing...
              </Typography>
            </div>
          </div>
        )}
        {children}
      </div>
      {/* Form Footer */}
      {footer && (
        <div className="pt-4 border-t border-subtle dark:border-text-tertiary">
          {footer}
        </div>
      )}
    </form>
  );
}
/**
 * FormField - Individual form field wrapper with label and validation
 */
export function FormField({
  children,
  label,
  description,
  required = false,
  error,
  success,
  warning,
  className = "",
  orientation = "vertical",
}: FormFieldProps) {
  return (
    <div
      className={`
        ${orientation === "horizontal" ? "flex items-start space-x-4" : "space-y-2"}
        ${className}
      `}
    >
      {/* Label */}
      {label && (
        <div className={orientation === "horizontal" ? "min-w-0 flex-1" : ""}>
          <Typography
            variant="label-md"
            as="label"
            className={`
              block text-text-primary dark:text-border-light
              ${required ? "after:content-['*'] after:ml-1 after:text-text-error" : ""}
            `}
          >
            {label}
          </Typography>
          {description && (
            <Typography variant="caption" color="muted" className="mt-1">
              {description}
            </Typography>
          )}
        </div>
      )}
      {/* Field Input */}
      <div className={orientation === "horizontal" ? "min-w-0 flex-1" : ""}>
        {children}
        {/* Validation Messages */}
        {(error || success || warning) && (
          <div className="mt-1">
            {error && (
              <Typography
                variant="caption"
                className="text-text-error dark:text-text-error"
              >
                {error}
              </Typography>
            )}
            {success && (
              <Typography
                variant="caption"
                className="text-text-success dark:text-text-success"
              >
                {success}
              </Typography>
            )}
            {warning && (
              <Typography
                variant="caption"
                className="text-text-warning dark:text-text-warning"
              >
                {warning}
              </Typography>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
/**
 * FormGroup - Group related form fields together
 */
export function FormGroup({
  children,
  title,
  description,
  layout = "vertical",
  columns = 2,
  className = "",
}: FormGroupProps) {
  const layoutClasses = {
    vertical: "space-y-4",
    horizontal: "space-y-4",
    grid: `grid grid-cols-1 md:grid-cols-${columns} gap-4`,
  };
  return (
    <div className={`space-y-4 ${className}`}>
      {/* Group Header */}
      {(title || description) && (
        <div className="space-y-1">
          {title && (
            <Typography variant="headline-sm" className="text-text-primary">
              {title}
            </Typography>
          )}
          {description && (
            <Typography variant="body-sm" color="muted">
              {description}
            </Typography>
          )}
        </div>
      )}
      {/* Group Fields */}
      <div className={layoutClasses[layout]}>{children}</div>
    </div>
  );
}
/**
 * FormActions - Form action buttons container
 */
export function FormActions({
  children,
  align = "right",
  spacing = "md",
  className = "",
}: FormActionsProps) {
  const alignClasses = {
    left: "justify-start",
    center: "justify-center",
    right: "justify-end",
    between: "justify-between",
  };
  const spacingClasses = {
    sm: "space-x-2",
    md: "space-x-3",
    lg: "space-x-4",
  };
  return (
    <div
      className={`
        flex items-center
        ${alignClasses[align]}
        ${spacingClasses[spacing]}
        ${className}
      `}
    >
      {children}
    </div>
  );
}
