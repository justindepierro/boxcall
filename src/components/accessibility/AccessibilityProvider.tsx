/**
 * Accessibility Provider
 *
 * Global accessibility provider for WCAG 2.1 AA compliance
 */

import React, { useEffect } from "react";
import type { ReactNode } from "react";
import {
  useScreenReader,
  useKeyboardNavigation,
  useReducedMotion,
  useSkipLinks,
  useA11yTesting,
} from "../../hooks/useAccessibility";
import { accessibilityConfig } from "../../config/accessibility";
import {
  AccessibilityContext,
  type AccessibilityContextType,
} from "../../hooks/useAccessibilityContext";

interface AccessibilityProviderProps {
  children: ReactNode;
  enableTesting?: boolean;
}

export const AccessibilityProvider: React.FC<AccessibilityProviderProps> = ({
  children,
  enableTesting = import.meta.env.DEV,
}) => {
  const {
    announce,
    announceError,
    announceSuccess,
    announcePageChange,
    announcementRef,
  } = useScreenReader();

  const { skipLinksEnabled } = useSkipLinks();
  const prefersReducedMotion = useReducedMotion();
  const { violations } = useA11yTesting();

  // Initialize keyboard navigation
  useKeyboardNavigation();

  // Apply accessibility-related CSS custom properties
  useEffect(() => {
    const root = document.documentElement;

    // Set CSS custom properties for accessibility
    root.style.setProperty(
      "--a11y-min-touch-target",
      `${accessibilityConfig.interactive.minTouchTarget}px`
    );
    root.style.setProperty(
      "--a11y-focus-width",
      `${accessibilityConfig.interactive.focusIndicatorWidth}px`
    );
    root.style.setProperty(
      "--a11y-line-height",
      accessibilityConfig.text.lineHeight.toString()
    );
    root.style.setProperty(
      "--a11y-letter-spacing",
      `${accessibilityConfig.text.letterSpacing}em`
    );

    // Handle reduced motion preference
    if (prefersReducedMotion) {
      root.style.setProperty("--a11y-animation-duration", "0ms");
      root.classList.add("reduce-motion");
    } else {
      root.style.setProperty(
        "--a11y-animation-duration",
        `${accessibilityConfig.motion.defaultAnimationDuration}ms`
      );
      root.classList.remove("reduce-motion");
    }

    // Add accessibility classes
    document.body.classList.add("a11y-enabled");

    return () => {
      document.body.classList.remove("a11y-enabled");
    };
  }, [prefersReducedMotion]);

  // Set up global focus management
  useEffect(() => {
    if (!accessibilityConfig.keyboardNavigation.focusVisible) return;

    const style = document.createElement("style");
    style.textContent = `
      /* Focus indicators */
      .keyboard-navigation *:focus {
        outline: var(--a11y-focus-width) solid #0066cc;
        outline-offset: 2px;
      }
      
      /* Hide focus for mouse users */
      body:not(.keyboard-navigation) *:focus {
        outline: none;
      }
      
      /* Skip links */
      .skip-links {
        position: absolute;
        top: -100px;
        left: 0;
        width: 100%;
        z-index: 9999;
      }
      
      .skip-link {
        position: absolute;
        top: 0;
        left: 0;
        background: #000;
        color: #fff;
        padding: 8px 16px;
        text-decoration: none;
        font-weight: bold;
        transform: translateY(-100%);
        transition: transform 0.2s ease-in-out;
      }
      
      .skip-link:focus {
        transform: translateY(0);
      }
      
      /* Screen reader only content */
      .sr-only {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border: 0;
      }
      
      /* Accessible touch targets */
      .a11y-enabled button,
      .a11y-enabled [role="button"],
      .a11y-enabled a,
      .a11y-enabled input,
      .a11y-enabled select,
      .a11y-enabled textarea {
        min-height: var(--a11y-min-touch-target);
        min-width: var(--a11y-min-touch-target);
      }
      
      /* Reduced motion */
      .reduce-motion * {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
      }
      
      /* Text spacing and readability */
      .a11y-enabled {
        line-height: var(--a11y-line-height);
        letter-spacing: var(--a11y-letter-spacing);
      }
      
      /* High contrast mode support */
      @media (prefers-contrast: high) {
        .a11y-enabled {
          filter: contrast(1.5);
        }
      }
      
      /* Focus-within for better navigation */
      .a11y-enabled [aria-expanded="true"] {
        position: relative;
      }
      
      /* Error states */
      .a11y-enabled [aria-invalid="true"] {
        border-color: #d32f2f;
        background-color: #ffebee;
      }
      
      /* Required field indicators */
      .a11y-enabled [aria-required="true"]::after {
        content: " *";
        color: #d32f2f;
        font-weight: bold;
      }
    `;

    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const contextValue: AccessibilityContextType = {
    announceMessage: announce,
    announceError,
    announceSuccess,
    announcePageChange,
    prefersReducedMotion,
    isA11yTestingEnabled: enableTesting,
    a11yViolations: violations,
  };

  return (
    <AccessibilityContext.Provider value={contextValue}>
      {/* Skip Links */}
      {skipLinksEnabled && (
        <div className="skip-links">
          <a href="#main-content" className="skip-link">
            Skip to main content
          </a>
          <a href="#navigation" className="skip-link">
            Skip to navigation
          </a>
        </div>
      )}

      {/* Screen Reader Announcer */}
      <div
        ref={announcementRef}
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
        role="status"
      />

      {children}
      {enableTesting && violations.length > 0 && (
        <div
          className="a11y-violations"
          style={{
            position: "fixed",
            bottom: 0,
            right: 0,
            background: "#ff5722",
            color: "white",
            padding: "8px",
            zIndex: 10000,
            fontSize: "12px",
          }}
        >
          {violations.length} A11y violations found
        </div>
      )}
    </AccessibilityContext.Provider>
  );
};
