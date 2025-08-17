import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { render, screen, cleanup } from "@testing-library/react";
import { SuperAdminRoute } from "../SuperAdminRoute";

vi.mock("../../app/auth-store", () => ({
  useIsAuthenticated: () => true,
  useAuthLoading: () => false,
  useAuthProfile: () => ({ id: "u1", role: "admin" }),
}));

const hoisted = vi.hoisted(() => ({ isSuper: false }));
vi.mock("../../lib/supabase", () => ({
  supabase: {
    from: () => ({
      select: () => ({
        eq: () => ({
          single: async () =>
            hoisted.isSuper
              ? { data: { admin_level: "super_admin" }, error: null }
              : { data: { admin_level: "user" }, error: null },
        }),
      }),
    }),
  },
}));

describe("SuperAdminRoute", () => {
  beforeEach(() => {
    hoisted.isSuper = false;
    cleanup();
  });

  it("denies when not super admin", async () => {
    render(
      <MemoryRouter initialEntries={["/protected"]}>
        <Routes>
          <Route
            path="/protected"
            element={
              <SuperAdminRoute>
                <div data-testid="ok">OK</div>
              </SuperAdminRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    );
    expect(await screen.findByRole("heading", { name: /Developer Access Only/i })).toBeInTheDocument();
    expect(screen.queryByTestId("ok")).toBeNull();
  });

  it("allows when super admin", async () => {
    hoisted.isSuper = true;
    render(
      <MemoryRouter initialEntries={["/protected"]}>
        <Routes>
          <Route
            path="/protected"
            element={
              <SuperAdminRoute>
                <div data-testid="ok">OK</div>
              </SuperAdminRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    );
    expect(await screen.findByTestId("ok")).toBeInTheDocument();
  });
});
