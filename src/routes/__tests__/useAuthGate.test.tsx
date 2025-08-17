import { describe, it, expect, beforeEach, afterEach, vi, type Mock } from "vitest";
import {
  MemoryRouter,
  Routes,
  Route,
  useLocation,
  type Location,
} from "react-router-dom";
import { render, within, cleanup } from "@testing-library/react";

import { useAuthGate } from "../useAuthGate";
import { ROUTES } from "../paths";

vi.mock("../../app/auth-store", () => ({
  useAuthLoading: vi.fn(),
  useIsAuthenticated: vi.fn(),
}));

// Access mocked hooks
import * as authStore from "../../app/auth-store";

function GateProbe() {
  const gate = useAuthGate({ requireAuth: true, redirectTo: ROUTES.LOGIN });
  if (gate.status === "loading") return <div data-testid="state">loading</div>;
  if (gate.status === "redirect") return gate.element!;
  return <div data-testid="state">ready</div>;
}

function LoginEcho() {
  const location = useLocation() as Location & {
    state: { from?: { pathname: string; search?: string; hash?: string } } | null;
  };
  const from = location.state?.from;
  const fromStr = from
    ? `${from.pathname}${from.search ?? ""}${from.hash ?? ""}`
    : "none";
  return <div data-testid="login">login from:{fromStr}</div>;
}

describe("useAuthGate", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  afterEach(() => {
    cleanup();
  });

  it("returns loading status while auth is loading", () => {
  (authStore.useAuthLoading as unknown as Mock).mockReturnValue(true);
  (authStore.useIsAuthenticated as unknown as Mock).mockReturnValue(false);

  const res = render(
      <MemoryRouter initialEntries={["/protected"]}>
        <Routes>
          <Route path="/protected" element={<GateProbe />} />
        </Routes>
      </MemoryRouter>
    );

  expect(res.getByTestId("state").textContent).toBe("loading");
  });

  it("redirects unauthenticated users and preserves from-state (pathname+search+hash)", async () => {
  (authStore.useAuthLoading as unknown as Mock).mockReturnValue(false);
  (authStore.useIsAuthenticated as unknown as Mock).mockReturnValue(false);

  const res = render(
      <MemoryRouter initialEntries={["/protected?x=1#h"]}>
        <Routes>
          <Route path="/protected" element={<GateProbe />} />
          <Route path={ROUTES.LOGIN} element={<LoginEcho />} />
        </Routes>
      </MemoryRouter>
    );

  const login = await within(res.container).findByTestId("login");
    expect(login.textContent).toContain("login from:/protected?x=1#h");
  });

  it("is ready when authenticated", () => {
  (authStore.useAuthLoading as unknown as Mock).mockReturnValue(false);
  (authStore.useIsAuthenticated as unknown as Mock).mockReturnValue(true);

  const res = render(
      <MemoryRouter initialEntries={["/protected"]}>
        <Routes>
          <Route path="/protected" element={<GateProbe />} />
        </Routes>
      </MemoryRouter>
    );

  expect(res.getByTestId("state").textContent).toBe("ready");
  });
});
