// Selection box, multi-select, drag, snap logic
import React from "react";
import { useFieldCanvas } from "./FieldCanvasContext";

export const Selection: React.FC = () => {
  const { selectionBox, state } = useFieldCanvas();
  // Compute marqueeCount from selectionBox and state.doc.players
  const marqueeCount = React.useMemo(() => {
    if (!selectionBox) return 0;
    const { x, y, w, h } = selectionBox;
    let count = 0;
    for (const p of state.doc.players) {
      if (p.x >= x && p.x <= x + w && p.y >= y && p.y <= y + h) {
        count++;
      }
    }
    return count;
  }, [selectionBox, state.doc.players]);

  return (
    <g>
      {selectionBox && (
        <g>
          <rect
            x={selectionBox.x}
            y={selectionBox.y}
            width={selectionBox.w}
            height={selectionBox.h}
            fill="rgba(250,204,21,0.15)"
            stroke="#fbbf24"
            strokeWidth={1.5}
            strokeDasharray="4 3"
          />
          {/* Count badge at top-right of marquee */}
          <g
            transform={`translate(${selectionBox.x + selectionBox.w}, ${selectionBox.y})`}
            style={{ pointerEvents: "none", userSelect: "none" }}
          >
            <g transform="translate(6, -10)">
              <rect
                x={-22}
                y={-14}
                width={44}
                height={22}
                rx={11}
                ry={11}
                fill="#111827"
                opacity={0.9}
              />
              <text
                x={0}
                y={-3}
                fontSize={12}
                fontWeight={700}
                fill="#fbbf24"
                textAnchor="middle"
                dominantBaseline="middle"
              >
                {marqueeCount}
              </text>
            </g>
          </g>
        </g>
      )}
    </g>
  );
};
