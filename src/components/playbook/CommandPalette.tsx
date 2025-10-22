import React, { useState, useEffect, useCallback } from "react";
import { Modal } from "../ui/Modal";
import { Input } from "../ui/Input";
import { Icon } from "../ui/Icon/Icon";
import type { IconName } from "../ui/Icon/Icon";
import { useIsMobile } from "../../hooks/useBreakpoint";
import { triggerHapticFeedback } from "../../lib/hapticFeedback";

export interface Command {
  id: string;
  label: string;
  icon: IconName;
  action: () => void;
  shortcut?: string;
  keywords?: string[]; // Additional keywords for fuzzy search
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  commands: Command[];
}

/**
 * Command palette for quick access to actions via keyboard
 * Supports fuzzy search and keyboard navigation
 * Mobile-optimized with larger touch targets and full-screen modal
 */
export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  commands,
}) => {
  const [search, setSearch] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const isMobile = useIsMobile();

  // Filter commands based on search
  const filteredCommands = commands.filter((cmd) => {
    const searchLower = search.toLowerCase();
    const labelMatch = cmd.label.toLowerCase().includes(searchLower);
    const keywordMatch = cmd.keywords?.some((k) =>
      k.toLowerCase().includes(searchLower)
    );
    return labelMatch || keywordMatch;
  });

  // Reset selected index when search changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [search]);

  // Reset search when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSearch("");
      setSelectedIndex(0);
    }
  }, [isOpen]);

  const executeCommand = useCallback(
    (cmd: Command) => {
      if (isMobile) {
        triggerHapticFeedback("medium");
      }
      cmd.action();
      onClose();
    },
    [isMobile, onClose]
  );

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((prev) =>
            Math.min(prev + 1, filteredCommands.length - 1)
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((prev) => Math.max(prev - 1, 0));
          break;
        case "Enter":
          e.preventDefault();
          if (filteredCommands[selectedIndex]) {
            executeCommand(filteredCommands[selectedIndex]);
          }
          break;
        case "Escape":
          e.preventDefault();
          onClose();
          break;
      }
    },
    [filteredCommands, selectedIndex, onClose, executeCommand]
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size={isMobile ? "fullscreen" : "md"}
      title="Command Palette"
    >
      <div className={`${isMobile ? "p-4 pb-safe" : "p-4"}`} onKeyDown={handleKeyDown}>
        {/* Search Input - Larger on mobile (48px) */}
        <Input
          placeholder="Type a command or search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          autoFocus={!isMobile} // Don't auto-focus on mobile to prevent keyboard jump
          className={isMobile ? "h-12 text-base" : ""}
        />

        {/* Command List - More spacing on mobile */}
        <div
          className={`mt-4 overflow-y-auto ${
            isMobile ? "max-h-[calc(100vh-16rem)] space-y-2" : "max-h-96 space-y-1"
          }`}
        >
          {filteredCommands.length === 0 ? (
            <div className={`text-center text-muted ${isMobile ? "py-12" : "py-8"}`}>
              <Icon
                name="search"
                size={isMobile ? 40 : 32}
                className="mx-auto mb-2"
              />
              <p className={isMobile ? "text-base" : "text-sm"}>
                No commands found
              </p>
            </div>
          ) : (
            filteredCommands.map((cmd, idx) => (
              <button
                key={cmd.id}
                onClick={() => executeCommand(cmd)}
                onMouseEnter={() => !isMobile && setSelectedIndex(idx)}
                className={`w-full flex items-center gap-3 rounded-lg transition-all ${
                  isMobile
                    ? "p-4 min-h-[48px] active:scale-98"
                    : "p-3"
                } ${
                  idx === selectedIndex
                    ? "bg-brand-primary/10 border-brand-primary border-2"
                    : "hover:bg-surface-muted border border-transparent"
                }`}
              >
                <Icon
                  name={cmd.icon}
                  size={isMobile ? 24 : 20}
                  className="flex-shrink-0"
                />
                <span
                  className={`flex-1 text-left font-medium ${
                    isMobile ? "text-base" : ""
                  }`}
                >
                  {cmd.label}
                </span>
                {/* Show shortcuts only on desktop */}
                {!isMobile && cmd.shortcut && (
                  <kbd className="px-2 py-1 text-xs bg-surface-secondary rounded border border-subtle font-mono">
                    {cmd.shortcut}
                  </kbd>
                )}
              </button>
            ))
          )}
        </div>

        {/* Keyboard Hints - Hide on mobile */}
        {!isMobile && (
          <div className="mt-4 pt-4 border-t border-subtle text-xs text-muted text-center space-x-4">
            <span>
              <kbd className="px-1.5 py-0.5 bg-surface-secondary rounded text-2xs">
                ↑↓
              </kbd>{" "}
              Navigate
            </span>
            <span>
              <kbd className="px-1.5 py-0.5 bg-surface-secondary rounded text-2xs">
                ↵
              </kbd>{" "}
              Select
            </span>
            <span>
              <kbd className="px-1.5 py-0.5 bg-surface-secondary rounded text-2xs">
                Esc
              </kbd>{" "}
              Close
            </span>
          </div>
        )}
      </div>
    </Modal>
  );
};
