import { describe, it, expect, vi, beforeEach } from "vitest";

import { mockFromChain } from "../../test/mocks/supabaseMock";

// Keep redirects easy to assert in unit tests.
vi.mock("react-router-dom", () => ({
  redirect: (to: string) => ({ __redirect: true, to }),
}));

// Hoist-safe Supabase mock: factory contains the full object.
vi.mock("../../lib/supabase", () => ({
  supabase: {
    auth: {
      getUser: vi.fn(),
    },
    from: vi.fn(),
  },
}));

import { supabase } from "../../lib/supabase";
import { ROUTES } from "../paths";
import { getCurrentUserWithRole, requireAuthenticatedLoader } from "../loaderAuth";

describe("loaderAuth", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("getCurrentUserWithRole returns null when unauthenticated", async () => {
    (supabase.auth.getUser as any).mockResolvedValue({ data: { user: null } });

    await expect(getCurrentUserWithRole()).resolves.toBeNull();
  });

  it("getCurrentUserWithRole returns id/role/email (profile overrides email)", async () => {
    (supabase.auth.getUser as any).mockResolvedValue({
      data: { user: { id: "u1", email: "auth@email.com" } },
    });

    mockFromChain(
      supabase as any,
      "profiles",
      [
        { method: "select" },
        { method: "eq" },
        { method: "maybeSingle" },
      ],
      { data: { role: "coach", email: "profile@email.com" }, error: null }
    );

    await expect(getCurrentUserWithRole()).resolves.toEqual({
      id: "u1",
      role: "coach",
      email: "profile@email.com",
    });
  });

  it("requireAuthenticatedLoader throws redirect to login when unauthenticated", async () => {
    (supabase.auth.getUser as any).mockResolvedValue({ data: { user: null } });

    await expect(requireAuthenticatedLoader()).rejects.toEqual({
      __redirect: true,
      to: ROUTES.LOGIN,
    });
  });

  it("requireAuthenticatedLoader resolves when authenticated", async () => {
    (supabase.auth.getUser as any).mockResolvedValue({
      data: { user: { id: "u1", email: "auth@email.com" } },
    });

    mockFromChain(
      supabase as any,
      "profiles",
      [
        { method: "select" },
        { method: "eq" },
        { method: "maybeSingle" },
      ],
      { data: { role: "coach", email: null }, error: null }
    );

    await expect(requireAuthenticatedLoader()).resolves.toBeNull();
  });
});
