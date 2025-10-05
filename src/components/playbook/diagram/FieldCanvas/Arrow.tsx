import React from "react";
import type { LineType } from "./FieldCanvasContext";
import { colorTokens } from "../../../../design-system/tokens";

export const Arrow: React.FC<LineType> = ({
  x1,
  y1,
  x2,
  y2,
  color = colorTokens.blue[600],
}) => {
  // Simple arrowhead calculation
  const arrowLength = 16;
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const arrowX = x2 - arrowLength * Math.cos(angle);
  const arrowY = y2 - arrowLength * Math.sin(angle);
  const arrowHead1 = {
    x: arrowX + 8 * Math.cos(angle + Math.PI / 6),
    y: arrowY + 8 * Math.sin(angle + Math.PI / 6),
  };
  const arrowHead2 = {
    x: arrowX + 8 * Math.cos(angle - Math.PI / 6),
    y: arrowY + 8 * Math.sin(angle - Math.PI / 6),
  };
  return (
    <g>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={3} />
      <polygon
        points={`${x2},${y2} ${arrowHead1.x},${arrowHead1.y} ${arrowHead2.x},${arrowHead2.y}`}
        fill={color}
      />
    </g>
  );
};
