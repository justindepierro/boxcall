/**
 * useScrollLock Hook
 *
 * Prevents body scroll when modals/overlays are open.
 * Handles iOS safari quirks, maintains scroll position, and supports nested locks.
 *
 * @example
 * ```tsx
 * function Modal({ isOpen }) {
 *   useScrollLock(isOpen);
 *
 *   return isOpen ? <div>Modal content</div> : null;
 * }
 * ```
 */

import { useEffect, useRef } from "react";

let lockCount = 0;
let originalOverflow = "";
let originalPaddingRight = "";

/**
 * Lock body scroll when active, restore when inactive
 * Supports multiple concurrent locks (nested modals)
 */
export function useScrollLock(isLocked: boolean) {
  const isLockedRef = useRef(isLocked);

  useEffect(() => {
    isLockedRef.current = isLocked;
  }, [isLocked]);

  useEffect(() => {
    if (!isLockedRef.current) return;

    // Get scrollbar width to prevent layout shift
    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;

    // First lock - store original values
    if (lockCount === 0) {
      originalOverflow = document.body.style.overflow;
      originalPaddingRight = document.body.style.paddingRight;

      // Lock scroll
      document.body.style.overflow = "hidden";

      // Prevent layout shift by adding padding equal to scrollbar width
      if (scrollbarWidth > 0) {
        document.body.style.paddingRight = `${scrollbarWidth}px`;
      }

      // iOS Safari specific: prevent elastic scrolling
      document.body.style.position = "fixed";
      document.body.style.width = "100%";
    }

    lockCount++;

    return () => {
      lockCount--;

      // Last lock removed - restore original values
      if (lockCount === 0) {
        document.body.style.overflow = originalOverflow;
        document.body.style.paddingRight = originalPaddingRight;
        document.body.style.position = "";
        document.body.style.width = "";
      }
    };
  }, [isLocked]);
}

/**
 * Alternative: Hook that returns lock/unlock functions for manual control
 * Useful when you need to programmatically control scroll lock
 */
export function useScrollLockManager() {
  const lock = () => {
    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;

    if (lockCount === 0) {
      originalOverflow = document.body.style.overflow;
      originalPaddingRight = document.body.style.paddingRight;

      document.body.style.overflow = "hidden";

      if (scrollbarWidth > 0) {
        document.body.style.paddingRight = `${scrollbarWidth}px`;
      }

      document.body.style.position = "fixed";
      document.body.style.width = "100%";
    }

    lockCount++;
  };

  const unlock = () => {
    lockCount--;

    if (lockCount === 0) {
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = originalPaddingRight;
      document.body.style.position = "";
      document.body.style.width = "";
    }
  };

  return { lock, unlock, isLocked: lockCount > 0 };
}
