import React from "react";
import { NavBar } from "../ui/NavBar";
import type { NavBarItem } from "../ui/NavBar";
import { LogoFull } from "../ui/Logo/Logo";
import { ThemeToggle } from "../ui/ThemeToggle/ThemeToggle";
import { useAuth } from "../../app/auth-store";

// Example navigation items (customize as needed)
const navItems: NavBarItem[] = [
  {
    id: "home",
    label: "Home",
    href: "/dashboard",
    icon: <i className="fa fa-home" />,
  },
  {
    id: "profile",
    label: "Profile",
    href: "/profile",
    icon: <i className="fa fa-user" />,
  },
  {
    id: "teams",
    label: "Teams",
    href: "/teams",
    icon: <i className="fa fa-users" />,
  },
  {
    id: "calendar",
    label: "Calendar",
    href: "/calendar",
    icon: <i className="fa fa-calendar" />,
  },
  {
    id: "achievements",
    label: "Achievements",
    href: "/achievements",
    icon: <i className="fa fa-trophy" />,
  },
  {
    id: "notifications",
    label: "Notifications",
    href: "/notifications",
    icon: <i className="fa fa-bell" />,
  },
];

export const DashboardHeader: React.FC = () => {
  const { profile } = useAuth();
  return (
    <NavBar
      items={navItems}
      brand={<LogoFull size="md" />}
      actions={
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {profile && (
            <span className="w-8 h-8 rounded-full bg-jade-100 flex items-center justify-center font-bold text-jade-800 text-sm">
              {profile.full_name
                ? profile.full_name
                    .split(" ")
                    .map((n: string) => n[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2)
                : "U"}
            </span>
          )}
        </div>
      }
      sticky={true}
      className="glass-header shadow-md"
    />
  );
};

export default DashboardHeader;
