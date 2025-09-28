// Single source of truth for navigation structure
// Keep this minimal for initial compile; expand iteratively.

export type NavItemId =
  | "dashboard"
  | "team-bulletin"
  | "calendar"
  | "planner"
  | "playbook"
  | "practice"
  | "analytics"
  | "settings";

export type NavBadge = { type: "count" | "dot"; value?: number } | null;

export type NavItem = {
  id: NavItemId;
  label: string;
  path: string; // react-router path
  icon: string; // lucide icon name (string key)
  children?: NavItem[];
  featureFlag?: string; // optional feature flag
  roles?: Array<"coach" | "player" | "admin" | "family">; // optional role filter
  badge?: NavBadge;
};

export type NavTree = NavItem[];

// Seed data for visual iteration
export const baseNav: NavTree = [
  { id: "dashboard", label: "Dashboard", path: "/", icon: "home" },
  {
    id: "team-bulletin",
    label: "Team Bulletin",
    path: "/team/:teamId/bulletin",
    icon: "users",
  },
  { id: "calendar", label: "Calendar", path: "/calendar", icon: "calendar" },
  { id: "planner", label: "Planner", path: "/planner", icon: "clipboard-list" },
  { id: "playbook", label: "Playbook", path: "/playbook", icon: "book" },
  {
    id: "practice",
    label: "Practice",
    path: "/practice",
    icon: "clipboard-list",
  },
  {
    id: "analytics",
    label: "Analytics",
    path: "/analytics",
    icon: "bar-chart",
    featureFlag: "analytics",
  },
  { id: "settings", label: "Settings", path: "/settings", icon: "settings" },
];

export type UserContext = {
  role: "coach" | "player" | "admin" | "family";
  features: Record<string, boolean>;
};

export function filterNav(tree: NavTree, ctx: UserContext): NavTree {
  const allow = (item: NavItem): boolean => {
    if (item.roles && !item.roles.includes(ctx.role)) return false;
    if (item.featureFlag && !ctx.features[item.featureFlag]) return false;
    return true;
  };

  const walk = (items: NavTree): NavTree =>
    items.filter(allow).map((it) => ({
      ...it,
      children: it.children ? walk(it.children) : undefined,
    }));

  return walk(tree);
}
