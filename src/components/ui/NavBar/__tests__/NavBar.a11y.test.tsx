import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { NavBar } from "../../index";

describe("NavBar a11y: aria-current on active link", () => {
  it("marks the current route link with aria-current=page", () => {
    const items = [
      { id: "dashboard", label: "Dashboard", href: "/dashboard" },
      { id: "about", label: "About", href: "/about" },
    ];

    render(
      <MemoryRouter initialEntries={["/about"]}>
        <NavBar items={items} />
      </MemoryRouter>
    );

    const about = screen.getByRole("link", { name: /about/i });
    const dashboard = screen.getByRole("link", { name: /dashboard/i });

    expect(about).toHaveAttribute("aria-current", "page");
    expect(dashboard).not.toHaveAttribute("aria-current");
  });
});
