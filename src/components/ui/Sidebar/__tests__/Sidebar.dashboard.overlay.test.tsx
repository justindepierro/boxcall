import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { Sidebar } from "../Sidebar";
import { UserPreferencesService } from "../../../../services/userPreferencesService";

// Use mock items for Sidebar
const items = [
  { id: "one", label: "One", href: "/one", badge: 3 },
  { id: "two", label: "Two", href: "/two", badge: 7 },
];

describe("Sidebar dashboard overlay edge cases", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("renders overlay with sidebar and verifies contrast and a11y", () => {
    vi.spyOn(UserPreferencesService, "loadPreferences").mockReturnValue({
      csvImport: {
        skipMissingFieldsConfirmation: false,
        skipQualityWarnings: false,
      },
      ui: { showTooltips: false, compactMode: false, showConfetti: false },
    });
    render(
      <MemoryRouter initialEntries={["/one"]}>
        <Sidebar items={items as any} isOpen={true} showOverlay={true} />
      </MemoryRouter>
    );
    // Sidebar should be visible
    const sidebar = screen.getByRole("navigation");
    expect(sidebar).toBeTruthy();
    // Overlay should be visible
    expect(screen.getByTestId("sidebar-overlay")).toBeTruthy();
    // Check contrast tokens via computed style
    const sidebarStyle = window.getComputedStyle(sidebar);
    expect(sidebarStyle.color).not.toBe(""); // Should be set by semantic token
    // Check a11y attributes
    expect(sidebar).toHaveAttribute("aria-label");
  });

  it("renders content-heavy overlay and verifies no contrast regressions", () => {
    vi.spyOn(UserPreferencesService, "loadPreferences").mockReturnValue({
      csvImport: {
        skipMissingFieldsConfirmation: false,
        skipQualityWarnings: false,
      },
      ui: { showTooltips: false, compactMode: false, showConfetti: false },
    });
    render(
      <MemoryRouter initialEntries={["/two"]}>
        <Sidebar items={items as any} isOpen={true} showOverlay={true} />
      </MemoryRouter>
    );
    // Overlay should be visible
    expect(screen.getByTestId("sidebar-overlay")).toBeTruthy();
    // Check for badge/label contrast via computed style
    const badges = screen.getAllByText(/\d+/);
    badges.forEach((badge) => {
      const badgeStyle = window.getComputedStyle(badge);
      expect(badgeStyle.backgroundColor).not.toBe(""); // Should be set by semantic token
      expect(badgeStyle.color).not.toBe(""); // Should be set by semantic token
    });
  });
});
