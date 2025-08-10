/**
 * User Menu Component
 * Simple dropdown menu with user info and logout option
 */

import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "../../app/auth-store";

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
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
        disabled={loading}
      >
        {/* Simple avatar circle */}
        <div className="w-8 h-8 bg-jade-500 rounded-full flex items-center justify-center text-white font-medium text-sm">
          {userName.charAt(0).toUpperCase()}
        </div>
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
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50">
          <div className="py-1">
            {/* User Info */}
            <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {userName}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                {userEmail}
              </p>
            </div>

            {/* Menu Items */}
            <button
              onClick={() => {
                setIsOpen(false);
                // Navigate to profile - you can add this later
                console.log("Navigate to profile");
              }}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Profile Settings
            </button>

            <button
              onClick={() => {
                setIsOpen(false);
                // Navigate to team settings - you can add this later
                console.log("Navigate to team");
              }}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Team Settings
            </button>

            <hr className="border-gray-200 dark:border-gray-700" />

            {/* Logout */}
            <button
              onClick={handleLogout}
              disabled={loading}
              className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-700 dark:hover:text-red-300 transition-colors disabled:opacity-50"
            >
              {loading ? "Signing out..." : "Sign Out"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
