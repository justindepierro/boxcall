import { describe, it, expect, vi, beforeEach } from "vitest";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { requireTeamCoachLoader } from "../loaderAuth";

// Minimal component to render when loader passes
function OK() {
  return <div>OK</div>;
}

// Mock supabase and authorize dependencies used in loader
const hoisted = vi.hoisted(() => ({
  userId: "u1" as string | null,
  role: "coach" as unknown,
}));

vi.mock("../../lib/supabase", () => ({
  supabase: {
    auth: {
      getUser: async () => ({
        data: { user: hoisted.userId ? { id: hoisted.userId } : null },
      }),
    },
    from: (_table: string) => ({
      select: () => ({
        eq: () => ({
          single: async () => ({ data: { role: hoisted.role }, error: null }),
        }),
      }),
    }),
  },
}));

vi.mock("../authorize", () => {
  return {
    authorize: vi.fn(
      async ({ profile }: { profile: { id?: string | null } | null }) => {
        if (!profile?.id)
          return { allowed: false, reason: "unauthenticated" as const };
        const ok = hoisted.role === "coach" || hoisted.role === "admin";
        return { allowed: ok };
      }
    ),
  };
});

// Helper to render a memory router route with the loader
function renderWithRouter(path: string) {
  const router = createMemoryRouter(
    [
      {
        path: "/team/:teamId/settings",
        loader: requireTeamCoachLoader,
        element: <OK />,
      },
      {
        path: "/login",
        element: <div>LOGIN</div>,
      },
      {
        path: "/dashboard",
        element: <div>DASHBOARD</div>,
      },
    ],
    { initialEntries: [path] }
  );
  return render(<RouterProvider router={router} />);
}

describe("requireTeamCoachLoader", () => {
  beforeEach(() => {
    hoisted.userId = "u1";
    hoisted.role = "coach";
  });

  it("renders element when authorized", async () => {
    renderWithRouter("/team/t1/settings");
    expect(await screen.findByText("OK")).toBeInTheDocument();
  });

  it("redirects to login when unauthenticated", async () => {
    hoisted.userId = null;
    renderWithRouter("/team/t1/settings");
    await waitFor(async () => {
      expect(await screen.findByText("LOGIN")).toBeInTheDocument();
    });
  });
});
