import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

import { Typography } from "../../design-system/Typography";
import { IconButton } from "../IconButton/IconButton";

import type { ReactNode } from "react";

export interface ModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Function to close the modal */
  onClose: () => void;
  /** Modal title */
  title?: string;
  /** Modal content */
  children: ReactNode;
  /** Modal size - can be responsive with space-separated values */
  size?:
    | "sm"
    | "md"
    | "lg"
    | "xl"
    | "2xl"
    | "3xl"
    | "4xl"
    | "5xl"
    | "full"
    | string;
  /** Modal type for different styling */
  type?: "default" | "alert" | "confirm";
  /** Whether clicking the backdrop closes the modal */
  closeOnBackdropClick?: boolean;
  /** Whether pressing Escape closes the modal */
  closeOnEscape?: boolean;
  /** Footer content */
  footer?: ReactNode;
  /** Additional CSS classes */
  className?: string;
  /** Custom z-index */
  zIndex?: number;
  /** Force landscape orientation on mobile */
  forceLandscapeOnMobile?: boolean;
}
const getModalSizeStyles = (size: ModalProps["size"]) => {
  // Handle responsive sizes (space-separated classes)
  if (size && size.includes(" ")) {
    return size
      .split(" ")
      .map((s) => {
        switch (s) {
          case "sm":
            return "max-w-sm";
          case "md":
            return "max-w-md";
          case "lg":
            return "max-w-lg";
          case "xl":
            return "max-w-xl";
          case "2xl":
            return "max-w-2xl";
          case "3xl":
            return "max-w-3xl";
          case "4xl":
            return "max-w-4xl";
          case "5xl":
            return "max-w-5xl";
          case "full":
            return "max-w-full";
          default:
            return s.startsWith("max-w-") ? s : `max-w-${s}`;
        }
      })
      .join(" ");
  }

  // Handle single sizes
  switch (size) {
    case "sm":
      return "max-w-sm";
    case "md":
      return "max-w-md";
    case "lg":
      return "max-w-lg";
    case "xl":
      return "max-w-xl";
    case "2xl":
      return "max-w-2xl";
    case "3xl":
      return "max-w-3xl";
    case "4xl":
      return "max-w-4xl";
    case "5xl":
      return "max-w-5xl";
    case "full":
      return "max-w-full";
    default:
      return "max-w-md";
  }
};
const getModalTypeStyles = (type: ModalProps["type"]) => {
  const baseStyles = "rounded-lg shadow-xl"; // Softer, no hard border
  switch (type) {
    case "alert":
      return `${baseStyles} surface-subtle dark:bg-red-900/20`;
    case "confirm":
      return `${baseStyles} surface-subtle dark:bg-yellow-900/20`;
    default:
      return `${baseStyles} surface-card elevation-modal`;
  }
};
const getBackdropStyles = () => {
  return "bg-black/40 dark:bg-black/60"; // Neutral backdrop
};
export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
  type = "default",
  closeOnBackdropClick = true,
  closeOnEscape = true,
  footer,
  className = "",
  zIndex = 9999,
  forceLandscapeOnMobile = false,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);
  const previousOrientation = useRef<string | null>(null);

  // Orientation management for mobile
  useEffect(() => {
    if (isOpen && forceLandscapeOnMobile) {
      // Check if we're on mobile
      const isMobile = window.innerWidth < 768;

      if (
        isMobile &&
        "orientation" in window.screen &&
        window.screen.orientation
      ) {
        // Store current orientation
        previousOrientation.current = window.screen.orientation.type;

        // Request landscape orientation if not already landscape
        if (!window.screen.orientation.type.includes("landscape")) {
          try {
            // Use type assertion for extended orientation API
            const orientation = window.screen
              .orientation as ScreenOrientation & {
              lock?: (orientation: string) => Promise<void>;
            };
            orientation.lock?.("landscape").catch((err: unknown) => {
              console.warn("Could not lock orientation:", err);
            });
          } catch (err) {
            console.warn("Orientation lock not supported:", err);
          }
        }
      }
    }

    return () => {
      // Restore previous orientation on close
      if (
        previousOrientation.current &&
        "orientation" in window.screen &&
        window.screen.orientation
      ) {
        try {
          const orientation = window.screen.orientation as ScreenOrientation & {
            unlock?: () => Promise<void>;
          };
          orientation.unlock?.();
        } catch (err) {
          console.warn("Could not unlock orientation:", err);
        }
      }
      previousOrientation.current = null;
    };
  }, [isOpen, forceLandscapeOnMobile]);
  // Focus management
  useEffect(() => {
    if (isOpen) {
      // Store the currently focused element
      previousActiveElement.current = document.activeElement as HTMLElement;
      // Focus the modal
      if (modalRef.current) {
        modalRef.current.focus();
      }
      // Prevent body scroll
      document.body.style.overflow = "hidden";
    } else {
      // Restore focus to the previously focused element
      if (previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
      // Restore body scroll
      document.body.style.overflow = "";
    }
    return () => {
      // Cleanup on unmount
      document.body.style.overflow = "";
    };
  }, [isOpen]);
  // Escape key handler
  useEffect(() => {
    if (!isOpen || !closeOnEscape) return;
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, closeOnEscape, onClose]);
  // Focus trap
  useEffect(() => {
    if (!isOpen) return;
    const handleTab = (event: KeyboardEvent) => {
      if (event.key !== "Tab" || !modalRef.current) return;
      const focusableElements = modalRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[
        focusableElements.length - 1
      ] as HTMLElement;
      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement?.focus();
          event.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement?.focus();
          event.preventDefault();
        }
      }
    };
    document.addEventListener("keydown", handleTab);
    return () => document.removeEventListener("keydown", handleTab);
  }, [isOpen]);
  const handleBackdropClick = (event: React.MouseEvent) => {
    if (closeOnBackdropClick && event.target === event.currentTarget) {
      onClose();
    }
  };
  if (!isOpen) return null;
  const modalContent = (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center p-4`}
      style={{ zIndex }}
    >
      {/* Backdrop */}
      <div
        className={`absolute inset-0 transition-opacity duration-300 ${getBackdropStyles()}`}
        onClick={handleBackdropClick}
        aria-hidden="true"
      />
      {/* Modal */}
      <div
        ref={modalRef}
        className={`
          relative w-full ${getModalSizeStyles(size)} ${getModalTypeStyles(type)}
          transform transition-all duration-300 scale-100 opacity-100
          ${className}
        `}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "modal-title" : undefined}
        tabIndex={-1}
      >
        {/* Header - Enhanced with display font and substantial styling */}
        {title && (
          <div className="bc-card-padding">
            <div className="flex items-center justify-between">
              <Typography
                id="modal-title"
                variant="headline-sm"
                as="h3"
                className={`${type === "alert" ? "text-red-900 dark:text-red-100" : ""} text-text-primary`}
              >
                {title}
              </Typography>
              <IconButton
                aria-label="Close modal"
                onClick={onClose}
                className="ml-2"
                tooltip="Close"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </IconButton>
            </div>
          </div>
        )}
        {/* Content - More substantial padding */}
        <div className="bc-card-padding">{children}</div>
        {/* Footer - Enhanced styling */}
        {footer && (
          <div className="bc-card-padding surface-subtle dark:bg-gray-900/50">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
  // Render in portal
  return createPortal(modalContent, document.body);
};
