import React, { useState } from "react";
import { useAuthProfile, useIsAuthenticated } from "../../app/auth-store";
import { supabase } from "../../lib/supabase";

/**
 * Navigation Component
 * 
 * Main navigation header with user menu and authentication controls.
 * Responsive design with mobile-friendly dropdown menu.
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
    <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <button
              onClick={() => handleNavigation("/dashboard")}
              className="flex items-center space-x-2 text-xl font-bold text-blue-600 hover:text-blue-700"
            >
              <span className="text-2xl">🏈</span>
              <span>BoxCall</span>
            </button>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-6">
            <button
              onClick={() => handleNavigation("/dashboard")}
              className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Dashboard
            </button>
            
            {/* Team Navigation - Show for different user types */}
            {(profile?.role === "admin" || profile?.role === "coach") && (
              <button
                onClick={() => handleNavigation("/team/1")}
                className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                {profile?.role === "admin" ? "Team Management" : "My Team"}
              </button>
            )}
            
            {/* Playbook Tools - For coaches and above */}
            {(profile?.role === "admin" || profile?.role === "coach") && (
              <button
                onClick={() => handleNavigation("/playbooks")}
                className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Playbooks
              </button>
            )}
            
            {/* Conditional Admin Links */}
            {profile?.role === "admin" && (
              <button
                onClick={() => handleNavigation("/admin")}
                className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Admin
              </button>
            )}
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {/* User Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                  {profile?.display_name?.[0] || profile?.email?.[0] || "U"}
                </div>
                <span className="hidden sm:block">
                  {profile?.display_name || profile?.email?.split("@")[0] || "User"}
                </span>
                <svg
                  className={`w-4 h-4 transition-transform ${userMenuOpen ? "rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                  <div className="py-1">
                    {/* Profile Info */}
                    <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {profile?.display_name || "User"}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                        {profile?.email}
                      </p>
                      {profile?.role && (
                        <p className="text-xs text-blue-600 dark:text-blue-400 capitalize">
                          {profile.role}
                        </p>
                      )}
                    </div>

                    {/* Menu Items */}
                    <button
                      onClick={() => handleNavigation("/profile")}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      👤 My Profile
                    </button>
                    
                    <button
                      onClick={() => handleNavigation("/dashboard")}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      🏠 Dashboard
                    </button>

                    {/* Conditional Menu Items */}
                    {profile?.role === "admin" && (
                      <button
                        onClick={() => handleNavigation("/super-admin")}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        🔧 Super Admin
                      </button>
                    )}

                    <div className="border-t border-gray-200 dark:border-gray-700 mt-1 pt-1">
                      <button
                        onClick={handleSignOut}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        🚪 Sign Out
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 p-2"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 dark:border-gray-700 pt-4 pb-4">
            <div className="space-y-2">
              <button
                onClick={() => handleNavigation("/dashboard")}
                className="block w-full text-left px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
              >
                🏠 Dashboard
              </button>
              
              {(profile?.role === "admin" || profile?.role === "coach") && (
                <button
                  onClick={() => handleNavigation("/team/1")}
                  className="block w-full text-left px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                >
                  🏈 {profile?.role === "admin" ? "Team Management" : "My Team"}
                </button>
              )}
              
              {(profile?.role === "admin" || profile?.role === "coach") && (
                <button
                  onClick={() => handleNavigation("/playbooks")}
                  className="block w-full text-left px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                >
                  📋 Playbooks
                </button>
              )}
              
              <button
                onClick={() => handleNavigation("/profile")}
                className="block w-full text-left px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
              >
                👤 My Profile
              </button>

              {profile?.role === "admin" && (
                <>
                  <button
                    onClick={() => handleNavigation("/admin")}
                    className="block w-full text-left px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                  >
                    ⚙️ Admin
                  </button>
                  <button
                    onClick={() => handleNavigation("/super-admin")}
                    className="block w-full text-left px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                  >
                    🔧 Super Admin
                  </button>
                </>
              )}

              <div className="border-t border-gray-200 dark:border-gray-700 pt-2 mt-2">
                <button
                  onClick={handleSignOut}
                  className="block w-full text-left px-3 py-2 text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
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
