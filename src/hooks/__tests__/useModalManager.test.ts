import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useModalManager } from "../useModalManager";

describe("useModalManager", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Initial State", () => {
    it("should initialize with no active modal", () => {
      const { result } = renderHook(() => useModalManager());

      expect(result.current.activeModal).toBeNull();
      expect(result.current.activeOptions).toBeUndefined();
    });

    it("should have all required functions", () => {
      const { result } = renderHook(() => useModalManager());

      expect(result.current.openModal).toBeInstanceOf(Function);
      expect(result.current.closeModal).toBeInstanceOf(Function);
      expect(result.current.closeAllModals).toBeInstanceOf(Function);
      expect(result.current.isModalOpen).toBeInstanceOf(Function);
      expect(result.current.replaceModal).toBeInstanceOf(Function);
    });
  });

  describe("openModal", () => {
    it("should open a modal", () => {
      const { result } = renderHook(() => useModalManager());

      act(() => {
        result.current.openModal("addNewPlay");
      });

      expect(result.current.activeModal).toBe("addNewPlay");
    });

    it("should open modal with options", () => {
      const { result } = renderHook(() => useModalManager());
      const options = {
        data: { id: 123 },
        closeOnBackdrop: false,
      };

      act(() => {
        result.current.openModal("playbookSettings", options);
      });

      expect(result.current.activeModal).toBe("playbookSettings");
      expect(result.current.activeOptions).toEqual(options);
    });

    it("should support modal stacking", () => {
      const { result } = renderHook(() => useModalManager());

      act(() => {
        result.current.openModal("addNewPlay");
      });

      expect(result.current.activeModal).toBe("addNewPlay");

      act(() => {
        result.current.openModal("personnel");
      });

      expect(result.current.activeModal).toBe("personnel");
      expect(result.current.isModalOpen("addNewPlay")).toBe(true);
      expect(result.current.isModalOpen("personnel")).toBe(true);
    });
  });

  describe("closeModal", () => {
    it("should close the active modal", () => {
      const { result } = renderHook(() => useModalManager());

      act(() => {
        result.current.openModal("addNewPlay");
      });

      expect(result.current.activeModal).toBe("addNewPlay");

      act(() => {
        result.current.closeModal();
      });

      expect(result.current.activeModal).toBeNull();
    });

    it("should call onClose callback when closing", () => {
      const { result } = renderHook(() => useModalManager());
      const onClose = vi.fn();

      act(() => {
        result.current.openModal("playbookSettings", { onClose });
      });

      act(() => {
        result.current.closeModal();
      });

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("should handle closing from modal stack", () => {
      const { result } = renderHook(() => useModalManager());

      act(() => {
        result.current.openModal("addNewPlay");
        result.current.openModal("personnel");
      });

      expect(result.current.activeModal).toBe("personnel");

      act(() => {
        result.current.closeModal();
      });

      expect(result.current.activeModal).toBe("addNewPlay");

      act(() => {
        result.current.closeModal();
      });

      expect(result.current.activeModal).toBeNull();
    });

    it("should do nothing when no modals are open", () => {
      const { result } = renderHook(() => useModalManager());

      expect(() => {
        act(() => {
          result.current.closeModal();
        });
      }).not.toThrow();

      expect(result.current.activeModal).toBeNull();
    });
  });

  describe("closeAllModals", () => {
    it("should close all modals in the stack", () => {
      const { result } = renderHook(() => useModalManager());

      act(() => {
        result.current.openModal("addNewPlay");
        result.current.openModal("personnel");
        result.current.openModal("playbookSettings");
      });

      expect(result.current.activeModal).toBe("playbookSettings");

      act(() => {
        result.current.closeAllModals();
      });

      expect(result.current.activeModal).toBeNull();
      expect(result.current.isModalOpen("addNewPlay")).toBe(false);
      expect(result.current.isModalOpen("personnel")).toBe(false);
      expect(result.current.isModalOpen("playbookSettings")).toBe(false);
    });

    it("should call onClose for all modals", () => {
      const { result } = renderHook(() => useModalManager());
      const onClose1 = vi.fn();
      const onClose2 = vi.fn();
      const onClose3 = vi.fn();

      act(() => {
        result.current.openModal("addNewPlay", { onClose: onClose1 });
        result.current.openModal("personnel", { onClose: onClose2 });
        result.current.openModal("playbookSettings", { onClose: onClose3 });
      });

      act(() => {
        result.current.closeAllModals();
      });

      expect(onClose1).toHaveBeenCalledTimes(1);
      expect(onClose2).toHaveBeenCalledTimes(1);
      expect(onClose3).toHaveBeenCalledTimes(1);
    });
  });

  describe("isModalOpen", () => {
    it("should return true when modal is open", () => {
      const { result } = renderHook(() => useModalManager());

      act(() => {
        result.current.openModal("addNewPlay");
      });

      expect(result.current.isModalOpen("addNewPlay")).toBe(true);
    });

    it("should return false when modal is not open", () => {
      const { result } = renderHook(() => useModalManager());

      expect(result.current.isModalOpen("addNewPlay")).toBe(false);
    });

    it("should return true for modals in the stack", () => {
      const { result } = renderHook(() => useModalManager());

      act(() => {
        result.current.openModal("addNewPlay");
        result.current.openModal("personnel");
      });

      expect(result.current.isModalOpen("addNewPlay")).toBe(true);
      expect(result.current.isModalOpen("personnel")).toBe(true);
      expect(result.current.isModalOpen("playbookSettings")).toBe(false);
    });
  });

  describe("replaceModal", () => {
    it("should replace the current modal with a new one", () => {
      const { result } = renderHook(() => useModalManager());

      act(() => {
        result.current.openModal("addNewPlay");
      });

      expect(result.current.activeModal).toBe("addNewPlay");

      act(() => {
        result.current.replaceModal("personnel");
      });

      expect(result.current.activeModal).toBe("personnel");
      expect(result.current.isModalOpen("addNewPlay")).toBe(false);
      expect(result.current.isModalOpen("personnel")).toBe(true);
    });

    it("should call onClose of replaced modal", () => {
      const { result } = renderHook(() => useModalManager());
      const onClose = vi.fn();

      act(() => {
        result.current.openModal("addNewPlay", { onClose });
      });

      act(() => {
        result.current.replaceModal("personnel");
      });

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("should work when no modal is open", () => {
      const { result } = renderHook(() => useModalManager());

      act(() => {
        result.current.replaceModal("addNewPlay");
      });

      expect(result.current.activeModal).toBe("addNewPlay");
    });

    it("should preserve modal stack except for replaced modal", () => {
      const { result } = renderHook(() => useModalManager());

      act(() => {
        result.current.openModal("addNewPlay");
        result.current.openModal("personnel");
        result.current.openModal("playbookSettings");
      });

      act(() => {
        result.current.replaceModal("keyboardShortcuts");
      });

      expect(result.current.activeModal).toBe("keyboardShortcuts");
      expect(result.current.isModalOpen("addNewPlay")).toBe(true);
      expect(result.current.isModalOpen("personnel")).toBe(true);
      expect(result.current.isModalOpen("playbookSettings")).toBe(false);
    });
  });

  describe("Modal Options", () => {
    it("should preserve options data", () => {
      const { result } = renderHook(() => useModalManager());
      const data = { playId: 123, name: "Test Play" };

      act(() => {
        result.current.openModal("addNewPlay", { data });
      });

      expect(result.current.activeOptions?.data).toEqual(data);
    });

    it("should handle closeOnBackdrop option", () => {
      const { result } = renderHook(() => useModalManager());

      act(() => {
        result.current.openModal("addNewPlay", { closeOnBackdrop: false });
      });

      expect(result.current.activeOptions?.closeOnBackdrop).toBe(false);
    });

    it("should handle closeOnEscape option", () => {
      const { result } = renderHook(() => useModalManager());

      act(() => {
        result.current.openModal("addNewPlay", { closeOnEscape: true });
      });

      expect(result.current.activeOptions?.closeOnEscape).toBe(true);
    });
  });

  describe("Edge Cases", () => {
    it("should handle rapid open/close cycles", () => {
      const { result } = renderHook(() => useModalManager());

      act(() => {
        result.current.openModal("addNewPlay");
        result.current.closeModal();
        result.current.openModal("personnel");
        result.current.closeModal();
        result.current.openModal("playbookSettings");
      });

      expect(result.current.activeModal).toBe("playbookSettings");
    });

    it("should handle opening the same modal multiple times", () => {
      const { result } = renderHook(() => useModalManager());

      act(() => {
        result.current.openModal("addNewPlay");
        result.current.openModal("addNewPlay");
      });

      // Both instances should be in the stack
      expect(result.current.activeModal).toBe("addNewPlay");

      act(() => {
        result.current.closeModal();
      });

      expect(result.current.activeModal).toBe("addNewPlay");
    });
  });
});
