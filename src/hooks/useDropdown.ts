import { useEffect, useRef, useState, useCallback } from 'react';

/**
 * Dropdown Configuration Options
 */
export interface UseDropdownOptions {
  /**
   * Close dropdown when clicking an item
   * @default true
   */
  closeOnItemClick?: boolean;

  /**
   * Close dropdown when clicking outside
   * @default true
   */
  closeOnOutsideClick?: boolean;

  /**
   * Close dropdown when pressing Escape
   * @default true
   */
  closeOnEscape?: boolean;

  /**
   * Delay before closing on blur (prevents race conditions)
   * @default 150
   */
  closeDelay?: number;

  /**
   * Callback when dropdown opens
   */
  onOpen?: () => void;

  /**
   * Callback when dropdown closes
   */
  onClose?: () => void;

  /**
   * Initial open state
   * @default false
   */
  defaultOpen?: boolean;

  /**
   * Controlled open state
   */
  isOpen?: boolean;

  /**
   * Controlled open state setter
   */
  onOpenChange?: (isOpen: boolean) => void;
}

/**
 * Dropdown Hook Return Value
 */
export interface UseDropdownReturn {
  /** Whether the dropdown is currently open */
  isOpen: boolean;
  
  /** Open the dropdown */
  open: () => void;
  
  /** Close the dropdown */
  close: () => void;
  
  /** Toggle the dropdown open/closed */
  toggle: () => void;
  
  /** Ref to attach to the trigger element */
  triggerRef: React.RefObject<HTMLElement | null>;
  
  /** Ref to attach to the dropdown content */
  contentRef: React.RefObject<HTMLElement | null>;
  
  /** Props to spread on trigger element */
  triggerProps: {
    ref: React.RefObject<HTMLElement | null>;
    onClick: () => void;
    onKeyDown: (e: React.KeyboardEvent) => void;
    'aria-expanded': boolean;
    'aria-haspopup': true;
  };
  
  /** Props to spread on content element */
  contentProps: {
    ref: React.RefObject<HTMLElement | null>;
    role: 'menu';
    'aria-hidden': boolean;
  };
}

/**
 * Universal Dropdown Hook
 * 
 * Handles all dropdown logic consistently:
 * - Click outside to close
 * - Escape key to close
 * - Keyboard navigation
 * - Focus management
 * - Race condition prevention
 * 
 * @example
 * ```tsx
 * function MyDropdown() {
 *   const { isOpen, toggle, triggerRef, contentRef, close } = useDropdown();
 * 
 *   return (
 *     <div className="relative">
 *       <button ref={triggerRef} onClick={toggle}>
 *         Open Menu
 *       </button>
 *       
 *       {isOpen && (
 *         <div ref={contentRef} className="absolute top-full z-50">
 *           <button onClick={() => { doSomething(); close(); }}>
 *             Menu Item
 *           </button>
 *         </div>
 *       )}
 *     </div>
 *   );
 * }
 * ```
 */
export function useDropdown(options: UseDropdownOptions = {}): UseDropdownReturn {
  const {
    closeOnOutsideClick = true,
    closeOnEscape = true,
    onOpen,
    onClose,
    defaultOpen = false,
    isOpen: controlledIsOpen,
    onOpenChange,
  } = options;

  // State management (controlled or uncontrolled)
  const [uncontrolledIsOpen, setUncontrolledIsOpen] = useState(defaultOpen);
  const isControlled = controlledIsOpen !== undefined;
  const isOpen = isControlled ? controlledIsOpen : uncontrolledIsOpen;

  // Refs
  const triggerRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLElement>(null);

  // Set open state
  const setIsOpen = useCallback(
    (newIsOpen: boolean) => {
      if (isControlled) {
        onOpenChange?.(newIsOpen);
      } else {
        setUncontrolledIsOpen(newIsOpen);
      }

      // Call callbacks
      if (newIsOpen) {
        onOpen?.();
      } else {
        onClose?.();
      }
    },
    [isControlled, onOpenChange, onOpen, onClose]
  );

  // Control functions
  const open = useCallback(() => setIsOpen(true), [setIsOpen]);
  const close = useCallback(() => {
    setIsOpen(false);
  }, [setIsOpen]);

  const toggle = useCallback(() => {
    setIsOpen(!isOpen);
  }, [isOpen, setIsOpen]);

  // Click outside handler
  useEffect(() => {
    if (!isOpen || !closeOnOutsideClick) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      
      // Check if click is inside trigger or content
      if (
        triggerRef.current?.contains(target) ||
        contentRef.current?.contains(target)
      ) {
        return;
      }

      // Click was outside - close dropdown
      setIsOpen(false);
    };

    // Add listener after a microtask to avoid race conditions
    // This ensures onClick handlers fire before this listener
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 0);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, closeOnOutsideClick, setIsOpen]);

  // Escape key handler
  useEffect(() => {
    if (!isOpen || !closeOnEscape) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        // Return focus to trigger
        triggerRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, closeOnEscape, setIsOpen]);

  // Props to spread on elements
  const triggerProps = {
    ref: triggerRef,
    onClick: toggle,
    onKeyDown: (e: React.KeyboardEvent) => {
      // Space or Enter to open
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        toggle();
      }
      // Arrow down to open and focus first item
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        open();
        // Focus first item after dropdown renders
        setTimeout(() => {
          const firstItem = contentRef.current?.querySelector('[role="menuitem"]') as HTMLElement;
          firstItem?.focus();
        }, 0);
      }
    },
    'aria-expanded': isOpen,
    'aria-haspopup': true as const,
  };

  const contentProps = {
    ref: contentRef,
    role: 'menu' as const,
    'aria-hidden': !isOpen,
  };

  return {
    isOpen,
    open,
    close,
    toggle,
    triggerRef,
    contentRef,
    triggerProps,
    contentProps,
  };
}

/**
 * Helper: Delayed close for onBlur events
 * 
 * Use this when you need to close on blur but want to prevent
 * race conditions with onClick handlers.
 * 
 * @example
 * ```tsx
 * <input
 *   onBlur={delayedClose(close, 150)}
 *   ...
 * />
 * ```
 */
export function delayedClose(
  closeFunction: () => void,
  delay: number = 150
): () => void {
  return () => {
    setTimeout(closeFunction, delay);
  };
}
