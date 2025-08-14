import React from "react";
import type { Play } from "../../../types/play";
import { FieldCanvas as DiagramV2FieldCanvas } from "../diagram-v2/FieldCanvas";
import { DiagramEditorProvider } from "../diagram-v2/context";

// Legacy shim: expose a FieldCanvas with the old props but delegate to the v2 canvas.
// The 'play' and 'readOnly' props are currently ignored; state is managed by the v2 editor context.
export const FieldCanvas: React.FC<{
  play?: Play;
  readOnly?: boolean;
  className?: string;
}> = ({ className }) => {
  return (
    <DiagramEditorProvider>
      <DiagramV2FieldCanvas className={className} />
    </DiagramEditorProvider>
  );
};

export default FieldCanvas;
