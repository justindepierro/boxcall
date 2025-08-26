import React from "react";

// Line/Arrow component
export const Line: React.FC<{
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color?: string;
}> = ({ x1, y1, x2, y2, color }) => (
  <line
    x1={x1}
    y1={y1}
    x2={x2}
    y2={y2}
    stroke={color || "#333"}
    strokeWidth={2}
  />
);
