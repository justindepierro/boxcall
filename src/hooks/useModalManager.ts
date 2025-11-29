/**
 * useModalManager Hook
 * 
 * Centralized modal state management to replace 10+ boolean useState flags.
 * Prevents modal conflicts, simplifies state tracking, and ensures proper stacking.
 * 
 * @example
 * ```tsx
 * const { openModal, closeModal, closeAllModals, activeModal, isModalOpen } = useModalManager();
 * 
 * // Open a modal
 * openModal('addNewPlay');
 * 
 * // Check if specific modal is open
 * if (isModalOpen('addNewPlay')) { ... }
 * 
 * // Close current modal
 * closeModal();
 * 
 * // Close all modals (escape key, backdrop click)
 * closeAllModals();
 * ```
 */

import { useState, useCallback } from 'react';

export type ModalType =
  | 'addNewPlay'
  | 'playbookSettings'
  | 'personnel'
  | 'playbookHealth'
  | 'stats'
  | 'postToBulletin'
  | 'assignments'
  | 'keyboardShortcuts'
  | 'practiceScriptBuilder'
  | 'filters'
  | 'diagram'
  | null;

export interface ModalOptions {
  /** Data to pass to the modal */
  data?: any;
  /** Whether modal can be closed by clicking backdrop */
  closeOnBackdrop?: boolean;
  /** Whether modal can be closed by pressing Escape */
  closeOnEscape?: boolean;
  /** Callback when modal closes */
  onClose?: () => void;
}

interface ModalState {
  type: ModalType;
  options?: ModalOptions;
}

/**
 * Hook to manage modal state centrally
 * Replaces scattered useState(false) hooks throughout PlaybookPage
 */
export function useModalManager() {
  const [modalStack, setModalStack] = useState<ModalState[]>([]);

  const activeModal = modalStack[modalStack.length - 1]?.type ?? null;
  const activeOptions = modalStack[modalStack.length - 1]?.options;

  /**
   * Open a modal and add it to the stack
   * Supports modal stacking (e.g., open settings, then open personnel from settings)
   */
  const openModal = useCallback((type: Exclude<ModalType, null>, options?: ModalOptions) => {
    setModalStack((prev) => [...prev, { type, options }]);
  }, []);

  /**
   * Close the currently active modal
   * Removes from stack and calls onClose callback if provided
   */
  const closeModal = useCallback(() => {
    setModalStack((prev) => {
      if (prev.length === 0) return prev;
      
      const closing = prev[prev.length - 1];
      if (closing.options?.onClose) {
        closing.options.onClose();
      }
      
      return prev.slice(0, -1);
    });
  }, []);

  /**
   * Close all modals in the stack
   * Useful for escape key or critical errors
   */
  const closeAllModals = useCallback(() => {
    setModalStack((prev) => {
      // Call onClose for all modals being closed
      prev.forEach((modal) => {
        if (modal.options?.onClose) {
          modal.options.onClose();
        }
      });
      return [];
    });
  }, []);

  /**
   * Check if a specific modal is currently open
   */
  const isModalOpen = useCallback(
    (type: Exclude<ModalType, null>) => {
      return modalStack.some((modal) => modal.type === type);
    },
    [modalStack]
  );

  /**
   * Replace the current modal with a different one
   * Useful for modal flows (e.g., "Add Play" → "Configure Personnel")
   */
  const replaceModal = useCallback((type: Exclude<ModalType, null>, options?: ModalOptions) => {
    setModalStack((prev) => {
      if (prev.length === 0) {
        return [{ type, options }];
      }
      
      const closing = prev[prev.length - 1];
      if (closing.options?.onClose) {
        closing.options.onClose();
      }
      
      return [...prev.slice(0, -1), { type, options }];
    });
  }, []);

  return {
    /** Currently active modal (top of stack) */
    activeModal,
    /** Options for active modal */
    activeOptions,
    /** Open a modal */
    openModal,
    /** Close current modal */
    closeModal,
    /** Close all modals */
    closeAllModals,
    /** Check if specific modal is open */
    isModalOpen,
    /** Replace current modal with another */
    replaceModal,
    /** Number of modals in stack */
    modalCount: modalStack.length,
  };
}
