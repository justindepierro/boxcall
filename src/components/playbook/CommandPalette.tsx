import React, { useState, useEffect, useCallback } from "react";
import { Modal } from "../ui/Modal";
import { Input } from "../ui/Input";
import { Icon } from "../ui/Icon/Icon";
import type { IconName } from "../ui/Icon/Icon";

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
 */
export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  commands,
}) => {
  const [search, setSearch] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

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
            filteredCommands[selectedIndex].action();
            onClose();
          }
          break;
        case "Escape":
          e.preventDefault();
          onClose();
          break;
      }
    },
    [filteredCommands, selectedIndex, onClose]
  );

  const executeCommand = (cmd: Command) => {
    cmd.action();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md" title="Command Palette">
      <div className="p-4" onKeyDown={handleKeyDown}>
        <Input
          placeholder="Type a command or search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          autoFocus
        />

        <div className="mt-4 max-h-96 overflow-y-auto space-y-1">
          {filteredCommands.length === 0 ? (
            <div className="text-center py-8 text-muted">
              <Icon name="search" size={32} className="mx-auto mb-2" />
              <p className="text-sm">No commands found</p>
            </div>
          ) : (
            filteredCommands.map((cmd, idx) => (
              <button
                key={cmd.id}
                onClick={() => executeCommand(cmd)}
                onMouseEnter={() => setSelectedIndex(idx)}
                className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
                  idx === selectedIndex
                    ? "bg-brand-primary/10 border-brand-primary"
                    : "hover:bg-surface-muted border border-transparent"
                }`}
              >
                <Icon name={cmd.icon} size={20} className="flex-shrink-0" />
                <span className="flex-1 text-left font-medium">
                  {cmd.label}
                </span>
                {cmd.shortcut && (
                  <kbd className="px-2 py-1 text-xs bg-surface-secondary rounded border border-subtle font-mono">
                    {cmd.shortcut}
                  </kbd>
                )}
              </button>
            ))
          )}
        </div>

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
      </div>
    </Modal>
  );
};
