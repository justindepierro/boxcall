import React, { useEffect, useState } from "react";
import { Button } from "../ui/Button";
import { Icon } from "../ui/Icon/Icon";
import { Typography } from "../design-system/Typography";
import { SidebarLogo } from "../ui/Logo";

interface AppHeaderProps {
  onMenuToggle: () => void;
  sidebarOpen: boolean;
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
export const AppHeader: React.FC<AppHeaderProps> = ({
  onMenuToggle,
  sidebarOpen,
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

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
          backdrop-blur-md border-b border-subtle/50
          transition-transform duration-300 ease-out
          ${isVisible ? "translate-y-0" : "-translate-y-full"}
        `}
      >
        <div className="flex items-center h-16 px-4">
          {/* Hamburger Menu Button */}
          <Button
            variant="ghost"
            onClick={onMenuToggle}
            className="p-2 mr-3 hover:bg-surface-hover rounded-lg transition-colors"
            aria-label={sidebarOpen ? "Close menu" : "Open menu"}
          >
            {sidebarOpen ? (
              <Icon name="close" size="md" className="text-text-primary" />
            ) : (
              <div className="w-5 h-5 flex flex-col justify-center items-center space-y-1">
                <div className="w-4 h-0.5 bg-current"></div>
                <div className="w-4 h-0.5 bg-current"></div>
                <div className="w-4 h-0.5 bg-current"></div>
              </div>
            )}
          </Button>

          {/* BoxCall Logo and Branding */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 flex items-center justify-center">
              <SidebarLogo />
            </div>
            <Typography
              variant="headline-sm"
              as="h1"
              className="text-jade-600 dark:text-jade-400 font-bold tracking-tight"
            >
              BoxCall
            </Typography>
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Future: User actions, notifications, etc. */}
        </div>
      </header>

      {/* Persistent Hamburger - Always visible when header is hidden */}
      <Button
        variant="primary"
        onClick={onMenuToggle}
        className={`
          fixed top-4 left-4 z-[60] 
          w-12 h-12 rounded-xl shadow-lg 
          bg-jade-600 hover:bg-jade-700 dark:bg-jade-500 dark:hover:bg-jade-600
          text-white border-0 
          transition-all duration-300 ease-out
          hover:scale-105 active:scale-95
          focus:outline-none focus:ring-2 focus:ring-jade-400 focus:ring-offset-2
          ${isVisible ? "opacity-0 pointer-events-none scale-75" : "opacity-100 pointer-events-auto scale-100"}
        `}
        aria-label={sidebarOpen ? "Close menu" : "Open menu"}
      >
        {sidebarOpen ? (
          <Icon name="close" size="md" />
        ) : (
          <div className="w-5 h-5 flex flex-col justify-center items-center space-y-1">
            <div className="w-4 h-0.5 bg-current"></div>
            <div className="w-4 h-0.5 bg-current"></div>
            <div className="w-4 h-0.5 bg-current"></div>
          </div>
        )}
      </Button>
    </>
  );
};
