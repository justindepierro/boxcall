/**
 * useAlignmentState Hook
 * Manages alignment state and synchronizes with external prop
 */

import * as React from "react";
import type { Alignment } from "../types";

interface UseAlignmentStateProps {
  externalAlignment?: Alignment;
  onAlignmentChange: (alignment: Alignment) => void;
}

export function useAlignmentState({ externalAlignment, onAlignmentChange }: UseAlignmentStateProps) {
  const [internalAlignment, setInternalAlignment] = React.useState<Alignment>("middle");
  const prevExternalAlignment = React.useRef<Alignment | undefined>(undefined);

  // Get the currently selected alignment (prioritize external over internal)
  const selectedAlignment = externalAlignment || internalAlignment;

  // React to external alignment changes
  React.useEffect(() => {
    // Only trigger movement if external alignment changed (not initial mount)
    if (
      externalAlignment &&
      prevExternalAlignment.current !== undefined &&
      prevExternalAlignment.current !== externalAlignment
    ) {
      console.log(
        `📐 External alignment changed: ${prevExternalAlignment.current} → ${externalAlignment}`
      );
      onAlignmentChange(externalAlignment);
    }
    prevExternalAlignment.current = externalAlignment;
  }, [externalAlignment, onAlignmentChange]);

  return {
    internalAlignment,
    setInternalAlignment,
    selectedAlignment,
  };
}
