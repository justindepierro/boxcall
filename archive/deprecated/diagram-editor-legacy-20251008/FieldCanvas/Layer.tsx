import React from "react";

// Layer system for stacking/grouping shapes/lines
export const Layer: React.FC<{
  children: React.ReactNode;
  name?: string;
  visible?: boolean;
}> = ({ children, name, visible = true }) => {
  if (!visible) return null;
  return <g data-layer={name}>{children}</g>;
};
