import type { SidebarItem } from "../components/ui/Sidebar";
import type { Database } from "../types/database";
import React from "react";
import { Icon } from "../components/ui/Icon/Icon";
import { softNavigate } from "./softNavigate";
import type { IconName } from "../components/ui/Icon/Icon";
import { ROUTES, teamRoutes } from "../routes/paths";
import { readLocalString, storageKeys } from "./storage";
type UserRole = Database["public"]["Tables"]["profiles"]["Row"]["role"];
type ExtendedUserRole = UserRole | "super_admin";
export interface NavigationItem {
  id: string;
  label: string;
  icon?: IconName;
  href: string;
  roles?: ExtendedUserRole[];
  children?: NavigationItem[];
  divider?: boolean;
  badge?: string | number;
  description?: string;
}

/** Role checks - coach-level access (admin, coach, super_admin) */
const isCoachOrAbove = (role?: UserRole | null | string): boolean =>
  role === "admin" || role === "coach" || (role as string) === "super_admin";

/** Role checks - any authenticated user with team access */
const isTeamMember = (role?: UserRole | null | string): boolean =>
  role === "admin" ||
  role === "coach" ||
  role === "player" ||
  (role as string) === "super_admin";

/** Create a navigation item with common defaults */
const createNavItem = (
  id: string,
  label: string,
  icon: IconName,
  href: string,
  description: string,
  options?: { roles?: ExtendedUserRole[]; badge?: string | number }
): NavigationItem => ({
  id,
  label,
  icon,
  href,
  description,
  ...options,
});

/** Create a divider item */
const createDivider = (id: string): NavigationItem => ({
  id,
  label: "",
  href: "",
  divider: true,
});

/**
 * Complete navigation structure for BoxCall application
 * Based on comprehensive requirements with role-based access
 */
export const getNavigationItems = (
  userRole?: UserRole | null | string,
  activeTeamId?: string | null
): NavigationItem[] => {
  // Dynamic team selection (persisted after creation)
  let resolvedTeamId = activeTeamId || null;
  try {
    const stored = readLocalString(storageKeys.activeTeamId);
    if (stored) resolvedTeamId = stored;
  } catch {
    /* ignore */
  }

  const items: NavigationItem[] = [];

  // Dashboard - Available to everyone
  items.push(
    createNavItem(
      "dashboard",
      "Dashboard",
      "home",
      ROUTES.DASHBOARD,
      "Personal dashboard with live feed and notifications"
    )
  );

  // Team Bulletin - Available to everyone
  items.push(
    createNavItem(
      "team-bulletin",
      "Team Bulletin",
      "users",
      resolvedTeamId ? teamRoutes.bulletin(resolvedTeamId) : ROUTES.TEAMS,
      "Team-specific feed, announcements, and quick actions"
    )
  );

  // BoxCall - Coach-level only (premium feature)
  if (isCoachOrAbove(userRole)) {
    items.push(
      createNavItem(
        "boxcall",
        "BoxCall",
        "phone",
        ROUTES.BOXCALL,
        "Advanced coaching tools and analytics (Premium)",
        { roles: ["admin", "coach", "super_admin"], badge: "Pro" }
      )
    );
  }

  // Playbook - Team members
  if (isTeamMember(userRole)) {
    items.push(
      createNavItem(
        "playbook",
        "Playbook",
        "book",
        ROUTES.PLAYBOOK,
        "Team plays and strategies",
        { roles: ["admin", "coach", "player", "super_admin"] }
      )
    );
  }

  // Roster - Coach-level only
  if (isCoachOrAbove(userRole)) {
    items.push(
      createNavItem(
        "roster",
        "Roster",
        "users",
        ROUTES.ROSTER,
        "Manage team roster and player profiles",
        { roles: ["admin", "coach", "super_admin"] }
      )
    );
  }

  // Calendar & Planner - Available to everyone
  items.push(
    createNavItem(
      "calendar",
      "Calendar",
      "calendar",
      resolvedTeamId ? teamRoutes.calendar(resolvedTeamId) : ROUTES.CALENDAR,
      "Personal and team calendars"
    )
  );

  items.push(
    createNavItem(
      "planner",
      "Planner",
      "clipboard-list",
      ROUTES.PLANNER,
      "Weekly planning dashboard for coaches"
    )
  );

  // Awards - Coach-level only
  if (isCoachOrAbove(userRole)) {
    items.push(
      createNavItem(
        "awards",
        "Awards",
        "award",
        ROUTES.AWARDS,
        "Give out awards and recognition to players and staff",
        { roles: ["admin", "coach", "super_admin"] }
      )
    );
  }

  // Profile - Available to everyone
  items.push(
    createNavItem(
      "profile",
      "Profile",
      "user",
      ROUTES.PROFILE,
      "Edit user settings and preferences"
    )
  );

  // Team-specific items
  if (resolvedTeamId) {
    items.push(
      createNavItem(
        "team-announcements",
        "Announcements",
        "bell",
        teamRoutes.announcements(resolvedTeamId),
        "Team announcements and updates"
      )
    );
    items.push(
      createNavItem(
        "team-settings",
        "Team Settings",
        "settings",
        teamRoutes.settings(resolvedTeamId),
        "Manage team configuration and roster"
      )
    );
  }

  // Utility section
  items.push(createDivider("divider-utility"));

  items.push(
    createNavItem("about", "About", "info", ROUTES.ABOUT, "Learn about BoxCall")
  );

  // Templates - Coach-level only
  if (isCoachOrAbove(userRole)) {
    items.push(
      createNavItem(
        "templates",
        "Templates",
        "file",
        ROUTES.TEMPLATES,
        "Pre-built templates and resources",
        { roles: ["admin", "coach", "super_admin"] }
      )
    );
  }

  // Logout section
  items.push(createDivider("divider-logout"));

  items.push(
    createNavItem(
      "logout",
      "Log Out",
      "arrow-right",
      "/logout",
      "Sign out of BoxCall"
    )
  );

  return items;
};
/**
 * Convert NavigationItem to SidebarItem format
 * BoxCall icons are styled with jade color for brand consistency
 */
export const toSidebarItems = (
  items: NavigationItem[],
  userRole?: UserRole | null | string,
  onNavigate?: (href: string) => void
): SidebarItem[] => {
  return items
    .filter((item) => {
      // Show item if no roles specified or user has required role
      return (
        !item.roles ||
        (userRole && item.roles.includes(userRole as ExtendedUserRole))
      );
    })
    .map((item) => ({
      id: item.id,
      label: item.label,
      icon: item.icon
        ? React.createElement(Icon, {
            name: item.icon,
            size: "md",
            color: item.id === "boxcall" ? "primary" : "current",
          })
        : undefined,
      onClick: item.divider
        ? undefined
        : () => {
            // Use the provided navigation handler
            if (onNavigate) {
              onNavigate(item.href);
            } else {
              // Fallback: avoid full reload
              softNavigate(item.href);
            }
          },
      divider: item.divider,
      badge: item.badge,
      children: item.children
        ? toSidebarItems(item.children, userRole, onNavigate)
        : undefined,
    }));
};
/**
 * Get primary navigation items for the top navigation bar
 * These are the most important/frequently used items with quick actions
 */
export const getPrimaryNavigationItems = (
  userRole?: UserRole | null
): NavigationItem[] => {
  const items: NavigationItem[] = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: "home",
      href: "/dashboard",
    },
    {
      id: "boxcall",
      label: "BoxCall",
      icon: "phone",
      href: "/boxcall",
    },
  ];
  return items.filter((item) => {
    // Filter based on role permissions
    if (item.id === "boxcall" && userRole !== "admin" && userRole !== "coach") {
      return false;
    }
    return true;
  });
};
/**
 * Get role-based display information
 */
export const getRoleDisplayInfo = (role?: UserRole | null) => {
  if (!role) return { display: "User", color: "gray" };
  const roleInfo: Record<
    NonNullable<UserRole>,
    { display: string; color: string }
  > = {
    super_admin: { display: "Super Admin", color: "red" },
    admin: { display: "Administrator", color: "red" },
    coach: { display: "Coach", color: "blue" },
    player: { display: "Player", color: "green" },
    family: { display: "Family", color: "purple" },
  };
  if (role in roleInfo) return roleInfo[role as NonNullable<UserRole>];
  // Fallback for team-role strings that may appear in some contexts
  switch (role as string) {
    case "head_coach":
      return { display: "Head Coach", color: "blue" };
    case "assistant_coach":
      return { display: "Assistant Coach", color: "blue" };
    case "manager":
      return { display: "Manager", color: "purple" };
    case "alumni":
      return { display: "Alumni", color: "gray" };
    default:
      return { display: String(role), color: "gray" };
  }
};
