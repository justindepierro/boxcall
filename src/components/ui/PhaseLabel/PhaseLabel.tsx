import React from "react";

export interface PhaseLabelProps {
  label: string;
  variant?: "default" | "warning" | "success" | "info" | "danger";
  size?: "xs" | "sm" | "md";
  className?: string;
}

/**
 * PhaseLabel - A badge for displaying personnel installation phases
 *
 * Features:
 * - Color-coded variants (warning = install phase, success = mastered, etc.)
 * - Uppercase text with tracking
 * - Rounded pill shape
 * - Multiple sizes
 * - Border for definition
 *
 * @example
 * ```tsx
 * <PhaseLabel label="Phase 1" variant="warning" size="sm" />
 * <PhaseLabel label="Mastered" variant="success" />
 * ```
 */
export const PhaseLabel: React.FC<PhaseLabelProps> = ({
  label,
  variant = "default",
  size = "sm",
  className = "",
}) => {
  const variantClasses = {
    default: "bg-surface-muted text-text-primary border-border-subtle",
    warning: "bg-warning-500 text-primary border-warning-600",
    success: "bg-success-500 text-white border-success-600",
    info: "bg-info-500 text-white border-info-600",
    danger: "bg-danger-500 text-white border-danger-600",
  };

  const sizeClasses = {
    xs: "px-1.5 py-0.5 text-3xs",
    sm: "px-2 py-0.5 text-2xs",
    md: "px-3 py-1 text-xs",
  };

  return (
    <span
      className={`
        inline-flex items-center justify-center
        rounded-full font-semibold tracking-wide uppercase
        border
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${className}
      `
        .trim()
        .replace(/\s+/g, " ")}
    >
      {label}
    </span>
  );
};
