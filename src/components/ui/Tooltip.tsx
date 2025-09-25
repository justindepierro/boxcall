import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";

/**
 * Tooltip Component System
 *
 * Contextual tooltips with smart positioning and animations
 * for enhanced user experience and information delivery.
 */

export type TooltipPosition =
  | "top"
  | "bottom"
  | "left"
  | "right"
  | "top-start"
  | "top-end"
  | "bottom-start"
  | "bottom-end"
  | "left-start"
  | "left-end"
  | "right-start"
  | "right-end";

export type TooltipVariant =
  | "default"
  | "info"
  | "success"
  | "warning"
  | "error";

export interface TooltipProps {
  /** Tooltip content */
  content: React.ReactNode;
  /** Tooltip position relative to trigger */
  position?: TooltipPosition;
  /** Visual variant */
  variant?: TooltipVariant;
  /** Delay before showing (ms) */
  delay?: number;
  /** Delay before hiding (ms) */
  hideDelay?: number;
  /** Whether tooltip is disabled */
  disabled?: boolean;
  /** Custom className for the tooltip */
  className?: string;
  /** Children to wrap with tooltip trigger */
  children: React.ReactElement;
}

const positionClasses = {
  top: "bottom-full left-1/2 transform -translate-x-1/2 mb-2",
  "top-start": "bottom-full left-0 mb-2",
  "top-end": "bottom-full right-0 mb-2",
  bottom: "top-full left-1/2 transform -translate-x-1/2 mt-2",
  "bottom-start": "top-full left-0 mt-2",
  "bottom-end": "top-full right-0 mt-2",
  left: "right-full top-1/2 transform -translate-y-1/2 mr-2",
  "left-start": "right-full top-0 mr-2",
  "left-end": "right-full bottom-0 mr-2",
  right: "left-full top-1/2 transform -translate-y-1/2 ml-2",
  "right-start": "left-full top-0 ml-2",
  "right-end": "left-full bottom-0 ml-2",
};

const variantClasses = {
  default: "bg-gray-900 text-white border-gray-700",
  info: "bg-navy-900 text-white border-navy-700",
  success: "bg-jade-600 text-white border-jade-500",
  warning: "bg-warning-600 text-white border-warning-500",
  error: "bg-error-600 text-white border-error-500",
};

const arrowClasses = {
  top: "top-full left-1/2 transform -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent border-t-gray-700",
  "top-start":
    "top-full left-4 border-l-transparent border-r-transparent border-b-transparent border-t-gray-700",
  "top-end":
    "top-full right-4 border-l-transparent border-r-transparent border-b-transparent border-t-gray-700",
  bottom:
    "bottom-full left-1/2 transform -translate-x-1/2 border-l-transparent border-r-transparent border-t-transparent border-b-gray-700",
  "bottom-start":
    "bottom-full left-4 border-l-transparent border-r-transparent border-t-transparent border-b-gray-700",
  "bottom-end":
    "bottom-full right-4 border-l-transparent border-r-transparent border-t-transparent border-b-gray-700",
  left: "left-full top-1/2 transform -translate-y-1/2 border-t-transparent border-b-transparent border-r-transparent border-l-gray-700",
  "left-start":
    "left-full top-4 border-t-transparent border-b-transparent border-r-transparent border-l-gray-700",
  "left-end":
    "left-full bottom-4 border-t-transparent border-b-transparent border-r-transparent border-l-gray-700",
  right:
    "right-full top-1/2 transform -translate-y-1/2 border-t-transparent border-b-transparent border-l-transparent border-r-gray-700",
  "right-start":
    "right-full top-4 border-t-transparent border-b-transparent border-l-transparent border-r-gray-700",
  "right-end":
    "right-full bottom-4 border-t-transparent border-b-transparent border-l-transparent border-r-gray-700",
};

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  position = "top",
  variant = "default",
  delay = 300,
  hideDelay = 150,
  disabled = false,
  className = "",
  children,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const triggerRef = useRef<HTMLElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const showTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showTooltipHandler = () => {
    if (disabled) return;

    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
    }
    showTimeoutRef.current = setTimeout(() => {
      setIsVisible(true);
      // Small delay for animation
      setTimeout(() => setShowTooltip(true), 10);
    }, delay);
  };

  const hideTooltipHandler = () => {
    if (showTimeoutRef.current) {
      clearTimeout(showTimeoutRef.current);
    }
    hideTimeoutRef.current = setTimeout(() => {
      setShowTooltip(false);
      // Wait for animation to complete before hiding
      setTimeout(() => setIsVisible(false), 150);
    }, hideDelay);
  };

  useEffect(() => {
    return () => {
      if (showTimeoutRef.current) {
        clearTimeout(showTimeoutRef.current);
      }
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, []);

  return (
    <span
      ref={triggerRef}
      className="inline-block"
      onMouseEnter={showTooltipHandler}
      onMouseLeave={hideTooltipHandler}
      onFocus={showTooltipHandler}
      onBlur={hideTooltipHandler}
    >
      {children}
      {isVisible &&
        createPortal(
          <div
            ref={tooltipRef}
            className={`
            fixed z-50 px-3 py-2 text-sm font-medium rounded-md border shadow-lg
            pointer-events-none transition-all duration-150 ease-out
            ${variantClasses[variant]}
            ${positionClasses[position]}
            ${showTooltip ? "opacity-100 scale-100" : "opacity-0 scale-95"}
            ${className}
          `}
            role="tooltip"
          >
            {content}
            {/* Arrow */}
            <div
              className={`
              absolute w-0 h-0 border-4
              ${arrowClasses[position]}
            `}
            />
          </div>,
          document.body
        )}
    </span>
  );
};

/**
 * Pre-configured tooltip variants for common use cases
 */

export const InfoTooltip: React.FC<Omit<TooltipProps, "variant">> = (props) => (
  <Tooltip {...props} variant="info" />
);

export const SuccessTooltip: React.FC<Omit<TooltipProps, "variant">> = (
  props
) => <Tooltip {...props} variant="success" />;

export const WarningTooltip: React.FC<Omit<TooltipProps, "variant">> = (
  props
) => <Tooltip {...props} variant="warning" />;

export const ErrorTooltip: React.FC<Omit<TooltipProps, "variant">> = (
  props
) => <Tooltip {...props} variant="error" />;

export default Tooltip;
