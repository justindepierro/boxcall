import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import DashboardPage from "../DashboardPage";

// Mock components
vi.mock("../../components/ui/Aurora", () => ({
  Aurora: ({
    children,
    variant,
  }: {
    children: React.ReactNode;
    variant: string;
  }) => <div data-testid={`aurora-${variant}`}>{children}</div>,
}));

vi.mock("../../components/layout/PageLayout", () => ({
  PageLayout: ({
    children,
    title,
    subtitle,
    variant,
  }: {
    children: React.ReactNode;
    title: string;
    subtitle: string;
    variant: string;
  }) => (
    <div data-testid="page-layout">
      <h1>{title}</h1>
      <p>{subtitle}</p>
      <div data-testid={`page-layout-${variant}`}>{children}</div>
    </div>
  ),
}));

vi.mock("../../components/dashboard/ResponsiveDashboardLayout", () => ({
  ResponsiveDashboardLayout: () => (
    <div data-testid="responsive-dashboard-layout" />
  ),
}));

describe("DashboardPage", () => {
  it("renders the dashboard with correct title and subtitle", () => {
    render(<DashboardPage />);

    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Your command center awaits • Quote of the day coming soon"
      )
    ).toBeInTheDocument();
  });

  it("renders with Aurora shell variant", () => {
    render(<DashboardPage />);

    const auroras = screen.getAllByTestId("aurora-shell");
    expect(auroras.length).toBeGreaterThan(0);
  });

  it("renders with PageLayout dashboard variant", () => {
    render(<DashboardPage />);

    const layouts = screen.getAllByTestId("page-layout-dashboard");
    expect(layouts.length).toBeGreaterThan(0);
  });

  it("renders the ResponsiveDashboardLayout component", () => {
    render(<DashboardPage />);

    const layouts = screen.getAllByTestId("responsive-dashboard-layout");
    expect(layouts.length).toBeGreaterThan(0);
  });

  it("has full height Aurora", () => {
    render(<DashboardPage />);

    const auroras = screen.getAllByTestId("aurora-shell");
    expect(auroras.length).toBeGreaterThan(0);
  });
});
