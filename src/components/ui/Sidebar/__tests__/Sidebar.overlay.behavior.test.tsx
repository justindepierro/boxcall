import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { Sidebar } from "../Sidebar";
import { UserPreferencesService } from "../../../../services/userPreferencesService";

describe("Sidebar overlay behavior", () => {
  afterEach(() => {
    cleanup();
    document.body.style.overflow = ""; // reset in case
    vi.restoreAllMocks();
  });

  it("renders scrim overlay, closes via overlay click and Escape, and locks body scroll", () => {
    vi.spyOn(UserPreferencesService, "loadPreferences").mockReturnValue({
      csvImport: { skipMissingFieldsConfirmation: false, skipQualityWarnings: false },
      ui: { showTooltips: false, compactMode: false, showConfetti: false },
    });

    const items = [
      { id: "one", label: "One", href: "/one" },
      { id: "two", label: "Two", href: "/two" },
    ];

    const onClose = vi.fn();

    const { rerender } = render(
      <MemoryRouter initialEntries={["/one"]}>
        <Sidebar items={items as any} isOpen={true} onClose={onClose} showOverlay={true} />
      </MemoryRouter>
    );

    const overlay = screen.getByTestId("sidebar-overlay");
    expect(overlay).toBeInTheDocument();
    expect(overlay).toHaveClass("fixed", "inset-0");

    // Body scroll locked
    expect(document.body.style.overflow).toBe("hidden");

    // Click on overlay closes
    fireEvent.click(overlay);
    expect(onClose).toHaveBeenCalledTimes(1);

    // Re-open to test Escape
    rerender(
      <MemoryRouter initialEntries={["/one"]}>
        <Sidebar items={items as any} isOpen={true} onClose={onClose} showOverlay={true} />
      </MemoryRouter>
    );

    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(2);
  });
});
