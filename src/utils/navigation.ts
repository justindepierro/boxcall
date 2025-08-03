import type { SidebarItem } from "../components/ui/Sidebar";
import type { Database } from "../types/database";

type UserRole = Database["public"]["Tables"]["profiles"]["Row"]["role"];

export interface NavigationItem {
  id: string;
  label: string;
  icon?: string;
  href: string;
  roles?: UserRole[];
  children?: NavigationItem[];
  divider?: boolean;
}

/**
 * Core navigation structure for the application
 * Used by both sidebar and mobile navigation
 */
export const getNavigationItems = (userRole?: UserRole | null): NavigationItem[] => {
  const items: NavigationItem[] = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: "🏠",
      href: "/dashboard",
    },
    {
      id: "calendar",
      label: "Calendar",
      icon: "📅", 
      href: "/calendar",
    },
  ];

  // Team management for coaches and admins
  if (userRole === "admin" || userRole === "coach") {
    items.push({
      id: "team-management",
      label: userRole === "admin" ? "Team Management" : "My Team",
      icon: "🏈",
      href: "/team/1",
      roles: ["admin", "coach"],
    });

    items.push({
      id: "playbooks",
      label: "Playbooks",
      icon: "📋",
      href: "/playbooks",
      roles: ["admin", "coach"],
    });
  }

  // Admin-only items
  if (userRole === "admin") {
    items.push(
      {
        id: "divider-admin",
        label: "",
        href: "",
        divider: true,
      },
      {
        id: "admin",
        label: "Admin Panel",
        icon: "⚙️",
        href: "/admin",
        roles: ["admin"],
      },
      {
        id: "super-admin",
        label: "Super Admin",
        icon: "🔧",
        href: "/super-admin",
        roles: ["admin"],
      }
    );
  }

  // Always include profile at the bottom
  items.push(
    {
      id: "divider-profile",
      label: "",
      href: "",
      divider: true,
    },
    {
      id: "profile",
      label: "My Profile",
      icon: "👤",
      href: "/profile",
    }
  );

  return items;
};

/**
 * Convert NavigationItem to SidebarItem format
 */
export const toSidebarItems = (
  items: NavigationItem[],
  userRole?: UserRole | null
): SidebarItem[] => {
  return items
    .filter(item => {
      // Show item if no roles specified or user has required role
      return !item.roles || (userRole && item.roles.includes(userRole));
    })
    .map(item => ({
      id: item.id,
      label: item.label,
      icon: item.icon,
      onClick: item.divider ? undefined : () => (window.location.href = item.href),
      divider: item.divider,
      children: item.children ? toSidebarItems(item.children, userRole) : undefined,
    }));
};

/**
 * Get primary navigation items for the top navigation bar
 * These are the most important/frequently used items
 */
export const getPrimaryNavigationItems = (userRole?: UserRole | null): NavigationItem[] => {
  const items: NavigationItem[] = [
    {
      id: "dashboard",
      label: "Dashboard", 
      icon: "🏠",
      href: "/dashboard",
    },
    {
      id: "calendar",
      label: "Calendar",
      icon: "📅",
      href: "/calendar",
    },
  ];

  // Add team item for coaches/admins
  if (userRole === "admin" || userRole === "coach") {
    items.push({
      id: "team",
      label: userRole === "admin" ? "Team Management" : "My Team",
      icon: "🏈", 
      href: "/team/1",
      roles: ["admin", "coach"],
    });
  }

  return items;
};

/**
 * Get role-based display information
 */
export const getRoleDisplayInfo = (role?: UserRole | null) => {
  if (!role) return { display: "User", color: "gray" };

  const roleInfo: Record<NonNullable<UserRole>, { display: string; color: string }> = {
    admin: { display: "Administrator", color: "red" },
    coach: { display: "Coach", color: "blue" },
    player: { display: "Player", color: "green" },
    family: { display: "Family", color: "purple" },
  };

  return roleInfo[role] || { display: role, color: "gray" };
};
