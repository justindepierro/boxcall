/**
 * Accessible Modal Component
 *
 * WCAG 2.1 AA compliant modal with comprehensive accessibility features
 */

import React, { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { createPortal } from "react-dom";
import {
  useFocusManagement,
  useAriaAttributes,
} from "../../hooks/useAccessibility";
import { useAccessibility } from "../accessibility/AccessibilityProvider";
import { AccessibleButton } from "../accessibility/AccessibleButton";
import { KEYBOARD_KEYS, ARIA_LABELS } from "../../config/accessibility";

interface AccessibleModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  showCloseButton?: boolean;
  initialFocus?: "first" | "close" | "none";
  className?: string;
}

export const AccessibleModal: React.FC<AccessibleModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = "md",
  closeOnOverlayClick = true,
  closeOnEscape = true,
  showCloseButton = true,
  initialFocus = "first",
  className = "",
}) => {
  const { saveFocus, restoreFocus, focusFirst, trapFocus } =
    useFocusManagement();
  const { generateId } = useAriaAttributes();
  const { announceMessage } = useAccessibility();

  const modalRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const titleId = generateId("modal-title");
  const descriptionId = generateId("modal-description");

  // Handle modal open/close effects
  useEffect(() => {
    if (isOpen) {
      // Save current focus
      saveFocus();

      // Prevent body scroll
      document.body.style.overflow = "hidden";

      // Announce modal opening
      announceMessage(`${title} dialog opened`, "ASSERTIVE");

      // Set initial focus
      setTimeout(() => {
        if (modalRef.current) {
          if (initialFocus === "close" && closeButtonRef.current) {
            closeButtonRef.current.focus();
          } else if (initialFocus === "first") {
            focusFirst(modalRef.current);
          }

          // Set up focus trap
          const cleanup = trapFocus(modalRef.current);
          return cleanup;
        }
      }, 100);
    } else {
      // Restore body scroll
      document.body.style.overflow = "";

      // Restore previous focus
      restoreFocus();

      // Announce modal closing
      announceMessage(`${title} dialog closed`);
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [
    isOpen,
    title,
    saveFocus,
    restoreFocus,
    focusFirst,
    trapFocus,
    announceMessage,
    initialFocus,
  ]);

  // Handle keyboard events
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === KEYBOARD_KEYS.ESCAPE && closeOnEscape) {
        event.preventDefault();
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, closeOnEscape, onClose]);

  // Handle overlay click
  const handleOverlayClick = (event: React.MouseEvent) => {
    if (closeOnOverlayClick && event.target === overlayRef.current) {
      onClose();
    }
  };

  const sizeClasses = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
  };

  if (!isOpen) return null;

  const modalContent = (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
      onClick={handleOverlayClick}
      aria-hidden={!isOpen}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        className={`
          relative
          w-full
          ${sizeClasses[size]}
          bg-white
          rounded-lg
          shadow-xl
          transform
          transition-all
          duration-200
          ease-out
          ${isOpen ? "scale-100 opacity-100" : "scale-95 opacity-0"}
          ${className}
        `}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 id={titleId} className="text-xl font-semibold text-gray-900">
            {title}
          </h2>

          {showCloseButton && (
            <AccessibleButton
              ref={closeButtonRef}
              variant="ghost"
              size="sm"
              onClick={onClose}
              ariaLabel={ARIA_LABELS.CLOSE}
              className="ml-4 text-gray-400 hover:text-gray-600"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </AccessibleButton>
          )}
        </div>

        {/* Description */}
        {description && (
          <div className="px-6 pt-4">
            <p id={descriptionId} className="text-sm text-gray-600">
              {description}
            </p>
          </div>
        )}

        {/* Content */}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );

  // Render modal in portal
  return createPortal(modalContent, document.body);
};


