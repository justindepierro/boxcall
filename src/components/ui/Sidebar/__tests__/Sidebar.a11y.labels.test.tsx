import { describe, it, beforeEach, afterEach, expect, vi } from "vitest";
import {
  render,
  screen,
  within,
  fireEvent,
  waitFor,
  cleanup,
} from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { Sidebar } from "../Sidebar";
import { UserPreferencesService } from "../../../../services/userPreferencesService";
import { Icon } from "../../Icon/Icon";

describe("Sidebar a11y labels and hidden decorations", () => {
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

  it("uses descriptive aria-labels for pin/unpin and hides decorative icons", async () => {
    const items = [
      {
        id: "one",
        label: "One",
        href: "/one",
        icon: <Icon name="star" size="sm" />,
      },
      {
        id: "two",
        label: "Two",
        href: "/two",
        icon: <Icon name="folder" size="sm" />,
      },
    ];

    render(
      <MemoryRouter initialEntries={["/one"]}>
        <Sidebar items={items as any} isOpen={true} header="Menu" showOverlay />
      </MemoryRouter>
    );

    // Scope to primary navigation
    const [nav] = screen.getAllByRole("navigation", {
      name: /primary navigation/i,
    });

    // Main list item initially not pinned: has a Pin button with descriptive label
    const oneItem = within(nav).getByRole("menuitem", { name: /one/i });
    const pinButton = within(oneItem).getByRole("button", { name: /pin one/i });
    expect(pinButton).toHaveAttribute("aria-pressed", "false");

    // Decorative icon wrapper should be aria-hidden
    const hiddenIconWrapper = oneItem.querySelector(
      'div[aria-hidden="true"], div[aria-hidden]'
    );
    expect(hiddenIconWrapper).toBeTruthy();

    // Pin it
    fireEvent.click(pinButton);

    // Item moves to Pinned section with Unpin button, pressed state
    const pinnedGroup = within(nav).getByText(/pinned/i);
    expect(pinnedGroup).toBeInTheDocument();

    const pinnedOne = within(nav).getByRole("menuitem", { name: /one/i });
    const unpinButton = within(pinnedOne).getByRole("button", {
      name: /unpin one/i,
    });
    expect(unpinButton).toHaveAttribute("aria-pressed", "true");

    // Decorative icon wrapper stays hidden in pinned section as well
    const hiddenPinnedIconWrapper = pinnedOne.querySelector(
      'div[aria-hidden="true"], div[aria-hidden]'
    );
    expect(hiddenPinnedIconWrapper).toBeTruthy();

    // Unpin and ensure it returns with proper label/state
    fireEvent.click(unpinButton);

    await waitFor(() => {
      const oneBack = within(nav).getByRole("menuitem", { name: /one/i });
      const pinBack = within(oneBack).getByRole("button", { name: /pin one/i });
      expect(pinBack).toHaveAttribute("aria-pressed", "false");
    });
  });
});
