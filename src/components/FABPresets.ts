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
  playbook: (handlers: {
    onNewPlay: () => void;
    onWhiteboard: () => void;
    onPractice: () => void;
    onGamePlan: () => void;
  }): FABAction[] => [
    {
      id: "new-play",
      label: "New Play",
      icon: "plus-circle" as IconName,
      color: "bg-jade-600 text-white",
      onClick: handlers.onNewPlay,
    },
    {
      id: "whiteboard",
      label: "Whiteboard",
      icon: "pen-tool" as IconName,
      color: "bg-purple-600 text-white",
      onClick: handlers.onWhiteboard,
    },
    {
      id: "practice",
      label: "Practice",
      icon: "clipboard-list" as IconName,
      color: "bg-blue-600 text-white",
      onClick: handlers.onPractice,
    },
    {
      id: "game-plan",
      label: "Game Plan",
      icon: "target" as IconName,
      color: "bg-orange-600 text-white",
      onClick: handlers.onGamePlan,
    },
  ],
};
