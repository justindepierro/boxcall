import { describe, expect, it } from "vitest";

import {
  createSameOriginRedirectTo,
  isSafeInternalRedirectPath,
} from "../redirectUtils";

describe("redirectUtils", () => {
  it("isSafeInternalRedirectPath rejects unsafe targets", () => {
    expect(isSafeInternalRedirectPath("http://evil.com" as any)).toBe(false);
    expect(isSafeInternalRedirectPath("//evil.com" as any)).toBe(false);
    expect(isSafeInternalRedirectPath("javascript:alert(1)" as any)).toBe(false);
    expect(isSafeInternalRedirectPath("/ok but space" as any)).toBe(false);
    expect(isSafeInternalRedirectPath("/bad\\path" as any)).toBe(false);
  });

  it("isSafeInternalRedirectPath allows internal paths", () => {
    expect(isSafeInternalRedirectPath("/invite/accept?token=abc")).toBe(true);
    expect(isSafeInternalRedirectPath("/reset-password")).toBe(true);
  });

  it("createSameOriginRedirectTo returns same-origin absolute URLs", () => {
    const url = createSameOriginRedirectTo("/reset-password");
    expect(url.startsWith(window.location.origin)).toBe(true);
    expect(url.endsWith("/reset-password")).toBe(true);
  });

  it("createSameOriginRedirectTo falls back for unsafe input", () => {
    const url = createSameOriginRedirectTo("//evil.com" as any);
    expect(url).toBe(`${window.location.origin}/`);
  });
});
