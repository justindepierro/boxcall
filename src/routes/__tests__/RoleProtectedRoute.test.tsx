import { describe, it, expect, vi } from "vitest";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { render, screen } from "@testing-library/react";
import { RoleProtectedRoute } from "../RoleProtectedRoute";

const mockProfile = vi.hoisted(() => ({ role: "player" as "player" | "coach" | "admin" }));
vi.mock("../../app/auth-store", () => ({
  useAuthProfile: () => ({ id: "u1", role: mockProfile.role }),
}));

vi.mock("../useAuthGate", () => ({
  useAuthGate: () => ({ status: "ok" }),
}));

describe("RoleProtectedRoute", () => {
  it("denies when role not allowed", async () => {
    render(
      <MemoryRouter initialEntries={["/protected"]}>
        <Routes>
          <Route
            path="/protected"
            element={
              <RoleProtectedRoute allowedRoles={["coach", "admin"]}>
                <div data-testid="ok">OK</div>
              </RoleProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    );
    expect(await screen.findByRole("heading", { name: /Access Denied/i })).toBeInTheDocument();
    expect(screen.queryByTestId("ok")).toBeNull();
  });

  it("allows when role is allowed", async () => {
    mockProfile.role = "coach";
    render(
      <MemoryRouter initialEntries={["/protected"]}>
        <Routes>
          <Route
            path="/protected"
            element={
              <RoleProtectedRoute allowedRoles={["coach", "admin"]}>
                <div data-testid="ok">OK</div>
              </RoleProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    );
    expect(await screen.findByTestId("ok")).toBeInTheDocument();
  });
});
