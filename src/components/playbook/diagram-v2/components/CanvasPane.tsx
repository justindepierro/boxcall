import React, { useEffect } from "react";
import { FieldCanvas } from "../FieldCanvas";
import { ActionBar } from "./ActionBar";
import { ToolPalette } from "./ToolPalette";
import { TipsOverlay } from "./TipsOverlay";
import { HelpHint } from "./HelpHint";

/**
 * CanvasPane
 * Wraps the FieldCanvas + svg ref capture. Pure presentational shell today.
 * Future enhancements:
 *  - Keyboard-accessible resize hook (handled in parent for now)
 *  - Focus ring & initial focus management
 *  - Optional overlays (history timeline, selection metrics, legality warnings)
 */
export const CanvasPane: React.FC<{
  svgRef: React.MutableRefObject<SVGSVGElement | null>;
  className?: string;
}> = ({ svgRef, className }) => {
  return (
    <div className={className}>
      {" "}
      {/* .flex-1 min-w-0 flex flex-col p-3 passes through */}
      <div className="relative flex-1 min-h-0 rounded-md bg-emerald-800/60">
        <div className="absolute inset-0">
          <ToolPalette />
          <FieldCanvas className="w-full h-full" />
          <CaptureSvgRef targetRef={svgRef} />
          <ActionBar svgRef={svgRef} />
          <TipsOverlay />
          <HelpHint />
        </div>
      </div>
    </div>
  );
};

// Internal helper preserved from previous inline implementation
const CaptureSvgRef: React.FC<{
  targetRef: React.MutableRefObject<SVGSVGElement | null>;
}> = ({ targetRef }) => {
  useEffect(() => {
    if (!targetRef.current) {
      const svg = document.querySelector<SVGSVGElement>(
        "svg[aria-label='Diagram field']"
      );
      if (svg) targetRef.current = svg;
    }
  });
  return null;
};
