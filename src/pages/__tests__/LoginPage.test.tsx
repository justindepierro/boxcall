import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import React from "react";
import LoginPage from "../LoginPage";
import { useAuth } from "../../app/auth-store";
import { ROUTES } from "../../routes/paths";

// Mock the auth store
vi.mock("../../app/auth-store", () => ({
  useAuth: vi.fn(),
}));

// Mock navigation utilities
vi.mock("../../utils/navigationUtils", () => ({
  getLoginDestination: vi.fn(),
}));

// Mock logger
vi.mock("../../utils/logger", () => ({
  auth: vi.fn(),
}));

// Mock components
vi.mock("../../components/ui/Auth/ProgressiveAuthFlow", () => ({
  ProgressiveAuthFlow: ({ onSuccess }: { onSuccess: () => void }) => (
    <div data-testid="progressive-auth-flow">
      <button onClick={onSuccess} data-testid="login-success-button">
        Login Success
      </button>
    </div>
  ),
}));

vi.mock("../../components/layout/PageLayout", () => ({
  PageLayout: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="page-layout">{children}</div>
  ),
}));

vi.mock("../../components/ui/Aurora", () => ({
  Aurora: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="aurora">{children}</div>
  ),
}));

const mockUseAuth = vi.mocked(useAuth);
const mockNavigate = vi.fn();
const mockGetLoginDestination = vi.mocked(
  await import("../../utils/navigationUtils")
).getLoginDestination;

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ search: "" }),
  };
});

describe("LoginPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear();
  });

  it("shows loading state when auth is loading", () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: true,
      isAuthenticated: false,
      error: null,
    });

    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );

    // Should render nothing while loading
    expect(
      screen.queryByTestId("progressive-auth-flow")
    ).not.toBeInTheDocument();
  });

  it("redirects authenticated user to dashboard", async () => {
    const mockUser = { id: "1", email: "test@example.com", name: "Test User" };
    mockUseAuth.mockReturnValue({
      user: mockUser,
      loading: false,
      isAuthenticated: true,
      error: null,
    });

    mockGetLoginDestination.mockReturnValue(ROUTES.DASHBOARD);

    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(ROUTES.DASHBOARD, {
        replace: true,
      });
    });
  });

  it("redirects authenticated user to intended destination from URL params", async () => {
    const mockUser = { id: "1", email: "test@example.com", name: "Test User" };
    mockUseAuth.mockReturnValue({
      user: mockUser,
      loading: false,
      isAuthenticated: true,
      error: null,
    });

    mockGetLoginDestination.mockReturnValue("/intended-destination");

    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/intended-destination", {
        replace: true,
      });
    });
  });

  it("renders login form for unauthenticated user", () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: false,
      isAuthenticated: false,
      error: null,
    });

    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );

    // LoginPage renders ProgressiveAuthFlow directly without PageLayout/Aurora wrappers
    expect(screen.getByTestId("progressive-auth-flow")).toBeInTheDocument();
  });

  it("handles login success and navigates to destination", async () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: false,
      isAuthenticated: false,
      error: null,
    });

    mockGetLoginDestination.mockReturnValue(ROUTES.DASHBOARD);

    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );

    const loginButtons = screen.getAllByTestId("login-success-button");
    const loginButton = loginButtons[0]; // Use the first one
    loginButton.click();

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(ROUTES.DASHBOARD, {
        replace: true,
      });
    });
  });

  it("does not render anything when user is authenticated", async () => {
    const mockUser = { id: "1", email: "test@example.com", name: "Test User" };
    mockUseAuth.mockReturnValue({
      user: mockUser,
      loading: false,
      isAuthenticated: true,
      error: null,
    });

    mockGetLoginDestination.mockReturnValue(ROUTES.DASHBOARD);

    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );

    // Should redirect authenticated users immediately
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(ROUTES.DASHBOARD, {
        replace: true,
      });
    });
  });
});
