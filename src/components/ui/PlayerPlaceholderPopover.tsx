import React, { useState, useRef, useEffect } from "react";
import { Mail, UserPlus, X } from "lucide-react";
import { Button } from "./Button";
import { usePopoverContext } from "../../contexts/PopoverContext";

interface PlayerPlaceholderPopoverProps {
  playerId: string;
  playerName: string;
  position?: string;
  jerseyNumber?: number;
  trigger: React.ReactNode;
  onInvite?: (playerId: string) => void;
  showOnHover?: boolean;
  className?: string;
}

/**
 * PlayerPlaceholderPopover
 *
 * Shows placeholder information for players without user accounts
 * Provides invite/resend invite functionality
 */
export const PlayerPlaceholderPopover: React.FC<
  PlayerPlaceholderPopoverProps
> = ({
  playerId,
  playerName,
  position,
  jerseyNumber,
  trigger,
  onInvite,
  showOnHover = false,
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [popoverPosition, setPopoverPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { registerPopover, unregisterPopover } = usePopoverContext();

  const popoverId = `player-placeholder-${playerId}`;

  useEffect(() => {
    if (isOpen) {
      registerPopover(popoverId);
    } else {
      unregisterPopover(popoverId);
    }
  }, [isOpen, popoverId, registerPopover, unregisterPopover]);

  const calculatePosition = () => {
    if (!triggerRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const popoverHeight = 200; // Approximate height
    const spaceBelow = viewportHeight - triggerRect.bottom;
    const spaceAbove = triggerRect.top;

    // Use fixed positioning for viewport-relative calculations
    let top: number;
    const left: number = triggerRect.left + triggerRect.width / 2;

    // Smart placement: prefer bottom, but flip to top if not enough space
    if (spaceBelow > popoverHeight || spaceBelow > spaceAbove) {
      // Position below
      top = triggerRect.bottom + 8;
    } else {
      // Position above
      top = triggerRect.top - popoverHeight - 8;
    }

    setPopoverPosition({ top, left });
  };

  const handleOpen = () => {
    calculatePosition();
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleMouseEnter = () => {
    if (!showOnHover) return;
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    hoverTimeoutRef.current = setTimeout(handleOpen, 300);
  };

  const handleMouseLeave = () => {
    if (!showOnHover) return;
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    hoverTimeoutRef.current = setTimeout(handleClose, 300);
  };

  const handlePopoverMouseEnter = () => {
    if (!showOnHover) return;
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
  };

  const handlePopoverMouseLeave = () => {
    if (!showOnHover) return;
    handleClose();
  };

  const handleInvite = () => {
    if (onInvite) {
      onInvite(playerId);
    }
    handleClose();
  };

  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={() => !showOnHover && handleOpen()}
        className={className}
      >
        {trigger}
      </div>

      {isOpen && (
        <div
          ref={popoverRef}
          onMouseEnter={handlePopoverMouseEnter}
          onMouseLeave={handlePopoverMouseLeave}
          className="fixed z-[9999] -translate-x-1/2"
          style={{
            top: `${popoverPosition.top}px`,
            left: `${popoverPosition.left}px`,
          }}
        >
          <div className="bg-primary/95 backdrop-blur-xl border border-border shadow-2xl rounded-xl w-80 overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-muted bg-subtle/50">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-base text-primary truncate">
                    {playerName}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    {jerseyNumber && (
                      <span className="text-xs font-mono text-secondary">
                        #{jerseyNumber}
                      </span>
                    )}
                    {position && jerseyNumber && (
                      <span className="text-secondary text-xs">•</span>
                    )}
                    {position && (
                      <span className="text-xs text-secondary">{position}</span>
                    )}
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  className="text-secondary hover:text-primary transition-colors p-1 -mt-1 -mr-1"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-4">
              <div className="flex items-center gap-2 text-secondary text-sm mb-4">
                <UserPlus className="w-4 h-4" />
                <span>No account linked</span>
              </div>

              <p className="text-sm text-secondary mb-4">
                This player hasn't been invited or hasn't accepted their
                invitation yet.
              </p>

              <Button
                variant="primary"
                size="sm"
                onClick={handleInvite}
                className="w-full gap-2"
              >
                <Mail className="w-4 h-4" />
                Send Invitation
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
