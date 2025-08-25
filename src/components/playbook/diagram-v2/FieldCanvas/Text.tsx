import React from "react";

export interface TextProps {
  x: number;
  y: number;
  text: string;
  color?: string;
  fontSize?: number;
}

export const Text: React.FC<TextProps> = ({
  x,
  y,
  text,
  color = "#111827",
  fontSize = 18,
}) => (
  <text
    x={x}
    y={y}
    fill={color}
    fontSize={fontSize}
    fontFamily="inherit"
    alignmentBaseline="middle"
    textAnchor="middle"
  >
    {text}
  </text>
);
