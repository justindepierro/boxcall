import React, { useState, useEffect } from "react";
import { Icon } from "../ui/Icon/Icon";
import { Typography } from "../design-system/Typography";

interface WorkflowStatusBarProps {
  className?: string;
}

export const WorkflowStatusBar: React.FC<WorkflowStatusBarProps> = ({
  className = "",
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [lastActivity, setLastActivity] = useState(Date.now());

  // Auto-hide on scroll, auto-show on idle
  useEffect(() => {
    let scrollTimeout: NodeJS.Timeout;
    let idleTimeout: NodeJS.Timeout;

    const handleScroll = () => {
      setIsVisible(false);
      setLastActivity(Date.now());

      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        // Check if user has been idle for 3 seconds
        const timeSinceActivity = Date.now() - lastActivity;
        if (timeSinceActivity >= 3000) {
          setIsVisible(true);
        }
      }, 1000);
    };

    const handleActivity = () => {
      setLastActivity(Date.now());
      if (!isVisible) {
        clearTimeout(idleTimeout);
        idleTimeout = setTimeout(() => {
          setIsVisible(true);
        }, 3000);
      }
    };

    // Listen for scroll events
    window.addEventListener("scroll", handleScroll, { passive: true });

    // Listen for user activity
    const activityEvents = [
      "mousedown",
      "mousemove",
      "keypress",
      "scroll",
      "touchstart",
    ];
    activityEvents.forEach((event) => {
      document.addEventListener(event, handleActivity, { passive: true });
    });

    // Initial idle check
    idleTimeout = setTimeout(() => {
      setIsVisible(true);
    }, 3000);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      activityEvents.forEach((event) => {
        document.removeEventListener(event, handleActivity);
      });
      clearTimeout(scrollTimeout);
      clearTimeout(idleTimeout);
    };
  }, [isVisible, lastActivity]);

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-40 bg-info/20/95 backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_-4px_12px_rgba(0,0,0,0.15)] px-4 py-3 transition-transform duration-300 ${
        isVisible ? "translate-y-0" : "translate-y-full"
      } ${className}`}
    >
      <div className="container-page">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Icon name="clipboard-list" size="sm" className="text-accent" />
              <Typography variant="body-sm" className="font-medium text-accent">
                Workflow Status
              </Typography>
            </div>

            <div className="flex items-center gap-4 text-sm">
              <span className="text-accent-secondary">
                Practice Scripts:{" "}
                <span className="font-medium text-accent">Ready</span>
              </span>
              <span className="text-accent-secondary">
                Game Plans:{" "}
                <span className="font-medium text-accent">Ready</span>
              </span>
              <span className="text-accent-secondary">
                PDF Export:{" "}
                <span className="font-medium text-accent">Available</span>
              </span>
            </div>
          </div>

          <div className="text-xs text-info">
            ⌨️ <strong>Shortcuts:</strong> Ctrl+P (Practice) • Ctrl+G (Game
            Plan)
          </div>
        </div>
      </div>
    </div>
  );
};
