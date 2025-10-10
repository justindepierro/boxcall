import type { IconName } from "./ui/Icon/Icon";

export interface FABAction {
  id: string;
  label: string;
  icon: IconName;
  color?: string;
  onClick: () => void;
}

/**
 * Preset FAB configurations
 */
export const FABPresets = {
  diagramEditor: (handlers: {
    onAddPlayer: () => void;
    onAddFormation: () => void;
    onClear: () => void;
    onUndo: () => void;
  }): FABAction[] => [
    {
      id: "add-player",
      label: "Add Player",
      icon: "user-plus" as IconName,
      color: "bg-blue-600 text-white",
      onClick: handlers.onAddPlayer,
    },
    {
      id: "formation",
      label: "Formation",
      icon: "grid" as IconName,
      color: "bg-purple-600 text-white",
      onClick: handlers.onAddFormation,
    },
    {
      id: "undo",
      label: "Undo",
      icon: "undo" as IconName,
      color: "bg-gray-600 text-white",
      onClick: handlers.onUndo,
    },
    {
      id: "clear",
      label: "Clear",
      icon: "delete" as IconName,
      color: "bg-error-600 text-white",
      onClick: handlers.onClear,
    },
  ],
};
