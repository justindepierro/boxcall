import { describe, it, expect, vi, beforeEach } from "vitest";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { render, screen, waitFor } from "@testing-library/react";
import { requireCoachOrAdminLoader } from "../loaderAuth";

function OK() {
  return <div>OK_TEMPLATES</div>;
}

// Mock supabase used in loader
const hoisted = vi.hoisted(() => ({
  userId: "u1" as string | null,
  role: "coach" as unknown,
}));

vi.mock("../../lib/supabase", () => ({
  supabase: {
    auth: {
      getUser: async () => ({ data: { user: hoisted.userId ? { id: hoisted.userId } : null } }),
    },
    from: (table: string) => ({
      select: () => ({
        eq: () => ({
          single: async () => {
            if (table === "profiles") return { data: { role: hoisted.role }, error: null };
            return { data: null, error: null };
          },
        }),
      }),
    }),
  },
}));

vi.mock("../authorize", () => {
  // Use the real authorize implementation (role check only path)
  const real = vi.importActual<typeof import("../authorize")>("../authorize");
  return real;
});

function renderWithRouter(path: string) {
  const router = createMemoryRouter(
    [
      { path: "/templates", loader: requireCoachOrAdminLoader, element: <OK /> },
      { path: "/login", element: <div>LOGIN</div> },
      { path: "/dashboard", element: <div>DASHBOARD</div> },
    ],
    { initialEntries: [path] }
  );
  return render(<RouterProvider router={router} />);
}

describe("requireCoachOrAdminLoader", () => {
  beforeEach(() => {
    hoisted.userId = "u1";
    hoisted.role = "coach";
  });

  it("allows coach", async () => {
    renderWithRouter("/templates");
    expect(await screen.findByText("OK_TEMPLATES")).toBeInTheDocument();
  });

  it("redirects unauthenticated to login", async () => {
    hoisted.userId = null;
    renderWithRouter("/templates");
    await waitFor(async () => {
      expect(await screen.findByText("LOGIN")).toBeInTheDocument();
    });
  });

  it("redirects non-allowed role to dashboard", async () => {
    hoisted.role = "player";
    renderWithRouter("/templates");
    await waitFor(async () => {
      expect(await screen.findByText("DASHBOARD")).toBeInTheDocument();
    });
  });
});
