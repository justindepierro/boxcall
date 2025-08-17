import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { render, screen, cleanup } from "@testing-library/react";

import { SubscriptionRoute } from "../SubscriptionRoute";
import { ROUTES } from "../paths";

// Hoisted mock result to allow per-test customization
type TeamRow = {
  subscription_tier: string | null;
  subscription_expires_at: string | null;
};
const mockResult = vi.hoisted(() => ({
  data: null as TeamRow | null,
  error: null as unknown,
}));

vi.mock("../../app/auth-store", () => ({
  useAuthLoading: () => false,
  useIsAuthenticated: () => true,
}));

vi.mock("../../lib/supabase", () => ({
  supabase: {
    from: () => ({
      select: () => ({
        eq: () => ({
          // The route under test calls .single()
          single: async () => mockResult,
        }),
      }),
    }),
  },
}));

describe("SubscriptionRoute", () => {
  beforeEach(() => {
    mockResult.data = null;
    mockResult.error = null;
  });
  afterEach(() => {
    cleanup();
  });

  it("denies access with wrong subscription tier", async () => {
    mockResult.data = {
      subscription_tier: "free",
      subscription_expires_at: null,
    };

    render(
      <MemoryRouter initialEntries={["/team/123/analytics"]}>
        <Routes>
          <Route
            path="/team/:teamId/analytics"
            element={
              <SubscriptionRoute requiredTiers={["team_premium"]}>
                <div data-testid="ok">OK</div>
              </SubscriptionRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    expect(
      await screen.findByRole("heading", { name: /Premium Feature/i })
    ).toBeInTheDocument();
    expect(screen.queryByTestId("ok")).toBeNull();
  });

  it("denies access when subscription is expired", async () => {
    const pastDate = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    mockResult.data = {
      subscription_tier: "team_premium",
      subscription_expires_at: pastDate,
    };

    render(
      <MemoryRouter initialEntries={["/team/123/analytics"]}>
        <Routes>
          <Route
            path="/team/:teamId/analytics"
            element={
              <SubscriptionRoute requiredTiers={["team_premium"]}>
                <div data-testid="ok">OK</div>
              </SubscriptionRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    expect(
      await screen.findByRole("heading", { name: /Subscription Expired/i })
    ).toBeInTheDocument();
    expect(screen.queryByTestId("ok")).toBeNull();
  });

  it("redirects to fallback when teamId is missing", async () => {
    mockResult.data = null; // won't be queried

    render(
      <MemoryRouter initialEntries={["/no-team"]}>
        <Routes>
          <Route
            path="/no-team"
            element={
              <SubscriptionRoute
                requiredTiers={["team_premium"]}
                fallbackTo={ROUTES.DASHBOARD}
              >
                <div data-testid="ok">OK</div>
              </SubscriptionRoute>
            }
          />
          <Route
            path={ROUTES.DASHBOARD}
            element={<div data-testid="dash">DASH</div>}
          />
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByTestId("dash")).toBeInTheDocument();
    expect(screen.queryByTestId("ok")).toBeNull();
  });
});
