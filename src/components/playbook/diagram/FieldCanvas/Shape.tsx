import React from "react";

// Generic Shape component (rectangle, circle, etc.)
export const Shape: React.FC<{
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color?: string;
}> = ({ type, x, y, width, height, color }) => {
  switch (type) {
    case "rect":
      return (
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          fill={color || "#eee"}
        />
      );
    case "circle":
      return (
        <circle
          cx={x + width / 2}
          cy={y + height / 2}
          r={Math.min(width, height) / 2}
          fill={color || "#eee"}
        />
      );
    default:
      return null;
  }
};
