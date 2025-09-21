import React from "react";
import { Button } from "../ui/Button/Button";
import { Typography } from "../design-system/Typography";

interface KeyboardShortcut {
  key: string;
  description: string;
  category: string;
}

interface KeyboardShortcutsGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

const shortcuts: KeyboardShortcut[] = [
  // Navigation
  { key: "Ctrl+N", description: "Create new play", category: "Creation" },
  {
    key: "Ctrl+P",
    description: "Create practice script",
    category: "Creation",
  },
  { key: "Ctrl+G", description: "Create game plan", category: "Creation" },
  { key: ",", description: "Open settings", category: "Navigation" },

  // Search & Filter
  { key: "Ctrl+F", description: "Focus search", category: "Search" },
  { key: "Esc", description: "Clear search/filter", category: "Search" },

  // Selection
  { key: "Ctrl+A", description: "Select all plays", category: "Selection" },
  { key: "Escape", description: "Clear selection", category: "Selection" },

  // Actions
  {
    key: "Ctrl+D",
    description: "Duplicate selected play",
    category: "Actions",
  },
  { key: "Delete", description: "Delete selected play", category: "Actions" },
  { key: "Enter", description: "Edit selected play", category: "Actions" },

  // View
  { key: "Ctrl+1", description: "Switch to card view", category: "View" },
  { key: "Ctrl+2", description: "Switch to list view", category: "View" },
  { key: "Ctrl+3", description: "Switch to compact view", category: "View" },
];

const categories = Array.from(new Set(shortcuts.map((s) => s.category)));

export const KeyboardShortcutsGuide: React.FC<KeyboardShortcutsGuideProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div
        className="surface-card elevation-modal rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-jade-100 rounded-lg">
                <span className="text-jade-600 font-mono text-lg">⌨️</span>
              </div>
              <div>
                <Typography variant="headline-md" className="text-gray-900">
                  Keyboard Shortcuts
                </Typography>
                <Typography variant="body-sm" className="text-gray-600">
                  Boost your productivity with these keyboard shortcuts
                </Typography>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              ✕
            </Button>
          </div>

          {/* Shortcuts by Category */}
          <div className="space-y-6">
            {categories.map((category) => (
              <div key={category}>
                <Typography
                  variant="headline-sm"
                  className="text-gray-900 mb-3"
                >
                  {category}
                </Typography>
                <div className="grid gap-2">
                  {shortcuts
                    .filter((shortcut) => shortcut.category === category)
                    .map((shortcut, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg"
                      >
                        <Typography variant="body-sm" className="text-gray-700">
                          {shortcut.description}
                        </Typography>
                        <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-xs font-mono text-gray-600 shadow-sm">
                          {shortcut.key}
                        </kbd>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <Typography variant="body-xs" className="text-gray-500">
                Press{" "}
                <kbd className="px-1 py-0.5 bg-gray-100 border rounded text-xs">
                  ?
                </kbd>{" "}
                anywhere to show this guide
              </Typography>
              <Button variant="primary" onClick={onClose}>
                Got it
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
