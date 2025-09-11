/**
 * Progressive Tooltip System
 * Phase 2A Sprint 3: Smart contextual help and progressive disclosure
 *
 * Provides adaptive tooltips and help content that adjusts based on user
 * experience level, role, and current context.
 */

import React, { useState, useRef, useEffect } from "react";
import { useAdaptiveDashboard } from "../../hooks/useAdaptiveDashboard";
import { Button } from "./Button/Button";

export interface TooltipContent {
  title: string;
  description: string;
  level: "beginner" | "intermediate" | "advanced";
  role?: "coach" | "player" | "family";
  context?: string[];
  actionable?: {
    label: string;
    action: () => void;
  };
}

export interface ProgressiveTooltipProps {
  children: React.ReactNode;
  content: TooltipContent | TooltipContent[];
  trigger?: "hover" | "click" | "focus";
  placement?: "top" | "bottom" | "left" | "right" | "auto";
  delay?: number;
  maxWidth?: number;
  className?: string;
}

export const ProgressiveTooltip: React.FC<ProgressiveTooltipProps> = ({
  children,
  content,
  trigger = "hover",
  placement = "auto",
  delay = 500,
  maxWidth = 300,
  className = "",
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentContent, setCurrentContent] = useState<TooltipContent | null>(
    null
  );
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const { currentContext } = useAdaptiveDashboard();
  // TODO: Get userRole from auth context
  const userRole = "coach" as const; // Placeholder

  /**
   * Helper function to determine user experience level
   * TODO: Implement actual user experience tracking
   */
  const getUserExperienceLevel = (): TooltipContent["level"] => {
    // Placeholder logic - in real implementation, this would:
    // - Track user actions and feature usage
    // - Consider account age and activity patterns
    // - Allow manual user preference setting

    // For now, default to beginner
    return "beginner";
  };

  /**
   * Select appropriate content based on user context and experience
   */
  useEffect(() => {
    const contentArray = Array.isArray(content) ? content : [content];

    // Filter content by role if specified
    const roleFiltered = contentArray.filter(
      (item) => !item.role || item.role === userRole
    );

    // Filter by context if specified
    const contextFiltered = roleFiltered.filter(
      (item) => !item.context || item.context.includes(currentContext)
    );

    // Select content by experience level (TODO: get actual user experience level)
    const userExperience = getUserExperienceLevel(); // Placeholder
    const experienceFiltered = contextFiltered.filter(
      (item) => item.level === userExperience
    );

    // Use filtered content or fallback to first available
    const selectedContent =
      experienceFiltered[0] || contextFiltered[0] || roleFiltered[0];
    setCurrentContent(selectedContent);
  }, [content, userRole, currentContext]);

  /**
   * Calculate optimal tooltip position
   */
  const calculatePosition = () => {
    if (!triggerRef.current || !tooltipRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let x = 0;
    let y = 0;

    // Calculate position based on placement preference
    switch (placement) {
      case "top":
        x = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2;
        y = triggerRect.top - tooltipRect.height - 8;
        break;
      case "bottom":
        x = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2;
        y = triggerRect.bottom + 8;
        break;
      case "left":
        x = triggerRect.left - tooltipRect.width - 8;
        y = triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2;
        break;
      case "right":
        x = triggerRect.right + 8;
        y = triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2;
        break;
      case "auto":
      default:
        {
          // Auto-placement: choose best position based on available space
          const spaceTop = triggerRect.top;
          const spaceBottom = viewportHeight - triggerRect.bottom;
          const spaceLeft = triggerRect.left;
          const spaceRight = viewportWidth - triggerRect.right;

          if (spaceBottom > tooltipRect.height + 8) {
            // Place below
            x =
              triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2;
            y = triggerRect.bottom + 8;
          } else if (spaceTop > tooltipRect.height + 8) {
            // Place above
            x =
              triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2;
            y = triggerRect.top - tooltipRect.height - 8;
          } else if (spaceRight > tooltipRect.width + 8) {
            // Place right
            x = triggerRect.right + 8;
            y =
              triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2;
          } else if (spaceLeft > tooltipRect.width + 8) {
            // Place left
            x = triggerRect.left - tooltipRect.width - 8;
            y =
              triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2;
          }
          break;
        }
        break;
    }

    // Ensure tooltip stays within viewport
    x = Math.max(8, Math.min(x, viewportWidth - tooltipRect.width - 8));
    y = Math.max(8, Math.min(y, viewportHeight - tooltipRect.height - 8));

    setPosition({ x, y });
  };

  /**
   * Show tooltip with delay
   */
  const showTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
      // Calculate position after tooltip is rendered
      setTimeout(calculatePosition, 0);
    }, delay);
  };

  /**
   * Hide tooltip immediately
   */
  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  /**
   * Handle trigger events
   */
  const handleMouseEnter = () => {
    if (trigger === "hover") showTooltip();
  };

  const handleMouseLeave = () => {
    if (trigger === "hover") hideTooltip();
  };

  const handleClick = () => {
    if (trigger === "click") {
      if (isVisible) {
        hideTooltip();
      } else {
        showTooltip();
      }
    }
  };

  const handleFocus = () => {
    if (trigger === "focus") showTooltip();
  };

  const handleBlur = () => {
    if (trigger === "focus") hideTooltip();
  };

  /**
   * Cleanup timeout on unmount
   */
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  if (!currentContent) {
    return <>{children}</>;
  }

  return (
    <>
      <div
        ref={triggerRef}
        className={`progressive-tooltip-trigger ${className}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        onFocus={handleFocus}
        onBlur={handleBlur}
        tabIndex={trigger === "focus" ? 0 : undefined}
      >
        {children}
      </div>

      {isVisible && (
        <div
          ref={tooltipRef}
          className="progressive-tooltip-content fixed z-50 bg-surface-primary border border-border-secondary rounded-lg shadow-lg p-3"
          style={{
            left: position.x,
            top: position.y,
            maxWidth: maxWidth,
          }}
        >
          <div className="tooltip-header">
            <h4 className="text-sm font-medium text-text-primary mb-1">
              {currentContent.title}
            </h4>
            <div className="flex items-center gap-2 mb-2">
              <ExperienceBadge level={currentContent.level} />
              {currentContent.role && <RoleBadge role={currentContent.role} />}
            </div>
          </div>

          <div className="tooltip-body">
            <p className="text-sm text-text-secondary leading-relaxed">
              {currentContent.description}
            </p>
          </div>

          {currentContent.actionable && (
            <div className="tooltip-actions mt-2 pt-2 border-t border-border-subtle">
              <Button
                variant="link"
                size="sm"
                onClick={() => {
                  currentContent.actionable?.action();
                  hideTooltip();
                }}
                className="text-xs p-0"
              >
                {currentContent.actionable.label}
              </Button>
            </div>
          )}

          {/* Tooltip arrow */}
          <div className="tooltip-arrow absolute w-2 h-2 bg-surface-primary border-l border-t border-border-secondary transform rotate-45" />
        </div>
      )}
    </>
  );
};

/**
 * Experience Level Badge
 */
interface ExperienceBadgeProps {
  level: TooltipContent["level"];
}

const ExperienceBadge: React.FC<ExperienceBadgeProps> = ({ level }) => {
  const badgeConfig = {
    beginner: { color: "bg-green-100 text-green-800", label: "Beginner" },
    intermediate: { color: "bg-blue-100 text-blue-800", label: "Intermediate" },
    advanced: { color: "bg-purple-100 text-purple-800", label: "Advanced" },
  };

  const config = badgeConfig[level];

  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}
    >
      {config.label}
    </span>
  );
};

/**
 * Role Badge
 */
interface RoleBadgeProps {
  role: NonNullable<TooltipContent["role"]>;
}

const RoleBadge: React.FC<RoleBadgeProps> = ({ role }) => {
  const badgeConfig = {
    coach: { color: "bg-orange-100 text-orange-800", label: "Coach" },
    player: { color: "bg-blue-100 text-blue-800", label: "Player" },
    family: { color: "bg-pink-100 text-pink-800", label: "Family" },
  };

  const config = badgeConfig[role];

  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}
    >
      {config.label}
    </span>
  );
};

/**
 * Progressive Tooltip Component
 * Provides contextual help that adapts to user experience level
 */

export default ProgressiveTooltip;
