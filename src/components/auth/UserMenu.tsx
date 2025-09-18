/**
 * User Menu Component
 * Simple dropdown menu with user info and logout option
 */

import React, { useState, useRef, useEffect } from "react";
import { Button } from "../ui/Button/Button";
import { useAuth } from "../../app/auth-store";
import { Typography } from "@components/design-system/Typography";

export const UserMenu: React.FC = () => {
  const { user, profile, signOut, loading } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Don't render if no user
  if (!user) return null;

  const handleLogout = async () => {
    setIsOpen(false);
    await signOut();
  };

  const userEmail = user.email || "Unknown User";
  const userName = profile?.full_name || userEmail;

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      {/* User Avatar/Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        variant="ghost"
        size="sm"
        className="flex items-center space-x-2 px-3 py-2 h-auto font-medium text-text-secondary hover:text-text-primary"
        disabled={loading}
      >
        {/* Simple avatar circle */}
        <Typography
          variant="body-sm"
          as="div"
          className="w-8 h-8 surface-subtle0 rounded-full flex items-center justify-center text-text-inverse font-medium"
        >
          {userName.charAt(0).toUpperCase()}
        </Typography>
        <span className="hidden sm:block max-w-32 truncate">{userName}</span>
        <svg
          className={`w-4 h-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
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
        <div className="absolute right-0 mt-2 w-64 surface-card rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50">
          <div className="py-1">
            {/* User Info */}
            <div className="px-4 py-2 border-b border-subtle dark:border-gray-700">
              <Typography
                variant="body-sm"
                as="p"
                className="font-medium text-text-primary dark:text-text-inverse"
              >
                {userName}
              </Typography>
              <p className="text-sm text-text-secondary truncate">
                {userEmail}
              </p>
            </div>

            {/* Menu Items */}
            <Button
              onClick={() => {
                setIsOpen(false);
// console.info("Navigate to profile");
              }}
              variant="ghost"
              size="xs"
              className="w-full justify-start px-4 py-2 h-auto text-sm text-text-secondary hover:text-text-primary"
            >
              Profile Settings
            </Button>

            <Button
              onClick={() => {
                setIsOpen(false);
// console.info("Navigate to team");
              }}
              variant="ghost"
              size="xs"
              className="w-full justify-start px-4 py-2 h-auto text-sm text-text-secondary hover:text-text-primary"
            >
              Team Settings
            </Button>

            <hr className="border-subtle dark:border-gray-700" />

            {/* Logout */}
            <Button
              onClick={handleLogout}
              disabled={loading}
              variant="danger"
              size="xs"
              className="w-full justify-start px-4 py-2 h-auto text-sm"
            >
              {loading ? "Signing out..." : "Sign Out"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
