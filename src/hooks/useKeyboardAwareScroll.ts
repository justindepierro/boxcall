import { useEffect, useRef } from "react";

/**
 * useKeyboardAwareScroll Hook
 *
 * Automatically scrolls focused inputs into view when keyboard appears on mobile.
 * Handles both iOS and Android keyboard behaviors.
 *
 * Usage:
 * ```tsx
 * const inputRef = useRef<HTMLInputElement>(null);
 * useKeyboardAwareScroll(inputRef);
 * ```
 *
 * Features:
 * - Auto-scrolls input into view when focused
 * - Accounts for keyboard height (estimated)
 * - Smooth scrolling animation
 * - No-op on desktop (< 768px only)
 *
 * @param inputRef - Ref to the input element to scroll into view
 * @param offset - Additional offset from top (default: 100px for header/toolbar)
 */
export function useKeyboardAwareScroll(
  inputRef: React.RefObject<HTMLElement | null>,
  offset = 100
): void {
  useEffect(() => {
    const input = inputRef.current;
    if (!input) return;

    // Only apply on mobile devices
    const isMobile = window.innerWidth < 768;
    if (!isMobile) return;

    const handleFocus = () => {
      // Delay to let keyboard animation start
      setTimeout(() => {
        const rect = input.getBoundingClientRect();
        const viewportHeight =
          window.visualViewport?.height || window.innerHeight;

        // Check if input is hidden by keyboard (estimated keyboard height: 300-350px)
        const keyboardHeight = 300;
        const isHiddenByKeyboard =
          rect.bottom > viewportHeight - keyboardHeight;

        if (isHiddenByKeyboard) {
          // Calculate scroll position to center input in visible viewport
          const scrollTop = window.scrollY + rect.top - offset;

          window.scrollTo({
            top: scrollTop,
            behavior: "smooth",
          });
        }
      }, 300); // Wait for keyboard animation
    };

    input.addEventListener("focus", handleFocus);

    return () => {
      input.removeEventListener("focus", handleFocus);
    };
  }, [inputRef, offset]);
}

/**
 * useModalKeyboardPadding Hook
 *
 * Adds safe bottom padding to modal content when keyboard is visible.
 * Uses env(safe-area-inset-bottom) for iOS notch/keyboard support.
 *
 * Usage:
 * ```tsx
 * const contentRef = useRef<HTMLDivElement>(null);
 * useModalKeyboardPadding(contentRef);
 * ```
 *
 * CSS Requirements:
 * - Container must have: `padding-bottom: env(safe-area-inset-bottom, 0px)`
 * - Viewport meta tag must include: `viewport-fit=cover`
 *
 * @param containerRef - Ref to the modal content container
 */
export function useModalKeyboardPadding(
  containerRef: React.RefObject<HTMLElement | null>
): void {
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Only apply on mobile devices
    const isMobile = window.innerWidth < 768;
    if (!isMobile) return;

    // Listen for visual viewport changes (keyboard show/hide)
    const handleResize = () => {
      if (!window.visualViewport) return;

      const viewportHeight = window.visualViewport.height;
      const windowHeight = window.innerHeight;

      // Keyboard is visible if viewport height is significantly smaller
      const isKeyboardVisible = windowHeight - viewportHeight > 100;

      if (isKeyboardVisible) {
        // Add extra padding when keyboard is visible (beyond safe area)
        const keyboardHeight = windowHeight - viewportHeight;
        container.style.paddingBottom = `calc(env(safe-area-inset-bottom, 0px) + ${keyboardHeight}px)`;
      } else {
        // Reset to just safe area padding
        container.style.paddingBottom = "env(safe-area-inset-bottom, 0px)";
      }
    };

    // Initial check
    handleResize();

    // Listen for viewport resize (keyboard show/hide)
    window.visualViewport?.addEventListener("resize", handleResize);

    return () => {
      window.visualViewport?.removeEventListener("resize", handleResize);

      // Cleanup padding on unmount
      if (container) {
        container.style.paddingBottom = "";
      }
    };
  }, [containerRef]);
}

/**
 * useFocusVisible Hook
 *
 * Tracks which input is currently focused for accessibility and styling.
 *
 * Usage:
 * ```tsx
 * const { focusedId, handleFocus, handleBlur } = useFocusVisible();
 *
 * <input
 *   onFocus={() => handleFocus('input-1')}
 *   onBlur={handleBlur}
 *   className={focusedId === 'input-1' ? 'ring-2' : ''}
 * />
 * ```
 *
 * @returns Object with focusedId, handleFocus, and handleBlur functions
 */
export function useFocusVisible(): {
  focusedId: string | null;
  handleFocus: (id: string) => void;
  handleBlur: () => void;
} {
  const focusedId = useRef<string | null>(null);

  const handleFocus = (id: string) => {
    focusedId.current = id;
  };

  const handleBlur = () => {
    focusedId.current = null;
  };

  return {
    focusedId: focusedId.current,
    handleFocus,
    handleBlur,
  };
}
