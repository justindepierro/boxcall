/**
 * Badge Component - The "New Balance Shoe Tongue" Philosophy
 *
 * Every interaction with this badge should feel intentional and luxurious.
 * The subtle details matter - the way it appears, responds to hover,
 * and celebrates achievements. This is the component users will touch
 * hundreds of times, so it should feel perfect every single time.
 */

import React from "react";
import { clsx } from "clsx";

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
    sm: "px-2 py-0.5 text-[11px] leading-tight min-h-[18px]",
    md: "px-2.5 py-0.5 text-xs leading-tight min-h-[22px]",
    lg: "px-3 py-1 text-sm min-h-[30px]",
  } as const;

  // Color variants using our psychological color system
  const variantStyles: Record<CanonicalBadgeVariant, string> = {
    neutral: cn(
      "surface-subtle text-gray-700 border border-subtle",
      "surface-subtle-hover hover:text-gray-800 dark:bg-gray-700/40 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600/50"
    ),
    info: cn(
      "bg-blue-50 text-blue-700 border border-blue-200",
      "hover:bg-blue-100 hover:text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-800 dark:hover:bg-blue-900/60"
    ),
    success: cn(
      "bg-green-50 text-green-700 border border-green-200",
      "hover:bg-green-100 hover:text-green-800 dark:bg-green-900/40 dark:text-green-300 dark:border-green-800 dark:hover:bg-green-900/60"
    ),
    warning: cn(
      "bg-yellow-50 text-yellow-700 border border-yellow-200",
      "hover:bg-yellow-100 hover:text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300 dark:border-yellow-800 dark:hover:bg-yellow-900/60"
    ),
    danger: cn(
      "bg-red-50 text-red-700 border border-red-200",
      "hover:bg-red-100 hover:text-red-800 dark:bg-red-900/40 dark:text-red-300 dark:border-red-800 dark:hover:bg-red-900/60"
    ),
    accent: cn(
      "bg-jade-50 text-jade-700 border border-jade-200",
      "hover:bg-jade-100 hover:text-jade-800 dark:bg-jade-900/40 dark:text-jade-300 dark:border-jade-800 dark:hover:bg-jade-900/60"
    ),
    premium: cn(
      "premium-badge decorative-gradient bg-gradient-to-r from-purple-50 to-indigo-50 text-purple-700 border border-purple-200",
      "hover:from-purple-100 hover:to-indigo-100 hover:text-purple-800 dark:text-purple-200 dark:from-purple-900/40 dark:to-indigo-900/40 dark:border-purple-800"
    ),
  };

  // Progress badge with filling animation
  const progressElement = progress !== undefined && (
    <div className="absolute inset-0 overflow-hidden">
      <div
        className="h-full bg-gradient-to-r from-green-400 to-jade-500 transition-all duration-500 ease-out"
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

export default Badge;
