import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { MobileBottomNavigation } from "../../mobile/core/MobileBottomNavigation";
import type { MobileNavItem } from "../../mobile/core/MobileBottomNavigation";

export interface PlaybookBottomNavProps {
  onNavigate?: (path: string) => void;
  className?: string;
}

/**
 * PlaybookBottomNav - Mobile bottom navigation for Playbook workflow
 *
 * Features:
 * - 4 primary tabs: Plays, Practice, Game Plans, More
 * - Active state management
 * - Touch-optimized (56px height, 44px+ touch targets)
 * - Safe area support for modern phones
 *
 * @example
 * ```tsx
 * <PlaybookBottomNav />
 * ```
 */
export const PlaybookBottomNav: React.FC<PlaybookBottomNavProps> = ({
  onNavigate,
  className = "",
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigation = (href: string) => {
    if (onNavigate) {
      onNavigate(href);
    } else {
      navigate(href);
    }
  };

  const navItems: MobileNavItem[] = [
    {
      id: "plays",
      label: "Plays",
      icon: "home",
      href: "/playbook",
      isActive: location.pathname === "/playbook",
    },
    {
      id: "practice",
      label: "Practice",
      icon: "clock",
      href: "/practice-plans",
      isActive: location.pathname.startsWith("/practice"),
    },
    {
      id: "gameplan",
      label: "Game Plan",
      icon: "target",
      href: "/game-plans",
      isActive: location.pathname.startsWith("/game-plan"),
    },
    {
      id: "more",
      label: "More",
      icon: "menu",
      href: "/playbook/more",
      isActive: location.pathname === "/playbook/more",
    },
  ];

  return (
    <MobileBottomNavigation
      items={navItems}
      onNavigate={handleNavigation}
      className={className}
    />
  );
};
