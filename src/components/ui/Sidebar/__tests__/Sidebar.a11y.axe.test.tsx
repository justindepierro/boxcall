import { describe, it, beforeEach, afterEach, expect, vi } from "vitest";
import { render, cleanup } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { axe, toHaveNoViolations } from "jest-axe";
import { Sidebar } from "../Sidebar";
import { UserPreferencesService } from "@services/userPreferencesService";

// Extend Vitest expect with jest-axe matcher
expect.extend(toHaveNoViolations);

declare module "vitest" {
  interface Assertion<T = any> {
    toHaveNoViolations(): T;
  }
}

describe("Sidebar automated a11y (axe)", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  beforeEach(() => {
    vi.spyOn(UserPreferencesService, "loadPreferences").mockReturnValue({
      csvImport: {
        skipMissingFieldsConfirmation: false,
        skipQualityWarnings: false,
      },
      ui: { showTooltips: false, compactMode: false, showConfetti: false },
    });
  });

  it("has no critical axe violations when open with overlay and header", async () => {
    const items = [
      { id: "one", label: "One", href: "/one" },
      { id: "two", label: "Two", href: "/two" },
    ];

    const { container } = render(
      <MemoryRouter initialEntries={["/one"]}>
        <Sidebar items={items as any} isOpen={true} header="Menu" showOverlay />
      </MemoryRouter>
    );

    const results = await axe(container, {
      rules: {
        // Allow color-contrast to be handled by dedicated contrast gate script
        "color-contrast": { enabled: false },
      },
    });
    expect(results).toHaveNoViolations();
  });
});
