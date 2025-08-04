import React from "react";
import { Typography } from "../design-system";
interface TeamNavigationProps {
  teamId: string;
  userRole: string;
}
/**
 * Team Navigation - Team-specific navigation tabs
 *
 * Features:
 * - Role-based navigation options
 * - Team context switching
 * - Quick access to team sections
 */
export const TeamNavigation: React.FC<TeamNavigationProps> = ({
  teamId,
  userRole,
}) => {
  const navigationItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: "🏠",
      href: `/team/${teamId}`,
    },
    {
      id: "roster",
      label: "Roster",
      icon: "👥",
      href: `/team/${teamId}/roster`,
    },
    {
      id: "schedule",
      label: "Schedule",
      icon: "📅",
      href: `/team/${teamId}/schedule`,
    },
    {
      id: "playbook",
      label: "Playbook",
      icon: "📋",
      href: `/team/${teamId}/playbook`,
      roles: ["coach", "head_coach", "player"],
    },
    { id: "stats", label: "Stats", icon: "📊", href: `/team/${teamId}/stats` },
    { id: "media", label: "Media", icon: "📸", href: `/team/${teamId}/media` },
  ];
  const visibleItems = navigationItems.filter(
    (item) => !item.roles || item.roles.includes(userRole)
  );
  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex space-x-8">
          {visibleItems.map((item) => (
            <button
              key={item.id}
              className="flex items-center space-x-2 py-4 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
            >
              <span>{item.icon}</span>
              <Typography variant="body-sm" className="font-medium">
                {item.label}
              </Typography>
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
};
export default TeamNavigation;
