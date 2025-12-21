import React, { useEffect, useState, lazy, Suspense } from "react";
import { Button } from "../ui/Button";
import { Typography } from "../design-system/Typography";
import { SaveIndicatorLogo } from "../ui/Logo";
import { UserMenu } from "../auth/UserMenu";
import { Icon } from "../ui/Icon/Icon";
import { useActiveTeamStore } from "../../stores/activeTeamStore";
import { useRoles } from "../../hooks/useRoles";
import { useAuthProfile } from "../../app/auth-store";
import { useDevMode } from "../../app/dev-mode-hooks";
import { useSaveState } from "../../hooks/useSaveState";
import {
  isPWAInstallAvailable,
  requestPWAInstallPrompt,
} from "../pwa/PWAIntegration";
import { triggerHapticFeedback } from "../../lib/hapticFeedback";
import { debug } from "../../utils/logger";
import {
  PWA_INSTALL_AVAILABLE_EVENT,
  addWindowAppEventListener,
} from "../../utils/appEvents";

// Lazy load GlobalSearch to defer search functionality until user interacts
const GlobalSearch = lazy(() =>
  import("../ui/GlobalSearch").then((module) => ({
    default: module.GlobalSearch,
  }))
);

interface AppHeaderProps {
  onMenuToggle: () => void;
  onVisibilityChange?: (visible: boolean) => void;
}

type TeamOption = {
  id: string;
  name: string;
};

function getRoleDisplay(role?: string | null) {
  if (role === "admin") return "Super Admin";
  if (role === "coach") return "Coach";
  if (role === "player") return "Player";
  return "User";
}

function buildTeams(
  roleContext: ReturnType<typeof useRoles>["roleContext"]
): TeamOption[] {
  return (
    roleContext?.teamMemberships.map((tm) => ({
      id: tm.teamId,
      name: tm.teamName,
    })) ?? []
  );
}

function MenuToggleButton({
  onClick,
  className,
}: {
  onClick: () => void;
  className: string;
}) {
  return (
    <Button
      variant="primary"
      size="md"
      onClick={() => {
        triggerHapticFeedback("light");
        onClick();
      }}
      className={className}
      aria-label="Toggle menu"
    >
      <Icon name="menu" size="md" />
    </Button>
  );
}

function NotificationsButton({
  size,
  className,
  iconSize,
}: {
  size: "sm" | "md";
  className: string;
  iconSize: "sm" | "md";
}) {
  return (
    <Button
      variant="ghost"
      size={size}
      onClick={() => {
        triggerHapticFeedback("light");
        debug("Notifications clicked");
      }}
      className={className}
      aria-label="Notifications"
    >
      <Icon
        name="bell"
        size={iconSize}
        className="text-secondary hover:text-primary transition-colors"
      />
    </Button>
  );
}

function GlobalSearchSuspense({
  className,
  fallbackClassName,
}: {
  className?: string;
  fallbackClassName: string;
}) {
  return (
    <Suspense fallback={<div className={fallbackClassName} />}>
      <GlobalSearch className={className} />
    </Suspense>
  );
}

function InstallPwaButton({ onClick }: { onClick: () => void }) {
  return (
    <Button
      variant="gradient"
      size="sm"
      onClick={onClick}
      className="flex items-center gap-2 px-3"
    >
      <Icon name="download" size="sm" /> Install BoxCall
    </Button>
  );
}

function SaveQueueIndicator({
  queueLength,
  onRetry,
  onClear,
}: {
  queueLength: number;
  onRetry: () => void;
  onClear: () => void;
}) {
  if (queueLength <= 0) return null;

  return (
    <button
      onClick={() => {
        triggerHapticFeedback("light");
        onRetry();
      }}
      onContextMenu={(e) => {
        e.preventDefault();
        triggerHapticFeedback("medium");
        onClear();
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
  );
}

function Branding({
  roleDisplay,
  showDevBadge,
  isOnline,
  queueLength,
  onRetryFailedSaves,
  onClearQueue,
}: {
  roleDisplay: string;
  showDevBadge: boolean;
  isOnline: boolean;
  queueLength: number;
  onRetryFailedSaves: () => void;
  onClearQueue: () => void;
}) {
  return (
    <div className="flex items-center gap-2 min-w-0 flex-1">
      <div className="flex-shrink-0 relative">
        <SaveIndicatorLogo size="sm" />
        <SaveQueueIndicator
          queueLength={queueLength}
          onRetry={onRetryFailedSaves}
          onClear={onClearQueue}
        />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <Typography
            variant="headline-sm"
            className="text-jade-600 dark:text-jade-400 font-bold tracking-tight leading-tight whitespace-nowrap"
          >
            BoxCall
          </Typography>
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
          <span className="text-secondary truncate">{roleDisplay}</span>
          {showDevBadge && (
            <span className="text-warning-600 dark:text-warning-400 font-medium">
              DEV
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function MobileHeaderRow({
  teams,
  onMenuToggle,
}: {
  teams: TeamOption[];
  onMenuToggle: () => void;
}) {
  return (
    <div className="md:hidden flex items-center justify-between h-16 gap-3">
      <MenuToggleButton
        onClick={onMenuToggle}
        className="w-10 h-10 !p-0 flex items-center justify-center rounded-radius-md flex-shrink-0"
      />
      <div className="flex-1 flex justify-center">
        <GlobalSearchSuspense fallbackClassName="h-10 w-28 animate-pulse bg-muted rounded-lg" />
      </div>
      <div className="flex items-center gap-2">
        <NotificationsButton
          size="sm"
          iconSize="sm"
          className="w-10 h-10 !p-0 flex items-center justify-center hover:bg-surface-hover rounded-lg transition-colors"
        />
        <UserMenu teams={teams} />
      </div>
    </div>
  );
}

function DesktopHeaderRow({
  teams,
  canInstallPwa,
  onInstall,
}: {
  teams: TeamOption[];
  canInstallPwa: boolean;
  onInstall: () => void;
}) {
  return (
    <div className="hidden md:flex items-center justify-center h-16">
      <div className="flex items-center gap-3">
        <GlobalSearchSuspense
          className="w-full max-w-lg"
          fallbackClassName="w-full max-w-lg h-10 animate-pulse bg-muted rounded-lg"
        />
        {canInstallPwa && <InstallPwaButton onClick={onInstall} />}
      </div>
      <div className="absolute right-4 lg:right-8 flex items-center gap-3">
        <NotificationsButton
          size="sm"
          iconSize="md"
          className="w-11 h-11 !p-0 flex items-center justify-center hover:bg-surface-hover rounded-lg transition-colors relative"
        />
        <UserMenu teams={teams} />
      </div>
    </div>
  );
}

function DesktopLeftSection({
  isVisible,
  onMenuToggle,
  roleDisplay,
  showDevBadge,
  isOnline,
  queueLength,
  onRetryFailedSaves,
  onClearQueue,
}: {
  isVisible: boolean;
  onMenuToggle: () => void;
  roleDisplay: string;
  showDevBadge: boolean;
  isOnline: boolean;
  queueLength: number;
  onRetryFailedSaves: () => void;
  onClearQueue: () => void;
}) {
  return (
    <div
      className={`
        hidden md:block
        fixed top-0 left-0 z-modal w-80
        bg-surface-card/90 dark:bg-surface-card/90 
        backdrop-blur-md
        border-r border-border/10
        transition-transform duration-300 ease-out
        ${isVisible ? "translate-y-0" : "-translate-y-full"}
      `}
    >
      <div className="flex items-center h-16 px-4 gap-3">
        <MenuToggleButton
          onClick={onMenuToggle}
          className="w-11 h-11 !p-0 flex items-center justify-center rounded-radius-md flex-shrink-0"
        />
        <Branding
          roleDisplay={roleDisplay}
          showDevBadge={showDevBadge}
          isOnline={isOnline}
          queueLength={queueLength}
          onRetryFailedSaves={onRetryFailedSaves}
          onClearQueue={onClearQueue}
        />
      </div>
    </div>
  );
}

function FloatingHamburger({
  isVisible,
  onMenuToggle,
}: {
  isVisible: boolean;
  onMenuToggle: () => void;
}) {
  return (
    <MenuToggleButton
      onClick={onMenuToggle}
      className={`
        fixed top-4 left-4 z-fixed
        w-11 h-11 !p-0 flex items-center justify-center
        rounded-radius-md
        shadow-elevation-md
        transition-all duration-300 ease-out
        ${isVisible ? "opacity-0 invisible pointer-events-none scale-75" : "opacity-100 visible pointer-events-auto scale-100 delay-150"}
      `}
    />
  );
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
  useActiveTeamStore((s) => s.activeTeamId);
  const { queueLength, retryFailedSaves, clearQueue, isOnline } =
    useSaveState();

  // Get role display info
  const roleDisplay = getRoleDisplay(profile?.role);
  const showDevBadge = devMode && devMode !== "production";
  const teams = buildTeams(roleContext);

  // 🔍 DEBUG: Log teams for header
  debug("🎯 AppHeader - roleContext:", roleContext);
  debug("🎯 AppHeader - teams for switcher:", teams);

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
    return addWindowAppEventListener(PWA_INSTALL_AVAILABLE_EVENT, (detail) => {
      setCanInstallPWA(Boolean(detail?.available));
    });
  }, []);

  const handleInstallClick = async () => {
    await requestPWAInstallPrompt();
  };

  return (
    <>
      {/* Main Header - Auto-hides on scroll */}
      <header
        className={`
          fixed top-0 left-0 right-0 z-sticky 
          bg-surface-card/90 dark:bg-surface-card/90 
          backdrop-blur-md
          shadow-[inset_0_-1px_0_rgba(0,0,0,0.05)]
          transition-transform duration-300 ease-out
          ${isVisible ? "translate-y-0" : "-translate-y-full"}
        `}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Mobile/Tablet Layout (< md) */}
          <MobileHeaderRow teams={teams} onMenuToggle={onMenuToggle} />

          {/* Desktop Layout (≥ md) */}
          <DesktopHeaderRow
            teams={teams}
            canInstallPwa={canInstallPWA}
            onInstall={handleInstallClick}
          />
        </div>
      </header>

      {/* Fixed Left Section - Part of Header, Sidebar Width (Desktop Only) */}
      <DesktopLeftSection
        isVisible={isVisible}
        onMenuToggle={onMenuToggle}
        roleDisplay={roleDisplay}
        showDevBadge={Boolean(showDevBadge)}
        isOnline={isOnline}
        queueLength={queueLength}
        onRetryFailedSaves={retryFailedSaves}
        onClearQueue={clearQueue}
      />

      {/* Floating Hamburger - When Header Hidden */}
      <FloatingHamburger isVisible={isVisible} onMenuToggle={onMenuToggle} />
    </>
  );
};
