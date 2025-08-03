import React from "react";
import { useAuthProfile } from "../../app/auth-store";
import { useUI } from "../../app/store";
import { getNavigationItems, getRoleDisplayInfo, toSidebarItems } from "../../utils/navigation";
import { Navigation } from "../ui/Navigation";
import { Sidebar } from "../ui/Sidebar";

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
  
  const navigationItems = getNavigationItems(profile?.role);
  const sidebarItems = toSidebarItems(navigationItems, profile?.role);
  const roleInfo = getRoleDisplayInfo(profile?.role);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation />
      
      {/* Main content area with sidebar */}
      <div className="flex">
        {/* Sidebar */}
        <Sidebar
          items={sidebarItems}
          isOpen={sidebarOpen}
          onClose={() => toggleSidebar()}
          header={
            <div className="flex items-center space-x-3">
              <span className="text-2xl">🏈</span>
              <div>
                <h3 className="font-display font-bold text-lg text-jade-600">BoxCall</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {roleInfo.display}
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
