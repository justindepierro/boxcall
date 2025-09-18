import React from "react";
import { FieldCanvasProvider } from "./FieldCanvas/FieldCanvasContext";
import { FieldCanvasOrchestrator } from "./FieldCanvas/FieldCanvasOrchestrator";

// Main FieldCanvas shell, using new modular architecture
export const FieldCanvas: React.FC<{ className?: string }> = ({
  className,
}) => (
  <FieldCanvasProvider>
    <div className={className ?? ""}>
      <FieldCanvasOrchestrator />
    </div>
  </FieldCanvasProvider>
);
