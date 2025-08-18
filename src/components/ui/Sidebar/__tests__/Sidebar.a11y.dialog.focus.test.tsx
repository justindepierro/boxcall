import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  within,
  cleanup,
} from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import React, { useState } from "react";
import { Sidebar } from "../Sidebar";
import { UserPreferencesService } from "../../../../services/userPreferencesService";
import { Button } from "../../Button";

describe("Sidebar dialog semantics and focus management", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    document.body.style.overflow = "";
  });

  beforeEach(() => {
    vi.spyOn(UserPreferencesService, "loadPreferences").mockReturnValue({
      csvImport: {
        skipMissingFieldsConfirmation: false,
        skipQualityWarnings: false,
      },
      ui: { showTooltips: false, compactMode: false, showConfetti: false },
    });

    // Minimize rAF timing flake in focus logic
    vi.spyOn(window, "requestAnimationFrame").mockImplementation(
      (cb: FrameRequestCallback) => {
        cb(performance.now());
        return 1 as unknown as number;
      }
    );
  });

  it("renders as an accessible modal dialog with aria attributes", () => {
    const items = [
      { id: "one", label: "One", href: "/one" },
      { id: "two", label: "Two", href: "/two" },
    ];

    render(
      <MemoryRouter initialEntries={["/one"]}>
        <Sidebar items={items as any} isOpen={true} header="Menu" showOverlay />
      </MemoryRouter>
    );

    const panel = screen.getByTestId("sidebar-panel");
    expect(panel).toHaveAttribute("role", "dialog");
    expect(panel).toHaveAttribute("aria-modal", "true");

    const labelledby = panel.getAttribute("aria-labelledby");
    expect(labelledby).toBe("sidebar-title");
    // The element referenced by aria-labelledby contains the header text
    const labelEl = document.getElementById(labelledby!);
    expect(labelEl).toBeTruthy();
    expect(labelEl).toHaveTextContent(/menu/i);

    // Primary navigation exists inside
    const [nav] = screen.getAllByRole("navigation", {
      name: /primary navigation/i,
    });
    expect(within(nav).getByRole("menubar")).toBeInTheDocument();
  });

  it("restores focus to the opener after closing", async () => {
    const items = [
      { id: "one", label: "One", href: "/one" },
      { id: "two", label: "Two", href: "/two" },
    ];

    const Harness: React.FC = () => {
      const [open, setOpen] = useState(false);
      return (
        <MemoryRouter initialEntries={["/one"]}>
          <Button aria-label="Open sidebar" onClick={() => setOpen(true)}>
            Open
          </Button>
          <Sidebar
            items={items as any}
            isOpen={open}
            onClose={() => setOpen(false)}
            header="Menu"
            showOverlay
          />
        </MemoryRouter>
      );
    };

    render(<Harness />);

    const openBtn = screen.getByRole("button", { name: /open sidebar/i });
    openBtn.focus();
    expect(openBtn).toHaveFocus();

    // Open the sidebar
    fireEvent.click(openBtn);

    // Focus should move inside the drawer (first menuitem gets tabindex=0)
    const [nav] = await screen.findAllByRole("navigation", {
      name: /primary navigation/i,
    });
    const firstItem = within(nav).getByRole("menuitem", { name: /one/i });
    await waitFor(() => expect(firstItem).toHaveFocus());

    // Close by clicking overlay
    const overlay = screen.getByTestId("sidebar-overlay");
    fireEvent.click(overlay);

    // Focus restores back to the open button
    await waitFor(() => expect(openBtn).toHaveFocus());
  });
});
