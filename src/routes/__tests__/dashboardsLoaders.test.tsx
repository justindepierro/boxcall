import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { render, screen, waitFor } from "@testing-library/react";
import { requireRolesLoader, requireCoachOrAdminLoader } from "../loaderAuth";

function CoachOK() {
  return <div>OK_COACH</div>;
}
function PlayerOK() {
  return <div>OK_PLAYER</div>;
}

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
    from: (table: string) => ({
      select: () => ({
        eq: () => ({
          single: async () => {
            if (table === "profiles")
              return { data: { role: hoisted.role }, error: null };
            return { data: null, error: null };
          },
        }),
      }),
    }),
  },
}));

vi.mock("../authorize", () => {
  const real = vi.importActual<typeof import("../authorize")>("../authorize");
  return real;
});

describe("dashboard role loaders", () => {
  beforeEach(() => {
    hoisted.userId = "u1";
    hoisted.role = "coach";
  });

  it("coach dashboard allows coach via requireCoachOrAdminLoader", async () => {
    const router = createMemoryRouter(
      [
        {
          path: "/coach",
          loader: requireCoachOrAdminLoader,
          element: <CoachOK />,
        },
        { path: "/login", element: <div>LOGIN</div> },
        { path: "/dashboard", element: <div>DASHBOARD</div> },
      ],
      { initialEntries: ["/coach"] }
    );
    render(<RouterProvider router={router} />);
    expect(await screen.findByText("OK_COACH")).toBeInTheDocument();
  });

  it("player loader denies coach and redirects dashboard", async () => {
    const requirePlayer = requireRolesLoader(["player"]);
    const router = createMemoryRouter(
      [
        { path: "/player", loader: requirePlayer, element: <PlayerOK /> },
        { path: "/login", element: <div>LOGIN</div> },
        { path: "/dashboard", element: <div>DASHBOARD</div> },
      ],
      { initialEntries: ["/player"] }
    );
    render(<RouterProvider router={router} />);
    await waitFor(async () => {
      expect(await screen.findByText("DASHBOARD")).toBeInTheDocument();
    });
  });

  it("player loader allows player", async () => {
    hoisted.role = "player";
    const requirePlayer = requireRolesLoader(["player"]);
    const router = createMemoryRouter(
      [
        { path: "/player", loader: requirePlayer, element: <PlayerOK /> },
        { path: "/login", element: <div>LOGIN</div> },
        { path: "/dashboard", element: <div>DASHBOARD</div> },
      ],
      { initialEntries: ["/player"] }
    );
    render(<RouterProvider router={router} />);
    expect(await screen.findByText("OK_PLAYER")).toBeInTheDocument();
  });
});
