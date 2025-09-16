import { describe, it, expect, vi, beforeEach } from "vitest";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { render, screen, waitFor } from "@testing-library/react";
import { requireTeamAnalyticsLoader } from "../loaderAuth";

function OK() {
  return <div>ANALYTICS_OK</div>;
}

// Mock supabase used in loader
const hoisted = vi.hoisted(() => ({
  userId: "u1" as string | null,
  role: "coach" as unknown,
  tier: "team_premium" as string | null,
  member: { role: "coach", status: "active" as const } as {
    role: string;
    status: "active" | "inactive" | "pending" | null;
  } | null,
}));

vi.mock("../../lib/supabase", () => ({
  supabase: {
    auth: {
      getUser: async () => ({
        data: { user: hoisted.userId ? { id: hoisted.userId } : null },
      }),
    },
    from: (table: string) => ({
      select: () => {
        const chain = {
          eq: () => chain,
          single: async () => {
            if (table === "profiles")
              return { data: { role: hoisted.role }, error: null };
            if (table === "teams")
              return {
                data: {
                  subscription_tier: hoisted.tier,
                  subscription_expires_at: null,
                },
                error: null,
              };
            if (table === "team_members")
              return { data: hoisted.member, error: null };
            return { data: null, error: null };
          },
        } as const;
        return chain;
      },
    }),
  },
}));

vi.mock("../authorize", () => {
  // Use the real authorize implementation for tier logic; our supabase mock supplies data
  const real = vi.importActual<typeof import("../authorize")>("../authorize");
  return real;
});

function renderWithRouter(path: string) {
  const router = createMemoryRouter(
    [
      {
        path: "/team/:teamId/analytics",
        loader: requireTeamAnalyticsLoader,
        element: <OK />,
      },
      { path: "/login", element: <div>LOGIN</div> },
      { path: "/dashboard", element: <div>DASHBOARD</div> },
    ],
    { initialEntries: [path] }
  );
  return render(<RouterProvider router={router} />);
}

describe("requireTeamAnalyticsLoader", () => {
  beforeEach(() => {
    hoisted.userId = "u1";
    hoisted.role = "coach";
    hoisted.tier = "team_premium";
    hoisted.member = { role: "coach", status: "active" };
  });

  it("renders when authorized and tier satisfied", async () => {
    renderWithRouter("/team/t1/analytics");
    expect(await screen.findByText("ANALYTICS_OK")).toBeInTheDocument();
  });

  it("redirects to login when unauthenticated", async () => {
    hoisted.userId = null;
    renderWithRouter("/team/t1/analytics");
    await waitFor(async () => {
      expect(await screen.findByText("LOGIN")).toBeInTheDocument();
    });
  });

  it("redirects to dashboard when subscription tier missing", async () => {
    hoisted.tier = "free";
    renderWithRouter("/team/t1/analytics");
    await waitFor(async () => {
      expect(await screen.findByText("DASHBOARD")).toBeInTheDocument();
    });
  });
});
