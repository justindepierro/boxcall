/**
 * User Menu Component
 * Simple dropdown menu with user info and logout option
 */

import React, { useState, useRef, useEffect } from "react";
import { Button } from "../ui/Button/Button";
import { useAuth } from "../../app/auth-store";
import { Typography } from "@components/design-system/Typography";
import { warn } from "../../utils/logger";

export const UserMenu: React.FC = () => {
  const { user, profile, signOut, loading } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setShowLogoutConfirm(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Don't render if no user
  if (!user) return null;

  const handleLogout = async () => {
    setShowLogoutConfirm(false);
    setIsOpen(false);
    try {
      await signOut();
    } catch (error) {
      warn("Failed to sign out:", error);
    }
  };

  const handleLogoutClick = () => {
    // Show confirmation on first click
    if (!showLogoutConfirm) {
      setShowLogoutConfirm(true);
      return;
    }
    // Actually logout on second click
    handleLogout();
  };

  const handleCancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  const userEmail = user.email || "Unknown User";
  const userName = profile?.full_name || userEmail;

  // Helper function to get initials (matches ProfileCard)
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      {/* User Avatar/Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        variant="ghost"
        size="sm"
        className="gap-2 px-4 py-2 h-10 font-medium text-secondary hover:text-primary min-w-44"
        disabled={loading}
      >
        {/* Profile picture matching ProfileCard style */}
        <div className="w-8 h-8 bg-surface-secondary rounded-full flex items-center justify-center border border-subtle flex-shrink-0">
          <Typography variant="body-sm" className="font-bold text-primary">
            {getInitials(userName)}
          </Typography>
        </div>
        <span className="hidden sm:inline-block font-medium truncate text-left min-w-0 max-w-30">
          {userName}
        </span>
        <svg
          className={`w-4 h-4 transition-transform duration-200 flex-shrink-0 ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </Button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-surface-primary/98 backdrop-blur-xl rounded-lg shadow-2xl border border-medium/40 z-[70] overflow-hidden max-h-[calc(100vh-5rem)]">
          <div className="py-1">
            {/* User Info */}
            <div className="px-4 py-3 border-b border-medium/40 bg-surface-subtle/20">
              <Typography
                variant="body-sm"
                as="p"
                className="font-medium text-primary"
              >
                {userName}
              </Typography>
              <p className="text-xs text-secondary truncate mt-0.5">
                {userEmail}
              </p>
            </div>

            <Button
              onClick={() => {
                setIsOpen(false);
                console.info("Navigate to profile");
              }}
              variant="ghost"
              size="xs"
              className="w-full justify-start px-4 py-2.5 h-auto text-sm text-secondary hover:text-primary hover:bg-surface-hover rounded-none"
            >
              Profile Settings
            </Button>

            <Button
              onClick={() => {
                setIsOpen(false);
                console.info("Navigate to team");
              }}
              variant="ghost"
              size="xs"
              className="w-full justify-start px-4 py-2.5 h-auto text-sm text-secondary hover:text-primary hover:bg-surface-hover rounded-none"
            >
              Team Settings
            </Button>

            <div className="border-t border-medium/50 my-1" />

            {/* Logout with confirmation */}
            {!showLogoutConfirm ? (
              <Button
                onClick={handleLogoutClick}
                disabled={loading}
                variant="ghost"
                size="xs"
                className="w-full justify-start px-4 py-2.5 h-auto text-sm text-error hover:text-error hover:bg-surface-error/10 rounded-none"
              >
                Sign Out
              </Button>
            ) : (
              <div className="px-4 py-3 bg-surface-error/5 border-t border-error/20">
                <Typography
                  variant="body-xs"
                  className="text-secondary mb-2"
                >
                  Are you sure you want to sign out?
                </Typography>
                <div className="flex gap-2">
                  <Button
                    onClick={handleLogout}
                    disabled={loading}
                    variant="ghost"
                    size="xs"
                    className="flex-1 bg-surface-error/10 hover:bg-surface-error/20 text-error text-xs py-1.5"
                  >
                    {loading ? "Signing out..." : "Yes, sign out"}
                  </Button>
                  <Button
                    onClick={handleCancelLogout}
                    disabled={loading}
                    variant="ghost"
                    size="xs"
                    className="flex-1 text-xs py-1.5"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
