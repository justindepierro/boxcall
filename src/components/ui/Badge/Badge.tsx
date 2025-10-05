/**
 * Badge Component - The "New Balance Shoe Tongue" Philosophy
 *
 * Every interaction with this badge should feel intentional and luxurious.
 * The subtle details matter - the way it appears, responds to hover,
 * and celebrates achievements. This is the component users will touch
 * hundreds of times, so it should feel perfect every single time.
 */

import { clsx } from "clsx";
import React from "react";

// Utility function for combining class names
const cn = (...classes: (string | undefined | null | false)[]): string => {
  return clsx(classes);
};

export type CanonicalBadgeVariant =
  | "neutral"
  | "info"
  | "success"
  | "warning"
  | "danger"
  | "accent"
  | "premium";

// Backwards compatibility legacy variant names still in codebase
export type LegacyBadgeVariant =
  | "default"
  | "urgency"
  | "achievement"
  | "information"
  | "attention";

export type BadgeVariant = CanonicalBadgeVariant | LegacyBadgeVariant;

export interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: "sm" | "md" | "lg";
  achievement?: boolean; // kept for backwards compat; triggers bounce + success styling
  progress?: number; // 0-100
  pulse?: boolean;
  className?: string;
  onClick?: () => void;
  /** Optional elevated style (slightly stronger shadow) */
  elevated?: boolean;
  /** Force pill (rounded-full) even for lg size */
  pill?: boolean;
  /** Provide accessible label when badge only contains an icon */
  ariaLabel?: string;
}

function normalizeBadgeVariant(
  variant: BadgeVariant | undefined
): CanonicalBadgeVariant {
  switch (variant) {
    case "default":
      return "neutral";
    case "urgency":
      return "danger";
    case "achievement":
      return "success";
    case "information":
      return "info";
    case "attention":
      return "warning";
    case "premium":
      return "premium";
    case "neutral":
    case "info":
    case "success":
    case "warning":
    case "danger":
    case "accent":
      return variant;
    default:
      return "neutral";
  }
}

/**
 * Badge Component
 *
 * The "shoe tongue" of our interface - something users touch constantly,
 * so it must feel luxurious and purposeful in every interaction.
 */
export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = "neutral",
  size = "md",
  achievement = false,
  progress,
  pulse = false,
  className,
  onClick,
  elevated = false,
  pill = true,
  ariaLabel,
}) => {
  const canonical = normalizeBadgeVariant(variant);
  // Base styles - the foundation of luxury
  const baseStyles = clsx(
    "inline-flex items-center justify-center font-medium select-none whitespace-nowrap align-middle",
    "transition-colors duration-200 ease-out",
    pill && size !== "lg" ? "rounded-full" : "rounded-md",
    // Elevation (optional)
    elevated ? "shadow-md" : "shadow-sm",
    // Interactive
    onClick && "cursor-pointer active:scale-95",
    pulse && "animate-pulse",
    achievement && "animate-bounce-in",
    // Positioning when progress is present
    progress !== undefined && "relative overflow-hidden"
  );

  // Size variants - purposeful scaling
  const sizeStyles = {
    sm: "px-2 py-0.5 text-xs leading-tight h-5", // 12px font, 20px height
    md: "px-2.5 py-0.5 text-xs leading-tight h-6", // 12px font, 24px height
    lg: "px-3 py-1 text-sm h-8", // 14px font, 32px height
  } as const;

  // Color variants using our psychological color system
  const variantStyles: Record<CanonicalBadgeVariant, string> = {
    neutral: cn(
      "surface-subtle text-text-primary border border-subtle",
      "surface-subtle-hover hover:text-text-primary"
    ),
    info: cn(
      "surface-subtle text-text-info border border-subtle",
      "hover:bg-surface-info hover:text-text-info"
    ),
    success: cn(
      "surface-subtle text-text-success border border-subtle",
      "hover:bg-surface-success hover:text-text-success"
    ),
    warning: cn(
      "surface-subtle text-text-warning border border-subtle",
      "hover:bg-surface-warning hover:text-text-warning"
    ),
    danger: cn(
      "surface-subtle text-text-error border border-subtle",
      "hover:bg-surface-error hover:text-text-error"
    ),
    accent: cn(
      "surface-subtle text-text-accent border border-subtle",
      "hover:bg-surface-accent hover:text-text-accent"
    ),
    premium: cn(
      "premium-badge decorative-gradient bg-gradient-to-r from-surface-accent to-surface-info text-text-accent border border-subtle",
      "hover:from-surface-accent hover:to-surface-info hover:text-text-accent"
    ),
  };

  // Progress badge with filling animation
  const progressElement = progress !== undefined && (
    <div className="absolute inset-0 overflow-hidden">
      <div
        className="h-full bg-gradient-to-r from-text-success to-text-accent transition-all duration-500 ease-out"
        style={{ width: `${progress}%` }}
        aria-hidden="true"
      />
    </div>
  );

  return (
    <span
      className={cn(
        baseStyles,
        sizeStyles[size],
        variantStyles[canonical],
        className
      )}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-label={ariaLabel}
    >
      {progressElement}
      <span className="relative z-10">{children}</span>
    </span>
  );
};

/**
 * Achievement Badge - Special badge for celebrating accomplishments
 *
 * This is the "championship moment" - when users earn something special,
 * this badge should make them feel genuinely proud.
 */
export const AchievementBadge: React.FC<Omit<BadgeProps, "variant">> = (
  props
) => <Badge {...props} variant="success" achievement={true} />;

/**
 * Progress Badge - Visual progress indicator
 *
 * Shows completion status with a satisfying fill animation.
 * Perfect for tracking practice attendance, skill development, etc.
 */
export const ProgressBadge: React.FC<
  Omit<BadgeProps, "children"> & {
    progress: number;
    label?: string;
    children?: React.ReactNode;
  }
> = ({ progress, label, children, ...props }) => (
  <Badge {...props} variant="info" progress={progress}>
    {children || label || `${progress}%`}
  </Badge>
);

/**
 * Notification Badge - For counts and alerts
 *
 * The classic red notification dot, but with our luxurious touch.
 */
export const NotificationBadge: React.FC<
  Omit<BadgeProps, "variant" | "children"> & { count: number }
> = ({ count, ...props }) => (
  <Badge
    {...props}
    variant="danger"
    size="sm"
    pulse={count > 0}
    ariaLabel={count ? `${count} notifications` : undefined}
  >
    {count > 99 ? "99+" : count}
  </Badge>
);
