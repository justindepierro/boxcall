/**
 * BACKWARDS COMPATIBLE Icon System
 *
 * Phase 1: Keep original functionality while building modular foundation
 * This ensures ZERO BREAKING CHANGES during the transition
 */

import React from "react";
import { getComponentColor } from "../../../design-system/tokens";
import type { IconProps } from "./types";
import { sizeMap } from "./types";

// Import the original 998-line icon system for backwards compatibility
import { Icon as OriginalIcon } from "./Icon.tsx.backup";

// Also import category-based icons for gradual migration
import { registerIconCategory } from "./registry";

// Auto-register the most common icons on import
import "./categories/NavigationIcons";
import "./categories/ActionIcons";

// Export backwards-compatible Icon component
export const Icon: React.FC<IconProps> = (props) => {
  // For now, just use the original Icon component
  // This ensures 100% compatibility while we test the new system
  return <OriginalIcon {...props} />;
};

// Re-export everything from the original file for now
export * from "./Icon.tsx.backup";

export default Icon;
