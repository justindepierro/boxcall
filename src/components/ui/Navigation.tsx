import React, { useState } from "react";
import { useAuthProfile, useIsAuthenticated } from "../../app/auth-store";
import { supabase } from "../../lib/supabase";

/**
 * Navigation Component
 *
 * Masculine, square navigation with jade/navy theme
 * Professional, confident design for football team management
 */
export const Navigation: React.FC = () => {
  const isAuthenticated = useIsAuthenticated();
  const profile = useAuthProfile();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  const handleNavigation = (path: string) => {
    window.location.href = path;
    setUserMenuOpen(false);
    setMobileMenuOpen(false);
  };

  if (!isAuthenticated) {
    return null; // Don't show navigation for unauthenticated users
  }

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-md border-b-2 border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand - Display font for impact */}
          <div className="flex items-center">
            <button
              onClick={() => handleNavigation("/dashboard")}
              className="flex items-center space-x-3 text-xl font-display font-bold text-jade-600 hover:text-jade-700 transition-colors"
            >
              <span className="text-2xl">🏈</span>
              <span className="font-display text-2xl tracking-wide">
                BoxCall
              </span>
            </button>
          </div>

          {/* Desktop Navigation Links - Square, technical styling */}
          <div className="hidden md:flex items-center space-x-2">
            <button
              onClick={() => handleNavigation("/dashboard")}
              className="text-gray-700 dark:text-gray-300 hover:text-jade-600 hover:bg-jade-50 dark:hover:text-jade-400 dark:hover:bg-jade-900/10 px-4 py-2 rounded-sm text-sm font-display font-medium transition-all duration-200 border border-transparent hover:border-jade-200"
            >
              Dashboard
            </button>

            {/* Master Calendar - Available to all users */}
            <button
              onClick={() => handleNavigation("/calendar")}
              className="text-gray-700 dark:text-gray-300 hover:text-jade-600 hover:bg-jade-50 dark:hover:text-jade-400 dark:hover:bg-jade-900/10 px-4 py-2 rounded-sm text-sm font-display font-medium transition-all duration-200 border border-transparent hover:border-jade-200"
            >
              📅 Calendar
            </button>

            {/* Team Navigation - Show for different user types */}
            {(profile?.role === "admin" || profile?.role === "coach") && (
              <button
                onClick={() => handleNavigation("/team/1")}
                className="text-gray-700 dark:text-gray-300 hover:text-jade-600 hover:bg-jade-50 dark:hover:text-jade-400 dark:hover:bg-jade-900/10 px-4 py-2 rounded-sm text-sm font-display font-medium transition-all duration-200 border border-transparent hover:border-jade-200"
              >
                {profile?.role === "admin" ? "Team Management" : "My Team"}
              </button>
            )}

            {/* Playbook Tools - For coaches and above */}
            {(profile?.role === "admin" || profile?.role === "coach") && (
              <button
                onClick={() => handleNavigation("/playbooks")}
                className="text-gray-700 dark:text-gray-300 hover:text-jade-600 hover:bg-jade-50 dark:hover:text-jade-400 dark:hover:bg-jade-900/10 px-4 py-2 rounded-sm text-sm font-display font-medium transition-all duration-200 border border-transparent hover:border-jade-200"
              >
                Playbooks
              </button>
            )}

            {/* Conditional Admin Links */}
            {profile?.role === "admin" && (
              <button
                onClick={() => handleNavigation("/admin")}
                className="text-gray-700 dark:text-gray-300 hover:text-navy-600 hover:bg-navy-50 dark:hover:text-navy-400 dark:hover:bg-navy-900/10 px-4 py-2 rounded-sm text-sm font-display font-medium transition-all duration-200 border border-transparent hover:border-navy-200"
              >
                Admin
              </button>
            )}
          </div>

          {/* User Menu - Square, professional styling */}
          <div className="flex items-center space-x-4">
            {/* User Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center space-x-3 text-gray-700 dark:text-gray-300 hover:text-jade-600 dark:hover:text-jade-400 px-3 py-2 rounded-sm text-sm font-medium transition-all duration-200 border border-transparent hover:border-jade-200 hover:bg-jade-50 dark:hover:bg-jade-900/10"
              >
                <div className="w-8 h-8 bg-jade-600 rounded-sm flex items-center justify-center text-white text-sm font-display font-bold shadow-sm">
                  {profile?.display_name?.[0] || profile?.email?.[0] || "U"}
                </div>
                <span className="hidden sm:block font-sans font-medium">
                  {profile?.display_name ||
                    profile?.email?.split("@")[0] ||
                    "User"}
                </span>
                <svg
                  className={`w-4 h-4 transition-transform ${userMenuOpen ? "rotate-180" : ""}`}
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

              {/* Dropdown Menu - Square, technical styling */}
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-gray-800 rounded-md shadow-lg border-2 border-gray-200 dark:border-gray-700 z-50">
                  <div className="py-2">
                    {/* Profile Info - Enhanced with display font */}
                    <div className="px-4 py-3 border-b-2 border-gray-200 dark:border-gray-700">
                      <p className="text-sm font-display font-semibold text-gray-900 dark:text-white">
                        {profile?.display_name || "User"}
                      </p>
                      <p className="text-sm font-mono text-gray-500 dark:text-gray-400 truncate">
                        {profile?.email}
                      </p>
                      {profile?.role && (
                        <p className="text-xs font-display font-bold text-jade-600 dark:text-jade-400 capitalize mt-1 px-2 py-1 bg-jade-50 dark:bg-jade-900/20 rounded-sm inline-block">
                          {profile.role}
                        </p>
                      )}
                    </div>

                    {/* Menu Items - Square, confident styling */}
                    <button
                      onClick={() => handleNavigation("/profile")}
                      className="w-full text-left px-4 py-3 text-sm font-sans font-medium text-gray-700 dark:text-gray-300 hover:bg-jade-50 hover:text-jade-700 dark:hover:bg-jade-900/20 dark:hover:text-jade-400 transition-all duration-200 border-l-2 border-transparent hover:border-jade-500"
                    >
                      👤 My Profile
                    </button>

                    <button
                      onClick={() => handleNavigation("/dashboard")}
                      className="w-full text-left px-4 py-3 text-sm font-sans font-medium text-gray-700 dark:text-gray-300 hover:bg-jade-50 hover:text-jade-700 dark:hover:bg-jade-900/20 dark:hover:text-jade-400 transition-all duration-200 border-l-2 border-transparent hover:border-jade-500"
                    >
                      🏠 Dashboard
                    </button>

                    {/* Conditional Menu Items */}
                    {profile?.role === "admin" && (
                      <button
                        onClick={() => handleNavigation("/super-admin")}
                        className="w-full text-left px-4 py-3 text-sm font-sans font-medium text-gray-700 dark:text-gray-300 hover:bg-navy-50 hover:text-navy-700 dark:hover:bg-navy-900/20 dark:hover:text-navy-400 transition-all duration-200 border-l-2 border-transparent hover:border-navy-500"
                      >
                        🔧 Super Admin
                      </button>
                    )}

                    <div className="border-t-2 border-gray-200 dark:border-gray-700 mt-2 pt-2">
                      <button
                        onClick={handleSignOut}
                        className="w-full text-left px-4 py-3 text-sm font-sans font-medium text-red-600 dark:text-red-400 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-900/20 dark:hover:text-red-300 transition-all duration-200 border-l-2 border-transparent hover:border-red-500"
                      >
                        🚪 Sign Out
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Menu Button - Square styling */}
            <div className="md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-gray-700 dark:text-gray-300 hover:text-jade-600 dark:hover:text-jade-400 hover:bg-jade-50 dark:hover:bg-jade-900/10 p-2 rounded-sm border border-transparent hover:border-jade-200 transition-all duration-200"
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

        {/* Mobile Menu - Enhanced square, technical styling */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t-2 border-gray-200 dark:border-gray-700 pt-4 pb-4 bg-gray-50 dark:bg-gray-900/50">
            <div className="space-y-1">
              <button
                onClick={() => handleNavigation("/dashboard")}
                className="block w-full text-left px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-jade-100 hover:text-jade-700 dark:hover:bg-jade-900/20 dark:hover:text-jade-400 rounded-sm transition-all duration-200 font-display font-medium border-l-4 border-transparent hover:border-jade-500"
              >
                🏠 Dashboard
              </button>

              <button
                onClick={() => handleNavigation("/calendar")}
                className="block w-full text-left px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-jade-100 hover:text-jade-700 dark:hover:bg-jade-900/20 dark:hover:text-jade-400 rounded-sm transition-all duration-200 font-display font-medium border-l-4 border-transparent hover:border-jade-500"
              >
                📅 Calendar
              </button>

              {(profile?.role === "admin" || profile?.role === "coach") && (
                <button
                  onClick={() => handleNavigation("/team/1")}
                  className="block w-full text-left px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-jade-100 hover:text-jade-700 dark:hover:bg-jade-900/20 dark:hover:text-jade-400 rounded-sm transition-all duration-200 font-display font-medium border-l-4 border-transparent hover:border-jade-500"
                >
                  🏈 {profile?.role === "admin" ? "Team Management" : "My Team"}
                </button>
              )}

              {(profile?.role === "admin" || profile?.role === "coach") && (
                <button
                  onClick={() => handleNavigation("/playbooks")}
                  className="block w-full text-left px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-jade-100 hover:text-jade-700 dark:hover:bg-jade-900/20 dark:hover:text-jade-400 rounded-sm transition-all duration-200 font-display font-medium border-l-4 border-transparent hover:border-jade-500"
                >
                  📋 Playbooks
                </button>
              )}

              <button
                onClick={() => handleNavigation("/profile")}
                className="block w-full text-left px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-jade-100 hover:text-jade-700 dark:hover:bg-jade-900/20 dark:hover:text-jade-400 rounded-sm transition-all duration-200 font-display font-medium border-l-4 border-transparent hover:border-jade-500"
              >
                👤 My Profile
              </button>

              {profile?.role === "admin" && (
                <>
                  <button
                    onClick={() => handleNavigation("/admin")}
                    className="block w-full text-left px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-navy-100 hover:text-navy-700 dark:hover:bg-navy-900/20 dark:hover:text-navy-400 rounded-sm transition-all duration-200 font-display font-medium border-l-4 border-transparent hover:border-navy-500"
                  >
                    ⚙️ Admin
                  </button>
                  <button
                    onClick={() => handleNavigation("/super-admin")}
                    className="block w-full text-left px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-navy-100 hover:text-navy-700 dark:hover:bg-navy-900/20 dark:hover:text-navy-400 rounded-sm transition-all duration-200 font-display font-medium border-l-4 border-transparent hover:border-navy-500"
                  >
                    🔧 Super Admin
                  </button>
                </>
              )}

              <div className="border-t-2 border-gray-200 dark:border-gray-700 pt-2 mt-3">
                <button
                  onClick={handleSignOut}
                  className="block w-full text-left px-4 py-3 text-red-600 dark:text-red-400 hover:bg-red-100 hover:text-red-700 dark:hover:bg-red-900/20 dark:hover:text-red-300 rounded-sm transition-all duration-200 font-display font-medium border-l-4 border-transparent hover:border-red-500"
                >
                  🚪 Sign Out
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Backdrop for mobile menu */}
      {(userMenuOpen || mobileMenuOpen) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setUserMenuOpen(false);
            setMobileMenuOpen(false);
          }}
        />
      )}
    </nav>
  );
};
