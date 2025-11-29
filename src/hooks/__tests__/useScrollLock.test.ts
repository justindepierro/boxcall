import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useScrollLock } from "../useScrollLock";

describe("useScrollLock", () => {
  let originalBodyStyle: CSSStyleDeclaration;
  let originalInnerWidth: number;
  let originalClientWidth: number;

  beforeEach(() => {
    vi.clearAllMocks();

    // Store original values
    originalBodyStyle = { ...document.body.style };
    originalInnerWidth = window.innerWidth;
    originalClientWidth = document.documentElement.clientWidth;

    // Reset body styles
    document.body.style.overflow = "";
    document.body.style.paddingRight = "";
    document.body.style.position = "";
    document.body.style.width = "";
  });

  afterEach(() => {
    // Restore original values
    document.body.style.overflow = originalBodyStyle.overflow || "";
    document.body.style.paddingRight = originalBodyStyle.paddingRight || "";
    document.body.style.position = originalBodyStyle.position || "";
    document.body.style.width = originalBodyStyle.width || "";
  });

  describe("Basic Functionality", () => {
    it("should lock scroll when isLocked is true", () => {
      renderHook(() => useScrollLock(true));

      expect(document.body.style.overflow).toBe("hidden");
      expect(document.body.style.position).toBe("fixed");
      expect(document.body.style.width).toBe("100%");
    });

    it("should not lock scroll when isLocked is false", () => {
      renderHook(() => useScrollLock(false));

      expect(document.body.style.overflow).toBe("");
      expect(document.body.style.position).toBe("");
    });

    it("should unlock scroll when unmounted", () => {
      const { unmount } = renderHook(() => useScrollLock(true));

      expect(document.body.style.overflow).toBe("hidden");

      unmount();

      expect(document.body.style.overflow).toBe("");
      expect(document.body.style.position).toBe("");
      expect(document.body.style.width).toBe("");
    });
  });

  describe("Scrollbar Width Compensation", () => {
    it("should add padding when scrollbar exists", () => {
      // Mock scrollbar width (innerWidth > clientWidth)
      Object.defineProperty(window, "innerWidth", {
        writable: true,
        configurable: true,
        value: 1024,
      });
      Object.defineProperty(document.documentElement, "clientWidth", {
        writable: true,
        configurable: true,
        value: 1008, // 16px scrollbar
      });

      renderHook(() => useScrollLock(true));

      expect(document.body.style.paddingRight).toBe("16px");
    });

    it("should not add padding when no scrollbar", () => {
      // Mock no scrollbar (innerWidth === clientWidth)
      Object.defineProperty(window, "innerWidth", {
        writable: true,
        configurable: true,
        value: 1024,
      });
      Object.defineProperty(document.documentElement, "clientWidth", {
        writable: true,
        configurable: true,
        value: 1024,
      });

      renderHook(() => useScrollLock(true));

      expect(document.body.style.paddingRight).toBe("");
    });
  });

  describe("Nested Locks (Modal Stacking)", () => {
    it("should maintain lock when multiple locks exist", () => {
      const { unmount: unmount1 } = renderHook(() => useScrollLock(true));
      const { unmount: unmount2 } = renderHook(() => useScrollLock(true));

      expect(document.body.style.overflow).toBe("hidden");

      // Unmount first lock - should still be locked
      unmount1();
      expect(document.body.style.overflow).toBe("hidden");

      // Unmount second lock - should now unlock
      unmount2();
      expect(document.body.style.overflow).toBe("");
    });

    it("should handle three nested locks", () => {
      const { unmount: unmount1 } = renderHook(() => useScrollLock(true));
      const { unmount: unmount2 } = renderHook(() => useScrollLock(true));
      const { unmount: unmount3 } = renderHook(() => useScrollLock(true));

      expect(document.body.style.overflow).toBe("hidden");

      unmount1();
      expect(document.body.style.overflow).toBe("hidden");

      unmount2();
      expect(document.body.style.overflow).toBe("hidden");

      unmount3();
      expect(document.body.style.overflow).toBe("");
    });

    it("should handle locks in any order", () => {
      const { unmount: unmount1 } = renderHook(() => useScrollLock(true));
      const { unmount: unmount2 } = renderHook(() => useScrollLock(true));
      const { unmount: unmount3 } = renderHook(() => useScrollLock(true));

      // Unmount middle lock first
      unmount2();
      expect(document.body.style.overflow).toBe("hidden");

      // Unmount first lock
      unmount1();
      expect(document.body.style.overflow).toBe("hidden");

      // Unmount last lock
      unmount3();
      expect(document.body.style.overflow).toBe("");
    });
  });

  describe("Dynamic Lock State", () => {
    it("should lock when isLocked changes from false to true", () => {
      const { rerender } = renderHook(({ locked }) => useScrollLock(locked), {
        initialProps: { locked: false },
      });

      expect(document.body.style.overflow).toBe("");

      rerender({ locked: true });

      expect(document.body.style.overflow).toBe("hidden");
    });

    it("should unlock when isLocked changes from true to false", () => {
      const { rerender } = renderHook(({ locked }) => useScrollLock(locked), {
        initialProps: { locked: true },
      });

      expect(document.body.style.overflow).toBe("hidden");

      rerender({ locked: false });

      expect(document.body.style.overflow).toBe("");
    });

    it("should handle rapid toggle changes", () => {
      const { rerender } = renderHook(({ locked }) => useScrollLock(locked), {
        initialProps: { locked: false },
      });

      rerender({ locked: true });
      expect(document.body.style.overflow).toBe("hidden");

      rerender({ locked: false });
      expect(document.body.style.overflow).toBe("");

      rerender({ locked: true });
      expect(document.body.style.overflow).toBe("hidden");

      rerender({ locked: false });
      expect(document.body.style.overflow).toBe("");
    });
  });

  describe("Original Style Preservation", () => {
    it("should restore original overflow style", () => {
      document.body.style.overflow = "auto";

      const { unmount } = renderHook(() => useScrollLock(true));

      expect(document.body.style.overflow).toBe("hidden");

      unmount();

      expect(document.body.style.overflow).toBe("auto");
    });

    it("should restore original padding", () => {
      document.body.style.paddingRight = "20px";

      Object.defineProperty(window, "innerWidth", {
        writable: true,
        configurable: true,
        value: 1024,
      });
      Object.defineProperty(document.documentElement, "clientWidth", {
        writable: true,
        configurable: true,
        value: 1008,
      });

      const { unmount } = renderHook(() => useScrollLock(true));

      expect(document.body.style.paddingRight).toBe("16px");

      unmount();

      expect(document.body.style.paddingRight).toBe("20px");
    });
  });

  describe("iOS Safari Specific", () => {
    it("should set position fixed for iOS", () => {
      renderHook(() => useScrollLock(true));

      expect(document.body.style.position).toBe("fixed");
    });

    it("should set width to 100% for iOS", () => {
      renderHook(() => useScrollLock(true));

      expect(document.body.style.width).toBe("100%");
    });

    it("should clear position on unlock", () => {
      document.body.style.position = "relative";

      const { unmount } = renderHook(() => useScrollLock(true));

      expect(document.body.style.position).toBe("fixed");

      unmount();

      // Position is intentionally cleared to empty string, not restored
      expect(document.body.style.position).toBe("");
    });
  });

  describe("Edge Cases", () => {
    it("should handle mounting with isLocked=false", () => {
      const { unmount } = renderHook(() => useScrollLock(false));

      expect(document.body.style.overflow).toBe("");

      unmount();

      expect(document.body.style.overflow).toBe("");
    });

    it("should handle multiple mounts and unmounts", () => {
      const hook1 = renderHook(() => useScrollLock(true));
      expect(document.body.style.overflow).toBe("hidden");

      const hook2 = renderHook(() => useScrollLock(true));
      expect(document.body.style.overflow).toBe("hidden");

      hook1.unmount();
      expect(document.body.style.overflow).toBe("hidden");

      hook2.unmount();
      expect(document.body.style.overflow).toBe("");

      const hook3 = renderHook(() => useScrollLock(true));
      expect(document.body.style.overflow).toBe("hidden");

      hook3.unmount();
      expect(document.body.style.overflow).toBe("");
    });
  });
});
