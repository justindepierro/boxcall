import { describe, it, expect } from "vitest";
import type { SidebarItem } from "../../components/ui/Sidebar";
import {
  computeActiveState,
  isActiveItem,
  shouldExpand,
} from "../nav.selectors";

const tree: SidebarItem[] = [
  { id: "dashboard", label: "Dashboard", href: "/dashboard" },
  {
    id: "team",
    label: "Team",
    href: "/team",
    children: [
      { id: "team-bulletin", label: "Bulletin", href: "/team/123/bulletin" },
      { id: "team-settings", label: "Settings", href: "/team/123/settings" },
    ],
  },
  { id: "playbook", label: "Playbook", href: "/playbook" },
];

describe("nav.selectors", () => {
  it("computes deepest active item and expanded parents", () => {
    const state = computeActiveState(tree, "/team/123/settings");
    expect(state.activeId).toBe("team-settings");
    expect(state.pathIds).toEqual(["team", "team-settings"]);
    expect([...state.expandedIds]).toEqual(["team"]);
  });

  it("treats parent prefixes as matches on boundaries", () => {
    expect(isActiveItem(tree[1], "/team")); // parent is active on index
    expect(shouldExpand(tree[1]!, "/team/123/settings")).toBe(true);
  });

  it("returns null when no href matches", () => {
    const state = computeActiveState(tree, "/unknown");
    expect(state.activeId).toBeNull();
    expect(state.pathIds).toEqual([]);
    expect(state.expandedIds.size).toBe(0);
  });
});
