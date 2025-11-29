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

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const isMobile = viewportWidth < 768; // md breakpoint

    // Responsive dimensions:
    // Mobile: 90vw max (with 16px padding on each side)
    // Desktop: 600px fixed
    const tooltipWidth = isMobile
      ? Math.min(viewportWidth - 32, viewportWidth * 0.9)
      : 600;
    // Mobile: 70vh max to prevent overflow
    // Desktop: 500px fixed
    const tooltipHeight = isMobile
      ? Math.min(viewportHeight * 0.7, viewportHeight - 100)
      : 500;

    // Center the tooltip on the viewport
    const left = (viewportWidth - tooltipWidth) / 2;
    const top = (viewportHeight - tooltipHeight) / 2;

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

  // Update position on scroll/resize (debounced for performance)
  useEffect(() => {
    if (!isOpen) return;

    let resizeTimeout: number | null = null;

    const handleUpdate = () => updatePosition();

    // Debounced resize handler (150ms) - prevents excessive recalculations
    const handleResize = () => {
      if (resizeTimeout) window.clearTimeout(resizeTimeout);
      resizeTimeout = window.setTimeout(() => {
        updatePosition();
      }, 150);
    };

    window.addEventListener("scroll", handleUpdate, true);
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("scroll", handleUpdate, true);
      window.removeEventListener("resize", handleResize);
      if (resizeTimeout) window.clearTimeout(resizeTimeout);
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
            className="fixed z-tooltip pointer-events-auto"
            style={{
              top: `${position.top}px`,
              left: `${position.left}px`,
            }}
            onMouseLeave={handleMouseLeave}
          >
            <div
              className="bg-surface border-2 border-jade-500 rounded-2xl shadow-2xl overflow-hidden animate-fade-in max-w-[90vw] md:max-w-2xl w-[90vw]"
              style={{ maxHeight: "70vh" }}
            >
              {/* Play Info Header */}
              <div className="bg-gradient-to-r from-jade-50 to-jade-100 px-3 md:px-lg py-2 md:py-md border-b border-jade-200">
                <div className="flex items-start gap-2 md:gap-sm">
                  <Icon
                    name="eye"
                    className="text-jade-600 flex-shrink-0 mt-1"
                    size="sm"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base md:text-lg font-bold text-primary truncate">
                      {displayName}
                    </h3>
                    <div className="flex items-center gap-1.5 md:gap-2 mt-1 md:mt-xs flex-wrap">
                      {play.p_type && (
                        <span className="text-xs md:text-sm text-secondary">
                          {play.p_type}
                        </span>
                      )}
                      {play.personnel && (
                        <span className="px-1.5 md:px-2 py-0.5 bg-jade-600 text-white rounded-md text-xs font-semibold">
                          {play.personnel}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Large Diagram Preview */}
              {play.diagram_image_url && (
                <div className="relative bg-neutral-50 overflow-hidden">
                  <img
                    src={play.diagram_image_url}
                    alt={`${displayName} diagram`}
                    className="w-full h-64 md:h-96 object-contain"
                    style={{ maxHeight: "calc(70vh - 140px)" }}
                    loading="lazy"
                  />
                  {/* Overlay hint */}
                  <div className="absolute bottom-2 md:bottom-4 right-2 md:right-4 bg-jade-600 text-white text-xs md:text-sm font-semibold px-2 md:px-3 py-1.5 md:py-2 rounded-lg shadow-lg flex items-center gap-1.5 md:gap-2">
                    <Icon
                      name="arrow-right"
                      size="sm"
                      className="hidden md:inline"
                    />
                    <span className="hidden sm:inline">
                      Click card to expand full details
                    </span>
                    <span className="sm:hidden">Tap to expand</span>
                  </div>
                </div>
              )}

              {/* Quick Stats Footer */}
              <div className="bg-neutral-50 px-3 md:px-lg py-2 md:py-md border-t border-muted">
                <div className="flex items-center justify-between text-xs md:text-sm gap-2">
                  <div className="flex items-center gap-1.5 md:gap-2 flex-1 min-w-0">
                    <Icon
                      name="eye"
                      size="sm"
                      className="text-jade-600 flex-shrink-0"
                    />
                    <span className="text-secondary truncate">
                      <strong className="text-primary font-bold">
                        {play.times_called || 0}
                      </strong>{" "}
                      <span className="hidden sm:inline">times called</span>
                      <span className="sm:hidden">called</span>
                    </span>
                  </div>
                  {play.install_phase && (
                    <span className="px-2 md:px-3 py-1 md:py-1.5 bg-jade-600 text-white rounded-lg font-bold text-xs uppercase tracking-wide shadow-sm flex-shrink-0">
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
