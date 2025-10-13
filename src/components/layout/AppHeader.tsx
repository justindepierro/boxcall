import React, { useEffect, useState, lazy, Suspense } from "react";
import { Button } from "../ui/Button";
import { Typography } from "../design-system/Typography";
import { SaveIndicatorLogo } from "../ui/Logo";
import { UserMenu } from "../auth/UserMenu";
import { Icon } from "../ui/Icon/Icon";
import { TeamSwitcher } from "./TeamSwitcher";
import { useActiveTeamStore } from "../../state/activeTeamStore";
import { useRoles } from "../../hooks/useRoles";
import { useAuthProfile } from "../../app/auth-store";
import { useDevMode } from "../../app/dev-mode-hooks";
import { useSaveState } from "../../contexts/SaveStateContext";
import {
  isPWAInstallAvailable,
  requestPWAInstallPrompt,
} from "../pwa/PWAIntegration";
import { triggerHapticFeedback } from "../../lib/hapticFeedback";

// Lazy load GlobalSearch to defer fuse.js (70KB) until user interacts
const GlobalSearch = lazy(() =>
  import("../ui/GlobalSearch").then((module) => ({
    default: module.GlobalSearch,
  }))
);

interface AppHeaderProps {
  onMenuToggle: () => void;
  onVisibilityChange?: (visible: boolean) => void;
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
  onVisibilityChange,
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [canInstallPWA, setCanInstallPWA] = useState(isPWAInstallAvailable());
  const { roleContext } = useRoles();
  const profile = useAuthProfile();
  const { devMode } = useDevMode();
  const { activeTeamId: _activeTeamId } = useActiveTeamStore();
  const { queueLength, retryFailedSaves, clearQueue, isOnline } = useSaveState();

  // Get role display info
  const roleDisplay =
    profile?.role === "admin"
      ? "Super Admin"
      : profile?.role === "coach"
        ? "Coach"
        : profile?.role === "player"
          ? "Player"
          : "User";
  const showDevBadge = devMode && devMode !== "production";
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
          const newIsVisible =
            currentScrollY < lastScrollY || currentScrollY < 10;

          if (newIsVisible !== isVisible) {
            setIsVisible(newIsVisible);
            onVisibilityChange?.(newIsVisible);
          }

          if (
            currentScrollY > lastScrollY &&
            currentScrollY > 100 &&
            isVisible
          ) {
            setIsVisible(false);
            onVisibilityChange?.(false);
          }

          setLastScrollY(currentScrollY);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY, isVisible, onVisibilityChange]);

  useEffect(() => {
    const handleAvailability = (event: Event) => {
      const detail = (event as CustomEvent<{ available: boolean }>).detail;
      setCanInstallPWA(Boolean(detail?.available));
    };
    window.addEventListener("pwa:install-available", handleAvailability);
    return () =>
      window.removeEventListener("pwa:install-available", handleAvailability);
  }, []);

  const handleInstallClick = async () => {
    await requestPWAInstallPrompt();
  };

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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ml-80">
          <div className="flex items-center h-16">
            {/* Global Search + Install CTA */}
            <div className="flex-1 flex items-center justify-center gap-3">
              {canInstallPWA && (
                <Button
                  variant="gradient"
                  size="sm"
                  onClick={handleInstallClick}
                  className="hidden sm:flex items-center gap-2 px-3"
                >
                  <Icon name="download" size="sm" /> Install BoxCall
                </Button>
              )}
              <Suspense
                fallback={
                  <div className="w-64 h-10 animate-pulse bg-surface-muted dark:bg-surface-secondary dark:bg-gray-700 rounded-lg" />
                }
              >
                <GlobalSearch />
              </Suspense>
            </div>

            {/* Right side - TeamSwitcher and User Actions */}
            <div className="flex-1 flex items-center justify-end gap-3">
              <TeamSwitcher teams={teams} />
              {/* TODO: Add notification system - see NotificationsBell in components/social */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  triggerHapticFeedback("light");
                  console.log("Notifications clicked");
                }}
                className="w-11 h-11 !p-0 flex items-center justify-center hover:bg-surface-hover rounded-lg transition-colors relative"
                aria-label="Notifications"
              >
                <Icon
                  name="bell"
                  size="md"
                  className="text-text-secondary hover:text-text-primary transition-colors"
                />
              </Button>
              <UserMenu />
            </div>
          </div>
        </div>
      </header>

      {/* Fixed Left Section - Part of Header, Sidebar Width */}
      <div
        className={`
          fixed top-0 left-0 z-[60] w-80
          bg-surface-card/90 dark:bg-surface-card/90 
          backdrop-blur-md
          border-r border-border/10
          transition-transform duration-300 ease-out
          ${isVisible ? "translate-y-0" : "-translate-y-full"}
        `}
      >
        <div className="flex items-center h-16 px-4 gap-3">
          {/* Hamburger Menu Button */}
          <Button
            variant="primary"
            size="md"
            onClick={() => {
              triggerHapticFeedback("light");
              onMenuToggle();
            }}
            className="w-11 h-11 !p-0 flex items-center justify-center rounded-radius-md flex-shrink-0"
            aria-label="Toggle menu"
          >
            <Icon name="menu" size="md" />
          </Button>

          {/* Logo and Branding */}
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div className="flex-shrink-0 relative">
              <SaveIndicatorLogo size="sm" />
              {/* Save Queue Indicator */}
              {queueLength > 0 && (
                <button
                  onClick={() => {
                    triggerHapticFeedback("light");
                    retryFailedSaves();
                  }}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    triggerHapticFeedback("medium");
                    clearQueue();
                  }}
                  className="absolute -top-1 -right-1 min-w-5 h-5 px-1.5 
                    bg-warning-500 dark:bg-warning-600 
                    text-white text-xs font-semibold 
                    rounded-full flex items-center justify-center 
                    shadow-md hover:scale-110 transition-transform
                    cursor-pointer"
                  title={`${queueLength} pending save${queueLength > 1 ? "s" : ""} - Click to retry, right-click to clear`}
                  aria-label={`${queueLength} pending saves in queue`}
                >
                  {queueLength}
                </button>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <Typography
                  variant="headline-sm"
                  className="text-jade-600 dark:text-jade-400 font-bold tracking-tight leading-tight whitespace-nowrap"
                >
                  BoxCall
                </Typography>
                {/* Offline Indicator */}
                {!isOnline && (
                  <span
                    className="px-1.5 py-0.5 text-xs font-medium 
                      bg-error-500/10 dark:bg-error-500/20 
                      text-error-700 dark:text-error-400 
                      rounded-md border border-error-500/20"
                    title="You are currently offline. Changes will be saved when connection is restored."
                  >
                    Offline
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5 text-xs leading-tight">
                <span className="text-text-secondary truncate">
                  {roleDisplay}
                </span>
                {showDevBadge && (
                  <span className="text-warning-600 dark:text-warning-400 font-medium">
                    DEV
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Hamburger - When Header Hidden */}
      <Button
        variant="primary"
        size="md"
        onClick={() => {
          triggerHapticFeedback("light");
          onMenuToggle();
        }}
        className={`
          fixed top-4 left-4 z-[55]
          w-11 h-11 !p-0 flex items-center justify-center
          rounded-radius-md
          shadow-elevation-md
          transition-all duration-300 ease-out
          ${isVisible ? "opacity-0 invisible pointer-events-none scale-75" : "opacity-100 visible pointer-events-auto scale-100 delay-150"}
        `}
        aria-label="Toggle menu"
      >
        <Icon name="menu" size="md" />
      </Button>
    </>
  );
};
