import React, { useMemo } from "react";

import { useDiagramEditor } from "../context/useDiagramEditor";

/**
 * TipsOverlay
 * Lightweight, pointer-events-none overlay with mode-aware tips.
 * Very low-contrast text to avoid visual clutter; updates with tool/drawMode.
 */
export const TipsOverlay: React.FC = () => {
  const { state } = useDiagramEditor();
  const { tool, drawMode, routeMode } = state.ui;

  const tips = useMemo(() => {
    const common = [
      "Arrow keys: nudge selection (Shift for bigger)",
      "Delete/Backspace: remove selected",
    ];
    if (tool === "select") {
      return {
        title: "Select",
        lines: [
          "Click to select; Shift-click to add/remove",
          "Drag empty space to box-select",
          ...common,
        ],
      } as const;
    }
    if (tool === "pan") {
      return {
        title: "Pan",
        lines: ["Drag to move the canvas", "Use toolbar to adjust zoom"],
      } as const;
    }
    if (tool === "add-player") {
      return {
        title: "Add Player",
        lines: ["Click to add a player", ...common],
      } as const;
    }
    if (tool === "route") {
      return {
        title: `Route (${routeMode || "line"})`,
        lines: [
          "Click a player to start",
          "Click to add points; Double-click to finish",
          "Esc: cancel current route",
        ],
      } as const;
    }
    if (tool === "draw") {
      switch (drawMode) {
        case "freehand":
          return {
            title: "Draw (freehand)",
            lines: ["Drag to draw; release to finish", "Esc: cancel"],
          } as const;
        case "connector":
          return {
            title: "Draw (connector)",
            lines: ["Click a player, then another to connect", "Esc: cancel"],
          } as const;
        case "curve":
          return {
            title: "Draw (curve)",
            lines: [
              "Click to add points; Double-click to finish",
              "Esc: cancel",
            ],
          } as const;
        default:
          return {
            title: `Draw (${drawMode || "line"})`,
            lines: [
              "Click to add points; Double-click to finish",
              "Esc: cancel",
            ],
          } as const;
      }
    }
    if (tool === "motion") {
      return {
        title: "Motion",
        lines: ["Define motion path (coming soon)"] as const,
      } as const;
    }
    if (tool === "delete") {
      return {
        title: "Delete",
        lines: ["Click an item to delete", "Esc: exit delete"],
      } as const;
    }
    return {
      title: "",
      lines: common,
    } as const;
  }, [tool, drawMode, routeMode]);

  return (
    <div
      className="pointer-events-none absolute bottom-3 right-3 z-20 select-none"
      aria-hidden
    >
      <div className="text-text-inverse/60 dark:text-text-inverse/50 text-[11px] leading-5">
        {tips.title ? (
          <div className="font-medium tracking-wide mb-1 drop-shadow-[0_1px_1px_rgba(0,0,0,0.35)]">
            {tips.title}
          </div>
        ) : null}
        <ul className="list-none m-0 p-0 space-y-0.5">
          {tips.lines.map((line, i) => (
            <li
              key={i}
              className="opacity-70 hover:opacity-90 transition-opacity drop-shadow-[0_1px_1px_rgba(0,0,0,0.35)]"
            >
              – {line}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default TipsOverlay;
