/**
 * PlayDiagramTooltip Component
 *
 * Hover/click popover that shows play diagram preview
 * - Desktop: Appears on hover (200ms delay)
 * - Mobile: Disabled (use card click instead)
 * - Click anywhere or press Escape to close
 * - Centers on viewport with proper z-index
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
  hoverDelay?: number; // Delay in ms before showing tooltip (default: 2000ms)
  allPlays?: PlayType[]; // All filtered plays for fullscreen navigation
  onEnterFullscreen?: (plays: PlayType[], playIndex: number) => void; // Callback to enter fullscreen mode
}

export const PlayDiagramTooltip: React.FC<PlayDiagramTooltipProps> = ({
  children,
  play,
  displayName,
  disabled = false,
  hoverDelay = 2000, // Default 2 second delay
  allPlays = [],
  onEnterFullscreen,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const openTimeoutRef = useRef<number | null>(null);
  const closeTimeoutRef = useRef<number | null>(null);

  // Only show tooltip if play has a diagram
  const hasDiagram = Boolean(
    play.diagram_url || (play as any).diagram_image_url
  );
  const shouldShow = hasDiagram && !disabled;

  const closeTooltip = useCallback(() => {
    if (openTimeoutRef.current) {
      window.clearTimeout(openTimeoutRef.current);
      openTimeoutRef.current = null;
    }

    // Start fade-out animation
    setIsClosing(true);

    // Remove from DOM after animation completes (300ms)
    closeTimeoutRef.current = window.setTimeout(() => {
      setIsOpen(false);
      setIsClosing(false);
    }, 300);
  }, []);

  const handleMouseEnter = useCallback(() => {
    if (!shouldShow) return;

    openTimeoutRef.current = window.setTimeout(() => {
      setIsOpen(true);
    }, hoverDelay);
  }, [shouldShow, hoverDelay]);

  const handlePopoverMouseLeave = useCallback(() => {
    closeTooltip();
  }, [closeTooltip]);

  const handleEnterFullscreen = useCallback(() => {
    if (!onEnterFullscreen || allPlays.length === 0) return;

    const playIndex = allPlays.findIndex((p) => p.id === play.id);
    if (playIndex !== -1) {
      closeTooltip();
      onEnterFullscreen(allPlays, playIndex);
    }
  }, [onEnterFullscreen, allPlays, play.id, closeTooltip]);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeTooltip();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, closeTooltip]);

  // Close on scroll (prevents tooltip from staying open when content moves)
  useEffect(() => {
    if (!isOpen) return;

    const handleScroll = () => {
      closeTooltip();
    };

    // Capture phase to catch all scrolls
    window.addEventListener("scroll", handleScroll, true);
    return () => window.removeEventListener("scroll", handleScroll, true);
  }, [isOpen, closeTooltip]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (openTimeoutRef.current) {
        window.clearTimeout(openTimeoutRef.current);
      }
      if (closeTimeoutRef.current) {
        window.clearTimeout(closeTimeoutRef.current);
      }
    };
  }, []);

  return (
    <>
      {/* Trigger */}
      <div
        ref={triggerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={() => {
          // Cancel pending open if mouse leaves before delay completes
          if (openTimeoutRef.current) {
            window.clearTimeout(openTimeoutRef.current);
            openTimeoutRef.current = null;
          }
        }}
        className="block"
      >
        {children}
      </div>

      {/* Popover Portal */}
      {isOpen &&
        shouldShow &&
        createPortal(
          <>
            {/* Backdrop - click to close */}
            <div
              className={`fixed inset-0 bg-black/50 z-[9998] transition-opacity duration-300 ${
                isClosing ? "opacity-0" : "opacity-100"
              }`}
              onClick={closeTooltip}
              aria-hidden="true"
            />

            {/* Popover Content */}
            <div
              ref={tooltipRef}
              className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[9999] pointer-events-auto max-w-[calc(100vw-2rem)] max-h-[calc(100vh-2rem)] w-full md:max-w-2xl transition-all duration-300 ${
                isClosing ? "opacity-0 scale-95" : "opacity-100 scale-100"
              }`}
              onMouseLeave={handlePopoverMouseLeave}
            >
              <div className="bg-surface border-2 border-jade-500 rounded-2xl shadow-2xl overflow-hidden">
                {/* Action Buttons */}
                <div className="absolute top-3 right-3 z-10 flex gap-2">
                  {/* Fullscreen Button */}
                  {onEnterFullscreen && allPlays.length > 0 && (
                    <button
                      onClick={handleEnterFullscreen}
                      className="flex items-center justify-center p-2 bg-jade-600 hover:bg-jade-700 rounded-full shadow-md transition-all hover:scale-110"
                      aria-label="Enter fullscreen presentation mode"
                      title="Fullscreen (for projector)"
                    >
                      <Icon name="maximize" size="sm" className="text-white" />
                    </button>
                  )}

                  {/* Close Button */}
                  <button
                    onClick={closeTooltip}
                    className="flex items-center justify-center p-2 bg-surface/90 hover:bg-surface rounded-full border border-divider shadow-md transition-all hover:scale-110"
                    aria-label="Close preview"
                  >
                    <Icon name="close" size="sm" className="text-secondary" />
                  </button>
                </div>

                {/* Play Info Header */}
                <div className="bg-gradient-to-r from-jade-50 to-jade-100 px-4 md:px-6 py-3 border-b border-jade-200">
                  <div className="flex items-start gap-2 pr-8">
                    <Icon
                      name="eye"
                      className="text-jade-600 flex-shrink-0 mt-1"
                      size="sm"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base md:text-lg font-bold text-primary truncate">
                        {displayName}
                      </h3>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        {play.p_type && (
                          <span className="text-xs md:text-sm text-secondary">
                            {play.p_type}
                          </span>
                        )}
                        {play.personnel && (
                          <span className="px-2 py-0.5 bg-jade-600 text-white rounded-md text-xs font-semibold">
                            {play.personnel}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Diagram Preview */}
                {play.diagram_image_url && (
                  <div className="relative bg-neutral-50 max-h-[60vh] overflow-y-auto">
                    <img
                      src={play.diagram_image_url}
                      alt={`${displayName} diagram`}
                      className="w-full object-contain"
                      style={{ maxHeight: "50vh" }}
                    />
                  </div>
                )}

                {/* Quick Stats Footer */}
                <div className="bg-neutral-50 px-4 md:px-6 py-3 border-t border-muted">
                  <div className="flex items-center justify-between text-xs md:text-sm gap-2">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <Icon
                        name="eye"
                        size="sm"
                        className="text-jade-600 flex-shrink-0"
                      />
                      <span className="text-secondary truncate">
                        <strong className="text-primary font-bold">
                          {play.times_called || 0}
                        </strong>{" "}
                        times called
                      </span>
                    </div>
                    {play.install_phase && (
                      <span className="px-3 py-1.5 bg-jade-600 text-white rounded-lg font-bold text-xs uppercase tracking-wide shadow-sm flex-shrink-0">
                        {play.install_phase}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>,
          document.body
        )}
    </>
  );
};
