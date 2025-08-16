// Archived shim of src/components/playbook/visual/FieldCanvas.tsx
// Delegates to the v2 Diagram editor provider and canvas. For archive reference only.
import React from "react";
import type { Play } from "../../src/types/play";
import { FieldCanvas as DiagramV2FieldCanvas } from "../../src/components/playbook/diagram-v2/FieldCanvas";
import { DiagramEditorProvider } from "../../src/components/playbook/diagram-v2/context";

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
