import React from "react";
import { useAuthProfile } from "../../app/auth-store";
import { useUI } from "../../app/store";
import { Navigation } from "../ui/Navigation";
import { Sidebar } from "../ui/Sidebar";
import type { SidebarItem } from "../ui/Sidebar";

interface LayoutProps {
  children: React.ReactNode;
}

/**
 * Layout Component
 *
 * Main application layout wrapper with integrated navigation and sidebar.
 * Provides consistent layout structure for all authenticated pages.
 */
export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const profile = useAuthProfile();
  const { sidebarOpen, toggleSidebar } = useUI();

  // Generate sidebar items based on user role
  const getSidebarItems = (): SidebarItem[] => {
    const baseItems: SidebarItem[] = [
      {
        id: "dashboard",
        label: "Dashboard",
        icon: "🏠",
        onClick: () => (window.location.href = "/dashboard"),
      },
      {
        id: "calendar",
        label: "Calendar", 
        icon: "📅",
        onClick: () => (window.location.href = "/calendar"),
      },
    ];

    // Add role-specific items
    if (profile?.role === "admin" || profile?.role === "coach") {
      baseItems.push({
        id: "team-management",
        label: "Team Management",
        icon: "🏈",
        onClick: () => (window.location.href = "/team/1"),
      });

      baseItems.push({
        id: "playbooks",
        label: "Playbooks",
        icon: "📋", 
        onClick: () => (window.location.href = "/playbooks"),
      });
    }

    // Add admin-specific items
    if (profile?.role === "admin") {
      baseItems.push({
        id: "divider-1",
        label: "",
        divider: true,
      });

      baseItems.push({
        id: "admin",
        label: "Admin Panel",
        icon: "⚙️",
        onClick: () => (window.location.href = "/admin"),
      });

      baseItems.push({
        id: "super-admin",
        label: "Super Admin",
        icon: "🔧",
        onClick: () => (window.location.href = "/super-admin"),
      });
    }

    // Always add profile at the bottom
    baseItems.push(
      {
        id: "divider-2", 
        label: "",
        divider: true,
      },
      {
        id: "profile",
        label: "My Profile",
        icon: "👤",
        onClick: () => (window.location.href = "/profile"),
      }
    );

    return baseItems;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation />
      
      {/* Main content area with sidebar */}
      <div className="flex">
        {/* Sidebar */}
        <Sidebar
          items={getSidebarItems()}
          isOpen={sidebarOpen}
          onClose={() => toggleSidebar()}
          header={
            <div className="flex items-center space-x-3">
              <span className="text-2xl">🏈</span>
              <div>
                <h3 className="font-display font-bold text-lg text-jade-600">BoxCall</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {profile?.role && profile.role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) || "User"}
                </p>
              </div>
            </div>
          }
          footer={
            <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
              <p>BoxCall v1.0</p>
              <p>Football Management</p>
            </div>
          }
          width="md"
          position="left"
        />

        {/* Main content with proper margin when sidebar is open */}
        <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? "lg:ml-80" : ""}`}>
          {children}
        </main>
      </div>
    </div>
  );
};
