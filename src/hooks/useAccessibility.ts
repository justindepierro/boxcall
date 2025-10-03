/**
 * Accessibility Hooks
 * 
 * React hooks for implementing WCAG 2.1 AA compliance and accessibility features
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { accessibilityConfig, KEYBOARD_KEYS, ARIA_LIVE_REGIONS } from '../config/accessibility';

// Screen Reader Announcements Hook
export function useScreenReader() {
  const announcementRef = useRef<HTMLDivElement>(null);

  const announce = useCallback((
    message: string,
    priority: keyof typeof ARIA_LIVE_REGIONS = 'POLITE'
  ) => {
    if (!accessibilityConfig.screenReader.enabled) return;

    if (announcementRef.current) {
      // Clear previous announcement
      announcementRef.current.textContent = '';
      
      // Set new announcement with slight delay to ensure screen readers pick it up
      setTimeout(() => {
        if (announcementRef.current) {
          announcementRef.current.setAttribute('aria-live', ARIA_LIVE_REGIONS[priority]);
          announcementRef.current.textContent = message;
        }
      }, 100);
    }
  }, []);

  const announceError = useCallback((message: string) => {
    if (accessibilityConfig.screenReader.announceErrors) {
      announce(`Error: ${message}`, 'ASSERTIVE');
    }
  }, [announce]);

  const announceSuccess = useCallback((message: string) => {
    if (accessibilityConfig.screenReader.announceSuccess) {
      announce(`Success: ${message}`, 'POLITE');
    }
  }, [announce]);

  const announcePageChange = useCallback((pageName: string) => {
    if (accessibilityConfig.screenReader.announcePageChanges) {
      announce(`Navigated to ${pageName}`, 'POLITE');
    }
  }, [announce]);

  // Return the announcement ref and functions - JSX will be handled by components
  return {
    announce,
    announceError,
    announceSuccess,
    announcePageChange,
    announcementRef,
  };
}

// Keyboard Navigation Hook
export function useKeyboardNavigation(
  onKeyDown?: (event: KeyboardEvent) => void
) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case KEYBOARD_KEYS.ESCAPE: {
          // Close modals, dropdowns, etc.
          const activeElement = document.activeElement as HTMLElement;
          if (activeElement && activeElement.blur) {
            activeElement.blur();
          }
          break;
        }
        case KEYBOARD_KEYS.TAB: {
          // Ensure visible focus indicators
          document.body.classList.add('keyboard-navigation');
          break;
        }
        default:
          break;
      }

      onKeyDown?.(event);
    };

    const handleMouseDown = () => {
      // Remove keyboard navigation class when mouse is used
      document.body.classList.remove('keyboard-navigation');
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleMouseDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, [onKeyDown]);
}

// Focus Management Hook
export function useFocusManagement() {
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const saveFocus = useCallback(() => {
    previousFocusRef.current = document.activeElement as HTMLElement;
  }, []);

  const restoreFocus = useCallback(() => {
    if (previousFocusRef.current && typeof previousFocusRef.current.focus === 'function') {
      previousFocusRef.current.focus();
    }
  }, []);

  const focusFirst = useCallback((container: HTMLElement) => {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0] as HTMLElement;
    if (firstElement) {
      firstElement.focus();
    }
  }, []);

  const trapFocus = useCallback((container: HTMLElement) => {
    if (!accessibilityConfig.keyboardNavigation.trapFocus) return;

    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === KEYBOARD_KEYS.TAB) {
        if (event.shiftKey) {
          if (document.activeElement === firstElement) {
            event.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            event.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    container.addEventListener('keydown', handleKeyDown);
    return () => container.removeEventListener('keydown', handleKeyDown);
  }, []);

  return {
    saveFocus,
    restoreFocus,
    focusFirst,
    trapFocus,
  };
}

// Reduced Motion Hook
export function useReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    if (!accessibilityConfig.motion.respectReducedMotion) return;

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    mediaQuery.addListener(handleChange);
    return () => mediaQuery.removeListener(handleChange);
  }, []);

  return prefersReducedMotion;
}

// Skip Links Hook
export function useSkipLinks() {
  const skipLinksRef = useRef<HTMLElement[]>([]);

  const addSkipLink = useCallback((element: HTMLElement) => {
    if (!accessibilityConfig.keyboardNavigation.skipLinks) return;
    skipLinksRef.current.push(element);
  }, []);

  return {
    addSkipLink,
    skipLinksEnabled: accessibilityConfig.keyboardNavigation.skipLinks,
  };
}

// ARIA Attributes Hook
export function useAriaAttributes() {
  const generateId = useCallback((prefix: string = 'aria') => {
    return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  const describedBy = useCallback((ids: string[]) => {
    return ids.length > 0 ? ids.join(' ') : undefined;
  }, []);

  const labelledBy = useCallback((ids: string[]) => {
    return ids.length > 0 ? ids.join(' ') : undefined;
  }, []);

  const expanded = useCallback((isExpanded: boolean) => {
    return isExpanded.toString();
  }, []);

  const pressed = useCallback((isPressed: boolean) => {
    return isPressed.toString();
  }, []);

  const selected = useCallback((isSelected: boolean) => {
    return isSelected.toString();
  }, []);

  const invalid = useCallback((isInvalid: boolean) => {
    return isInvalid ? 'true' : undefined;
  }, []);

  return {
    generateId,
    describedBy,
    labelledBy,
    expanded,
    pressed,
    selected,
    invalid,
  };
}

// Accessibility Testing Hook (Development only)
export function useA11yTesting() {
  const [violations] = useState<any[]>([]);

  useEffect(() => {
    if (!import.meta.env.DEV) return;

    // In a real implementation, you would integrate with axe-core
    // For now, we'll just provide a placeholder
    const checkAccessibility = async () => {
      try {
        // Placeholder for axe-core integration
        console.log('A11y testing enabled in development mode');
      } catch (error) {
        console.error('Accessibility testing error:', error);
      }
    };

    checkAccessibility();
  }, []);

  return {
    violations,
    hasViolations: violations.length > 0,
  };
}