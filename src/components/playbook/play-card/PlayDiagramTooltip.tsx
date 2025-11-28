/**
 * PlayDiagramTooltip Component
 *
 * Hover tooltip that shows play diagram preview with basic play info
 * Similar to user avatar hover cards - appears on play card hover
 */

import React, { useState, useRef, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import type { Play as PlayType } from "../../../types/play";
import { Icon } from "../../ui/Icon/Icon";

interface PlayDiagramTooltipProps {
  children: React.ReactNode;
  play: PlayType;
  displayName: string;
  disabled?: boolean;
}

export const PlayDiagramTooltip: React.FC<PlayDiagramTooltipProps> = ({
  children,
  play,
  displayName,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<number | null>(null);

  // Only show tooltip if play has a diagram
  const hasDiagram = Boolean(play.diagram_image_url);
  const shouldShow = hasDiagram && !disabled;

  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();

    // Position tooltip to the right of the card
    const top = rect.top + rect.height / 2;
    const left = rect.right + 16;

    setPosition({ top, left });
  }, []);

  const handleMouseEnter = useCallback(() => {
    if (!shouldShow) return;

    // Delay tooltip appearance (500ms)
    timeoutRef.current = window.setTimeout(() => {
      updatePosition();
      setIsOpen(true);
    }, 500);
  }, [shouldShow, updatePosition]);

  const handleMouseLeave = useCallback(() => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsOpen(false);
  }, []);

  // Update position on scroll/resize
  useEffect(() => {
    if (!isOpen) return;

    const handleUpdate = () => updatePosition();
    window.addEventListener("scroll", handleUpdate, true);
    window.addEventListener("resize", handleUpdate);

    return () => {
      window.removeEventListener("scroll", handleUpdate, true);
      window.removeEventListener("resize", handleUpdate);
    };
  }, [isOpen, updatePosition]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="contents"
      >
        {children}
      </div>

      {/* Tooltip Portal */}
      {isOpen &&
        shouldShow &&
        createPortal(
          <div
            className="fixed z-[100] pointer-events-none"
            style={{
              top: `${position.top}px`,
              left: `${position.left}px`,
              transform: "translateY(-50%)",
            }}
            onMouseEnter={handleMouseLeave} // Close if mouse enters tooltip
          >
            <div className="bg-surface border-2 border-primary rounded-xl shadow-2xl p-md space-y-sm max-w-sm animate-fade-in">
              {/* Play Info Header */}
              <div className="flex items-start gap-xs">
                <Icon name="eye" className="text-jade-600 flex-shrink-0 mt-0.5" size="sm" />
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-primary truncate">
                    {displayName}
                  </h4>
                  {play.p_type && (
                    <p className="text-xs text-secondary">
                      {play.p_type}
                    </p>
                  )}
                </div>
              </div>

              {/* Diagram Preview */}
              {play.diagram_image_url && (
                <div className="relative">
                  <img
                    src={play.diagram_image_url}
                    alt={`${displayName} diagram`}
                    className="w-full h-48 object-cover rounded-lg border border-muted"
                    loading="lazy"
                  />
                  {/* Overlay hint */}
                  <div className="absolute bottom-2 right-2 bg-navy-900/80 text-white text-xs px-2 py-1 rounded-md backdrop-blur-sm">
                    <Icon name="expand" size="sm" className="inline mr-1" />
                    Click to expand
                  </div>
                </div>
              )}

              {/* Quick Stats */}
              <div className="flex items-center justify-between text-xs text-secondary pt-xs border-t border-muted">
                <span className="flex items-center gap-1">
                  <Icon name="eye" size="sm" />
                  {play.times_called || 0} called
                </span>
                {play.install_phase && (
                  <span className="px-2 py-0.5 bg-jade-100 text-jade-700 rounded-md font-medium">
                    {play.install_phase}
                  </span>
                )}
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
};
