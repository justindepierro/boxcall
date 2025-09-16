import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  createMemoryRouter,
  RouterProvider,
  type LoaderFunction,
} from "react-router-dom";
import { render, screen, waitFor } from "@testing-library/react";
import {
  requireAuthenticatedLoader,
  requireTeamMemberLoader,
} from "../loaderAuth";

function OK({ label }: { label: string }) {
  return <div>{label}</div>;
}

type Member = {
  role: "coach" | "admin" | "player";
  status: "active" | "invited" | "suspended";
};
const hoisted = vi.hoisted(() => ({
  userId: "u1" as string | null,
  role: "coach" as unknown,
  member: { role: "coach", status: "active" as const } as Member,
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

type TestRoute = { path: string; loader: LoaderFunction; label: string };
function renderWithRouter(path: string, route: TestRoute) {
  const router = createMemoryRouter(
    [
      {
        path: route.path,
        loader: route.loader,
        element: <OK label={route.label} />,
      },
      { path: "/login", element: <div>LOGIN</div> },
      { path: "/dashboard", element: <div>DASHBOARD</div> },
    ],
    { initialEntries: [path] }
  );
  return render(<RouterProvider router={router} />);
}

describe("basic loaders", () => {
  beforeEach(() => {
    hoisted.userId = "u1";
    hoisted.role = "coach";
    hoisted.member = { role: "coach", status: "active" };
  });

  it("requireAuthenticatedLoader allows authed user", async () => {
    renderWithRouter("/dashboard", {
      path: "/dashboard",
      loader: requireAuthenticatedLoader,
      label: "OK_AUTH",
    });
    expect(await screen.findByText("OK_AUTH")).toBeInTheDocument();
  });

  it("requireAuthenticatedLoader redirects unauthenticated to login", async () => {
    hoisted.userId = null;
    renderWithRouter("/dashboard", {
      path: "/dashboard",
      loader: requireAuthenticatedLoader,
      label: "OK_AUTH",
    });
    await waitFor(async () =>
      expect(await screen.findByText("LOGIN")).toBeInTheDocument()
    );
  });

  it("requireTeamMemberLoader allows team member", async () => {
    renderWithRouter("/team/t1/bulletin", {
      path: "/team/:teamId/bulletin",
      loader: requireTeamMemberLoader,
      label: "OK_TEAM",
    });
    expect(await screen.findByText("OK_TEAM")).toBeInTheDocument();
  });

  it("requireTeamMemberLoader redirects unauthenticated to login", async () => {
    hoisted.userId = null;
    renderWithRouter("/team/t1/bulletin", {
      path: "/team/:teamId/bulletin",
      loader: requireTeamMemberLoader,
      label: "OK_TEAM",
    });
    await waitFor(async () =>
      expect(await screen.findByText("LOGIN")).toBeInTheDocument()
    );
  });
});
