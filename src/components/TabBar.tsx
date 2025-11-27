import React from "react";
import { motion } from "framer-motion";
import { Icon } from "./ui/Icon/Icon";
import type { IconName } from "./ui/Icon/Icon";

export interface Tab {
  id: string;
  label: string;
  icon: IconName;
  badge?: number;
}

interface TabBarProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
}

/**
 * TabBar - Mobile-optimized tab navigation
 *
 * Features:
 * - Icons + labels for clarity
 * - Active indicator animation
 * - Badge support for counts
 * - Large touch targets (48px height)
 */
export function TabBar({
  tabs,
  activeTab,
  onTabChange,
  className = "",
}: TabBarProps) {
  return (
    <div
      className={`flex items-stretch border-t border-border bg-surface-primary ${className}`}
      role="tablist"
      aria-label="Bottom sheet tabs"
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;

        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            aria-controls={`tabpanel-${tab.id}`}
            onClick={() => onTabChange(tab.id)}
            className={`
              flex-1 flex flex-col items-center justify-center gap-1 py-2 px-2
              min-h-12 touch-manipulation
              transition-colors
              ${
                isActive
                  ? "text-primary"
                  : "text-secondary hover:text-primary hover:bg-surface-secondary/50"
              }
            `}
          >
            {/* Icon with optional badge */}
            <div className="relative">
              <Icon
                name={tab.icon}
                size="md"
                className={isActive ? "text-primary-600" : ""}
              />
              {tab.badge !== undefined && tab.badge > 0 && (
                <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 flex items-center justify-center text-xs font-bold bg-primary-600 text-white rounded-full">
                  {tab.badge > 99 ? "99+" : tab.badge}
                </span>
              )}
            </div>

            {/* Label */}
            <span
              className={`text-xs font-medium leading-none ${
                isActive ? "text-primary" : "text-secondary"
              }`}
            >
              {tab.label}
            </span>

            {/* Active indicator */}
            {isActive && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600"
                initial={false}
                transition={{
                  type: "spring",
                  stiffness: 500,
                  damping: 30,
                }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}

/**
 * TabPanel - Container for tab content
 */
export function TabPanel({
  id,
  active,
  children,
}: {
  id: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      id={`tabpanel-${id}`}
      role="tabpanel"
      aria-labelledby={`tab-${id}`}
      hidden={!active}
      className={active ? "block" : "hidden"}
    >
      {children}
    </div>
  );
}
