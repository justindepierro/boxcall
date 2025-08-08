import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useIsAuthenticated, useAuth } from "../../app/auth-store";
import { useDevMode } from "../../app/dev-mode-hooks";
import { useUI } from "../../app/store";
import { Icon } from "./Icon/Icon";
import { NotificationBadge, Badge } from "./Badge";
import { NavbarLogo } from "./Logo";

/**
 * Navigation Component
 *
 * Masculine, square navigation with jade/navy theme
 * Professional, confident design for football team management
 */
export const Navigation: React.FC = () => {
  const isAuthenticated = useIsAuthenticated();
  const { devMode } = useDevMode();
  const { toggleSidebar } = useUI();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const isDevMode = devMode !== "production";

  // Mock data for reward loop demonstration
  const [notifications] = useState({
    dashboard: 2, // New team updates
    bulletin: 5, // Unread announcements
    playbook: 1, // New play suggestions
    calendar: 3, // Upcoming events
  });

  const [achievements] = useState({
    hasNewAchievement: true, // Show premium badge for recent milestone
    playbookProgress: 67, // Progress toward season goal
  });

  // Auto-hide navigation on scroll and mouse behavior
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY < 10) {
        setIsVisible(true);
      } else if (currentScrollY < lastScrollY) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 50) {
        setIsVisible(false);
      }

      setLastScrollY(currentScrollY);
    };

    let hideTimeout: NodeJS.Timeout;
    const handleMouseMove = (e: MouseEvent) => {
      if (e.clientY < 80) {
        setIsVisible(true);
        if (hideTimeout) clearTimeout(hideTimeout);
      } else if (window.scrollY > 50) {
        if (hideTimeout) clearTimeout(hideTimeout);
        hideTimeout = setTimeout(() => setIsVisible(false), 1000);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("mousemove", handleMouseMove);
      if (hideTimeout) clearTimeout(hideTimeout);
    };
  }, [lastScrollY]);

  const { signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      console.log("Navigation: Starting logout process...");
      console.log("Navigation: Current window location:", window.location.href);

      // Use the auth store's signOut method for proper state management
      console.log("Navigation: Calling auth store signOut...");
      await signOut();

      console.log("Navigation: Auth state cleared successfully");

      // Small delay to ensure state updates are processed
      await new Promise((resolve) => setTimeout(resolve, 100));

      console.log("Navigation: Navigating to login...");

      // Use React Router navigation instead of window.location
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Navigation: Logout error:", error);
      console.log("Navigation: Force redirecting due to error...");
      // Force redirect even if there's an error - use navigate as fallback
      try {
        navigate("/login", { replace: true });
      } catch (_navError) {
        console.warn(
          "Navigation: React Router navigation failed, using window.location"
        );
        window.location.replace("/login");
      }
    }
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    setMobileMenuOpen(false);
  };
  if (!isAuthenticated) {
    return null; // Don't show navigation for unauthenticated users
  }
  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-800 shadow-md border-b-2 border-gray-200 dark:border-gray-700 transition-transform duration-300 ${
        isVisible ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-16">
          {/* Logo and Brand - Display font for impact */}
          <div className="flex items-center space-x-4">
            {/* Sidebar Toggle */}
            <button
              onClick={() => toggleSidebar()}
              className="text-gray-700 dark:text-gray-300 hover:text-interaction-jade dark:hover:text-brand-jade hover:bg-surface-jade dark:hover:bg-surface-jade-dark p-2 rounded-sm border border-transparent hover:border-surface-jade-dark transition-all duration-200"
              title="Toggle sidebar"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h7"
                />
              </svg>
            </button>
            <button
              onClick={() => handleNavigation("/dashboard")}
              className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
            >
              <div className="flex items-center justify-center w-8 h-8">
                <NavbarLogo />
              </div>
              <span className="font-display text-xl tracking-wide text-interaction-jade dark:text-brand-jade font-bold">
                BoxCall
              </span>
            </button>
          </div>

          {/* Desktop Quick Actions - Centered */}
          <div className="hidden md:flex items-center space-x-4 flex-1 justify-center">
            {/* Quick Navigation Shortcuts with Reward Loop Psychology */}
            <div className="flex items-center space-x-3">
              {/* Dashboard with notification badge */}
              <div className="relative">
                <button
                  onClick={() => handleNavigation("/dashboard")}
                  className="text-gray-600 dark:text-gray-400 hover:text-interaction-jade dark:hover:text-brand-jade p-2 rounded-md hover:bg-surface-jade dark:hover:bg-surface-jade-dark transition-all duration-200"
                  title="Dashboard (⌘+1)"
                >
                  <Icon name="home" size="md" color="current" />
                </button>
                {notifications.dashboard > 0 && (
                  <div className="absolute -top-1 -right-1">
                    <NotificationBadge count={notifications.dashboard} />
                  </div>
                )}
              </div>

              {/* Team Bulletin with notification badge */}
              <div className="relative">
                <button
                  onClick={() => handleNavigation("/team/1/bulletin")}
                  className="text-gray-600 dark:text-gray-400 hover:text-interaction-jade dark:hover:text-brand-jade p-2 rounded-md hover:bg-surface-jade dark:hover:bg-surface-jade-dark transition-all duration-200"
                  title="Team Bulletin (⌘+2)"
                >
                  <Icon name="grid" size="md" color="current" />
                </button>
                {notifications.bulletin > 0 && (
                  <div className="absolute -top-1 -right-1">
                    <NotificationBadge count={notifications.bulletin} />
                  </div>
                )}
              </div>

              {/* BoxCall with premium achievement indicator */}
              <div className="relative">
                <button
                  onClick={() => handleNavigation("/boxcall")}
                  className="text-gray-600 dark:text-gray-400 hover:text-interaction-jade dark:hover:text-brand-jade p-2 rounded-md hover:bg-surface-jade dark:hover:bg-surface-jade-dark transition-all duration-200"
                  title="BoxCall (⌘+3)"
                >
                  <Icon name="zap" size="md" color="current" />
                </button>
                {achievements.hasNewAchievement && (
                  <div className="absolute -top-2 -right-2">
                    <Badge variant="premium" size="sm">
                      NEW
                    </Badge>
                  </div>
                )}
              </div>

              {/* Playbook with progress badge */}
              <div className="relative">
                <button
                  onClick={() => handleNavigation("/playbook")}
                  className="text-gray-600 dark:text-gray-400 hover:text-interaction-jade dark:hover:text-brand-jade p-2 rounded-md hover:bg-surface-jade dark:hover:bg-surface-jade-dark transition-all duration-200"
                  title="Playbook (⌘+4)"
                >
                  <Icon name="book" size="md" color="current" />
                </button>
                {notifications.playbook > 0 && (
                  <div className="absolute -top-1 -right-1">
                    <NotificationBadge count={notifications.playbook} />
                  </div>
                )}
                {/* Progress indicator for playbook completion */}
                <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2">
                  <div className="w-6 h-1 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 transition-all duration-500"
                      style={{ width: `${achievements.playbookProgress}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Calendar with notification badge */}
              <div className="relative">
                <button
                  onClick={() => handleNavigation("/calendar")}
                  className="text-gray-600 dark:text-gray-400 hover:text-interaction-jade dark:hover:text-brand-jade p-2 rounded-md hover:bg-surface-jade dark:hover:bg-surface-jade-dark transition-all duration-200"
                  title="Calendar (⌘+5)"
                >
                  <Icon name="calendar" size="md" color="current" />
                </button>
                {notifications.calendar > 0 && (
                  <div className="absolute -top-1 -right-1">
                    <NotificationBadge count={notifications.calendar} />
                  </div>
                )}
              </div>
            </div>
          </div>
          {/* Right side - Settings and Logout */}
          <div className="flex items-center space-x-3">
            {/* Settings Gear - Link to Profile */}
            <button
              onClick={() => handleNavigation("/profile")}
              className="text-gray-600 dark:text-gray-400 hover:text-interaction-jade dark:hover:text-brand-jade p-2 rounded-md hover:bg-surface-jade dark:hover:bg-surface-jade-dark transition-all duration-200"
              title="Settings & Profile"
            >
              <Icon name="settings" size="md" color="current" />
            </button>

            {/* Sign Out Button */}
            <button
              onClick={handleSignOut}
              className="text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 p-2 rounded-md hover:bg-red-50 dark:hover:bg-red-900/10 transition-all duration-200"
              title="Sign Out"
            >
              <Icon name="power" size="md" color="current" />
            </button>

            {/* Dev mode indicator */}
            {isDevMode && (
              <span className="text-xs bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200 px-2 py-1 rounded font-medium">
                DEV
              </span>
            )}

            {/* Mobile Menu Button - Square styling */}
            <div className="md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-gray-700 dark:text-gray-300 hover:text-interaction-jade dark:hover:text-brand-jade hover:bg-surface-jade dark:hover:bg-surface-jade-dark p-2 rounded-sm border border-transparent hover:border-surface-jade-dark transition-all duration-200"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d={
                      mobileMenuOpen
                        ? "M6 18L18 6M6 6l12 12"
                        : "M4 6h16M4 12h16M4 18h16"
                    }
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
        {/* Mobile Menu - Simplified, encourage sidebar use */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t-2 border-gray-200 dark:border-gray-700 pt-4 pb-4 bg-gray-50 dark:bg-gray-900/50">
            <div className="px-4">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-3 font-medium">
                <Icon name="info" size="sm" color="current" />
                Use the sidebar menu for full navigation
              </div>
              <div className="space-y-2">
                <button
                  onClick={() => handleNavigation("/dashboard")}
                  className="block w-full text-left px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-surface-jade hover:text-interaction-jade dark:hover:bg-surface-jade-dark dark:hover:text-brand-jade rounded-sm transition-all duration-200 font-display font-medium border-l-4 border-transparent hover:border-brand-jade"
                >
                  � Dashboard
                </button>
                <button
                  onClick={() => handleNavigation("/calendar")}
                  className="block w-full text-left px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-surface-jade hover:text-interaction-jade dark:hover:bg-surface-jade-dark dark:hover:text-brand-jade rounded-sm transition-all duration-200 font-display font-medium border-l-4 border-transparent hover:border-brand-jade"
                >
                  � Calendar
                </button>
                <button
                  onClick={() => handleNavigation("/profile")}
                  className="block w-full text-left px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-surface-jade hover:text-interaction-jade dark:hover:bg-surface-jade-dark dark:hover:text-brand-jade rounded-sm transition-all duration-200 font-display font-medium border-l-4 border-transparent hover:border-brand-jade"
                >
                  � My Profile
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      {/* Backdrop for mobile menu */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setMobileMenuOpen(false);
          }}
        />
      )}
    </nav>
  );
};
