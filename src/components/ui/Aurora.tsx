import React, { type ReactNode } from "react";
import clsx from "clsx";

/**
 * Aurora Background Variants
 *
 * - shell: Soft gradient with aurora effects (default for most pages)
 * - field: Sports field-inspired green gradient
 * - minimal: Subtle gradient for content-focused pages
 * - none: No aurora background (plain surface)
 */
export type AuroraVariant = "shell" | "field" | "minimal" | "none";

export interface AuroraProps {
  /**
   * Visual variant of the aurora background
   */
  variant?: AuroraVariant;

  /**
   * Content to render inside aurora wrapper
   */
  children: ReactNode;

  /**
   * Additional CSS classes for the wrapper
   */
  className?: string;

  /**
   * Whether to apply full viewport height
   */
  fullHeight?: boolean;

  /**
   * Whether to enable animated aurora effects
   */
  animated?: boolean;
}

/**
 * Aurora Background Component
 *
 * Provides consistent background styling across all pages with multiple variants.
 * Replaces hardcoded gradient classes with a unified, token-based system.
 *
 * @example
 * // Default aurora shell background
 * <Aurora>
 *   <Card>Content</Card>
 * </Aurora>
 *
 * @example
 * // Field variant for sports pages
 * <Aurora variant="field">
 *   <PlaybookContent />
 * </Aurora>
 *
 * @example
 * // Minimal variant for text-heavy pages
 * <Aurora variant="minimal" fullHeight>
 *   <Documentation />
 * </Aurora>
 */
export const Aurora: React.FC<AuroraProps> = ({
  variant = "shell",
  children,
  className,
  fullHeight = false,
  animated = true,
}) => {
  const baseClasses = clsx(
    "relative w-full",
    {
      "min-h-screen": fullHeight,
    },
    className
  );

  const variantClasses = {
    shell: clsx(
      // Background gradient
      "bg-gradient-to-br from-jade-50 via-white to-electric-50/30",
      "dark:from-navy-900 dark:via-navy-800 dark:to-electric-900/20",
      // Optional animated aurora glow - with pointer-events-none to not block clicks
      animated &&
        "before:absolute before:inset-0 before:opacity-0 before:pointer-events-none",
      animated &&
        "before:bg-gradient-radial before:from-electric-400/10 before:to-transparent",
      animated && "before:animate-pulse before:duration-[8s]"
    ),

    field: clsx(
      // Sports field gradient
      "bg-gradient-to-b from-jade-100 via-jade-50 to-white",
      "dark:from-jade-900/30 dark:via-navy-900 dark:to-navy-900",
      // Field texture overlay
      "bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))]"
    ),

    minimal: clsx(
      // Subtle gradient for content focus
      "bg-gradient-to-b from-navy-50/50 via-white to-white",
      "dark:from-navy-900/50 dark:via-navy-900 dark:to-navy-900"
    ),

    none: clsx(
      // Plain background (no aurora)
      "bg-white dark:bg-navy-900"
    ),
  };

  return (
    <div className={clsx(baseClasses, variantClasses[variant])}>{children}</div>
  );
};

/**
 * Pre-configured Aurora variants for common use cases
 */
export const AuroraShell: React.FC<Omit<AuroraProps, "variant">> = (props) => (
  <Aurora variant="shell" {...props} />
);

export const AuroraField: React.FC<Omit<AuroraProps, "variant">> = (props) => (
  <Aurora variant="field" {...props} />
);

export const AuroraMinimal: React.FC<Omit<AuroraProps, "variant">> = (
  props
) => <Aurora variant="minimal" {...props} />;
