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

export interface BadgeProps {
  /** Badge content - text, number, or React element */
  children: React.ReactNode;

  /** Visual variant based on psychological color system */
  variant?:
    | "default"
    | "urgency"
    | "achievement"
    | "information"
    | "attention"
    | "premium";

  /** Size variant */
  size?: "sm" | "md" | "lg";

  /** Achievement badge with celebration animation */
  achievement?: boolean;

  /** Progress badge with filling animation */
  progress?: number; // 0-100

  /** Pulsing animation for attention */
  pulse?: boolean;

  /** Additional styling */
  className?: string;

  /** Click handler for interactive badges */
  onClick?: () => void;
}

/**
 * Badge Component
 *
 * The "shoe tongue" of our interface - something users touch constantly,
 * so it must feel luxurious and purposeful in every interaction.
 */
export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = "default",
  size = "md",
  achievement = false,
  progress,
  pulse = false,
  className,
  onClick,
}) => {
  // Base styles - the foundation of luxury
  const baseStyles = cn(
    // Shape and positioning
    "inline-flex items-center justify-center",
    "font-medium tracking-wide",
    "border border-transparent",
    "transition-all duration-200 ease-out",

    // The "New Balance touch" - subtle but luxurious details
    "shadow-sm", // Subtle depth
    "backdrop-blur-sm", // Slight glass effect

    // Interactive states - responsive and satisfying
    onClick && [
      "cursor-pointer",
      "hover:scale-105", // Subtle growth on hover
      "active:scale-95", // Satisfying press feedback
      "hover:shadow-md", // Enhanced depth on interaction
    ],

    // Pulse animation for attention
    pulse && "animate-pulse",

    // Achievement celebration animation
    achievement && [
      "animate-bounce-in", // Custom animation defined in CSS
      "shadow-lg shadow-green-200", // Celebratory glow
    ]
  );

  // Size variants - purposeful scaling
  const sizeStyles = {
    sm: "px-2 py-0.5 text-xs rounded-full min-h-[18px]",
    md: "px-2.5 py-1 text-sm rounded-full min-h-[24px]",
    lg: "px-3 py-1.5 text-base rounded-lg min-h-[32px]",
  };

  // Color variants using our psychological color system
  const variantStyles = {
    default: cn(
      "bg-gray-100 text-gray-700",
      "hover:bg-gray-200 hover:text-gray-800",
      "border-gray-200"
    ),

    // 🔴 RED = URGENCY - Immediate attention required
    urgency: cn(
      "bg-red-50 text-red-700",
      "hover:bg-red-100 hover:text-red-800",
      "border-red-200",
      "shadow-red-100"
    ),

    // 🟢 GREEN = ACHIEVEMENT - Success and accomplishment
    achievement: cn(
      "bg-green-50 text-green-700",
      "hover:bg-green-100 hover:text-green-800",
      "border-green-200",
      "shadow-green-100"
    ),

    // 🔵 BLUE = INFORMATION - Neutral, informative content
    information: cn(
      "bg-blue-50 text-blue-700",
      "hover:bg-blue-100 hover:text-blue-800",
      "border-blue-200",
      "shadow-blue-100"
    ),

    // 🟡 YELLOW = ATTENTION - Important but not urgent
    attention: cn(
      "bg-yellow-50 text-yellow-700",
      "hover:bg-yellow-100 hover:text-yellow-800",
      "border-yellow-200",
      "shadow-yellow-100"
    ),

    // 🟣 PURPLE = PREMIUM - Special, elite, exclusive
    premium: cn(
      "bg-purple-50 text-purple-700",
      "hover:bg-purple-100 hover:text-purple-800",
      "border-purple-200",
      "shadow-purple-100",
      "bg-gradient-to-r from-purple-50 to-indigo-50" // Subtle gradient for premium feel
    ),
  };

  // Progress badge with filling animation
  const progressElement = progress !== undefined && (
    <div className="absolute inset-0 overflow-hidden rounded-full">
      <div
        className="h-full bg-gradient-to-r from-green-400 to-emerald-500 transition-all duration-500 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );

  return (
    <span
      className={cn(
        baseStyles,
        sizeStyles[size],
        variantStyles[variant],
        progress !== undefined && "relative overflow-hidden",
        className
      )}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
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
) => <Badge {...props} variant="achievement" achievement={true} />;

/**
 * Progress Badge - Visual progress indicator
 *
 * Shows completion status with a satisfying fill animation.
 * Perfect for tracking practice attendance, skill development, etc.
 */
export const ProgressBadge: React.FC<
  BadgeProps & { progress: number; label?: string }
> = ({ progress, label, ...props }) => (
  <Badge {...props} variant="information" progress={progress}>
    {label || `${progress}%`}
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
  <Badge {...props} variant="urgency" size="sm" pulse={count > 0}>
    {count > 99 ? "99+" : count}
  </Badge>
);

export default Badge;
