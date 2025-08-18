import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { Sidebar } from "../Sidebar";
import * as sidebarState from "../../../../hooks/useSidebarState";
import * as prefs from "../../../../services/userPreferencesService";

describe("Sidebar deep-link auto-expand", () => {
  it("calls expand on parent group when current route matches a child href prefix", () => {
    // Mock preferences to avoid tooltip logic noise
    vi.spyOn(prefs, "UserPreferencesService", "get").mockReturnValue({
      loadPreferences: () => ({ ui: { showTooltips: false } }),
    } as unknown as typeof prefs.UserPreferencesService);

    const expand = vi.fn();
    const toggleMode = vi.fn();
    const isExpanded = vi.fn().mockReturnValue(false);
    const collapse = vi.fn();
    const toggleExpanded = vi.fn();
    const isFavorite = vi.fn().mockReturnValue(false);
    const toggleFavorite = vi.fn();

    // Spy on hook to return a controlled state
    vi.spyOn(sidebarState, "useSidebarState").mockReturnValue({
      mode: "expanded",
      setMode: vi.fn(),
      toggleMode,
      expanded: new Set<string>(),
      isExpanded,
      expand,
      collapse,
      toggleExpanded,
      favorites: new Set<string>(),
      isFavorite,
      toggleFavorite,
    } as unknown as ReturnType<typeof sidebarState.useSidebarState>);

    const items = [
      {
        id: "grp",
        label: "Group",
        children: [{ id: "child", label: "Child", href: "/group/child" }],
      },
    ];

    render(
      <MemoryRouter initialEntries={["/group/child"]}>
        <Sidebar items={items as any} isOpen={true} />
      </MemoryRouter>
    );

    expect(expand).toHaveBeenCalledWith("grp");
  });
});
