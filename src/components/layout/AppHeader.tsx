import React, { useEffect, useState } from "react";
import { Button } from "../ui/Button";
import { Typography } from "../design-system/Typography";
import { SidebarLogo } from "../ui/Logo";
import { GlobalSearch } from "../ui/GlobalSearch";
import { UserMenu } from "../auth/UserMenu";
import { NotificationBell } from "../ui/NotificationBell";
import { TeamSwitcher } from "./TeamSwitcher";
import { useActiveTeamStore } from "../../state/activeTeamStore";
import { useRoles } from "../../hooks/useRoles";

interface AppHeaderProps {
  onMenuToggle: () => void;
}

/**
 * App Header Component
 *
 * Features:
 * - Fixed hamburger menu in top-left (always visible)
 * - BoxCall logo and name next to hamburger
 * - Auto-hide on scroll down, show on scroll up
 * - Hamburger remains visible even when header is hidden
 * - Clean, modern design with backdrop blur
 */
export const AppHeader: React.FC<AppHeaderProps> = ({ onMenuToggle }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const { roleContext } = useRoles();
  const { activeTeamId: _activeTeamId } = useActiveTeamStore();
  const teams =
    roleContext?.teamMemberships.map((tm) => ({
      id: tm.teamId,
      name: tm.teamName,
    })) ?? [];

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;

          // Show header when scrolling up or at top
          // Hide header when scrolling down (but keep hamburger)
          if (currentScrollY < lastScrollY || currentScrollY < 10) {
            setIsVisible(true);
          } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
            setIsVisible(false);
          }

          setLastScrollY(currentScrollY);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  return (
    <>
      {/* Main Header - Auto-hides on scroll */}
      <header
        className={`
          fixed top-0 left-0 right-0 z-[60] 
          bg-surface-card/90 dark:bg-surface-card/90 
          backdrop-blur-md
          shadow-[inset_0_-1px_0_rgba(0,0,0,0.05)]
          transition-transform duration-300 ease-out
          ${isVisible ? "translate-y-0" : "-translate-y-full"}
        `}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            {/* Hamburger Menu Button */}
            <Button
              variant="primary"
              onClick={onMenuToggle}
              className="p-2 mr-3 bg-jade-600 hover:bg-jade-700 text-white rounded-lg transition-colors"
              aria-label="Open menu"
            >
              <div className="w-5 h-5 flex flex-col justify-center items-center space-y-1">
                <div className="w-4 h-0.5 bg-white"></div>
                <div className="w-4 h-0.5 bg-white"></div>
                <div className="w-4 h-0.5 bg-white"></div>
              </div>
            </Button>

            {/* Logo */}
            <div className="flex items-center space-x-2 flex-shrink-0">
              <SidebarLogo />
              <Typography
                variant="headline-md"
                className="text-jade-600 dark:text-jade-400 font-bold tracking-tight"
              >
                BoxCall
              </Typography>
            </div>

            {/* Left spacer */}
            <div className="flex-1" />

            {/* Global Search - Truly Centered */}
            <div className="flex items-center justify-center gap-3">
              <GlobalSearch />
            </div>

            {/* Right side - TeamSwitcher and User Actions */}
            <div className="flex-1 flex items-center justify-end gap-3">
              <TeamSwitcher teams={teams} />
              <NotificationBell
                unreadCount={0} // TODO: Connect to actual notification count
                onClick={() => console.log("Notifications clicked")}
              />
              <UserMenu />
            </div>
          </div>
        </div>
      </header>

      {/* Persistent Hamburger - Always visible when header is hidden */}
      <Button
        variant="primary"
        onClick={onMenuToggle}
        className={`
          fixed top-4 left-4 z-[60]
          p-2 rounded-lg
          bg-jade-600 hover:bg-jade-700 text-white border-0
          transition-all duration-300 ease-out
          focus:outline-none focus:ring-2 focus:ring-jade-400 focus:ring-offset-2
          ${isVisible ? "opacity-0 pointer-events-none scale-75" : "opacity-100 pointer-events-auto scale-100"}
        `}
        aria-label="Open menu"
      >
        <div className="w-5 h-5 flex flex-col justify-center items-center space-y-1">
          <div className="w-4 h-0.5 bg-white"></div>
          <div className="w-4 h-0.5 bg-white"></div>
          <div className="w-4 h-0.5 bg-white"></div>
        </div>
      </Button>
    </>
  );
};
