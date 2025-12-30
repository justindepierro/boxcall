import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { MobileBottomNavigation } from "../../mobile/core/MobileBottomNavigation";
import type { MobileNavItem } from "../../mobile/core/MobileBottomNavigation";
import type { CoachingView } from "./PlaybookViewTabs";

export interface PlaybookBottomNavProps {
  currentView?: CoachingView;
  onViewChange?: (view: CoachingView) => void;
  onNavigate?: (path: string) => void;
  className?: string;
}

/**
 * PlaybookBottomNav - Mobile bottom navigation for Playbook workflow
 *
 * Features:
 * - 4 primary tabs: Plays, Practice, Game Plans, More
 * - Switches views within the same page (consistent with desktop tabs)
 * - Active state based on currentView prop
 * - Touch-optimized (56px height, 44px+ touch targets)
 * - Safe area support for modern phones
 *
 * @example
 * ```tsx
 * <PlaybookBottomNav
 *   currentView={state.currentView}
 *   onViewChange={handleViewChange}
 * />
 * ```
 */
export const PlaybookBottomNav: React.FC<PlaybookBottomNavProps> = ({
  currentView = "playbook",
  onViewChange,
  onNavigate,
  className = "",
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigation = (href: string) => {
    // Handle view switching within the playbook page
    if (href.startsWith("view:")) {
      const view = href.replace("view:", "") as CoachingView;
      if (onViewChange) {
        onViewChange(view);
      }
      return;
    }

    // Handle external navigation
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
      href: "view:playbook",
      isActive: currentView === "playbook",
    },
    {
      id: "practice",
      label: "Practice",
      icon: "clock",
      href: "view:practice-script",
      isActive: currentView === "practice-script",
    },
    {
      id: "gameplan",
      label: "Game Plan",
      icon: "target",
      href: "/gameplans",
      isActive: location.pathname === "/gameplans",
    },
    {
      id: "more",
      label: "More",
      icon: "menu",
      href: "/dashboard",
      isActive: location.pathname === "/dashboard",
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
