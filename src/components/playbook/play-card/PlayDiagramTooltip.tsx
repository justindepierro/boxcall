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

    // Large preview: 600px wide, 500px tall
    const tooltipWidth = 600;
    const tooltipHeight = 500;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const margin = 24;
    
    // Start with positioning to the right of the card
    let left = rect.right + margin;
    let top = rect.top + rect.height / 2 - tooltipHeight / 2;
    
    // Check if tooltip goes off right edge
    if (left + tooltipWidth + margin > viewportWidth) {
      // Try left side instead
      left = rect.left - tooltipWidth - margin;
      
      // If still doesn't fit, center it on screen
      if (left < margin) {
        left = (viewportWidth - tooltipWidth) / 2;
      }
    }
    
    // Ensure tooltip doesn't go below viewport
    if (top + tooltipHeight + margin > viewportHeight) {
      top = viewportHeight - tooltipHeight - margin;
    }
    
    // Ensure tooltip doesn't go above viewport
    if (top < margin) {
      top = margin;
    }

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
            }}
            onMouseEnter={handleMouseLeave} // Close if mouse enters tooltip
          >
            <div 
              className="bg-surface border-2 border-jade-500 rounded-2xl shadow-2xl overflow-hidden animate-fade-in"
              style={{ width: '600px' }}
            >
              {/* Play Info Header */}
              <div className="bg-gradient-to-r from-jade-50 to-jade-100 px-lg py-md border-b border-jade-200">
                <div className="flex items-start gap-sm">
                  <Icon name="eye" className="text-jade-600 flex-shrink-0 mt-1" size="md" />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-primary truncate">
                      {displayName}
                    </h3>
                    {play.p_type && (
                      <p className="text-sm text-secondary mt-xs">
                        {play.p_type}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Large Diagram Preview */}
              {play.diagram_image_url && (
                <div className="relative bg-neutral-50">
                  <img
                    src={play.diagram_image_url}
                    alt={`${displayName} diagram`}
                    className="w-full h-96 object-contain"
                    loading="lazy"
                  />
                  {/* Overlay hint */}
                  <div className="absolute bottom-4 right-4 bg-navy-900/90 text-white text-sm px-3 py-2 rounded-lg backdrop-blur-sm shadow-lg flex items-center gap-2">
                    <Icon name="expand" size="sm" />
                    Click card to expand full details
                  </div>
                </div>
              )}

              {/* Quick Stats Footer */}
              <div className="bg-neutral-50 px-lg py-md border-t border-muted">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-secondary">
                    <Icon name="eye" size="sm" className="text-jade-600" />
                    <strong className="text-primary">{play.times_called || 0}</strong> times called
                  </span>
                  {play.install_phase && (
                    <span className="px-3 py-1 bg-jade-100 text-jade-700 rounded-lg font-semibold text-xs uppercase tracking-wide">
                      {play.install_phase}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
};
