/**
 * Diagram Editor Tips Data
 *
 * Keyboard shortcuts and editor tips for the diagram editor.
 * Separated from component for Fast Refresh compatibility.
 */

export interface Tip {
  key?: string;
  description: string;
  category: "Navigation" | "Editing" | "Selection" | "Tools" | "Tips";
}

export const DIAGRAM_EDITOR_TIPS: Tip[] = [
  // Navigation
  {
    key: "Arrow Keys",
    description: "Nudge selected players (0.5 yards)",
    category: "Navigation",
  },
  {
    key: "Shift + Arrow",
    description: "Large nudge (1 yard)",
    category: "Navigation",
  },

  // Editing
  {
    key: "Delete",
    description: "Remove selected players",
    category: "Editing",
  },
  {
    key: "Backspace",
    description: "Remove selected players",
    category: "Editing",
  },
  {
    key: "Escape",
    description: "Deselect all players",
    category: "Editing",
  },

  // Selection
  {
    key: "Ctrl/Cmd + C",
    description: "Copy selected players",
    category: "Selection",
  },
  {
    key: "Ctrl/Cmd + V",
    description: "Paste copied players",
    category: "Selection",
  },
  {
    key: "Ctrl/Cmd + D",
    description: "Duplicate selected players",
    category: "Selection",
  },
  {
    key: "Ctrl/Cmd + Z",
    description: "Undo last action",
    category: "Selection",
  },
  {
    key: "Ctrl/Cmd + Shift + Z",
    description: "Redo last action",
    category: "Selection",
  },

  // Tools
  {
    description: "Click and drag on empty field to box-select players",
    category: "Tools",
  },
  {
    description: "Click player to select, drag to move",
    category: "Tools",
  },
  {
    description: "Multi-select: Hold Shift and click players",
    category: "Tools",
  },

  // Tips
  {
    description: "Use spacing indicator to measure player distances",
    category: "Tips",
  },
  {
    description: "Drag spacing line up/down for custom measurements",
    category: "Tips",
  },
  {
    description: "Toggle field colors: Jade, Clay, Navy",
    category: "Tips",
  },
];
