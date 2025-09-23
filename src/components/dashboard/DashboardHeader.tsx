import React from "react";
import { NavBar } from "../ui/NavBar";
import type { NavBarItem } from "../ui/NavBar";
import { LogoFull } from "../ui/Logo/Logo";
import { useAuth } from "../../app/auth-store";
import { Typography } from "../design-system/Typography";

// Example navigation items (customize as needed)
const navItems: NavBarItem[] = [
  {
    id: "home",
    label: "Home",
    href: "/dashboard",
    icon: <i className="fa fa-home" />,
  },
  {
    id: "collaboration",
    label: "Team Collaboration",
    href: "/collaborative-demo",
    icon: <i className="fa fa-comments" />,
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
        profile ? (
          <Typography
            variant="body-sm"
            className="w-8 h-8 rounded-full bg-jade-100 flex items-center justify-center font-bold text-jade-800"
          >
            {profile.full_name
              ? profile.full_name
                  .split(" ")
                  .map((n: string) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2)
              : "U"}
          </Typography>
        ) : null
      }
      sticky={true}
      className="glass-header shadow-md"
    />
  );
};

export default DashboardHeader;
