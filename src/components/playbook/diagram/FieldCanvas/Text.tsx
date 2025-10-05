import React from "react";
import { colorTokens } from "../../../../design-system/tokens";

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
  color = colorTokens.gray[900],
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
