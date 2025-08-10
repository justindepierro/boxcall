/**
 * Professional Touch Interaction Components
 * Part of Phase 3C: Professional Touch Experience
 *
 * Provides native-app-quality touch feedback and micro-interactions
 */
import React, { useState, useRef, useCallback, type ElementType } from "react";
import { Typography } from "../design-system/Typography";

interface TouchFeedbackProps {
  /** Enable ripple effect on touch */
  ripple?: boolean;
  /** Enable scale feedback on press */
  scaleOnPress?: boolean;
  /** Enable shadow elevation on press */
  shadowOnPress?: boolean;
  /** Custom press animation duration */
  animationDuration?: number;
  /** Disable touch feedback entirely */
  disabled?: boolean;
  /** Custom className */
  className?: string;
  /** Children to render */
  children: React.ReactNode;
  /** Touch event handlers */
  onPress?: () => void;
  onLongPress?: () => void;
  /** Element type */
  as?: ElementType;
}

// Core touch feedback wrapper component
export const TouchFeedback: React.FC<TouchFeedbackProps> = ({
  ripple = true,
  scaleOnPress = true,
  shadowOnPress = false,
  animationDuration = 150,
  disabled = false,
  className = "",
  children,
  onPress,
  onLongPress,
  as: Element = "div",
}) => {
  const [isPressed, setIsPressed] = useState(false);
  const [ripples, setRipples] = useState<
    Array<{ id: number; x: number; y: number }>
  >([]);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const elementRef = useRef<HTMLElement>(null);

  const handleTouchStart = useCallback(
    (event: React.TouchEvent | React.MouseEvent) => {
      if (disabled) return;

      setIsPressed(true);

      // Create ripple effect
      if (ripple && elementRef.current) {
        const rect = elementRef.current.getBoundingClientRect();
        const x =
          ("touches" in event ? event.touches[0].clientX : event.clientX) -
          rect.left;
        const y =
          ("touches" in event ? event.touches[0].clientY : event.clientY) -
          rect.top;

        const newRipple = { id: Date.now(), x, y };
        setRipples((prev) => [...prev, newRipple]);

        // Remove ripple after animation
        setTimeout(() => {
          setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
        }, 600);
      }

      // Setup long press detection
      if (onLongPress) {
        longPressTimer.current = setTimeout(() => {
          onLongPress();
        }, 500);
      }
    },
    [disabled, ripple, onLongPress]
  );

  const handleTouchEnd = useCallback(() => {
    if (disabled) return;

    setIsPressed(false);

    // Clear long press timer
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }

    // Trigger press callback
    if (onPress) {
      onPress();
    }
  }, [disabled, onPress]);

  const handleTouchCancel = useCallback(() => {
    if (disabled) return;

    setIsPressed(false);

    // Clear long press timer
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, [disabled]);

  const baseStyles = `
    relative overflow-hidden cursor-pointer select-none
    transition-all duration-${animationDuration} ease-out
    ${scaleOnPress && isPressed ? "transform scale-95" : ""}
    ${shadowOnPress && isPressed ? "shadow-lg" : ""}
    ${disabled ? "opacity-50 cursor-not-allowed" : ""}
  `;

  return (
    <Element
      ref={elementRef as React.Ref<HTMLElement>}
      className={`${baseStyles} ${className}`}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchCancel}
      onMouseDown={handleTouchStart}
      onMouseUp={handleTouchEnd}
      onMouseLeave={handleTouchCancel}
      style={{
        WebkitTapHighlightColor: "transparent",
      }}
    >
      {children}

      {/* Ripple effects */}
      {ripple &&
        ripples.map((ripple) => (
          <div
            key={ripple.id}
            className="absolute pointer-events-none"
            style={{
              left: ripple.x - 10,
              top: ripple.y - 10,
              width: 20,
              height: 20,
            }}
          >
            <div className="w-full h-full bg-white bg-opacity-30 rounded-full animate-ping" />
          </div>
        ))}
    </Element>
  );
};

// Enhanced button with professional touch feedback
interface TouchButtonProps {
  /** Button variant */
  variant?: "primary" | "secondary" | "ghost" | "danger";
  /** Button size */
  size?: "sm" | "md" | "lg" | "xl";
  /** Full width button */
  fullWidth?: boolean;
  /** Loading state */
  loading?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Icon before text */
  icon?: React.ReactNode;
  /** Icon after text */
  iconAfter?: React.ReactNode;
  /** Button content */
  children: React.ReactNode;
  /** Click handler */
  onClick?: () => void;
  /** Long press handler */
  onLongPress?: () => void;
  /** Custom className */
  className?: string;
}

export const TouchButton: React.FC<TouchButtonProps> = ({
  variant = "primary",
  size = "md",
  fullWidth = false,
  loading = false,
  disabled = false,
  icon,
  iconAfter,
  children,
  onClick,
  onLongPress,
  className = "",
}) => {
  const variantStyles = {
    primary:
      "bg-team-primary hover:bg-jade-700 text-white shadow-md hover:shadow-lg",
    secondary:
      "surface-subtle surface-subtle-hover text-gray-900 shadow-sm hover:shadow-md",
    ghost:
      "bg-transparent surface-subtle-hover text-gray-700 border border-gray-300 hover:border-gray-400",
    danger: "bg-red-500 hover:bg-red-600 text-white shadow-md hover:shadow-lg",
  };

  const sizeStyles = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
    xl: "px-8 py-4 text-xl",
  };

  const buttonStyles = `
    inline-flex items-center justify-center space-x-2
    rounded-lg font-semibold
    transition-all duration-200 ease-out
    focus:outline-none focus:ring-2 focus:ring-jade-500 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
    ${variantStyles[variant]}
    ${sizeStyles[size]}
    ${fullWidth ? "w-full" : ""}
    ${loading ? "cursor-wait" : ""}
  `;

  return (
    <TouchFeedback
      as="button"
      onPress={onClick}
      onLongPress={onLongPress}
      disabled={disabled || loading}
      scaleOnPress
      shadowOnPress
      className={`${buttonStyles} ${className}`}
    >
      {loading && (
        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
            className="opacity-25"
          />
          <path
            fill="currentColor"
            className="opacity-75"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {!loading && icon && <span className="flex-shrink-0">{icon}</span>}
      <span>{children}</span>
      {!loading && iconAfter && (
        <span className="flex-shrink-0">{iconAfter}</span>
      )}
    </TouchFeedback>
  );
};

// Enhanced card component with touch interactions
interface TouchCardProps {
  /** Enable hover elevation */
  hoverElevation?: boolean;
  /** Enable press feedback */
  pressable?: boolean;
  /** Card padding */
  padding?: "none" | "sm" | "md" | "lg";
  /** Card children */
  children: React.ReactNode;
  /** Card click handler */
  onClick?: () => void;
  /** Long press handler */
  onLongPress?: () => void;
  /** Custom className */
  className?: string;
}

export const TouchCard: React.FC<TouchCardProps> = ({
  hoverElevation = false,
  pressable = false,
  padding = "md",
  children,
  onClick,
  onLongPress,
  className = "",
}) => {
  const paddingStyles = {
    none: "",
    sm: "p-3",
    md: "p-4",
    lg: "p-6",
  };

  const cardStyles = `
    bg-white rounded-lg border border-subtle
    transition-all duration-200 ease-out
    ${hoverElevation ? "hover:shadow-md hover:-translate-y-0.5" : "shadow-sm"}
    ${pressable ? "cursor-pointer" : ""}
    ${paddingStyles[padding]}
  `;

  if (pressable || onClick || onLongPress) {
    return (
      <TouchFeedback
        onPress={onClick}
        onLongPress={onLongPress}
        scaleOnPress={pressable}
        ripple={pressable}
        className={`${cardStyles} ${className}`}
      >
        {children}
      </TouchFeedback>
    );
  }

  return <div className={`${cardStyles} ${className}`}>{children}</div>;
};

// Enhanced navigation item with touch feedback
interface TouchNavItemProps {
  /** Active state */
  active?: boolean;
  /** Navigation icon */
  icon?: React.ReactNode;
  /** Navigation label */
  label: string;
  /** Badge count */
  badge?: number;
  /** Click handler */
  onClick?: () => void;
  /** Custom className */
  className?: string;
}

export const TouchNavItem: React.FC<TouchNavItemProps> = ({
  active = false,
  icon,
  label,
  badge,
  onClick,
  className = "",
}) => {
  const navStyles = `
    flex flex-col items-center justify-center space-y-1
    px-3 py-2 rounded-lg min-h-[48px]
    transition-all duration-200 ease-out
    ${
      active
        ? "bg-blue-100 text-team-primary"
        : "text-text-secondary hover:text-text-primary surface-subtle-hover"
    }
  `;

  return (
    <TouchFeedback
      onPress={onClick}
      scaleOnPress
      className={`${navStyles} ${className}`}
    >
      <div className="relative">
        {icon && <div className="flex-shrink-0">{icon}</div>}
        {badge && badge > 0 && (
          <div className="absolute -top-1 -right-1 bg-red-500 text-text-inverse text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {badge > 99 ? "99+" : badge}
          </div>
        )}
      </div>
      <Typography
        variant="caption"
        className={active ? "text-team-primary font-medium" : "text-current"}
      >
        {label}
      </Typography>
    </TouchFeedback>
  );
};

export default TouchFeedback;
