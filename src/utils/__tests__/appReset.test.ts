import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { APP_RESET_EVENT, requestAppReset } from "../appReset";

describe("appReset", () => {
  const originalWindow = globalThis.window;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    // Restore window if a test stubs it.
    vi.unstubAllGlobals();
    // Ensure window is back even if unstub doesn’t restore (defensive).
    if (globalThis.window !== originalWindow) {
      // @ts-expect-error - test-only restore
      globalThis.window = originalWindow;
    }
  });

  it("dispatches the APP_RESET_EVENT with reason detail", () => {
    const dispatchSpy = vi.spyOn(window, "dispatchEvent");

    requestAppReset("unit-test");

    expect(dispatchSpy).toHaveBeenCalledTimes(1);

    const [event] = dispatchSpy.mock.calls[0];
    expect(event).toBeInstanceOf(CustomEvent);
    expect((event as CustomEvent).type).toBe(APP_RESET_EVENT);
    expect((event as CustomEvent).detail).toEqual({ reason: "unit-test" });
  });

  it("is a no-op when window is undefined (SSR-safe)", () => {
    vi.stubGlobal("window", undefined as any);

    expect(() => requestAppReset("ssr-test")).not.toThrow();
  });
});
