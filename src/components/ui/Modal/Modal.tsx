import type { ReactNode } from "react";
import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
export interface ModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Function to close the modal */
  onClose: () => void;
  /** Modal title */
  title?: string;
  /** Modal content */
  children: ReactNode;
  /** Modal size */
  size?: "sm" | "md" | "lg" | "xl";
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
}
const getModalSizeStyles = (size: ModalProps["size"]) => {
  switch (size) {
    case "sm":
      return "max-w-sm";
    case "md":
      return "max-w-md";
    case "lg":
      return "max-w-lg";
    case "xl":
      return "max-w-xl";
    default:
      return "max-w-md";
  }
};
const getModalTypeStyles = (type: ModalProps["type"]) => {
  const baseStyles = "rounded-lg shadow-xl border-2"; // Square corners, stronger shadows
  switch (type) {
    case "alert":
      return `${baseStyles} bg-red-50 dark:bg-red-900/20 border-red-400 dark:border-red-500`;
    case "confirm":
      return `${baseStyles} bg-yellow-50 dark:bg-yellow-900/20 border-yellow-400 dark:border-yellow-500`;
    default:
      return `${baseStyles} bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600`;
  }
};
const getBackdropStyles = () => {
  return "bg-brand-navy/60 dark:bg-brand-navy-dark/80"; // Navy-tinted backdrop instead of gray
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
  zIndex = 50,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);
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
      className={`fixed inset-0 z-${zIndex} flex items-center justify-center p-4`}
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
          <div className="px-8 py-6 border-b-2 border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h3
                id="modal-title"
                className={`
                  text-xl font-display font-bold leading-6
                  text-gray-900 dark:text-white
                  ${type === "alert" ? "text-red-900 dark:text-red-100" : ""}
                  ${type === "confirm" ? "text-yellow-900 dark:text-yellow-100" : ""}
                `}
              >
                {title}
              </h3>
              <button
                onClick={onClose}
                className="ml-4 p-2 rounded-sm transition-all duration-200 text-gray-600 hover:text-interaction-jade hover:bg-surface-jade dark:text-gray-400 dark:hover:text-brand-jade dark:hover:bg-surface-jade-dark border border-transparent hover:border-surface-jade-dark"
                aria-label="Close modal"
              >
                <svg
                  className="w-5 h-5"
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
              </button>
            </div>
          </div>
        )}
        {/* Content - More substantial padding */}
        <div className="px-8 py-6">{children}</div>
        {/* Footer - Enhanced styling */}
        {footer && (
          <div className="px-8 py-6 border-t-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
  // Render in portal
  return createPortal(modalContent, document.body);
};
