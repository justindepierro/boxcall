import { describe, expect, it, beforeEach, vi } from "vitest";

import {
  createLoginUrl,
  getLoginDestination,
  getReturnUrlFromQuery,
  isValidReturnUrl,
  saveReturnUrl,
  getAndClearReturnUrl,
} from "../navigationUtils";

// Minimal sessionStorage polyfill for predictable tests
const sessionStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

describe("navigationUtils", () => {
  beforeEach(() => {
    sessionStorageMock.clear();
    vi.stubGlobal("sessionStorage", sessionStorageMock as any);
  });

  it("rejects external/protocol URLs for returnUrl", () => {
    expect(isValidReturnUrl("http://evil.com" as any)).toBe(false);
    expect(isValidReturnUrl("https://evil.com" as any)).toBe(false);
    expect(isValidReturnUrl("javascript:alert(1)" as any)).toBe(false);
    expect(isValidReturnUrl("//evil.com" as any)).toBe(false);
  });

  it("accepts normal internal return URLs", () => {
    expect(isValidReturnUrl("/playbook")).toBe(true);
    expect(isValidReturnUrl("/playbook?x=1")).toBe(true);
  });

  it("getReturnUrlFromQuery returns null for unsafe URLs", () => {
    expect(getReturnUrlFromQuery("?returnUrl=https%3A%2F%2Fevil.com")).toBe(
      null
    );
    expect(getReturnUrlFromQuery("?returnUrl=%2F%2Fevil.com")).toBe(null);
  });

  it("createLoginUrl omits unsafe returnUrl", () => {
    expect(createLoginUrl("https://evil.com" as any)).toBe("/login");
    expect(createLoginUrl("//evil.com" as any)).toBe("/login");
  });

  it("saveReturnUrl does not store unsafe values", () => {
    saveReturnUrl("//evil.com" as any);
    expect(getAndClearReturnUrl("/dashboard")).toBe("/dashboard");
  });

  it("getLoginDestination prefers query returnUrl when safe", () => {
    expect(getLoginDestination("?returnUrl=%2Fplaybook", "/dashboard")).toBe(
      "/playbook"
    );
  });
});
