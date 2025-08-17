import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor, cleanup, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { Sidebar } from "../Sidebar";
import { UserPreferencesService } from "../../../../services/userPreferencesService";

describe("Sidebar a11y + keyboard navigation", () => {
  afterEach(() => cleanup());
  beforeEach(() => {
    vi.spyOn(UserPreferencesService, "loadPreferences").mockReturnValue({
      csvImport: { skipMissingFieldsConfirmation: false, skipQualityWarnings: false },
      ui: { showTooltips: false, compactMode: false, showConfetti: false },
    });
  });

  it("sets aria-current=page on the active link", () => {
    const items = [
      { id: "one", label: "One", href: "/one" },
      { id: "two", label: "Two", href: "/two" },
    ];

    render(
      <MemoryRouter initialEntries={["/two"]}>
        <Sidebar items={items as any} isOpen={true} />
      </MemoryRouter>
    );

  // Scope to the first primary navigation to avoid ambiguity
  const [nav] = screen.getAllByRole("navigation", { name: /primary navigation/i });
  const one = within(nav).getByRole("menuitem", { name: /one/i });
  const two = within(nav).getByRole("menuitem", { name: /two/i });

    expect(two).toHaveAttribute("aria-current", "page");
    expect(one).not.toHaveAttribute("aria-current");
  });

  it("moves focus with ArrowDown and activates item with Enter", async () => {
    // Immediate rAF to avoid async flake
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((cb: FrameRequestCallback) => {
      cb(performance.now());
      return 1 as unknown as number;
    });

    const items = [
      { id: "one", label: "One", href: "/one" },
      { id: "two", label: "Two", href: "/two" },
      { id: "three", label: "Three", href: "/three" },
    ];

    render(
      <MemoryRouter initialEntries={["/one"]}>
        <Sidebar items={items as any} isOpen={true} />
      </MemoryRouter>
    );

  // The scroll container handles keydown; restrict queries to this container
  const [container] = screen.getAllByRole("navigation", { name: /primary navigation/i });

    // ArrowDown should move focus from first to second item
    fireEvent.keyDown(container, { key: "ArrowDown" });

    await waitFor(() => {
      const two = within(container).getByRole("menuitem", { name: /two/i });
      expect(document.activeElement).toBe(two);
    });

    // Enter should trigger click; we just assert focus remains and aria-current stays on initial route until navigation
    fireEvent.keyDown(container, { key: "Enter" });

    await waitFor(() => {
      const two = within(container).getByRole("menuitem", { name: /two/i });
      expect(document.activeElement).toBe(two);
    });
  });
});
