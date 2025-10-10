import React from "react";

interface AlignTabProps {
  selectedAlignment: "left" | "middle" | "right";
  onAlignmentChange: (alignment: "left" | "middle" | "right") => void;
}

/**
 * AlignTab - Mobile-optimized alignment controls
 *
 * Features:
 * - Hash mark selection (left/middle/right)
 * - Visual hash mark indicators
 * - Simple, touch-friendly UI
 */
export const AlignTab: React.FC<AlignTabProps> = ({
  selectedAlignment,
  onAlignmentChange,
}) => {
  const alignments: Array<{
    id: "left" | "middle" | "right";
    label: string;
    description: string;
    icon: string;
  }> = [
    {
      id: "left",
      label: "Left Hash",
      description: "Align formation to left hash mark",
      icon: "◀️",
    },
    {
      id: "middle",
      label: "Middle Hash",
      description: "Align formation to center of field",
      icon: "⬆️",
    },
    {
      id: "right",
      label: "Right Hash",
      description: "Align formation to right hash mark",
      icon: "▶️",
    },
  ];

  return (
    <div className="space-y-4">
      {/* Hash Mark Selection */}
      <div>
        <h3 className="text-sm font-semibold text-primary mb-2">Hash Mark Alignment</h3>
        <div className="space-y-2">
          {alignments.map((alignment) => {
            const isSelected = selectedAlignment === alignment.id;

            return (
              <button
                key={alignment.id}
                onClick={() => onAlignmentChange(alignment.id)}
                className={`w-full px-4 py-3 rounded-lg transition-colors text-left touch-manipulation ${
                  isSelected
                    ? "bg-primary-600 text-white"
                    : "bg-surface-secondary hover:bg-surface-tertiary active:bg-border text-primary"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{alignment.icon}</div>
                  <div className="flex-1">
                    <div className="text-sm font-medium">{alignment.label}</div>
                    <div className={`text-xs mt-0.5 ${isSelected ? "text-white/80" : "text-secondary"}`}>
                      {alignment.description}
                    </div>
                  </div>
                  {isSelected && (
                    <div className="text-lg">✓</div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Visual Guide */}
      <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 border border-green-200 dark:border-green-800">
        <p className="text-xs text-green-900 dark:text-green-100">
          📍 <strong>Current Alignment:</strong> {selectedAlignment.charAt(0).toUpperCase() + selectedAlignment.slice(1)} Hash
        </p>
        <p className="text-xs text-green-900 dark:text-green-100 mt-2">
          💡 <strong>Tip:</strong> All new formations will be centered on the selected hash mark. Existing players are not moved.
        </p>
      </div>

      {/* Field Diagram (Visual) */}
      <div>
        <h3 className="text-sm font-semibold text-primary mb-2">Field View</h3>
        <div className="bg-surface-secondary rounded-lg p-4">
          <div className="relative h-32 bg-green-700/20 rounded border-2 border-green-600/30">
            {/* Sidelines */}
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-white/50"></div>
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/50"></div>

            {/* Left Hash */}
            <div className={`absolute left-1/4 top-0 bottom-0 w-1 ${
              selectedAlignment === "left" ? "bg-primary-500" : "bg-white/30"
            }`}>
              {selectedAlignment === "left" && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white text-2xl">
                  ⚪
                </div>
              )}
            </div>

            {/* Middle Hash */}
            <div className={`absolute left-1/2 top-0 bottom-0 w-1 ${
              selectedAlignment === "middle" ? "bg-primary-500" : "bg-white/30"
            }`}>
              {selectedAlignment === "middle" && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white text-2xl">
                  ⚪
                </div>
              )}
            </div>

            {/* Right Hash */}
            <div className={`absolute right-1/4 top-0 bottom-0 w-1 ${
              selectedAlignment === "right" ? "bg-primary-500" : "bg-white/30"
            }`}>
              {selectedAlignment === "right" && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white text-2xl">
                  ⚪
                </div>
              )}
            </div>

            {/* Labels */}
            <div className="absolute bottom-1 left-1/4 -translate-x-1/2 text-[10px] text-white/70">
              Left
            </div>
            <div className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[10px] text-white/70">
              Middle
            </div>
            <div className="absolute bottom-1 right-1/4 translate-x-1/2 text-[10px] text-white/70">
              Right
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
